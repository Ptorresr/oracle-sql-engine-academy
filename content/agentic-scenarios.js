(() => {
  "use strict";
  const scenarios = [
    { id: "retail-agent", title: "Retail · consulta comercial", request: "Resume las ventas de Running", objective: "Seleccionar una herramienta de lectura con parámetros validables.", tool: "salesSummary", parameters: { category: "Running" }, permitted: true, result: "Ventas Running: 128000 (resultado sintético)", limit: 1, security: "Solo consulta de lectura autorizada; no hay ejecución externa." },
    { id: "finance-agent", title: "Finanzas · métrica mensual", request: "Calcula partidas pendientes", objective: "Mostrar autorización y límite de una herramienta financiera de solo lectura.", tool: "pendingItems", parameters: { status: "PENDING" }, permitted: true, result: "14 partidas pendientes (resultado sintético)", limit: 1, security: "Los parámetros son una lista permitida local; no sustituyen controles de base de datos." },
    { id: "operations-agent", title: "Operaciones · acción sensible", request: "Reinicia el servicio afectado", objective: "Mostrar rechazo de una herramienta sensible sin confirmación y permiso.", tool: "restartService", parameters: { service: "network-gateway" }, permitted: false, result: "Operación no autorizada: requiere permiso y confirmación humana.", limit: 0, security: "La simulación no invoca herramientas, MCP, servicios ni Oracle Database." }
  ].map((scenario) => Object.freeze({ ...scenario, questions: Object.freeze(["¿Qué herramienta se selecciona?", "¿Qué parámetros se validan?", "¿La herramienta está autorizada?", "¿Qué límite de ejecución aplica?", "¿Cuándo se requiere confirmación humana?" ]), parameters: Object.freeze(scenario.parameters) }));
  globalThis.oracleAgenticScenarios = Object.freeze(scenarios);
})();
