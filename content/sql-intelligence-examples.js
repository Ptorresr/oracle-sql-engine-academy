(() => {
  "use strict";

  const notice = "Plan educativo ilustrativo; no corresponde a una ejecución observada.";
  const plan = (lines) => lines.join("\n");
  const examples = Object.freeze([
    {
      id: "retail",
      label: "Retail · clientes y órdenes",
      objective: "Relacionar clientes y órdenes mediante un plan DISPLAY estimado, sin estadísticas observadas de ejecución.",
      sql: "SELECT c.customer_name, o.order_id, o.total_amount\nFROM customers_demo c\nJOIN orders_demo o\n  ON o.customer_id = c.customer_id\nWHERE o.order_date >= DATE '2026-01-01';",
      questions: ["¿Qué predicado se asocia con la unión?", "¿Qué evidencia faltaría para confirmar I/O físico?"],
      relation: "Abre HASH JOIN Visualizer para un recorrido conceptual del método.",
      plan: plan([
        "Plan hash value: 90432111", "", "------------------------------------------------------------------", "| Id  | Operation           | Name          | E-Rows | Cost |", "------------------------------------------------------------------", "|   0 | SELECT STATEMENT    |               |        |   12 |", "|*  1 |  HASH JOIN          |               |      3 |   11 |", "|*  2 |   TABLE ACCESS FULL | CUSTOMERS_DEMO|      3 |    4 |", "|*  3 |   TABLE ACCESS FULL | ORDERS_DEMO   |      5 |    7 |", "------------------------------------------------------------------", "", "Predicate Information (identified by operation id):", "---------------------------------------------------", "   1 - access(\"O\".\"CUSTOMER_ID\"=\"C\".\"CUSTOMER_ID\")", "   3 - filter(\"O\".\"ORDER_DATE\">=DATE '2026-01-01')", "", "Note", "-----", `   - ${notice}`
      ])
    },
    {
      id: "finance",
      label: "Finanzas · conciliación de transacciones",
      objective: "Mostrar NESTED LOOPS, Starts superiores a uno y una diferencia de cardinalidad que requiere investigación.",
      sql: "SELECT l.reference, b.transaction_id, l.amount, b.amount\nFROM ledger_demo l\nJOIN bank_transactions_demo b\n  ON b.reference = l.reference\nWHERE l.posted_on >= DATE '2026-02-01';",
      questions: ["¿Por qué A-Rows puede requerir lectura por inicio?", "¿Qué datos adicionales confirmarían la causa?"],
      relation: "Compara NESTED LOOPS con HASH JOIN y SORT MERGE JOIN en SQL Execution Comparison Lab.",
      plan: plan([
        "Plan hash value: 17302044", "", "---------------------------------------------------------------------------------------------------", "| Id  | Operation                    | Name                   | Starts | E-Rows | A-Rows | Buffers |", "---------------------------------------------------------------------------------------------------", "|   0 | SELECT STATEMENT             |                        |      1 |        |     18 |      43 |", "|   1 |  NESTED LOOPS                |                        |      1 |      4 |     18 |      43 |", "|*  2 |   TABLE ACCESS FULL          | LEDGER_DEMO            |      1 |      2 |      6 |      13 |", "|*  3 |   TABLE ACCESS BY INDEX ROWID| BANK_TRANSACTIONS_DEMO |      6 |      2 |     18 |      30 |", "|*  4 |    INDEX RANGE SCAN          | BANK_REFERENCE_IX      |      6 |      2 |     18 |      12 |", "---------------------------------------------------------------------------------------------------", "", "Predicate Information (identified by operation id):", "---------------------------------------------------", "   2 - filter(\"L\".\"POSTED_ON\">=DATE '2026-02-01')", "   4 - access(\"B\".\"REFERENCE\"=\"L\".\"REFERENCE\")", "", "Note", "-----", `   - ${notice}`
      ])
    },
    {
      id: "warehouse",
      label: "Data Warehouse · agregación analítica",
      objective: "Relacionar un JOIN, agrupación y ordenamiento con contexto explícito de workarea y TEMP ilustrativo.",
      sql: "SELECT d.category, SUM(f.sales_amount) AS total_sales\nFROM fact_sales_demo f\nJOIN dim_product_demo d\n  ON d.product_id = f.product_id\nGROUP BY d.category\nORDER BY total_sales DESC;",
      questions: ["¿Qué evidencia del plan habla de TEMP?", "¿Qué no puede deducirse sin telemetría adicional?"],
      relation: "Usa HASH JOIN Visualizer para diferenciar el flujo lógico de filas y componentes internos conceptuales.",
      plan: plan([
        "Plan hash value: 66890127", "", "-----------------------------------------------------------------------------------------------------------------", "| Id  | Operation            | Name             | Starts | E-Rows | A-Rows | Buffers | OMem  | 1Mem  | Used-Mem | TempSpc |", "-----------------------------------------------------------------------------------------------------------------", "|   0 | SELECT STATEMENT     |                  |      1 |        |     12 |    1860 |       |       |          |         |", "|   1 |  SORT ORDER BY       |                  |      1 |     12 |     12 |    1860 | 2048K | 2048K | 1536K    | 64M     |", "|   2 |   HASH GROUP BY      |                  |      1 |     12 |     12 |    1801 | 3072K | 2048K | 1024K    | 32M     |", "|*  3 |    HASH JOIN         |                  |      1 |  12000 |  98500 |    1760 | 4096K | 2048K | 2048K    | 96M     |", "|   4 |     TABLE ACCESS FULL| DIM_PRODUCT_DEMO |      1 |    300 |    300 |      20 |       |       |          |         |", "|   5 |     TABLE ACCESS FULL| FACT_SALES_DEMO  |      1 | 120000 |  98500 |    1740 |       |       |          |         |", "-----------------------------------------------------------------------------------------------------------------", "", "Predicate Information (identified by operation id):", "---------------------------------------------------", "   3 - access(\"D\".\"PRODUCT_ID\"=\"F\".\"PRODUCT_ID\")", "", "Note", "-----", `   - ${notice}`, "   - TempSpc is displayed because this educational example explicitly supplies it."
      ])
    }
  ].map((example) => Object.freeze({ ...example, notice })));

  globalThis.oracleSqlIntelligenceExamples = examples;
})();
