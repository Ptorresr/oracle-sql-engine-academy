(() => {
  "use strict";

  const SCHEMA_VERSION = 1;

  function freezeDeep(value) {
    if (Array.isArray(value)) value.forEach(freezeDeep);
    else if (value && typeof value === "object") Object.values(value).forEach(freezeDeep);
    return Object.freeze(value);
  }

  const scenarios = freezeDeep([
    {
      id: "retail-order-fulfillment",
      version: SCHEMA_VERSION,
      domain: "Retail",
      label: "Retail · pedidos recientes y catálogo caliente",
      definition: "Escenario sintético para relacionar pedidos recientes con productos y explicar reutilización conceptual de bloques.",
      mechanism: "El modelo futuro recorre una secuencia declarada de bloques de pedidos y productos; los patrones de reutilización, memoria y selectividad son entradas educativas visibles.",
      purpose: "Comparar un filtro de pedidos selectivo con la reutilización conceptual de un catálogo de productos.",
      internalProcessing: "Los bloques, Buffer Cache, workarea y rutas de acceso se representarán como dependencias conceptuales, no como una traza física de Oracle Database.",
      developerFocus: "Revisar la condición de unión y el filtro por fecha antes de interpretar las hipótesis de acceso.",
      dbaFocus: "Distinguir solicitudes lógicas y métricas ilustrativas de cualquier medición observada en una base real.",
      sql: `SELECT o.order_id, p.product_name, oi.quantity
FROM orders_lab o
JOIN order_items_lab oi
  ON oi.order_id = o.order_id
JOIN products_lab p
  ON p.product_id = oi.product_id
WHERE o.order_date >= :cutoff_date;`,
      tables: [
        {
          name: "orders_lab",
          rows: [
            { id: "ORD-01", order_id: 101, customer_id: 11, order_date: "2026-01-10" },
            { id: "ORD-02", order_id: 102, customer_id: 11, order_date: "2026-01-11" },
            { id: "ORD-03", order_id: 103, customer_id: 24, order_date: "2025-12-20" }
          ]
        },
        {
          name: "order_items_lab",
          rows: [
            { id: "ITEM-01", order_id: 101, product_id: 501, quantity: 2 },
            { id: "ITEM-02", order_id: 102, product_id: 501, quantity: 1 },
            { id: "ITEM-03", order_id: 102, product_id: null, quantity: 1 }
          ]
        },
        {
          name: "products_lab",
          rows: [
            { id: "PROD-01", product_id: 501, product_name: "Sensor industrial", category: "Hardware" },
            { id: "PROD-02", product_id: 502, product_name: "Servicio de instalación", category: "Services" }
          ]
        }
      ],
      blockLayout: [
        { blockId: "ORDERS-B01", table: "orders_lab", rowIds: ["ORD-01", "ORD-02"] },
        { blockId: "ORDERS-B02", table: "orders_lab", rowIds: ["ORD-03"] },
        { blockId: "ITEMS-B01", table: "order_items_lab", rowIds: ["ITEM-01", "ITEM-02", "ITEM-03"] },
        { blockId: "PRODUCTS-B01", table: "products_lab", rowIds: ["PROD-01", "PROD-02"] }
      ],
      accessPattern: {
        coldRequests: ["ORDERS-B01", "ITEMS-B01", "PRODUCTS-B01", "PRODUCTS-B01"],
        warmSeed: ["PRODUCTS-B01"],
        defaultMode: "warm"
      },
      statisticsModel: {
        objectRows: { orders_lab: 3, order_items_lab: 3, products_lab: 2 },
        declaredSelectivity: 0.67,
        indexes: { orders_lab_order_date: true, products_lab_product_id: true },
        distribution: "Producto 501 se repite en el conjunto sintético para mostrar reutilización y duplicados lógicos."
      },
      memoryModel: { workareaLimitUnits: 12, estimatedRowUnits: 2, unitLabel: "unidades educativas" },
      workareaModel: {
        defaultOperation: "HASH_JOIN",
        defaultRows: 4,
        defaultRowUnits: 2,
        defaultMemoryBudgetUnits: 16,
        defaultDistribution: "clustered",
        expectedClassification: "OPTIMAL",
        resultDescription: "La unión educativa completa su trabajo dentro del presupuesto declarado."
      },
      optimizerModel: {
        defaultBaseRows: 1000,
        defaultSelectivity: 0.02,
        defaultStatisticsStatus: "available",
        defaultIndexAvailable: true,
        defaultDistribution: "uniform",
        joinContext: { relation: "one-to-many", lookupRows: 20 },
        declaredObservationRows: null,
        observationSource: "not-declared",
        logicalResultRowIds: ["ORD-01/ITEM-01/PROD-01", "ORD-02/ITEM-02/PROD-01"],
        nullBehavior: "ITEM-03 usa PRODUCT_ID NULL y no obtiene coincidencia de igualdad en la muestra lógica."
      },
      whatIfModel: {
        allowedParameters: ["baseRows", "selectivity", "statisticsStatus", "indexAvailable", "optimizerDistribution", "cacheMode", "capacityBlocks", "accessPattern", "workareaOperation", "workareaRows", "rowUnits", "memoryBudgetUnits", "workareaDistribution", "populationId"],
        initialValues: { baseRows: 1000, selectivity: 0.02, statisticsStatus: "available", indexAvailable: true, optimizerDistribution: "uniform", cacheMode: "warm", capacityBlocks: 3, accessPattern: "declared", workareaOperation: "HASH_JOIN", workareaRows: 4, rowUnits: 2, memoryBudgetUnits: 16, workareaDistribution: "clustered", populationId: "retail-orders-2026-fixed" },
        restrictions: ["La selectividad representa una entrada declarada del estimador, no un filtro ejecutado.", "Los índices son disponibilidad declarada y no una recomendación ni una decisión del CBO."],
        comparability: { logicalResultId: "retail-orders-fulfilled-v1", requireSamePopulation: true, volumeChangesPopulation: false, resultRule: "La identidad lógica se conserva cuando populationId coincide; cambiar selectividad o índice no modifica las filas sintéticas." },
        limitations: ["No compara duración, coste, I/O real ni plan Oracle.", "La caché y la workarea son modelos educativos separados."]
      },
      expectedObservation: "La repetición de PRODUCTS-B01 puede producir un cache hit conceptual; la fila ITEM-03 con clave NULL no obtiene coincidencia por igualdad.",
      assumptions: ["Las fechas, bloques y cardinalidades son sintéticos.", "La secuencia de solicitudes es declarada y no representa un algoritmo de acceso real."],
      limitations: ["No modela reemplazo real de Buffer Cache, prefetch, RAC ni latencia.", "No predice el plan de Oracle ni mide I/O físico."],
      seed: "sprint8-retail-v1"
    },
    {
      id: "finance-settlement-reconciliation",
      version: SCHEMA_VERSION,
      domain: "Finanzas",
      label: "Finanzas · conciliación de liquidaciones",
      definition: "Escenario sintético de conciliación entre entradas de libro mayor y eventos de liquidación.",
      mechanism: "Las claves de referencia repetidas y nulas permiten explorar cardinalidad lógica, patrón de acceso y tamaño de trabajo como hipótesis educativas.",
      purpose: "Mostrar que distribución, repetición y alcance de estadísticas influyen en la interpretación de una consulta de conciliación.",
      internalProcessing: "Los futuros operadores, workareas y eventos TEMP se mostrarán solo si la regla declarada del escenario los emite.",
      developerFocus: "Relacionar el predicado por cuenta y la condición de conciliación con el resultado lógico esperado.",
      dbaFocus: "Separar una observación importada del plan de las unidades simuladas de cache y memoria.",
      sql: `SELECT l.entry_id, s.settlement_id, l.amount
FROM ledger_entries_lab l
JOIN settlement_events_lab s
  ON s.reference_id = l.reference_id
WHERE l.account_id = :account_id;`,
      tables: [
        {
          name: "ledger_entries_lab",
          rows: [
            { id: "LEDGER-01", entry_id: 7001, account_id: 800, reference_id: "SET-100", amount: 900 },
            { id: "LEDGER-02", entry_id: 7002, account_id: 800, reference_id: "SET-200", amount: 1200 },
            { id: "LEDGER-03", entry_id: 7003, account_id: 900, reference_id: null, amount: 110 }
          ]
        },
        {
          name: "settlement_events_lab",
          rows: [
            { id: "SETTLE-01", settlement_id: "S-01", reference_id: "SET-100", amount: 900 },
            { id: "SETTLE-02", settlement_id: "S-02", reference_id: "SET-200", amount: 700 },
            { id: "SETTLE-03", settlement_id: "S-03", reference_id: "SET-200", amount: 500 }
          ]
        }
      ],
      blockLayout: [
        { blockId: "LEDGER-B01", table: "ledger_entries_lab", rowIds: ["LEDGER-01", "LEDGER-02"] },
        { blockId: "LEDGER-B02", table: "ledger_entries_lab", rowIds: ["LEDGER-03"] },
        { blockId: "SETTLE-B01", table: "settlement_events_lab", rowIds: ["SETTLE-01"] },
        { blockId: "SETTLE-B02", table: "settlement_events_lab", rowIds: ["SETTLE-02", "SETTLE-03"] }
      ],
      accessPattern: {
        coldRequests: ["LEDGER-B01", "SETTLE-B01", "LEDGER-B02", "SETTLE-B02"],
        warmSeed: ["SETTLE-B02"],
        defaultMode: "cold"
      },
      statisticsModel: {
        objectRows: { ledger_entries_lab: 3, settlement_events_lab: 3 },
        declaredSelectivity: 0.67,
        indexes: { ledger_entries_lab_account_id: true, settlement_events_lab_reference_id: false },
        distribution: "SET-200 aparece dos veces en liquidaciones para exponer una cardinalidad de salida distinta de la cantidad de claves."
      },
      memoryModel: { workareaLimitUnits: 8, estimatedRowUnits: 2, unitLabel: "unidades educativas" },
      workareaModel: {
        defaultOperation: "SORT",
        defaultRows: 12,
        defaultRowUnits: 2,
        defaultMemoryBudgetUnits: 16,
        defaultDistribution: "mixed",
        expectedClassification: "ONE_PASS",
        resultDescription: "La ordenación educativa requiere una fase temporal adicional bajo el presupuesto declarado."
      },
      optimizerModel: {
        defaultBaseRows: 50000,
        defaultSelectivity: 0.2,
        defaultStatisticsStatus: "stale",
        defaultIndexAvailable: false,
        defaultDistribution: "skewed",
        joinContext: { relation: "one-to-many", lookupRows: 500 },
        declaredObservationRows: 2,
        observationSource: "scenario-declared-logical-result",
        logicalResultRowIds: ["LEDGER-01/SETTLE-01", "LEDGER-02/SETTLE-02", "LEDGER-02/SETTLE-03"],
        nullBehavior: "LEDGER-03 usa REFERENCE_ID NULL y no coincide con una clave NULL bajo igualdad SQL educativa."
      },
      whatIfModel: {
        allowedParameters: ["baseRows", "selectivity", "statisticsStatus", "indexAvailable", "optimizerDistribution", "cacheMode", "capacityBlocks", "accessPattern", "workareaOperation", "workareaRows", "rowUnits", "memoryBudgetUnits", "workareaDistribution", "populationId"],
        initialValues: { baseRows: 50000, selectivity: 0.2, statisticsStatus: "stale", indexAvailable: false, optimizerDistribution: "skewed", cacheMode: "cold", capacityBlocks: 3, accessPattern: "declared", workareaOperation: "SORT", workareaRows: 12, rowUnits: 2, memoryBudgetUnits: 16, workareaDistribution: "mixed", populationId: "finance-settlement-fixed" },
        restrictions: ["El patrón de acceso y el presupuesto no alteran el dataset sintético.", "TEMP solo se muestra si el motor de workarea emite TEMP_WRITE y TEMP_READ."],
        comparability: { logicalResultId: "finance-settlement-reconciliation-v1", requireSamePopulation: true, volumeChangesPopulation: false, resultRule: "La identidad lógica se conserva mientras populationId coincida; caché y workarea no cambian las filas declaradas." },
        limitations: ["No deduce configuración PGA ni lecturas físicas de Oracle.", "Una observación declarada no se convierte en A-Rows."]
      },
      expectedObservation: "La clave SET-200 puede emitir dos resultados lógicos; una clave NULL no coincide con otra NULL bajo la comparación de igualdad educativa.",
      assumptions: ["El dataset no contiene información financiera real.", "La disponibilidad de índice es una entrada del modelo, no evidencia de un plan."],
      limitations: ["No representa permisos, bloqueos ni contabilidad real.", "No infiere uso de TEMP ni lectura física desde el SQL."],
      seed: "sprint8-finance-v1"
    },
    {
      id: "warehouse-sales-aggregation",
      version: SCHEMA_VERSION,
      domain: "Data Warehouse",
      label: "Data Warehouse · ventas por categoría",
      definition: "Escenario sintético de hechos y dimensión para explorar volumen conceptual, agregación y una workarea limitada.",
      mechanism: "Una tabla de hechos conceptual se relaciona con producto; el modelo futuro podrá variar selectividad, distribución, memoria y alternativa de operador sin fabricar duraciones.",
      purpose: "Explicar por qué el volumen de entrada y los límites de trabajo cambian las hipótesis educativas sobre acceso, cardinalidad y TEMP.",
      internalProcessing: "La posible partición a TEMP será una transición explícita del motor educativo, no una conclusión a partir del nombre de un operador.",
      developerFocus: "Relacionar filtro, agrupación y unión con las filas de entrada y resultado del escenario.",
      dbaFocus: "Comparar estimación, observación declarada y métricas ilustrativas sin convertir Cost o contadores en tiempo real.",
      sql: `SELECT p.category, SUM(f.net_amount) AS net_amount
FROM fact_sales_lab f
JOIN dim_product_lab p
  ON p.product_id = f.product_id
WHERE f.sales_year = :sales_year
GROUP BY p.category;`,
      tables: [
        {
          name: "fact_sales_lab",
          rows: [
            { id: "FACT-01", sale_id: 9001, product_id: 10, sales_year: 2026, net_amount: 2400 },
            { id: "FACT-02", sale_id: 9002, product_id: 20, sales_year: 2026, net_amount: 980 },
            { id: "FACT-03", sale_id: 9003, product_id: 20, sales_year: 2026, net_amount: 1250 },
            { id: "FACT-04", sale_id: 9004, product_id: null, sales_year: 2026, net_amount: 99 }
          ]
        },
        {
          name: "dim_product_lab",
          rows: [
            { id: "DIM-01", product_id: 10, category: "Hardware" },
            { id: "DIM-02", product_id: 20, category: "Software" },
            { id: "DIM-03", product_id: 30, category: "Services" }
          ]
        }
      ],
      blockLayout: [
        { blockId: "FACT-B01", table: "fact_sales_lab", rowIds: ["FACT-01", "FACT-02"] },
        { blockId: "FACT-B02", table: "fact_sales_lab", rowIds: ["FACT-03", "FACT-04"] },
        { blockId: "DIM-PRODUCT-B01", table: "dim_product_lab", rowIds: ["DIM-01", "DIM-02", "DIM-03"] }
      ],
      accessPattern: {
        coldRequests: ["FACT-B01", "FACT-B02", "DIM-PRODUCT-B01", "FACT-B01"],
        warmSeed: ["DIM-PRODUCT-B01"],
        defaultMode: "cold"
      },
      statisticsModel: {
        objectRows: { fact_sales_lab: 4, dim_product_lab: 3 },
        declaredSelectivity: 0.75,
        indexes: { fact_sales_lab_sales_year: false, dim_product_lab_product_id: true },
        distribution: "La dimensión es pequeña y PRODUCT_ID 20 se repite en hechos; las proporciones son educativas."
      },
      memoryModel: { workareaLimitUnits: 4, estimatedRowUnits: 2, unitLabel: "unidades educativas" },
      workareaModel: {
        defaultOperation: "HASH_JOIN",
        defaultRows: 30,
        defaultRowUnits: 3,
        defaultMemoryBudgetUnits: 12,
        defaultDistribution: "wide",
        expectedClassification: "MULTI_PASS",
        resultDescription: "El volumen conceptual supera varias veces el presupuesto y activa fases temporales educativas."
      },
      optimizerModel: {
        defaultBaseRows: 1000000,
        defaultSelectivity: 0.75,
        defaultStatisticsStatus: "available",
        defaultIndexAvailable: false,
        defaultDistribution: "skewed",
        joinContext: { relation: "many-to-one", lookupRows: 1000 },
        declaredObservationRows: null,
        observationSource: "not-declared",
        logicalResultRowIds: ["FACT-01/DIM-01", "FACT-02/DIM-02", "FACT-03/DIM-02"],
        nullBehavior: "FACT-04 usa PRODUCT_ID NULL y queda fuera de la unión de igualdad de la muestra lógica."
      },
      whatIfModel: {
        allowedParameters: ["baseRows", "selectivity", "statisticsStatus", "indexAvailable", "optimizerDistribution", "cacheMode", "capacityBlocks", "accessPattern", "workareaOperation", "workareaRows", "rowUnits", "memoryBudgetUnits", "workareaDistribution", "populationId"],
        initialValues: { baseRows: 1000000, selectivity: 0.75, statisticsStatus: "available", indexAvailable: false, optimizerDistribution: "skewed", cacheMode: "cold", capacityBlocks: 3, accessPattern: "declared", workareaOperation: "HASH_JOIN", workareaRows: 30, rowUnits: 3, memoryBudgetUnits: 12, workareaDistribution: "wide", populationId: "warehouse-sales-2026-fixed" },
        restrictions: ["Cambiar populationId o volumen declarado requiere marcar la comparación como no comparable.", "La alternativa JOIN es educativa y no representa una elección del optimizador."],
        comparability: { logicalResultId: "warehouse-category-sales-v1", requireSamePopulation: true, volumeChangesPopulation: true, resultRule: "Solo se compara el resultado lógico cuando populationId y el volumen declarado coinciden; una cardinalidad igual no prueba equivalencia." },
        limitations: ["No modela paralelismo, particionamiento ni coste.", "SORT o HASH no implican TEMP sin eventos explícitos del modelo."]
      },
      expectedObservation: "La capacidad intencionalmente baja permite diseñar un caso de presión de workarea; cualquier evento TEMP futuro seguirá una regla visible del modelo.",
      assumptions: ["La tabla de hechos representa volumen conceptual, no tamaño físico.", "Los resultados usan datos sintéticos y deterministas."],
      limitations: ["No modela paralelismo, particionamiento, almacenamiento columnar ni políticas de memoria de Oracle.", "No presenta una alternativa de JOIN como recomendación universal."],
      seed: "sprint8-warehouse-v1"
    }
  ]);

  function getScenario(scenarioId) {
    return scenarios.find((scenario) => scenario.id === scenarioId) || null;
  }

  globalThis.oraclePerformanceScenarios = scenarios;
  globalThis.OraclePerformanceScenarioCatalog = Object.freeze({ SCHEMA_VERSION, getScenario, list: () => scenarios });
})();
