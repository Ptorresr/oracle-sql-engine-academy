(() => {
  "use strict";
  const EVENT_TYPES = Object.freeze(["PROMPT_RECEIVED", "SCHEMA_CONTEXT_PREPARED", "SQL_PROPOSED", "SQL_VALIDATED", "SQL_RESULT_SIMULATED"]);
  const run = (scenario) => {
    const definitions = [
      ["PROMPT_RECEIVED", "Usuario", "Aplicación", "Se recibe una pregunta en lenguaje natural.", "APPLICATION_SIMULATED", "La pregunta se conserva como ejemplo local; no se envía a un LLM."],
      ["SCHEMA_CONTEXT_PREPARED", "Esquema permitido", "Contexto", `Se prepara: ${scenario.schema}.`, "DATABASE_SIMULATED", "El esquema es fijo y autorizado solo para el escenario."],
      ["SQL_PROPOSED", "Proveedor de IA simulado", "SQL predefinido", "Se muestra SQL de ejemplo predefinido.", "EXTERNAL_AI_SIMULATED", "No hubo generación: el SQL predefinido pertenece al dataset educativo."],
      ["SQL_VALIDATED", "Política local", "SQL propuesto", "La simulación marca el SQL como revisado para el escenario.", "EDUCATIONAL_ABSTRACTION", "Las validaciones reales dependen de privilegios, políticas y revisión humana."],
      ["SQL_RESULT_SIMULATED", "Consulta autorizada simulada", "Resultado", scenario.result, "DATABASE_SIMULATED", "No se ejecuta SQL ni se consulta Oracle Database desde el navegador."]
    ];
    return Object.freeze({ scenarioId: scenario.id, events: Object.freeze(definitions.map(([type, source, target, label, executionLocation, detail], index) => Object.freeze({ step: index + 1, type, source, target, rowIds: Object.freeze([]), blockIds: Object.freeze([]), label, illustrativeMetrics: Object.freeze({ illustrative: true }), explanation: Object.freeze({ what: label, where: executionLocation, why: "Explica el flujo conceptual de Select AI.", dba: detail }), executionLocation, representation: "select-ai-flow" }))) });
  };
  globalThis.OracleSelectAiFlowEngine = Object.freeze({ EVENT_TYPES, run });
})();
