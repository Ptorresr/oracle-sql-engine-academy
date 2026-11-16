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
    return `<svg class="comparison-isometric" viewBox="0 0 820 260" role="img" aria-labelledby="comparisonIsoTitle comparisonIsoDesc"><title id="comparisonIsoTitle">Vista isométrica conceptual de comparación de métodos JOIN</title><desc id="comparisonIsoDesc">Dos entradas de datos llegan a operadores intercambiables y producen el mismo resultado lógico. La figura es educativa e inspirada en anatomía isométrica.</desc><g transform="translate(28 35)"><polygon points="0,48 70,10 140,48 70,86" fill="#24536b"/><polygon points="0,48 70,86 70,157 0,119" fill="#17384f"/><polygon points="140,48 70,86 70,157 140,119" fill="#2e6d7e"/><text x="70" y="115">LEFT</text></g><g transform="translate(190 35)"><polygon points="0,48 70,10 140,48 70,86" fill="#5a432c"/><polygon points="0,48 70,86 70,157 0,119" fill="#42301e"/><polygon points="140,48 70,86 70,157 140,119" fill="#865e35"/><text x="70" y="115">RIGHT</text></g><path d="M335 115H420" stroke="#4cd9df" stroke-width="5"/><path d="M445 82l55 33-55 33-55-33z" fill="#285843" stroke="#58d5a0" stroke-width="3"/><text x="445" y="120">JOIN</text><path d="M505 115H585" stroke="#4cd9df" stroke-width="5"/><g transform="translate(590 35)"><polygon points="0,48 70,10 140,48 70,86" fill="#23514e"/><polygon points="0,48 70,86 70,157 0,119" fill="#193d39"/><polygon points="140,48 70,86 70,157 140,119" fill="#36746b"/><text x="70" y="115">RESULT</text></g><text x="410" y="225">Entradas → operador intercambiable → mismo resultado lógico</text></svg>`;
  }

  globalThis.OracleJoinComparisonRenderer = Object.freeze({ renderAlgorithmCard, renderIsometricOverview });
})();
