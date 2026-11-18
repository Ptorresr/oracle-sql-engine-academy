(() => {
  "use strict";
  const relationships = new Set(["HTTPS_REQUEST", "API_CALL", "AUTHENTICATION", "DATABASE_QUERY", "DATABASE_CAPABILITY", "EMBEDDING_REQUEST", "DOCUMENT_INGESTION", "MODEL_REQUEST", "AUDIT_EVENT", "OBSERVABILITY_EVENT", "AGENT_REQUEST", "TOOL_CALL"]);
  const run = (architecture = {}) => {
    const edges = Array.isArray(architecture.edges) ? architecture.edges : [];
    const nodeIds = Array.isArray(architecture.nodes) ? new Set(architecture.nodes.map((node) => node.id)) : null;
    const warnings = [];
    const validEdges = edges.filter((edge) => {
      const endpointsExist = !nodeIds || (nodeIds.has(edge.source) && nodeIds.has(edge.target));
      const relationshipIsKnown = relationships.has(edge.relationship);
      if (!endpointsExist || !relationshipIsKnown) {
        warnings.push(Object.freeze({ type: "INVALID_CONNECTION", edgeId: edge.id || "unknown", label: "La conexión no cumple el contrato actual y no se representa en el flujo." }));
        return false;
      }
      return true;
    });
    if (!validEdges.length) warnings.push(Object.freeze({ type: "NO_VALID_FLOW", label: "No hay conexiones válidas para representar un flujo educativo." }));
    return Object.freeze({
    architectureId: architecture.id,
    warnings: Object.freeze(warnings),
    events: Object.freeze(validEdges.map((edge, index) => Object.freeze({
      step: index + 1,
      type: edge.relationship,
      source: edge.source,
      target: edge.target,
      rowIds: Object.freeze([]),
      blockIds: Object.freeze([]),
      blocked: edge.securityContext === "DENIED",
      label: `${edge.relationship}: ${edge.source} → ${edge.target}`,
      illustrativeMetrics: Object.freeze({ illustrative: true, sequence: index + 1 }),
      executionLocation: edge.relationship === "DATABASE_QUERY" || edge.relationship === "DATABASE_CAPABILITY" ? "DATABASE_SIMULATED" : edge.relationship === "MODEL_REQUEST" || edge.relationship === "EMBEDDING_REQUEST" ? "EXTERNAL_AI_SIMULATED" : "APPLICATION_SIMULATED",
      explanation: Object.freeze({ what: edge.securityContext === "DENIED" ? `La operación ${edge.relationship} se bloquea educativamente antes de ejecutar una acción.` : `Flujo conceptual de ${edge.dataType}.`, where: edge.securityContext, why: "Explica una relación de arquitectura; no es tráfico real.", dba: "No representa paquetes de red, bloques ni telemetría observada." })
    })))
  });
  };
  const stateAt = (flow, step) => {
    const currentStep = Math.max(0, Math.min(Number(step) || 0, flow.events.length));
    return Object.freeze({ currentStep, completedEvents: Object.freeze(flow.events.slice(0, currentStep)) });
  };
  globalThis.OracleArchitectureFlowEngine = Object.freeze({ run, stateAt });
})();
