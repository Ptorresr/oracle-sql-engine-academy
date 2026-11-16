(() => {
  "use strict";

  const scenarios = Object.freeze([
    {
      id: "retail",
      label: "Retail · clientes y pedidos",
      question: "¿Qué clientes tienen pedidos y cómo cambian las rutas conceptuales de acceso?",
      purpose: "Comparar tres métodos para la misma unión por cliente_id con una relación 1:N visible.",
      performance: "Un índice conceptual en PEDIDOS puede favorecer ciertas alternativas cuando la entrada externa es selectiva; no determina un plan real.",
      sql: `SELECT c.cliente_id, c.nombre, p.pedido_id, p.monto
FROM clientes_lab c
JOIN pedidos_lab p
  ON p.cliente_id = c.cliente_id
ORDER BY c.cliente_id, p.pedido_id;`,
      left: { name: "CLIENTES", key: "cliente_id", rows: [
        { id: "c1", block: "CUST-01", cliente_id: 1, label: "Ana" },
        { id: "c2", block: "CUST-01", cliente_id: 2, label: "Luis" },
        { id: "c3", block: "CUST-02", cliente_id: 3, label: "María" }
      ] },
      right: { name: "PEDIDOS", key: "cliente_id", indexed: true, rows: [
        { id: "p101", block: "ORD-01", pedido_id: 101, cliente_id: 1, label: "320" },
        { id: "p102", block: "ORD-01", pedido_id: 102, cliente_id: 1, label: "180" },
        { id: "p103", block: "ORD-02", pedido_id: 103, cliente_id: 2, label: "540" },
        { id: "p104", block: "ORD-02", pedido_id: 104, cliente_id: null, label: "75" }
      ] }
    },
    {
      id: "finance",
      label: "Finanzas · conciliación",
      question: "¿Cómo se reconcilian referencias repetidas de libro mayor y banco?",
      purpose: "Observar cómo los duplicados de una misma clave producen varias filas lógicas equivalentes.",
      performance: "La distribución de referencias y la cardinalidad influyen en el costo; los contadores del laboratorio no son estadísticas de Oracle.",
      sql: `SELECT l.referencia, l.importe AS libro_mayor, b.movimiento_id, b.importe AS banco
FROM libro_mayor_lab l
JOIN banco_lab b
  ON b.referencia = l.referencia
ORDER BY l.referencia, b.movimiento_id;`,
      left: { name: "LIBRO_MAYOR", key: "referencia", rows: [
        { id: "l1", block: "GL-01", referencia: "A-100", label: "900" },
        { id: "l2", block: "GL-01", referencia: "B-200", label: "1200" },
        { id: "l3", block: "GL-02", referencia: "C-300", label: "450" }
      ] },
      right: { name: "BANCO", key: "referencia", indexed: true, rows: [
        { id: "b1", block: "BANK-01", movimiento_id: "M-01", referencia: "A-100", label: "900" },
        { id: "b2", block: "BANK-01", movimiento_id: "M-02", referencia: "B-200", label: "700" },
        { id: "b3", block: "BANK-02", movimiento_id: "M-03", referencia: "B-200", label: "500" },
        { id: "b4", block: "BANK-02", movimiento_id: "M-04", referencia: null, label: "110" }
      ] }
    },
    {
      id: "warehouse",
      label: "Data Warehouse · hechos y dimensión",
      question: "¿Cómo cambia la explicación de operadores con una dimensión y varios hechos?",
      purpose: "Comparar la misma unión de dimensión y hechos con más filas y una clave NULL visible.",
      performance: "Ordenación, memoria y selectividad son hipótesis educativas. Un plan real depende de estadísticas, parámetros y ejecución observada.",
      sql: `SELECT d.categoria, f.venta_id, f.importe
FROM dim_producto_lab d
JOIN fact_ventas_lab f
  ON f.producto_id = d.producto_id
ORDER BY f.venta_id;`,
      left: { name: "DIM_PRODUCTO", key: "producto_id", rows: [
        { id: "d1", block: "DIM-01", producto_id: 10, label: "Hardware" },
        { id: "d2", block: "DIM-01", producto_id: 20, label: "Software" },
        { id: "d3", block: "DIM-02", producto_id: 30, label: "Servicios" },
        { id: "d4", block: "DIM-02", producto_id: 40, label: "Accesorios" }
      ] },
      right: { name: "FACT_VENTAS", key: "producto_id", indexed: false, rows: [
        { id: "f1", block: "FACT-01", venta_id: 501, producto_id: 10, label: "2400" },
        { id: "f2", block: "FACT-01", venta_id: 502, producto_id: 20, label: "980" },
        { id: "f3", block: "FACT-02", venta_id: 503, producto_id: 20, label: "1250" },
        { id: "f4", block: "FACT-02", venta_id: 504, producto_id: 30, label: "3100" },
        { id: "f5", block: "FACT-03", venta_id: 505, producto_id: 40, label: "420" },
        { id: "f6", block: "FACT-03", venta_id: 506, producto_id: null, label: "99" }
      ] }
    }
  ]);

  globalThis.oracleExecutionComparisonScenarios = scenarios;
})();
