(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const label = (value) => String(value ?? "").replaceAll("_", " ");
  const metric = (value) => value ?? "No informado";
  const active = (selected, track, index) => selected?.track === track && selected.index === index ? " is-selected" : "";

  function renderParameters(track) {
    const { optimizer, cache, workarea } = track.parameters;
    return `<dl class="whatif-parameter-grid"><div><dt>Cardinalidad*</dt><dd>${optimizer.baseRows} × ${Math.round(optimizer.declaredSelectivity * 100)}% = ${optimizer.estimatedRows}</dd></div><div><dt>Acceso / JOIN*</dt><dd>${escapeHtml(label(optimizer.accessPath))} · ${escapeHtml(label(optimizer.joinAlternative))}</dd></div><div><dt>Cache*</dt><dd>${escapeHtml(cache.cacheMode)} · ${cache.capacityBlocks} bloque(s) · ${escapeHtml(cache.accessPattern)}</dd></div><div><dt>Workarea*</dt><dd>${escapeHtml(label(workarea.classification))} · ${workarea.memoryBudgetUnits} unidades</dd></div></dl>`;
  }

  function renderDeveloper(scenario, track) {
    const rows = scenario.tables.flatMap((table) => table.rows.slice(0, 2).map((row) => `${table.name}:${row.id}`));
    return `<section class="whatif-view"><div class="kicker">Developer · snapshot ${track.id}</div><h4>SQL, datos y parámetros</h4><pre>${escapeHtml(scenario.sql)}</pre>${renderParameters(track)}<p><strong>Población declarada:</strong> ${escapeHtml(track.logicalIdentity.populationId)}.</p><p><strong>Muestra:</strong> ${escapeHtml(rows.join(" · "))}</p></section>`;
  }

  function renderPlan(track) {
    const parameters = track.parameters.optimizer;
    return `<section class="whatif-view"><div class="kicker">Execution Plan · educativo</div><h4>Alternativas, no plan Oracle</h4><p><strong>Acceso:</strong> <code>${escapeHtml(parameters.accessPath)}</code></p><p><strong>JOIN:</strong> <code>${escapeHtml(parameters.joinAlternative)}</code></p><p>${escapeHtml(parameters.decisionBasis.join(" "))}</p><small>La alternativa procede de reglas locales; no es coste, predicción ni elección del CBO.</small></section>`;
  }

  function renderInternals(track, state) {
    const cache = state.stage === "bufferCache" ? state.stageState.cacheState : track.sourceTimelines.bufferCache.events.at(-1).cacheState;
    const workarea = state.stage === "workarea" ? state.stageState.workareaState : track.sourceTimelines.workarea.events.at(-1).workareaState;
    return `<section class="whatif-view"><div class="kicker">Internals · abstracción educativa</div><h4>Cache, PGA / Workarea y TEMP</h4><figure class="generated-illustration whatif-flow-illustration"><img src="assets/illustrations/performance-what-if-tech.svg" width="1280" height="720" loading="lazy" alt="Ilustración tecnológica de entradas declaradas, Buffer Cache conceptual, workarea educativa, TEMP condicional y resultados comparados"><figcaption>El flujo activo es una explicación educativa; no representa una traza física de Oracle.</figcaption></figure><dl class="whatif-parameter-grid"><div><dt>Buffer Cache*</dt><dd>${escapeHtml((cache?.residentBlockIds || []).join(", ") || "sin bloques residentes")} · ${metric(cache?.capacityBlocks)} capacidad</dd></div><div><dt>Workarea*</dt><dd>${escapeHtml(workarea?.classification || "No informado")} · ${metric(workarea?.estimatedWorkUnits)} unidades</dd></div><div><dt>TEMP*</dt><dd>${workarea?.tempActive ? "fase temporal activa" : "sin fase temporal en este paso"}</dd></div></dl></section>`;
  }

  function renderResults(track, state) {
    const summary = state.stageState?.metrics || state.current?.illustrativeMetrics || {};
    return `<section class="whatif-view"><div class="kicker">Results · procedencia explícita</div><h4>Resultado y métricas</h4><p><strong>Identidad lógica:</strong> ${escapeHtml(track.logicalIdentity.logicalResultId)}</p><p><strong>Filas declaradas:</strong> ${escapeHtml(track.logicalIdentity.declaredResultRowIds.join(", ") || "No declaradas")}</p><p><strong>Métricas del paso:</strong> <code>${escapeHtml(JSON.stringify(summary))}</code></p><small>Las métricas provienen del motor de la etapa activa y son ilustrativas; no sustituyen evidencia importada.</small></section>`;
  }

  function renderTrack(scenario, track, state, selected) {
    const events = track.events.map((event, index) => `<button type="button" class="whatif-event${active(selected, track.id, index)}" data-whatif-track="${track.id}" data-whatif-event-index="${index}" aria-current="${active(selected, track.id, index) ? "step" : "false"}"><span>${event.step}</span>${escapeHtml(event.type)}</button>`).join("");
    return `<article class="whatif-track" data-whatif-track-panel="${track.id}"><header><div><span class="whatif-track-badge">Track ${track.id}</span><h3>${escapeHtml(track.id === "A" ? "Baseline" : "Variante")}</h3></div><p>${escapeHtml(track.disclaimer)}</p></header><div class="whatif-track-grid">${renderDeveloper(scenario, track)}${renderPlan(track)}${renderInternals(track, state)}${renderResults(track, state)}</div><section class="whatif-timeline" aria-label="Timeline del Track ${track.id}"><h4>Timeline propio</h4><div>${events}</div></section></article>`;
  }

  function renderComparison(comparison) {
    const changed = comparison.summary.changed.length ? comparison.summary.changed.map((key) => `<li>${escapeHtml(label(key))}</li>`).join("") : "<li>Sin diferencias derivadas.</li>";
    const unchanged = comparison.summary.unchanged.length ? comparison.summary.unchanged.map((key) => `<li>${escapeHtml(label(key))}</li>`).join("") : "<li>Sin métricas compartidas.</li>";
    const status = comparison.comparability.comparable ? "is-comparable" : "is-not-comparable";
    return `<section class="whatif-comparison ${status}" aria-live="polite"><div><div class="kicker">Comparación A/B</div><h3>${comparison.comparability.comparable ? "Resultado lógico comparable" : "Resultado lógico no comparable"}</h3><p>${escapeHtml(comparison.comparability.reason)}</p><small>${escapeHtml(comparison.comparability.rule)}</small></div><div><h4>Cambia*</h4><ul>${changed}</ul></div><div><h4>Permanece igual*</h4><ul>${unchanged}</ul></div></section>`;
  }

  function renderInspector(state, selectedTrack) {
    const track = selectedTrack === "A" ? state.a : state.b;
    const event = track.current;
    const explanation = event.explanation || {};
    const data = `Filas: ${event.rowIds?.join(", ") || "ninguna"}. Bloques: ${event.blockIds?.join(", ") || "ninguno"}.`;
    return `<div class="kicker">Event Inspector · Track ${escapeHtml(track.trackId)}</div><h3>${escapeHtml(`${event.step} · ${event.type}`)}</h3><dl class="whatif-inspector-grid"><div><dt>Qué ocurre</dt><dd>${escapeHtml(explanation.what || event.label)}</dd></div><div><dt>Dónde</dt><dd>${escapeHtml(explanation.where || `${event.source} → ${event.target}`)}</dd></div><div><dt>Cómo / por qué</dt><dd>${escapeHtml(`${explanation.how || "Regla local."} ${explanation.why || ""}`)}</dd></div><div><dt>Datos involucrados</dt><dd>${escapeHtml(data)}</dd></div><div><dt>Perspectiva DBA</dt><dd>${escapeHtml(explanation.dba || "Métrica educativa; validar evidencia real antes de concluir.")}</dd></div><div><dt>Procedencia</dt><dd>${escapeHtml(track.metricProvenance[track.stage])}</dd></div><div><dt>SQL relacionado</dt><dd>Las cláusulas SQL dan contexto lógico; no fuerzan el acceso, JOIN, cache o TEMP educativo.</dd></div></dl>`;
  }

  globalThis.OraclePerformanceWhatIfRenderer = Object.freeze({ escapeHtml, renderTrack, renderComparison, renderInspector });
})();
