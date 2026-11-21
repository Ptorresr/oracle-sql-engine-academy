(() => {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function selected(selection, kind, id) {
    return selection?.kind === kind && selection.id === id ? " is-selected" : "";
  }

  function operationLabel(parameters) {
    return parameters.operation === "HASH_JOIN" ? "HASH JOIN" : "SORT";
  }

  function renderDeveloper(scenario, state, selection) {
    const rows = scenario.tables.flatMap((table) => table.rows.map((row) => ({ ...row, table: table.name }))).slice(0, 8);
    const activeRows = new Set(state.current?.rowIds || []);
    const blocks = scenario.blockLayout.map((block) => `<button type="button" class="workarea-block${state.current?.blockIds?.includes(block.blockId) ? " is-active" : ""}${selected(selection, "block", block.blockId)}" data-workarea-block="${escapeHtml(block.blockId)}">${escapeHtml(block.blockId)}<small>${escapeHtml(block.table)} · ${block.rowIds.length} filas</small></button>`).join("");
    const sample = rows.map((row) => `<tr class="${activeRows.has(row.id) ? "is-active" : ""}${selected(selection, "row", row.id)}" data-workarea-row="${escapeHtml(row.id)}" tabindex="0" role="button" aria-label="Inspeccionar fila ${escapeHtml(row.id)}"><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.table)}</td><td>${escapeHtml(Object.entries(row).filter(([key]) => key !== "id" && key !== "table").slice(0, 2).map(([, value]) => value ?? "NULL").join(" · "))}</td></tr>`).join("");
    return `<p class="workarea-view-summary">${escapeHtml(operationLabel(state.parameters))} procesa ${state.metrics.rowsProcessed} fila(s) educativas. Las filas mostradas son una muestra sintética; no representan buffers ni cardinalidad observada.</p><div class="workarea-block-list">${blocks}</div><div class="workarea-row-table"><table><thead><tr><th>Fila</th><th>Tabla</th><th>Datos visibles</th></tr></thead><tbody>${sample}</tbody></table></div>`;
  }

  function renderPlan(state, selection) {
    const operation = operationLabel(state.parameters);
    const active = (types) => types.includes(state.current?.type) ? " is-active" : "";
    const operator = (id, title, detail, types) => `<button type="button" class="workarea-operator${active(types)}${selected(selection, "operator", id)}" data-workarea-operator="${id}"><strong>${title}</strong><small>${detail}</small></button>`;
    return `<div class="workarea-plan">${operator("sql-operation", operation, "Operación SQL educativa", ["WORKAREA_ALLOCATE", "WORKAREA_PROCESS"])}<span aria-hidden="true">→</span>${operator("workarea", "PGA / Work Area", "Presupuesto y fases", ["WORKAREA_ALLOCATE", "WORKAREA_PROCESS", "WORKAREA_COMPLETE"])}<span aria-hidden="true">→</span>${operator("temp", "TEMP", "Solo si existen eventos", ["TEMP_WRITE", "TEMP_READ"])}<span aria-hidden="true">→</span>${operator("results", "Results", "Clasificación educativa", ["WORKAREA_COMPLETE"])}</div><p class="workarea-plan-note">Este flujo conceptual no es un plan <code>DBMS_XPLAN</code>, no confirma un método real ni atribuye TEMP a una cláusula SQL.</p>`;
  }

  function renderInternals(state, selection) {
    const parameters = state.parameters;
    const active = (types) => types.includes(state.current?.type) ? " is-active" : "";
    const chosen = (id) => selected(selection, "component", id);
    const tempStatus = state.metrics.tempEvents ? `${state.metrics.tempEvents} evento(s) TEMP educativo(s)` : "Sin eventos TEMP en este timeline";
    return `<figure class="generated-illustration workarea-illustration"><img src="assets/illustrations/workarea-temp-tech.svg" width="1280" height="720" loading="lazy" alt="Ilustración tridimensional de operación SQL, PGA Work Area, TEMP conceptual y resultados"><figcaption>Ilustración local de la workarea educativa. El SVG, timeline e inspector conservan la semántica técnica y la selección.</figcaption></figure><svg class="workarea-engine-svg" viewBox="0 0 980 330" role="img" aria-labelledby="workareaSvgTitle workareaSvgDesc"><title id="workareaSvgTitle">Flujo conceptual de PGA Work Area y TEMP</title><desc id="workareaSvgDesc">Una operación SQL reserva una workarea educativa, procesa filas y usa TEMP únicamente cuando el timeline emite escritura y lectura temporales.</desc><defs><marker id="workareaEngineArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path class="workarea-engine-path" d="M250 120H350M630 120H730M490 210V270" marker-end="url(#workareaEngineArrow)"/><g class="workarea-node${active(["WORKAREA_ALLOCATE", "WORKAREA_PROCESS"])}${chosen("SQL Operation")}" data-workarea-component="SQL Operation" tabindex="0" role="button" aria-label="Inspeccionar operación SQL"><rect x="40" y="58" width="210" height="130" rx="16"/><text x="145" y="103">SQL OPERATION</text><text x="145" y="134">${escapeHtml(operationLabel(parameters))}</text><text x="145" y="163">Filas*: ${state.metrics.rowsProcessed}</text></g><g class="workarea-node${active(["WORKAREA_ALLOCATE", "WORKAREA_PROCESS", "WORKAREA_COMPLETE"])}${chosen("PGA / Work Area")}" data-workarea-component="PGA / Work Area" tabindex="0" role="button" aria-label="Inspeccionar PGA y Work Area"><rect x="350" y="38" width="280" height="170" rx="16"/><text x="490" y="82">PGA · WORK AREA</text><text x="490" y="116">Presupuesto*: ${state.metrics.memoryBudgetUnits}</text><text x="490" y="146">Trabajo*: ${state.metrics.estimatedWorkUnits}</text><text x="490" y="176">${escapeHtml(parameters.classificationLabel)}</text></g><g class="workarea-node${active(["TEMP_WRITE", "TEMP_READ"])}${chosen("TEMP")}" data-workarea-component="TEMP" tabindex="0" role="button" aria-label="Inspeccionar TEMP conceptual"><rect x="385" y="248" width="210" height="58" rx="16"/><text x="490" y="281">TEMP · ${escapeHtml(tempStatus)}</text></g><g class="workarea-node${active(["WORKAREA_COMPLETE"])}${chosen("Results")}" data-workarea-component="Results" tabindex="0" role="button" aria-label="Inspeccionar resultados"><rect x="730" y="58" width="210" height="130" rx="16"/><text x="835" y="103">RESULTS</text><text x="835" y="134">Fases*: ${state.metrics.processingPhases}</text><text x="835" y="163">${escapeHtml(parameters.classificationLabel)}</text></g></svg><p class="workarea-legend">* Valores ilustrativos. Las etiquetas Optimal, One-Pass y Multi-Pass describen reglas locales; no son estadísticas PGA ni diagnóstico de Oracle.</p>`;
  }

  function renderResults(state, selection) {
    const parameters = state.parameters;
    const selectedResult = selected(selection, "component", "Results");
    return `<button type="button" class="workarea-result${selectedResult}" data-workarea-component="Results"><strong>${escapeHtml(parameters.classificationLabel)}</strong><span>Trabajo*: ${state.metrics.estimatedWorkUnits} · presupuesto*: ${state.metrics.memoryBudgetUnits}</span><span>Pasadas temporales*: ${state.metrics.temporaryPasses} · eventos TEMP*: ${state.metrics.tempEvents}</span><small>Resultado educativo: ${state.current?.type === "WORKAREA_COMPLETE" ? "completo" : "en proceso"}. No es una medición de tiempo ni una estadística observada.</small></button>`;
  }

  globalThis.OracleWorkareaTempRenderer = Object.freeze({ renderDeveloper, renderPlan, renderInternals, renderResults });
})();
