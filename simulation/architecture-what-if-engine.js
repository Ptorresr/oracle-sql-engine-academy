(() => {
  "use strict";
  const compare = (architecture, options = {}) => {
    const users = options.users || "medium";
    const documents = options.documents || "medium";
    const privateConnectivity = options.privateConnectivity !== "no";
    const authorization = options.authorization !== "no";
    const considerations = [];
    if (users === "high") considerations.push("Más usuarios elevan la necesidad de revisar escalabilidad y límites de servicios.");
    if (documents === "high") considerations.push("Más documentos añaden dependencia de ingestión, almacenamiento y estrategia de recuperación.");
    if (!privateConnectivity) considerations.push("La conectividad pública exige revisar exposición, identidad, cifrado y controles compensatorios.");
    if (!authorization) considerations.push("La ausencia de autorización representada es un riesgo educativo prioritario.");
    const hypotheses = Object.freeze(considerations.length ? considerations : ["La alternativa conserva las dependencias representadas; validar requisitos reales."]);
    const complexity = Math.min(5, 2 + (users === "high") + (documents === "high") + Number(!privateConnectivity) + Number(!authorization));
    return Object.freeze({
      architectureId: architecture.id,
      baseline: Object.freeze({ facts: Object.freeze({ components: architecture.nodes.length, connections: architecture.edges.length }) }),
      alternative: Object.freeze({ hypotheses, illustrativeMetrics: Object.freeze({ complexity }), complexity, considerations: hypotheses }),
      illustrative: true
    });
  };
  globalThis.OracleArchitectureWhatIfEngine = Object.freeze({ compare });
})();
