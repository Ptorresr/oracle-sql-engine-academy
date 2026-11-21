(() => {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function selected(selection, kind, id) {
    return selection?.kind === kind && selection.id === id ? " is-selected" : "";
  }

  function active(state, types) {
    return types.includes(state.current?.type) ? " is-active" : "";
  }

  function formatSelectivity(value) {
    return `${Math.round(Number(value || 0) * 100)}%`;
  }

  function renderDeveloper(scenario, state, selection) {
    const rows = scenario.tables.flatMap((table) => table.rows.map((row) => ({ ...row, table: table.name })));
    const rowButtons = rows.map((row) => `<tr class="${selected(selection, "row", row.id)}" data-optimizer-row="${escapeHtml(row.id)}" tabindex="0" role="button" aria-label="Inspeccionar fila ${escapeHtml(row.id)}"><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.table)}</td><td>${escapeHtml(Object.entries(row).filter(([key]) => !["id", "table"].includes(key)).slice(0, 2).map(([, value]) => value ?? "NULL").join(" · "))}</td></tr>`).join("");
    const blocks = scenario.blockLayout.map((block) => `<button type="button" class="optimizer-block${state.current?.blockIds?.includes(block.blockId) ? " is-active" : ""}${selected(selection, "block", block.blockId)}" data-optimizer-block="${escapeHtml(block.blockId)}"><strong>${escapeHtml(block.blockId)}</strong><small>${escapeHtml(block.table)} · ${block.rowIds.length} fila(s)</small></button>`).join("");
    return `<div class="optimizer-developer-summary"><p><strong>Predicado y cardinalidad:</strong> ${state.parameters.baseRows} filas base* × ${formatSelectivity(state.parameters.declaredSelectivity)} = ${state.parameters.estimatedRows} fila(s) estimada(s)*.</p><p><strong>Regla de redondeo:</strong> ${escapeHtml(state.parameters.roundingRule)}</p></div><div class="optimizer-block-list" aria-label="Bloques sintéticos">${blocks}</div><div class="table-wrap"><table><thead><tr><th>Fila</th><th>Tabla</th><th>Datos visibles</th></tr></thead><tbody>${rowButtons}</tbody></table></div>`;
  }

  function alternativeButton(alternative, selection) {
    const status = alternative.selected ? "Seleccionada por la regla local" : alternative.available ? "Alternativa disponible" : "No aplicable con las entradas actuales";
    return `<button type="button" class="optimizer-alternative${alternative.selected ? " is-active" : ""}${selected(selection, "operator", alternative.id)}" data-optimizer-operator="${escapeHtml(alternative.id)}" aria-pressed="${alternative.selected ? "true" : "false"}"><strong>${escapeHtml(alternative.label)}</strong><span>${escapeHtml(status)}</span><small>${escapeHtml(alternative.limitation)}</small></button>`;
  }

  function renderPlan(state, selection) {
    const parameters = state.parameters;
    return `<div class="optimizer-plan-rule"><strong>Regla educativa visible</strong><p>${escapeHtml(parameters.formula)}. ${escapeHtml(parameters.roundingRule)}</p><p>Acceso*: <code>${escapeHtml(parameters.accessPath)}</code> · JOIN*: <code>${escapeHtml(parameters.joinAlternative)}</code></p><p>Estas etiquetas son alternativas educativas, no un plan, coste ni decisión del CBO.</p></div><div class="optimizer-alternative-grid">${parameters.alternatives.map((alternative) => alternativeButton(alternative, selection)).join("")}</div>`;
  }

  function node(id, label, detail, x, state, selection, types) {
    return `<g transform="translate(${x} 83)" class="optimizer-node${active(state, types)}${selected(selection, "component", id)}" data-optimizer-component="${escapeHtml(id)}" tabindex="0" role="button" aria-label="Inspeccionar ${escapeHtml(label)}"><rect width="190" height="104" rx="15"/><text x="95" y="39">${escapeHtml(label)}</text><text class="optimizer-svg-detail" x="95" y="69">${escapeHtml(detail)}</text><text class="optimizer-svg-detail" x="95" y="89">educativo</text></g>`;
  }

  function renderInternals(scenario, state, selection) {
    const parameters = state.parameters;
    const observation = parameters.observationRows === null ? "No declarada" : `${parameters.observationRows} declarada`;
    return `<figure class="generated-illustration optimizer-illustration"><img src="assets/illustrations/optimizer-cardinality-tech.svg" width="1280" height="720" loading="lazy" alt="Ilustración tecnológica de estadísticas declaradas, estimador de cardinalidad, alternativas educativas y resultado lógico"><figcaption>Infografía local: las rutas representan reglas visibles del modelo, no decisiones del optimizador Oracle.</figcaption></figure><svg class="optimizer-engine-svg" viewBox="0 0 980 270" role="img" aria-labelledby="optimizerSvgTitle optimizerSvgDesc"><title id="optimizerSvgTitle">Flujo conceptual de Optimizer y Cardinality</title><desc id="optimizerSvgDesc">Estadísticas declaradas alimentan un estimador educativo; la regla muestra alternativas de acceso y JOIN y luego una muestra lógica del resultado.</desc><defs><marker id="optimizerArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path class="optimizer-engine-path" d="M220 135H300M490 135H570M760 135H840" marker-end="url(#optimizerArrow)"/>${node("Statistics & Predicate Inputs", "STATISTICS", `${parameters.statisticsStatus} · ${formatSelectivity(parameters.declaredSelectivity)}`, 30, state, selection, ["CARDINALITY_ESTIMATE"])}${node("Cardinality Estimator", "ESTIMATOR", `${parameters.estimatedRows} filas*`, 300, state, selection, ["CARDINALITY_ESTIMATE", "ACCESS_PATH_SELECTED"])}${node("Access / JOIN Alternative", "ALTERNATIVE", parameters.accessPath.replace("_EDUCATIONAL", ""), 570, state, selection, ["ACCESS_PATH_SELECTED", "TABLE_ACCESS"])}${node("Logical Result Set", "RESULTS", observation, 840, state, selection, ["TABLE_ACCESS", "EMIT_ROW"] )}</svg><p class="optimizer-legend">* Métricas ilustrativas. Estadísticas disponibles, desactualizadas y ausentes cambian la interpretación del modelo; no son metadatos ni mediciones Oracle.</p>`;
  }

  function renderResults(scenario, state, selection) {
    const parameters = state.parameters;
    const rows = state.emittedRowIds.length ? state.emittedRowIds : ["Sin filas emitidas en el paso actual"];
    const observation = parameters.observationRows === null ? "Ausente: el escenario no declara observación." : `${parameters.observationRows} fila(s), declarada por el escenario (${parameters.observationSource}).`;
    return `<div class="optimizer-result${selected(selection, "component", "Logical Result Set")}" data-optimizer-component="Logical Result Set" tabindex="0" role="button" aria-label="Inspeccionar resultado lógico"><p><strong>Estimación educativa:</strong> ${parameters.estimatedRows} fila(s)*.</p><p><strong>Observación:</strong> ${escapeHtml(observation)}</p><p><strong>Alternativa seleccionada:</strong> ${escapeHtml(parameters.accessPath)} + ${escapeHtml(parameters.joinAlternative)}.</p><ul>${rows.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul><small>${escapeHtml(scenario.optimizerModel.nullBehavior)}</small></div>`;
  }

  globalThis.OracleOptimizerCardinalityRenderer = Object.freeze({ renderDeveloper, renderPlan, renderInternals, renderResults });
})();
