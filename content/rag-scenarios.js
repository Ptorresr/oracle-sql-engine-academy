(() => {
  "use strict";
  const scenarios = [
    {
      id: "retail-rag", title: "Retail · política de devoluciones", question: "¿Puedo devolver calzado usado?", objective: "Recuperar solo políticas públicas de cliente.", userRole: "customer-support",
      documents: [
        { id: "rag-retail-public", title: "Política de devoluciones", text: "El calzado sin uso puede devolverse en treinta días con comprobante.", roles: ["customer-support", "manager"] },
        { id: "rag-retail-restricted", title: "Notas internas de fraude", text: "Procedimiento interno restringido.", roles: ["manager"] }
      ], response: "Respuesta educativa predefinida: la política recuperada indica devolución de calzado sin uso dentro de treinta días.", sql: "-- Recuperación ilustrativa; no se ejecuta en GitHub Pages\nSELECT title FROM policy_chunks WHERE access_role = :role ORDER BY VECTOR_DISTANCE(embedding, :query_embedding, COSINE) FETCH FIRST :top_k ROWS ONLY;"
    },
    {
      id: "finance-rag", title: "Finanzas · guía de conciliación", question: "¿Cómo investigamos una diferencia bancaria?", objective: "Mostrar chunks permitidos y referencias de fuente.", userRole: "analyst",
      documents: [
        { id: "rag-fin-guide", title: "Guía de conciliación", text: "Compare referencia, importe, fecha y estado; documente excepciones.", roles: ["analyst", "controller"] },
        { id: "rag-fin-close", title: "Cierre confidencial", text: "Estimaciones reservadas de cierre.", roles: ["controller"] }
      ], response: "Respuesta educativa predefinida: compare referencia, importe, fecha y estado y registre la excepción.", sql: "SELECT chunk_text FROM reconciliation_chunks WHERE role_name = :role FETCH FIRST :top_k ROWS ONLY;"
    },
    {
      id: "operations-rag", title: "Operaciones · incidente de red", question: "¿Qué reviso ante alta latencia?", objective: "Construir contexto de runbook accesible al rol de operaciones.", userRole: "operator",
      documents: [
        { id: "rag-ops-runbook", title: "Runbook de latencia", text: "Verifique alcance, métricas autorizadas, cambios recientes y ruta de escalamiento.", roles: ["operator", "sre"] },
        { id: "rag-ops-secret", title: "Credenciales de contingencia", text: "Información restringida no recuperable.", roles: ["sre"] }
      ], response: "Respuesta educativa predefinida: verifique alcance, cambios recientes y siga la ruta de escalamiento.", sql: "-- Los filtros de permiso deben ocurrir antes de construir contexto para el modelo."
    }
  ].map((scenario) => Object.freeze({ ...scenario, questions: Object.freeze(["¿Qué documento queda excluido por permisos?", "¿Cuándo se aplica el filtro de acceso?", "¿Cómo afectan chunk size y overlap?", "¿Qué chunks forman el contexto?", "¿Por qué la respuesta es predefinida?" ]), documents: Object.freeze(scenario.documents.map((document) => Object.freeze({ ...document, roles: Object.freeze(document.roles) }))) }));
  globalThis.oracleRagScenarios = Object.freeze(scenarios);
})();
