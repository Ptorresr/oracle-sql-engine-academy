(() => {
  "use strict";

  const scenarios = Object.freeze([
    {
      id: "retail",
      label: "Retail · clientes y pedidos",
      purpose: "Relacionar clientes con sus pedidos y visualizar una relación 1:N.",
      useCase: "Ventas por cliente y validación de duplicados de la tabla de pedidos.",
      mechanism: "CLIENTES es la entrada Build; PEDIDOS consulta la estructura hash por cliente_id.",
      performance: "Con pocos datos el objetivo es didáctico: las métricas no comparan métodos ni prueban un plan real.",
      sql: `SELECT c.cliente_id, c.nombre, p.pedido_id, p.monto
FROM clientes_lab c
JOIN pedidos_lab p
  ON p.cliente_id = c.cliente_id
ORDER BY c.cliente_id, p.pedido_id;`,
      build: {
        name: "CLIENTES",
        key: "cliente_id",
        blocks: [
          { id: "CUST-01", rows: [
            { id: "c1", cliente_id: 1, nombre: "Ana" },
            { id: "c2", cliente_id: 2, nombre: "Luis" }
          ] },
          { id: "CUST-02", rows: [{ id: "c3", cliente_id: 3, nombre: "María" }] }
        ]
      },
      probe: {
        name: "PEDIDOS",
        key: "cliente_id",
        blocks: [
          { id: "ORD-01", rows: [
            { id: "p101", pedido_id: 101, cliente_id: 1, monto: 320 },
            { id: "p102", pedido_id: 102, cliente_id: 1, monto: 180 }
          ] },
          { id: "ORD-02", rows: [
            { id: "p103", pedido_id: 103, cliente_id: 2, monto: 540 },
            { id: "p104", pedido_id: 104, cliente_id: null, monto: 75 }
          ] }
        ]
      },
      cacheSeed: ["CUST-01"],
      memoryCapacity: 8,
      expectedRows: 3
    },
    {
      id: "finance",
      label: "Finanzas · conciliación de transacciones",
      purpose: "Conciliar referencias entre un libro mayor y liquidaciones bancarias.",
      useCase: "Detectar referencias repetidas y registros sin correspondencia al revisar una carga.",
      mechanism: "LIBRO_MAYOR construye buckets por referencia y BANCO ejecuta Probe; dos movimientos B-200 producen dos filas lógicas.",
      performance: "La duplicación de claves afecta cardinalidad de salida; validar distribución y estadísticas antes de interpretar costos.",
      sql: `SELECT l.referencia, l.importe AS libro_mayor, b.movimiento_id, b.importe AS banco
FROM libro_mayor_lab l
JOIN banco_lab b
  ON b.referencia = l.referencia
ORDER BY l.referencia, b.movimiento_id;`,
      build: {
        name: "LIBRO_MAYOR",
        key: "referencia",
        blocks: [
          { id: "GL-01", rows: [
            { id: "l1", referencia: "A-100", importe: 900 },
            { id: "l2", referencia: "B-200", importe: 1200 }
          ] },
          { id: "GL-02", rows: [{ id: "l3", referencia: "C-300", importe: 450 }] }
        ]
      },
      probe: {
        name: "BANCO",
        key: "referencia",
        blocks: [
          { id: "BANK-01", rows: [
            { id: "b1", movimiento_id: "M-01", referencia: "A-100", importe: 900 },
            { id: "b2", movimiento_id: "M-02", referencia: "B-200", importe: 700 }
          ] },
          { id: "BANK-02", rows: [
            { id: "b3", movimiento_id: "M-03", referencia: "B-200", importe: 500 },
            { id: "b4", movimiento_id: "M-04", referencia: null, importe: 110 }
          ] }
        ]
      },
      cacheSeed: ["GL-01", "BANK-02"],
      memoryCapacity: 8,
      expectedRows: 3
    },
    {
      id: "warehouse",
      label: "Data Warehouse · hechos y dimensión",
      purpose: "Relacionar hechos de venta con una dimensión de producto en un volumen conceptual mayor.",
      useCase: "Explicar por qué una workarea limitada puede particionar datos y usar TEMP de forma conceptual.",
      mechanism: "DIM_PRODUCTO se usa como Build y FACT_VENTAS como Probe; la fila con producto_id NULL no encuentra coincidencia.",
      performance: "La capacidad ilustrativa es intencionalmente baja para activar SPILL_TEMP; no representa tamaño, PGA ni TEMP reales.",
      sql: `SELECT d.categoria, f.venta_id, f.importe
FROM dim_producto_lab d
JOIN fact_ventas_lab f
  ON f.producto_id = d.producto_id
ORDER BY f.venta_id;`,
      build: {
        name: "DIM_PRODUCTO",
        key: "producto_id",
        blocks: [
          { id: "DIM-01", rows: [
            { id: "d1", producto_id: 10, categoria: "Hardware" },
            { id: "d2", producto_id: 20, categoria: "Software" }
          ] },
          { id: "DIM-02", rows: [
            { id: "d3", producto_id: 30, categoria: "Servicios" },
            { id: "d4", producto_id: 40, categoria: "Accesorios" }
          ] }
        ]
      },
      probe: {
        name: "FACT_VENTAS",
        key: "producto_id",
        blocks: [
          { id: "FACT-01", rows: [
            { id: "f1", venta_id: 501, producto_id: 10, importe: 2400 },
            { id: "f2", venta_id: 502, producto_id: 20, importe: 980 }
          ] },
          { id: "FACT-02", rows: [
            { id: "f3", venta_id: 503, producto_id: 20, importe: 1250 },
            { id: "f4", venta_id: 504, producto_id: 30, importe: 3100 }
          ] },
          { id: "FACT-03", rows: [
            { id: "f5", venta_id: 505, producto_id: 40, importe: 420 },
            { id: "f6", venta_id: 506, producto_id: null, importe: 99 }
          ] }
        ]
      },
      cacheSeed: ["DIM-01"],
      memoryCapacity: 2,
      expectedRows: 5
    }
  ]);

  globalThis.oracleHashJoinScenarios = scenarios;
})();
