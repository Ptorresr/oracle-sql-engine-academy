(() => {
  "use strict";

  const scenarios = [
    {
      id: "retail-vectors",
      title: "Retail · recomendaciones de producto",
      objective: "Recuperar productos semánticamente cercanos a una intención de compra.",
      query: "zapatillas para correr ligeras",
      queryVector: [0.9, 0.2, 0.7],
      documents: [
        { id: "retail-1", label: "Running Aero", vector: [0.88, 0.21, 0.72], category: "running" },
        { id: "retail-2", label: "Trail Peak", vector: [0.72, 0.43, 0.66], category: "trail" },
        { id: "retail-3", label: "Bolso urbano", vector: [0.14, 0.81, 0.18], category: "accessories" },
        { id: "retail-4", label: "Sprint Lite", vector: [0.92, 0.18, 0.63], category: "running" }
      ],
      approximateCandidates: ["retail-1", "retail-4", "retail-3"],
      sql: `CREATE TABLE product_embeddings (\n  product_id NUMBER PRIMARY KEY,\n  product_name VARCHAR2(100),\n  embedding VECTOR(3, FLOAT32)\n);\n\nSELECT product_id, product_name,\n       VECTOR_DISTANCE(embedding, :query_embedding, COSINE) AS distance\nFROM product_embeddings\nORDER BY distance\nFETCH FIRST :top_k ROWS ONLY;`,
      requirements: "La sintaxis se documenta para Oracle AI Database 26ai. Los bindings, privilegios, versión y métrica deben verificarse en el entorno destino."
    },
    {
      id: "finance-vectors",
      title: "Finanzas · documentos de conciliación",
      objective: "Encontrar notas de conciliación relacionadas con una discrepancia bancaria.",
      query: "ajuste por pago duplicado",
      queryVector: [0.18, 0.91, 0.35],
      documents: [
        { id: "finance-1", label: "Pago duplicado detectado", vector: [0.2, 0.9, 0.38], category: "reconciliation" },
        { id: "finance-2", label: "Comisión bancaria", vector: [0.34, 0.73, 0.53], category: "fees" },
        { id: "finance-3", label: "Factura vencida", vector: [0.76, 0.18, 0.34], category: "invoices" },
        { id: "finance-4", label: "Reverso de transacción", vector: [0.12, 0.87, 0.28], category: "reconciliation" }
      ],
      approximateCandidates: ["finance-1", "finance-2", "finance-4"],
      sql: `SELECT document_id, title\nFROM finance_embeddings\nORDER BY VECTOR_DISTANCE(embedding, :query_embedding, EUCLIDEAN)\nFETCH FIRST 3 ROWS ONLY;`,
      requirements: "EUCLIDEAN debe ser coherente con la métrica del modelo y, si aplica, del índice vectorial."
    },
    {
      id: "operations-vectors",
      title: "Operaciones · incidentes técnicos",
      objective: "Recuperar procedimientos relacionados con un incidente de conectividad.",
      query: "procedimiento para latencia de red",
      queryVector: [0.48, 0.36, 0.89],
      documents: [
        { id: "ops-1", label: "Diagnóstico de latencia", vector: [0.51, 0.31, 0.91], category: "network" },
        { id: "ops-2", label: "Rotación de certificados", vector: [0.19, 0.82, 0.31], category: "security" },
        { id: "ops-3", label: "Escalamiento de incidente", vector: [0.44, 0.41, 0.82], category: "network" },
        { id: "ops-4", label: "Mantenimiento de almacenamiento", vector: [0.78, 0.29, 0.16], category: "storage" }
      ],
      approximateCandidates: ["ops-1", "ops-3", "ops-2"],
      sql: `CREATE VECTOR INDEX incident_embedding_hnsw\nON incident_embeddings (embedding)\nORGANIZATION INMEMORY NEIGHBOR GRAPH\nDISTANCE COSINE;`,
      requirements: "HNSW e IVF son tecnologías de índice de Oracle con parámetros y restricciones propias; esta academia no reproduce sus internals."
    }
  ].map((scenario) => Object.freeze({ ...scenario, questions: Object.freeze(["¿Qué representa el vector de consulta?", "¿Qué diferencia hay entre distancia y similitud?", "¿Qué candidatos se evaluaron?", "¿Qué significa el recall de este dataset?", "¿Qué métrica de Oracle no está mostrando esta simulación?" ]), documents: Object.freeze(scenario.documents.map((document) => Object.freeze(document))), queryVector: Object.freeze(scenario.queryVector), approximateCandidates: Object.freeze(scenario.approximateCandidates) }));

  globalThis.oracleAiVectorScenarios = Object.freeze(scenarios);
})();
