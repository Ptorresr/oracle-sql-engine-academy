(() => {
  "use strict";

  const unique = (items) => [...new Set(items)];
  const nodeComponents = (architecture) => unique(architecture.nodes.map((node) => node.componentId));
  const edgeByComponents = (architecture) => architecture.edges.map((edge) => ({ ...edge, sourceComponent: architecture.nodes.find((node) => node.id === edge.source)?.componentId, targetComponent: architecture.nodes.find((node) => node.id === edge.target)?.componentId }));
  const finding = (id, criterion, status, evidence, explanation, recommendation, affectedNodes = [], affectedEdges = [], severity = status === "met" ? "info" : "warning") => Object.freeze({ id, criterion, status, evidence, explanation, recommendation, affectedNodes: Object.freeze(affectedNodes), affectedEdges: Object.freeze(affectedEdges), severity });

  const evaluate = (challenge, architecture) => {
    const components = nodeComponents(architecture);
    const edges = edgeByComponents(architecture);
    const findings = [];
    const met = [];
    const missing = [];
    const componentNodes = (ids) => architecture.nodes.filter((node) => ids.includes(node.componentId)).map((node) => node.id);
    const evaluateCriterion = (requirement) => {
      let matched = false;
      let evidence = "";
      let nodes = [];
      let affectedEdges = [];
      if ((requirement.kind === "component" || requirement.kind === "security") && requirement.componentIds) {
        matched = requirement.componentIds.some((id) => components.includes(id));
        nodes = componentNodes(requirement.componentIds);
        evidence = matched ? `Representado: ${requirement.componentIds.filter((id) => components.includes(id)).join(", ")}.` : `Falta una alternativa de ${requirement.label.toLowerCase()}.`;
      }
      if (requirement.kind === "flow") {
        matched = edges.some((edge) => (requirement.from ? requirement.from.includes(edge.sourceComponent) && requirement.to.includes(edge.targetComponent) : true) && (requirement.dataTypes ? requirement.dataTypes.includes(edge.dataType) : true) && (requirement.relationships ? requirement.relationships.includes(edge.relationship) : true));
        affectedEdges = edges.filter((edge) => (requirement.dataTypes ? requirement.dataTypes.includes(edge.dataType) : true) || (requirement.relationships ? requirement.relationships.includes(edge.relationship) : true)).map((edge) => edge.id);
        evidence = matched ? "Existe una conexión representada compatible con el criterio." : "No existe una ruta representada que cumpla el criterio.";
      }
      if (requirement.edgeSecurityContext) {
        matched = edges.some((edge) => edge.securityContext === requirement.edgeSecurityContext);
        affectedEdges = edges.filter((edge) => edge.securityContext === requirement.edgeSecurityContext).map((edge) => edge.id);
        evidence = matched ? `Existe una operación marcada como ${requirement.edgeSecurityContext}.` : `No se encontró una operación marcada como ${requirement.edgeSecurityContext}.`;
      }
      if (requirement.kind === "functional") {
        matched = edges.some((edge) => (requirement.relationships ? requirement.relationships.includes(edge.relationship) : true) && (requirement.dataTypes ? requirement.dataTypes.includes(edge.dataType) : true));
        affectedEdges = edges.filter((edge) => (requirement.relationships ? requirement.relationships.includes(edge.relationship) : true) || (requirement.dataTypes ? requirement.dataTypes.includes(edge.dataType) : true)).map((edge) => edge.id);
        evidence = matched ? "Existe una ruta funcional representada en el grafo." : "No existe una ruta funcional suficiente para este criterio.";
      }
      if (requirement.kind === "security" && !requirement.componentIds && !requirement.edgeSecurityContext) {
        matched = edges.some((edge) => (requirement.relationships ? requirement.relationships.includes(edge.relationship) : true) && (requirement.dataTypes ? requirement.dataTypes.includes(edge.dataType) : true));
        affectedEdges = edges.filter((edge) => (requirement.relationships ? requirement.relationships.includes(edge.relationship) : true) || (requirement.dataTypes ? requirement.dataTypes.includes(edge.dataType) : true)).map((edge) => edge.id);
        evidence = matched ? "Existe evidencia de control en la conexión representada." : "No existe evidencia de control suficiente en las conexiones.";
      }
      const status = matched ? "met" : "missing";
      const current = finding(`${challenge.id}:${requirement.id}`, requirement.label, status, evidence, matched ? "El modelo actual satisface este criterio educativo." : "La variante aún no representa el requisito o la evidencia es insuficiente.", matched ? "Conservar la decisión y validarla con el contexto real." : "Añadir o conectar componentes sin asumir que una conexión implica autorización.", nodes, affectedEdges, matched ? "info" : requirement.kind === "security" ? "error" : "warning");
      findings.push(current);
      (matched ? met : missing).push(requirement.id);
    };
    challenge.requirements.forEach(evaluateCriterion);
    const score = {
      functional: Math.round((met.filter((id) => challenge.requirements.find((item) => item.id === id)?.kind === "functional").length / Math.max(1, challenge.requirements.filter((item) => item.kind === "functional").length)) * challenge.scoring.functional),
      components: Math.round((met.filter((id) => challenge.requirements.find((item) => item.id === id)?.kind === "component").length / Math.max(1, challenge.requirements.filter((item) => item.kind === "component").length)) * challenge.scoring.components),
      flow: Math.round((met.filter((id) => challenge.requirements.find((item) => item.id === id)?.kind === "flow").length / Math.max(1, challenge.requirements.filter((item) => item.kind === "flow").length)) * challenge.scoring.flow),
      security: Math.round((met.filter((id) => challenge.requirements.find((item) => item.id === id)?.kind === "security").length / Math.max(1, challenge.requirements.filter((item) => item.kind === "security").length)) * challenge.scoring.security),
      decisions: 10
    };
    const total = Math.max(0, Math.min(100, Object.values(score).reduce((sum, value) => sum + value, 0)));
    return Object.freeze({ challengeId: challenge.id, score: Object.freeze({ ...score, total }), status: total === 100 ? "complete" : "in-progress", findings: Object.freeze(findings), met: Object.freeze(met), missing: Object.freeze(unique(missing)), facts: Object.freeze({ components: components.length, connections: architecture.edges.length }), limitations: Object.freeze(["Puntuación educativa determinista; no es certificación Oracle ni validación real de seguridad.", "Una arquitectura alternativa puede ser válida aunque no coincida con una topología de referencia."]) });
  };

  globalThis.OracleArchitectureChallengeEvaluator = Object.freeze({ evaluate });
})();
