(() => {
  "use strict";

  const EVENT_TYPES = Object.freeze(["EMBEDDING_GENERATED", "VECTOR_STORED", "VECTOR_DISTANCE_CALCULATED", "VECTOR_INDEX_SEARCH", "TOP_K_SELECTED"]);
  const location = Object.freeze({ database: "DATABASE_SIMULATED", external: "EXTERNAL_AI_SIMULATED", abstraction: "EDUCATIONAL_ABSTRACTION" });
  const eventFactory = (step, type, source, target, label, detail, metrics = {}) => Object.freeze({
    step, type, source, target, rowIds: Object.freeze(detail.rowIds || []), blockIds: Object.freeze([]), label,
    illustrativeMetrics: Object.freeze({ ...metrics, illustrative: true }), explanation: Object.freeze(detail.explanation), executionLocation: detail.executionLocation, representation: detail.representation || "logical-flow"
  });
  const ranking = (scenario, metric, candidateIds) => scenario.documents.filter((document) => candidateIds.includes(document.id)).map((document) => {
    const calculated = globalThis.OracleVectorDistanceEngine.calculate(metric, scenario.queryVector, document.vector);
    return Object.freeze({ ...document, distance: calculated.value, reason: calculated.reason || null });
  }).filter((document) => document.distance !== null).sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id));
  function run(scenario, options = {}) {
    const metric = String(options.metric || "COSINE").toUpperCase();
    const topK = Math.max(1, Math.min(Number(options.topK) || 2, scenario.documents.length));
    const approximate = options.mode === "approximate";
    const exactCandidates = scenario.documents.map((document) => document.id);
    const candidates = approximate ? scenario.approximateCandidates.slice(0, Math.max(1, Number(options.candidateCount) || scenario.approximateCandidates.length)) : exactCandidates;
    const fullRanking = ranking(scenario, metric, exactCandidates);
    const ranked = ranking(scenario, metric, candidates);
    const results = ranked.slice(0, topK);
    const exactTop = new Set(fullRanking.slice(0, topK).map((document) => document.id));
    const recovered = results.filter((document) => exactTop.has(document.id)).length;
    const recall = exactTop.size ? recovered / exactTop.size : 1;
    let step = 0;
    const events = [];
    const push = (type, source, target, label, detail, metrics) => events.push(eventFactory(++step, type, source, target, label, detail, metrics));
    push("EMBEDDING_GENERATED", "Consulta de estudiante", "Vector de consulta ilustrativo", "Se representa un embedding sintético de la consulta.", { rowIds: [], executionLocation: location.external, explanation: { what: "Un embedding es una representación numérica; este vector fue definido en el dataset y no proviene de un modelo real.", where: "Servicio externo simulado", why: "Permite demostrar comparación semántica sin llamadas externas.", dba: "No hay telemetría ni servicio real." } });
    scenario.documents.forEach((document) => push("VECTOR_STORED", "Dataset sintético", "VECTOR column simulada", `${document.label} aporta un vector almacenado.`, { rowIds: [document.id], executionLocation: location.database, explanation: { what: "El documento tiene un vector sintético.", where: "Oracle Database simulado", why: "Representa el tipo VECTOR sin afirmar almacenamiento interno.", dba: "No se muestran bloques, SGA ni métricas reales." } }));
    if (approximate) push("VECTOR_INDEX_SEARCH", "Índice vectorial conceptual", "Candidatos educativos", `La abstracción approximate evalúa ${candidates.length} de ${scenario.documents.length} candidatos.`, { rowIds: candidates, executionLocation: location.abstraction, explanation: { what: "Se reduce el conjunto de candidatos con una abstracción conceptual.", where: "Índice vectorial conceptual", why: "Permite comparar recall y trabajo ilustrativo.", dba: "No implementa ni representa internals reales de HNSW o IVF." } }, { candidatesEvaluated: candidates.length });
    ranked.forEach((document) => push("VECTOR_DISTANCE_CALCULATED", "Vector de consulta", document.id, `Distancia ${metric}: ${document.distance.toFixed(4)} para ${document.label}.`, { rowIds: [document.id], executionLocation: location.database, explanation: { what: "Se calcula una distancia sobre vectores del dataset.", where: "Operación local que representa una consulta de similitud", why: "Ordena candidatos por cercanía según la métrica elegida.", dba: "El cálculo local no mide CPU ni usa un índice Oracle real." } }, { distance: Number(document.distance.toFixed(4)) }));
    push("TOP_K_SELECTED", "Ranking ordenado", "Resultados", `Top-${topK}: ${results.map((document) => document.label).join(", ") || "sin resultados"}.`, { rowIds: results.map((document) => document.id), executionLocation: location.database, explanation: { what: "Se seleccionan los vecinos con menor distancia del ranking educativo.", where: "Resultado lógico simulado", why: "Ilustra Top-K.", dba: "Recall y candidatos son métricas ilustrativas del dataset." } }, { topK, recall: Number(recall.toFixed(2)), candidatesEvaluated: candidates.length });
    return Object.freeze({ scenarioId: scenario.id, metric, topK, mode: approximate ? "approximate" : "exact", candidates: Object.freeze(candidates), fullRanking: Object.freeze(fullRanking), ranking: Object.freeze(ranked), results: Object.freeze(results), recall, events: Object.freeze(events) });
  }
  globalThis.OracleVectorSearchEngine = Object.freeze({ EVENT_TYPES, location, run });
})();
