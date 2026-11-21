(() => {
  "use strict";

  const adapter = globalThis.OraclePerformanceEventAdapter;
  if (!adapter) return;

  const MAX_PLAYBACK_NODES = 160;
  const METRIC_FIELDS = Object.freeze(["starts", "eRows", "aRows", "rows", "cost", "bytes", "aTime", "buffers", "reads", "writes", "oMem", "oneMem", "usedMem", "tempSpc"]);

  function freeze(value) {
    if (Array.isArray(value)) value.forEach(freeze);
    else if (value && typeof value === "object") Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function metricNames(node) {
    return freeze(METRIC_FIELDS.filter((field) => {
      const metric = node?.metrics?.[field];
      return typeof metric?.raw === "string" && metric.raw.trim().length > 0;
    }));
  }

  function nodeById(plan, operatorId) {
    return plan.nodes.find((node) => node.id === operatorId) || null;
  }

  function evidenceFor(node, plan) {
    const names = metricNames(node);
    return freeze({
      format: plan.format || "unknown",
      operatorId: node.id,
      operation: node.operation,
      predicate: node.predicate || null,
      notesPresent: plan.metadata?.notes?.length > 0,
      metricNames: names,
      hasObservedRows: names.includes("aRows"),
      hasStarts: names.includes("starts"),
      hasTempSpc: names.includes("tempSpc")
    });
  }

  function explanationFor(phase, node, plan, analysis) {
    const evidence = evidenceFor(node, plan);
    const cardinality = analysis?.cardinalities?.find((item) => item.nodeId === node.id) || null;
    const findings = (analysis?.findings || []).filter((item) => item.relatedNodeIds?.includes(node.id));
    const metrics = evidence.metricNames.length ? evidence.metricNames.join(", ") : "ninguna";
    const cardinalityText = cardinality?.interpretation || "No hay comparación de cardinalidad disponible para este operador.";
    return freeze({
      what: phase === "start" ? `Se inicia el recorrido diagnóstico del operador importado ${node.id} · ${node.operation}.` : `Se consolida la evidencia disponible del operador importado ${node.id} · ${node.operation}.`,
      where: `Texto DBMS_XPLAN importado (${plan.format || "formato no identificado"}).`,
      how: `Métricas presentes: ${metrics}. ${cardinalityText}`,
      why: "Permite revisar evidencia, interpretación y límites sin representar una ejecución temporal o física de Oracle.",
      dba: findings.length ? `${findings.length} hallazgo(s) local(es) se relacionan con este operador; son hipótesis y comprobaciones sugeridas, no diagnóstico de producción.` : "La ausencia de un hallazgo no confirma rendimiento ni estado saludable; valide con evidencia autorizada adicional."
    });
  }

  function eventFor(step, phase, node, plan, analysis, order, playbackLimited) {
    const evidence = evidenceFor(node, plan);
    const type = phase === "start" ? "PLAN_OPERATOR_START" : "PLAN_OPERATOR_END";
    return adapter.adaptEvent({
      step,
      type,
      source: phase === "start" ? "Plan importado" : "Operador parseado",
      target: phase === "start" ? "Operador parseado" : "Event Inspector",
      rowIds: [],
      blockIds: [],
      label: phase === "start" ? `Se inicia la lectura diagnóstica de ${node.id} · ${node.operation}.` : `Se revisa la evidencia disponible de ${node.id} · ${node.operation}.`,
      illustrativeMetrics: freeze({
        illustrative: true,
        diagnosticOrder: order,
        importedEvidenceAvailable: evidence.metricNames.length > 0,
        playbackLimited
      }),
      operatorId: node.id,
      executionLocation: "EDUCATIONAL_ABSTRACTION",
      representation: "plan-diagnostics",
      explanation: explanationFor(phase, node, plan, analysis),
      decisionBasis: freeze([
        `Operador importado: ${node.id} · ${node.operation}.`,
        `Formato reconocido: ${plan.format || "unknown"}.`,
        evidence.metricNames.length ? `Columnas presentes para el operador: ${evidence.metricNames.join(", ")}.` : "El operador no aporta métricas de ejecución en el texto importado.",
        node.predicate ? "Predicado asociado por el parser cuando el identificador lo permitió." : "No hay predicado asociado por el parser."
      ])
    });
  }

  function createTimeline(plan, analysis = {}) {
    if (!plan || !Array.isArray(plan.nodes)) throw new TypeError("El timeline diagnóstico requiere un plan parseado.");
    const nodes = plan.nodes.slice(0, MAX_PLAYBACK_NODES);
    const playbackLimited = plan.nodes.length > nodes.length;
    const events = [];
    nodes.forEach((node, index) => {
      events.push(eventFor(events.length + 1, "start", node, plan, analysis, index + 1, playbackLimited));
      events.push(eventFor(events.length + 1, "end", node, plan, analysis, index + 1, playbackLimited));
    });
    const warnings = [...(plan.warnings || [])];
    if (playbackLimited) warnings.push(`La reproducción diagnóstica se limita a los primeros ${MAX_PLAYBACK_NODES} de ${plan.nodes.length} operadores; la tabla importada conserva todos los operadores reconocidos.`);
    return freeze({
      plan,
      analysis,
      events,
      warnings,
      playbackNodeIds: nodes.map((node) => node.id),
      playbackLimited
    });
  }

  function stateAt(timeline, index) {
    const events = timeline?.events || [];
    if (!events.length) return freeze({ index: -1, current: null, node: null, evidence: null, cardinality: null, findings: freeze([]), warnings: freeze(timeline?.warnings || []), playbackLimited: Boolean(timeline?.playbackLimited) });
    const safeIndex = Math.max(0, Math.min(Number.isInteger(index) ? index : 0, events.length - 1));
    const current = events[safeIndex];
    const node = nodeById(timeline.plan, current.operatorId);
    const cardinality = timeline.analysis?.cardinalities?.find((item) => item.nodeId === node?.id) || null;
    const findings = freeze((timeline.analysis?.findings || []).filter((item) => item.relatedNodeIds?.includes(node?.id)));
    return freeze({
      index: safeIndex,
      current,
      node,
      evidence: node ? evidenceFor(node, timeline.plan) : null,
      cardinality,
      findings,
      warnings: freeze(timeline.warnings || []),
      playbackLimited: Boolean(timeline.playbackLimited)
    });
  }

  function indexForOperator(timeline, operatorId, phase = "start") {
    const type = phase === "end" ? "PLAN_OPERATOR_END" : "PLAN_OPERATOR_START";
    return (timeline?.events || []).findIndex((event) => event.operatorId === operatorId && event.type === type);
  }

  globalThis.OraclePlanDiagnosticsTimeline = Object.freeze({ MAX_PLAYBACK_NODES, createTimeline, stateAt, indexForOperator });
})();
