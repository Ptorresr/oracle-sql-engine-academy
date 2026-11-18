(() => {
  "use strict";
  const EVENT_TYPES = Object.freeze(["TEXT_SEARCH", "VECTOR_SEARCH", "RESULTS_FUSED", "TOP_K_SELECTED"]);
  const tokens = (value) => String(value).toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const run = (scenario, options = {}) => {
    const textWeight = Math.max(0, Math.min(1, Number(options.textWeight ?? 0.5)));
    const vectorWeight = Number((1 - textWeight).toFixed(4));
    const queryTokens = new Set(tokens(scenario.query));
    const rows = scenario.documents.map((document) => {
      const matches = tokens(`${document.title} ${document.text}`).filter((token) => queryTokens.has(token)).length;
      const textScore = queryTokens.size ? matches / queryTokens.size : 0;
      return { ...document, textScore, vectorScore: Number(document.vectorScore) };
    });
    const maxText = Math.max(...rows.map((row) => row.textScore), 1);
    const maxVector = Math.max(...rows.map((row) => row.vectorScore), 1);
    const ranking = rows.map((row) => Object.freeze({ ...row, fusedScore: Number(((row.textScore / maxText) * textWeight + (row.vectorScore / maxVector) * vectorWeight).toFixed(4)) })).sort((left, right) => right.fusedScore - left.fusedScore || left.id.localeCompare(right.id));
    const results = ranking.slice(0, Math.max(1, Math.min(2, Number(options.topK) || 2)));
    let step = 0;
    const build = (type, source, target, label, rowIds, explanation) => Object.freeze({ step: ++step, type, source, target, rowIds: Object.freeze(rowIds), blockIds: Object.freeze([]), label, illustrativeMetrics: Object.freeze({ textWeight, vectorWeight, illustrative: true }), explanation: Object.freeze(explanation), executionLocation: "DATABASE_SIMULATED", representation: "dual-path" });
    const events = [
      build("TEXT_SEARCH", "Consulta", "Ruta textual", `Ruta textual encuentra ${rows.filter((row) => row.textScore > 0).length} coincidencia(s).`, rows.filter((row) => row.textScore > 0).map((row) => row.id), { what: "Coincidencias por tokens del dataset.", where: "Ruta textual simulada", why: "Ilustra recuperación léxica.", dba: "No afirma el ranking de Oracle Text o un índice híbrido real." }),
      build("VECTOR_SEARCH", "Consulta", "Ruta vectorial", "Ruta vectorial usa scores sintéticos declarados.", rows.map((row) => row.id), { what: "Ranking semántico sintético.", where: "Ruta vectorial simulada", why: "Ilustra una segunda señal de recuperación.", dba: "No se calculan embeddings ni distancias reales en este motor." }),
      build("RESULTS_FUSED", "Dos rankings normalizados", "Ranking combinado", `Fusión educativa: peso textual ${textWeight.toFixed(2)}, vectorial ${vectorWeight.toFixed(2)}.`, ranking.map((row) => row.id), { what: "Se combinan scores normalizados con pesos explícitos.", where: "Aplicación/estrategia educativa local", why: "Hace comparable la demostración, no los scores nativos.", dba: "Oracle puede aplicar estrategias distintas según configuración; no se atribuye esta fórmula a Oracle." }),
      build("TOP_K_SELECTED", "Ranking combinado", "Resultados", `Top-${results.length}: ${results.map((row) => row.title).join(", ")}.`, results.map((row) => row.id), { what: "Se muestran resultados finales.", where: "Resultado simulado", why: "Cierra el flujo híbrido.", dba: "Los scores son ilustrativos." })
    ];
    return Object.freeze({ scenarioId: scenario.id, textWeight, vectorWeight, ranking: Object.freeze(ranking), results: Object.freeze(results), events: Object.freeze(events) });
  };
  globalThis.OracleHybridSearchEngine = Object.freeze({ EVENT_TYPES, run });
})();
