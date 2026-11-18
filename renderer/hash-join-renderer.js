(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "NULL").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  const flattenRows = (side) => side.blocks.flatMap((block) => block.rows.map((row) => ({ ...row, blockId: block.id })));
  const columns = (rows) => Object.keys(rows[0] || {}).filter((column) => column !== "id" && column !== "blockId");

  const selected = (selection, kind, value) => selection?.kind === kind && selection.id === value;

  function renderRows(side, activeIds, selection) {
    const rows = flattenRows(side);
    const header = columns(rows).map((column) => `<th>${escapeHtml(column)}</th>`).join("");
    const body = rows.map((row) => `<tr class="${activeIds.has(row.id) ? "is-active" : ""} ${selected(selection, "row", row.id) ? "is-selected" : ""}" data-engine-row="${escapeHtml(row.id)}" tabindex="0" role="button" aria-label="Inspeccionar fila ${escapeHtml(row.id)}">${columns(rows).map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`).join("");
    const blocks = side.blocks.map((block) => `<button class="hash-block ${selected(selection, "block", block.id) ? "is-selected" : ""}" type="button" data-engine-block="${escapeHtml(block.id)}">${escapeHtml(block.id)} · ${block.rows.length} filas</button>`).join("");
    return `<div class="hash-table"><h4>${escapeHtml(side.name)} <span>${rows.length} filas</span></h4><div class="hash-block-list" aria-label="Bloques de ${escapeHtml(side.name)}">${blocks}</div><div class="scroll"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div></div>`;
  }

  function renderResult(scenario, state, selection) {
    const build = flattenRows(scenario.build);
    const probe = flattenRows(scenario.probe);
    const rows = state.output.map(({ buildId, probeId }) => ({ build: build.find((row) => row.id === buildId), probe: probe.find((row) => row.id === probeId) }));
    const content = rows.length ? rows.map(({ build: buildRow, probe: probeRow }) => `<tr class="${selected(selection, "row", buildRow.id) || selected(selection, "row", probeRow.id) ? "is-selected" : ""}"><td>${escapeHtml(buildRow[scenario.build.key])}</td><td>${escapeHtml(buildRow.nombre || buildRow.referencia || buildRow.categoria)}</td><td>${escapeHtml(probeRow.pedido_id || probeRow.movimiento_id || probeRow.venta_id)}</td><td>${escapeHtml(probeRow.importe ?? probeRow.monto)}</td></tr>`).join("") : '<tr><td colspan="4">Aún no hay filas emitidas.</td></tr>';
    return `<div class="hash-result"><h4>Resultado lógico <span>${rows.length} de ${scenario.expectedRows} fila(s)</span></h4><div class="scroll"><table><thead><tr><th>Clave</th><th>Build</th><th>Probe</th><th>Importe</th></tr></thead><tbody>${content}</tbody></table></div></div>`;
  }

  function renderDeveloper(scenario, state, selection) {
    const activeIds = new Set(state.current?.rowIds || []);
    return `${renderRows(scenario.build, activeIds, selection)}${renderRows(scenario.probe, activeIds, selection)}${renderResult(scenario, state, selection)}`;
  }

  function renderPlan(scenario, state, selection) {
    const currentType = state.current?.type || "READ_BLOCK";
    const operator = (id, name, types, component) => `<button class="plan-operator ${types.includes(currentType) ? "is-active" : ""} ${selected(selection, "operator", id) ? "is-selected" : ""}" type="button" data-engine-operator="${id}" data-engine-component="${component}"><span>${name}</span><small>${types.join(" · ")}</small></button>`;
    return `<div class="plan-flow" aria-label="Plan conceptual de HASH JOIN">
      ${operator("build-access", `TABLE ACCESS FULL ${scenario.build.name}`, ["READ_BLOCK", "CACHE_HIT", "CACHE_MISS", "TABLE_ACCESS", "HASH_BUILD"], "SQL Execution Engine")}
      <span aria-hidden="true">→</span>${operator("hash-build", "HASH BUILD", ["HASH_BUILD", "SPILL_TEMP"], "PGA Hash Workarea")}
      <span aria-hidden="true">→</span>${operator("hash-join", "HASH JOIN", ["HASH_PROBE", "EMIT_ROW"], "SQL Execution Engine")}
      <span aria-hidden="true">←</span>${operator("probe-access", `TABLE ACCESS FULL ${scenario.probe.name}`, ["READ_BLOCK", "CACHE_HIT", "CACHE_MISS", "TABLE_ACCESS", "HASH_PROBE"], "SQL Execution Engine")}
    </div><p class="hash-plan-note">Cardinalidad conceptual de salida: <strong>${state.output.length}</strong> de ${scenario.expectedRows} esperadas. No es un plan estimado ni observado.</p>`;
  }

  function renderInternals(scenario, state, selection) {
    const type = state.current?.type || "READ_BLOCK";
    const active = (types) => types.includes(type) ? " engine-node-active" : "";
    const tempVisible = state.metrics.tempPartitions > 0;
    const componentSelected = (component) => selected(selection, "component", component) ? " engine-node-selected" : "";
    const blockLabel = selection?.kind === "block" ? selection.id : (state.current?.blockIds?.join(", ") || "bloques");
    return `<figure class="generated-illustration hash-illustration"><img src="assets/illustrations/hash-join-tech.png" width="1280" height="720" loading="lazy" alt="Ilustración tridimensional del procesamiento de un HASH JOIN entre bloques, memoria y resultado"><figcaption>Ilustración conceptual 3D del flujo HASH JOIN. El SVG inferior conserva la selección de componentes y el inspector sincronizado.</figcaption></figure><svg class="hash-engine-svg" viewBox="0 0 920 300" role="img" aria-labelledby="hashSvgTitle hashSvgDesc">
      <title id="hashSvgTitle">Flujo conceptual de un HASH JOIN</title><desc id="hashSvgDesc">Almacenamiento, Buffer Cache, operadores SQL, workarea PGA y TEMP se resaltan según el evento educativo seleccionado.</desc>
      <defs><marker id="hashEngineArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#4cd9df"/></marker></defs>
      <path d="M165 145H248M410 145H495M665 145H748" fill="none" stroke="#4cd9df" stroke-width="4" marker-end="url(#hashEngineArrow)"/>
      <path d="M580 220V270H790V220" fill="none" stroke="#ffb65d" stroke-width="4" stroke-dasharray="8 6" marker-end="url(#hashEngineArrow)"/>
      <g class="engine-node${active(["READ_BLOCK", "CACHE_MISS"])}${componentSelected("Storage")}" data-engine-component="Storage" tabindex="0" role="button" aria-label="Inspeccionar Storage"><rect x="20" y="72" width="145" height="150" rx="14"/><text x="92" y="110">STORAGE</text><text x="92" y="135">Datafiles / blocks</text><text x="92" y="174">${escapeHtml(blockLabel)}</text></g>
      <g class="engine-node${active(["CACHE_HIT", "CACHE_MISS"])}${componentSelected("Database Buffer Cache")}" data-engine-component="Database Buffer Cache" tabindex="0" role="button" aria-label="Inspeccionar Database Buffer Cache"><rect x="250" y="72" width="160" height="150" rx="14"/><text x="330" y="110">SGA</text><text x="330" y="135">Buffer Cache</text><text x="330" y="174">Lógicas: ${state.metrics.logicalReads}</text><text x="330" y="197">Físicas*: ${state.metrics.physicalReads}</text></g>
      <g class="engine-node${active(["TABLE_ACCESS", "HASH_PROBE", "EMIT_ROW"])}${componentSelected("SQL Execution Engine")}" data-engine-component="SQL Execution Engine" tabindex="0" role="button" aria-label="Inspeccionar SQL Execution Engine"><rect x="495" y="72" width="170" height="150" rx="14"/><text x="580" y="110">SQL ENGINE</text><text x="580" y="145">TABLE ACCESS</text><text x="580" y="177">HASH JOIN</text></g>
      <g class="engine-node${active(["HASH_BUILD", "HASH_PROBE", "SPILL_TEMP"])}${componentSelected("PGA Hash Workarea")}" data-engine-component="PGA Hash Workarea" tabindex="0" role="button" aria-label="Inspeccionar PGA Hash Workarea"><rect x="750" y="72" width="150" height="150" rx="14"/><text x="825" y="110">PGA</text><text x="825" y="135">Hash Workarea</text><text x="825" y="174">Build: ${state.metrics.hashRows}</text><text x="825" y="197">Buckets*</text></g>
      <g class="engine-node${tempVisible ? " engine-node-active" : ""}${componentSelected("TEMP")}" data-engine-component="TEMP" tabindex="0" role="button" aria-label="Inspeccionar TEMP"><rect x="650" y="244" width="145" height="42" rx="11"/><text x="722" y="270">TEMP: ${state.metrics.tempPartitions}</text></g>
    </svg><p class="hash-legend">* Métricas ilustrativas. Las flechas muestran dependencias conceptuales, no movimiento físico literal de filas.</p>`;
  }

  globalThis.OracleHashJoinRenderer = Object.freeze({ renderDeveloper, renderPlan, renderInternals });
})();
