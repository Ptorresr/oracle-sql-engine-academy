(() => {
  "use strict";
  const EVENT_TYPES = Object.freeze(["PROMPT_RECEIVED", "TOOL_SELECTED", "TOOL_AUTHORIZED", "TOOL_RESULT_RECEIVED"]);
  const run = (scenario) => {
    const steps = [
      ["PROMPT_RECEIVED", "Usuario", "Agente educativo", scenario.request, "APPLICATION_SIMULATED", "La solicitud no activa un agente real."],
      ["TOOL_SELECTED", "Agente educativo", scenario.tool, `Se selecciona ${scenario.tool} con parámetros predefinidos.`, "EDUCATIONAL_ABSTRACTION", "La selección es una regla del escenario, no razonamiento autónomo."],
      ["TOOL_AUTHORIZED", "Política local", scenario.tool, scenario.permitted ? "La herramienta de solo lectura está autorizada." : "La herramienta queda rechazada: falta permiso y confirmación humana.", "APPLICATION_SIMULATED", scenario.security],
      ["TOOL_RESULT_RECEIVED", scenario.tool, "Respuesta", scenario.result, scenario.permitted ? "DATABASE_SIMULATED" : "EDUCATIONAL_ABSTRACTION", "No se invocan MCP, servicios, herramientas ni operaciones de base de datos."]
    ];
    return Object.freeze({ scenarioId: scenario.id, permitted: scenario.permitted, events: Object.freeze(steps.map(([type, source, target, label, executionLocation, dba], index) => Object.freeze({ step: index + 1, type, source, target, rowIds: Object.freeze([]), blockIds: Object.freeze([]), label, illustrativeMetrics: Object.freeze({ executionLimit: scenario.limit, illustrative: true }), explanation: Object.freeze({ what: label, where: executionLocation, why: "Explica controles de un workflow agéntico.", dba }), executionLocation, representation: "agentic-workflow" }))) });
  };
  globalThis.OracleAgenticWorkflowEngine = Object.freeze({ EVENT_TYPES, run });
})();
