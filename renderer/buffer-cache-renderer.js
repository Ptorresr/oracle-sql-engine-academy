(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "NULL").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  const selected = (selection, kind, id) => selection?.kind === kind && selection.id === id;
  const rowsFor = (scenario, rowIds) => scenario.tables.flatMap((table) => table.rows.map((row) => ({ ...row, table: table.name }))).filter((row) => rowIds.includes(row.id));
  const blockFor = (scenario, blockId) => scenario.blockLayout.find((block) => block.blockId === blockId) || null;

  function renderDeveloper(scenario, state, selection) {
    const currentBlockId = state.current?.blockIds?.[0] || scenario.blockLayout[0]?.blockId;
    const currentBlock = blockFor(scenario, currentBlockId);
    const activeRows = new Set(state.current?.rowIds || []);
    const rows = rowsFor(scenario, currentBlock?.rowIds || []);
    const columns = Object.keys(rows[0] || {}).filter((column) => !["id", "table"].includes(column));
    const blocks = scenario.blockLayout.map((block) => `<button type="button" class="buffer-block${state.current?.blockIds?.includes(block.blockId) ? " is-active" : ""}${selected(selection, "block", block.blockId) ? " is-selected" : ""}" data-buffer-block="${escapeHtml(block.blockId)}">${escapeHtml(block.blockId)}<small>${escapeHtml(block.table)} · ${block.rowIds.length} filas</small></button>`).join("");
    const body = rows.length ? rows.map((row) => `<tr class="${activeRows.has(row.id) ? "is-active" : ""}${selected(selection, "row", row.id) ? " is-selected" : ""}" data-buffer-row="${escapeHtml(row.id)}" tabindex="0" role="button" aria-label="Inspeccionar fila ${escapeHtml(row.id)}">${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`).join("") : '<tr><td>No hay filas representadas para este bloque.</td></tr>';
    return `<div class="buffer-developer"><div class="buffer-block-list" aria-label="Bloques educativos del escenario">${blocks}</div><div class="buffer-current-block"><h4>${escapeHtml(currentBlock?.blockId || "Bloque no disponible")}</h4><p>Tabla: <strong>${escapeHtml(currentBlock?.table || "no informada")}</strong>. Las filas se entregan solo en el paso <code>TABLE_ACCESS</code>.</p><div class="scroll"><table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div></div></div>`;
  }

  function renderPlan(state, selection) {
    const eventType = state.current?.type || "READ_BLOCK";
    const operator = (id, label, types, description) => `<button type="button" class="buffer-operator${types.includes(eventType) ? " is-active" : ""}${selected(selection, "operator", id) ? " is-selected" : ""}" data-buffer-operator="${id}"><strong>${label}</strong><small>${description}</small></button>`;
    return `<div class="buffer-plan" aria-label="Flujo conceptual de acceso a datos">
      ${operator("logical-read", "Solicitud lógica", ["READ_BLOCK"], "El SQL solicita un bloque educativo.")}
      <span aria-hidden="true">→</span>
      ${operator("cache-lookup", "Búsqueda en caché", ["CACHE_HIT", "CACHE_MISS"], "El modelo resuelve hit o miss.")}
      <span aria-hidden="true">→</span>
      ${operator("table-access", "TABLE ACCESS conceptual", ["TABLE_ACCESS"], "Las filas sintéticas quedan disponibles.")}
    </div><p class="buffer-plan-note">Este flujo ayuda a leer un acceso lógico. No es un plan <code>DBMS_XPLAN</code>, no confirma un método real ni atribuye un I/O físico a una cláusula SQL.</p>`;
  }

  function renderInternals(state, selection) {
    const eventType = state.current?.type || "READ_BLOCK";
    const active = (types) => types.includes(eventType) ? " is-active" : "";
    const chosen = (component) => selected(selection, "component", component) ? " is-selected" : "";
    const residents = state.cacheState?.residentBlockIds?.join(", ") || "ninguno";
    return `<figure class="generated-illustration buffer-illustration"><img src="assets/illustrations/buffer-cache-tech.svg" width="1280" height="720" loading="lazy" alt="Ilustración tridimensional de bloques, Buffer Cache y SQL Execution Engine"><figcaption>Ilustración local de bloques, caché y motor SQL. El SVG y el timeline debajo conservan la semántica técnica, selección e inspector.</figcaption></figure><svg class="buffer-engine-svg" viewBox="0 0 920 310" role="img" aria-labelledby="bufferSvgTitle bufferSvgDesc"><title id="bufferSvgTitle">Flujo conceptual Buffer Cache e I/O</title><desc id="bufferSvgDesc">Un bloque se solicita lógicamente, se busca en una caché conceptual y entrega filas sintéticas al motor SQL. Los componentes se resaltan según el evento seleccionado.</desc><defs><marker id="bufferEngineArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path class="buffer-engine-path" d="M704 132H610M318 132H232M318 210H610" marker-end="url(#bufferEngineArrow)"/><g class="buffer-node${active(["READ_BLOCK", "CACHE_MISS"])}${chosen("Datafiles / blocks")}" data-buffer-component="Datafiles / blocks" tabindex="0" role="button" aria-label="Inspeccionar Datafiles y bloques"><rect x="54" y="72" width="178" height="145" rx="16"/><text x="143" y="111">DATAFILES</text><text x="143" y="139">Bloques educativos</text><text x="143" y="173">${escapeHtml(state.current?.blockIds?.join(", ") || "sin bloque")}</text></g><g class="buffer-node${active(["CACHE_HIT", "CACHE_MISS", "TABLE_ACCESS"])}${chosen("Database Buffer Cache")}" data-buffer-component="Database Buffer Cache" tabindex="0" role="button" aria-label="Inspeccionar Database Buffer Cache"><rect x="318" y="52" width="292" height="185" rx="16"/><text x="464" y="94">SGA · Buffer Cache</text><text x="464" y="130">Residentes: ${escapeHtml(residents)}</text><text x="464" y="163">Capacidad*: ${state.cacheState?.capacityBlocks || 0}</text><text x="464" y="194">Hits*: ${state.metrics.cacheHits} · Misses*: ${state.metrics.cacheMisses}</text></g><g class="buffer-node${active(["READ_BLOCK", "TABLE_ACCESS"])}${chosen("SQL Execution Engine")}" data-buffer-component="SQL Execution Engine" tabindex="0" role="button" aria-label="Inspeccionar SQL Execution Engine"><rect x="704" y="72" width="166" height="145" rx="16"/><text x="787" y="111">SQL ENGINE</text><text x="787" y="139">TABLE ACCESS</text><text x="787" y="173">Filas*: ${state.metrics.rowsDelivered}</text></g></svg><p class="buffer-legend">* Valores ilustrativos del escenario. La cola FIFO, las rutas y los contadores no reproducen la gestión interna de Buffer Cache.</p>`;
  }

  function renderResults(state) {
    const metrics = state.metrics || {};
    const event = state.current || {};
    return `<div class="buffer-results"><p><strong>${escapeHtml(event.type || "Sin evento")}</strong> · ${escapeHtml(event.label || "No hay resultado seleccionado.")}</p><dl><div><dt>Filas entregadas*</dt><dd>${escapeHtml(metrics.rowsDelivered ?? 0)}</dd></div><div><dt>Solicitudes lógicas*</dt><dd>${escapeHtml(metrics.logicalRequests ?? 0)}</dd></div><div><dt>Lecturas físicas conceptuales*</dt><dd>${escapeHtml(metrics.conceptualPhysicalReads ?? 0)}</dd></div></dl><p>Estos contadores proceden del estado actual del modelo. No son Buffer Gets, I/O observados ni métricas de Oracle Database.</p></div>`;
  }

  globalThis.OracleBufferCacheRenderer = Object.freeze({ renderDeveloper, renderPlan, renderInternals, renderResults });
})();
