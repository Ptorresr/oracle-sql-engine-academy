(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "—").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]);
  const format = (value) => value === null || value === undefined ? "—" : Number.isFinite(value) ? value.toLocaleString("es-MX", { maximumFractionDigits: 2 }) : String(value);

  function renderCardinality(rows) {
    return `<div class="cardinality-list">${rows.map((row) => `<article><h4>Operador ${escapeHtml(row.nodeId)}</h4><dl><div><dt>E-Rows importadas</dt><dd>${format(row.estimated)}</dd></div><div><dt>A-Rows importadas</dt><dd>${format(row.observed)}</dd></div><div><dt>Starts importados</dt><dd>${format(row.starts)}</dd></div><div><dt>A-Rows/Starts derivado</dt><dd>${format(row.normalizedObserved)}</dd></div><div><dt>Factor aproximado</dt><dd>${row.factor === null ? "—" : `${format(row.factor)}×`}</dd></div></dl><p>${escapeHtml(row.interpretation)}</p><span>Confianza: ${escapeHtml(row.confidence)}</span></article>`).join("") || "<p class=\"muted\">No hay estadísticas de cardinalidad para analizar.</p>"}</div>`;
  }

  function renderFindings(findings) {
    return `<div class="insight-list">${findings.map((item) => `<article class="insight insight-${escapeHtml(item.severity)}"><h4>${escapeHtml(item.title)}</h4><p><strong>Evidencia:</strong> ${escapeHtml(item.evidence)}</p><p><strong>Interpretación:</strong> ${escapeHtml(item.explanation)}</p><p><strong>Hipótesis:</strong> ${escapeHtml(item.hypothesis)}</p><p><strong>Comprobar:</strong> ${escapeHtml(item.recommendedChecks.join(" "))}</p><p><strong>Límite:</strong> ${escapeHtml(item.limitations.join(" "))}</p></article>`).join("") || "<p class=\"muted\">No hay hallazgos basados en la información disponible.</p>"}</div>`;
  }

  function renderSqlAnalysis(result) {
    return `<div class="sql-analysis-list">${result.patterns.map((item) => `<article><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.explanation)}</p><small>${escapeHtml(item.limitation)}</small></article>`).join("") || "<p class=\"muted\">No se detectaron patrones soportados.</p>"}</div><ul class="limit-list">${result.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function renderWhatIf(result) {
    return `<div class="whatif-result"><span class="data-pill hypothetical">Escenario hipotético</span>${result.observations.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}<p><strong>${escapeHtml(result.disclaimer)}</strong></p></div>`;
  }

  function renderDiagnosticRecord(state) {
    if (!state?.node || !state.current) return "<p class=\"muted\">Importe un plan y seleccione un operador para recorrer evidencia diagnóstica.</p>";
    const evidence = state.evidence?.metricNames?.length ? state.evidence.metricNames.join(", ") : "No informado";
    const findings = state.findings?.length ? renderFindings(state.findings) : "<p class=\"muted\">No hay hallazgos locales para este operador con la evidencia disponible.</p>";
    const cardinality = state.cardinality ? `<p><strong>Cálculo derivado:</strong> ${escapeHtml(state.cardinality.interpretation)}</p>` : "<p><strong>Cálculo derivado:</strong> No informado.</p>";
    return `<article class="diagnostic-record"><p><strong>Evidencia importada:</strong> formato ${escapeHtml(state.evidence?.format || "no informado")}; métricas: ${escapeHtml(evidence)}. Predicado: ${escapeHtml(state.node.predicate || "No informado")}.</p>${cardinality}<p><strong>Interpretación educativa:</strong> ${escapeHtml(state.current.explanation?.how || "No informado")}</p><p><strong>Limitación:</strong> ${escapeHtml(state.current.explanation?.dba || "No se infieren métricas ni causas ausentes.")}</p>${findings}</article>`;
  }

  globalThis.OracleSqlIntelligenceRenderer = Object.freeze({ escapeHtml, renderCardinality, renderFindings, renderSqlAnalysis, renderWhatIf, renderDiagnosticRecord });
})();
