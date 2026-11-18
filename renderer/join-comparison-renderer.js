(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "NULL").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  const selected = (selection, track) => selection?.track === track ? " is-selected" : "";

  function renderRows(side, activeIds) {
    return `<ul class="comparison-row-list">${side.rows.map((row) => `<li class="${activeIds.has(row.id) ? "is-active" : ""}"><span>${escapeHtml(row.id)}</span><span>${escapeHtml(row[side.key])}</span><small>${escapeHtml(row.label)}</small></li>`).join("")}</ul>`;
  }

  function renderAlgorithmCard(scenario, track, timeline, state, selection) {
    const algorithm = globalThis.OracleJoinComparisonEngine.ALGORITHMS[timeline.algorithm];
    const activeIds = new Set(state.current?.rowIds || []);
    const operatorLabels = {
      hash: ["TABLE ACCESS", "HASH BUILD", "HASH JOIN"],
      nested: ["TABLE ACCESS", "NESTED LOOPS", scenario.right.indexed ? "INDEX LOOKUP" : "INNER SCAN"],
      merge: ["SORT INPUT", "SORT MERGE JOIN", "MERGE ADVANCE"]
    };
    return `<article class="comparison-card${selected(selection, track)}" data-comparison-track="${track}">
      <header><div><span class="workspace-label">${track === "left" ? "Comparación A" : "Comparación B"}</span><h3>${algorithm.label}</h3></div><span class="comparison-step">${state.index + 1}/${timeline.events.length}</span></header>
      <div class="comparison-views"><section><h4>Developer</h4><div class="comparison-inputs"><div><strong>${scenario.left.name}</strong>${renderRows(scenario.left, activeIds)}</div><div><strong>${scenario.right.name}</strong>${renderRows(scenario.right, activeIds)}</div></div><p class="comparison-output">Salida lógica: <strong>${state.output.length}</strong> fila(s)</p></section>
      <section><h4>Execution Plan</h4><div class="comparison-plan">${operatorLabels[timeline.algorithm].map((operator) => `<button type="button" class="comparison-operator${state.current?.label.includes(operator.split(" ")[0]) ? " is-active" : ""}" data-comparison-operator="${timeline.algorithm}" data-comparison-track="${track}">${operator}</button>`).join("<span aria-hidden=\"true\">↓</span>")}</div></section>
      <section><h4>Internals</h4><div class="comparison-internals"><span>Bloques*: ${state.metrics.logicalReads}</span><span>Filas*: ${state.metrics.rowsRead}</span><span>Workarea*: ${state.metrics.workareaRows}</span><span>Comparaciones*: ${state.metrics.comparisons}</span></div></section></div>
      <p class="comparison-event" aria-live="polite"><strong>${state.current.type}</strong> · ${escapeHtml(state.current.label)}</p>
      <div class="comparison-events" aria-label="Timeline de ${algorithm.label}">${timeline.events.map((event, index) => `<button type="button" class="${index === state.index ? "is-active" : ""}" data-comparison-event="${index}" data-comparison-track="${track}">${event.step}</button>`).join("")}</div>
    </article>`;
  }

  function renderIsometricOverview() {
    return `<figure class="generated-illustration comparison-illustration" role="img" aria-label="Vista isométrica conceptual de comparación de métodos JOIN"><img src="assets/illustrations/sql-comparison-tech.png" width="1280" height="720" loading="lazy" alt="Ilustración tridimensional de tres caminos de ejecución SQL que llegan al mismo resultado lógico"><figcaption>Ilustración isométrica conceptual: HASH JOIN, NESTED LOOPS y SORT MERGE JOIN pueden producir el mismo resultado lógico con recorridos internos distintos.</figcaption></figure>`;
  }

  globalThis.OracleJoinComparisonRenderer = Object.freeze({ renderAlgorithmCard, renderIsometricOverview });
})();
