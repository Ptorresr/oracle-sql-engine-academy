(() => {
  "use strict";

  function ensureRoot() {
    let section = document.getElementById("performance-what-if-preview");
    if (section) return section;
    const anchor = document.getElementById("optimizer-cardinality-preview") || document.getElementById("workarea-temp-preview");
    if (!anchor) return null;
    section = document.createElement("section");
    section.id = "performance-what-if-preview";
    section.className = "section";
    section.setAttribute("aria-labelledby", "whatifTitle");
    section.innerHTML = `<div class="kicker">Laboratorio 5 · Capítulo 15</div><h2 id="whatifTitle">Performance What-If · comparación A/B de hipótesis educativas</h2><p>Compara snapshots locales de cardinalidad, acceso, Buffer Cache y workarea. El laboratorio no calcula costes, tiempos, I/O real ni predicciones del CBO; sus recorridos no son trazas físicas de Oracle Database.</p><div class="panel performance-what-if-lab" id="performanceWhatIfLab"><div class="whatif-toolbar"><label for="whatifScenario">Escenario<select id="whatifScenario"></select></label><label for="whatifEditTrack">Editar snapshot<select id="whatifEditTrack"><option value="A">Track A · baseline</option><option value="B">Track B · variante</option></select></label><label for="whatifMode">Reproducción<select id="whatifMode"><option value="sync">Modo sincronizado</option><option value="independent">Modo independiente</option></select></label><label for="whatifSelectivity">Selectividad declarada<select id="whatifSelectivity"><option value="0">0%</option><option value="0.02">2%</option><option value="0.05">5%</option><option value="0.1">10%</option><option value="0.2">20%</option><option value="0.5">50%</option><option value="0.75">75%</option><option value="1">100%</option></select></label><label for="whatifIndex">Índice declarado<select id="whatifIndex"><option value="true">Disponible</option><option value="false">No disponible</option></select></label><label for="whatifDistribution">Distribución<select id="whatifDistribution"><option value="uniform">Uniforme</option><option value="skewed">Sesgada</option></select></label><label for="whatifCache">Cache conceptual<select id="whatifCache"><option value="cold">Fría</option><option value="warm">Caliente</option></select></label><label for="whatifCapacity">Capacidad cache*<select id="whatifCapacity"><option value="1">1 bloque</option><option value="2">2 bloques</option><option value="3">3 bloques</option><option value="4">4 bloques</option></select></label><label for="whatifBudget">Presupuesto workarea*<select id="whatifBudget"><option value="4">4 unidades</option><option value="8">8 unidades</option><option value="12">12 unidades</option><option value="16">16 unidades</option><option value="32">32 unidades</option></select></label><label for="whatifVolume">Volumen declarado*<select id="whatifVolume"><option value="0">0 filas</option><option value="1000">1,000 filas</option><option value="50000">50,000 filas</option><option value="1000000">1,000,000 filas</option><option value="10000000">10,000,000 filas</option></select></label><label for="whatifPopulation">Población<select id="whatifPopulation"><option value="same">Declarada original</option><option value="different">Alternativa · no comparable</option></select></label></div><div class="whatif-controls"><button class="btn" type="button" id="whatifPrevious">← Anterior</button><button class="btn primary" type="button" id="whatifNext">Siguiente →</button><button class="btn" type="button" id="whatifPlay" aria-pressed="false">▶ Play</button><button class="btn" type="button" id="whatifPause" disabled>Ⅱ Pause</button><button class="btn" type="button" id="whatifReset">↺ Reset</button><label for="whatifSpeed">Velocidad<select id="whatifSpeed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><p id="whatifStatus" class="whatif-status" aria-live="polite"></p><div id="whatifComparison"></div><div class="whatif-track-layout"><div id="whatifTrackA"></div><div id="whatifTrackB"></div></div><section class="whatif-inspector" aria-labelledby="whatifInspectorHeading"><div id="whatifInspector"><h3 id="whatifInspectorHeading">Event Inspector</h3></div><button class="btn" type="button" id="whatifRelatedSql" aria-expanded="false" aria-controls="whatifSqlPanel">Ver SQL relacionado</button><pre id="whatifSqlPanel" hidden></pre></section><div class="whatif-explain-grid"><section><h3>AI Tutor contextual local</h3><button class="btn" type="button" id="whatifTutor">Explicar diferencia seleccionada</button><p id="whatifTutorOutput" aria-live="polite">El tutor usa reglas locales, no IA generativa.</p></section><section><h3>Límites permanentes</h3><p>Las métricas con <strong>*</strong> son ilustrativas. La comparación A/B no representa costes, tiempos, estadísticas observadas ni una traza física de Oracle.</p></section></div></div>`;
    anchor.insertAdjacentElement("afterend", section);
    return section;
  }

  const section = ensureRoot();
  const root = section?.querySelector("#performanceWhatIfLab");
  if (!root || !globalThis.oraclePerformanceScenarios || !globalThis.OraclePerformanceWhatIfEngine || !globalThis.OraclePerformanceWhatIfRenderer) return;

  const scenarios = globalThis.oraclePerformanceScenarios;
  const engine = globalThis.OraclePerformanceWhatIfEngine;
  const renderer = globalThis.OraclePerformanceWhatIfRenderer;
  const byId = (id) => document.getElementById(id);
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reportActivity = (activity) => window.dispatchEvent(new CustomEvent("academy:performance-activity", { detail: { lab: "performance-what-if", activity } }));
  let scenario = scenarios[0];
  let variants = { A: {}, B: {} };
  let comparison = null;
  let indexes = { A: 0, B: 0 };
  let activeTrack = "A";
  let sqlVisible = false;
  let timer = null;

  function selectedTrack() { return byId("whatifEditTrack").value; }
  function trackFor(id) { return id === "A" ? comparison.baseline : comparison.variant; }
  function populationValue(value) { return value === "different" ? `${scenario.whatIfModel.initialValues.populationId}-alternative` : scenario.whatIfModel.initialValues.populationId; }
  function controlValues() {
    return { selectivity: Number(byId("whatifSelectivity").value), indexAvailable: byId("whatifIndex").value === "true", optimizerDistribution: byId("whatifDistribution").value, cacheMode: byId("whatifCache").value, capacityBlocks: Number(byId("whatifCapacity").value), memoryBudgetUnits: Number(byId("whatifBudget").value), baseRows: Number(byId("whatifVolume").value), populationId: populationValue(byId("whatifPopulation").value) };
  }
  function applyControls(trackId) {
    const defaults = scenario.whatIfModel.initialValues;
    const values = { ...defaults, ...variants[trackId] };
    byId("whatifSelectivity").value = String(values.selectivity);
    byId("whatifIndex").value = String(values.indexAvailable);
    byId("whatifDistribution").value = values.optimizerDistribution;
    byId("whatifCache").value = values.cacheMode;
    byId("whatifCapacity").value = String(values.capacityBlocks);
    byId("whatifBudget").value = String(values.memoryBudgetUnits);
    byId("whatifVolume").value = String(values.baseRows);
    byId("whatifPopulation").value = values.populationId === defaults.populationId ? "same" : "different";
  }
  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    byId("whatifPause").disabled = true;
    byId("whatifPlay").setAttribute("aria-pressed", "false");
  }
  function rebuild() {
    stop();
    comparison = engine.createComparison(scenario, { a: variants.A, b: variants.B });
    indexes = { A: 0, B: 0 };
    activeTrack = selectedTrack();
    sqlVisible = false;
    render();
  }
  function syncFrom(trackId, nextIndex) {
    const track = trackFor(trackId);
    const ratio = track.events.length <= 1 ? 0 : Math.max(0, Math.min(nextIndex, track.events.length - 1)) / (track.events.length - 1);
    indexes.A = Math.round(ratio * (comparison.baseline.events.length - 1));
    indexes.B = Math.round(ratio * (comparison.variant.events.length - 1));
  }
  function move(trackId, nextIndex, restoreFocus = false) {
    activeTrack = trackId;
    if (byId("whatifMode").value === "sync") syncFrom(trackId, nextIndex);
    else indexes[trackId] = Math.max(0, Math.min(nextIndex, trackFor(trackId).events.length - 1));
    render();
    if (restoreFocus) root.querySelector(`[data-whatif-track="${trackId}"][data-whatif-event-index="${indexes[trackId]}"]`)?.focus();
  }
  function render() {
    const state = engine.stateAt(comparison, indexes);
    byId("whatifComparison").innerHTML = renderer.renderComparison(comparison);
    byId("whatifTrackA").innerHTML = renderer.renderTrack(scenario, comparison.baseline, state.a, { track: "A", index: indexes.A });
    byId("whatifTrackB").innerHTML = renderer.renderTrack(scenario, comparison.variant, state.b, { track: "B", index: indexes.B });
    byId("whatifInspector").innerHTML = renderer.renderInspector(state, activeTrack);
    const activeState = activeTrack === "A" ? state.a : state.b;
    byId("whatifStatus").textContent = `Track ${activeTrack} · ${activeState.index + 1}/${trackFor(activeTrack).events.length} · ${activeState.current.type}. ${comparison.comparability.comparable ? "Resultado comparable bajo la regla declarada." : "Resultado no comparable bajo la regla declarada."}`;
    byId("whatifPrevious").disabled = indexes[activeTrack] === 0;
    byId("whatifNext").disabled = indexes[activeTrack] === trackFor(activeTrack).events.length - 1;
    byId("whatifPlay").disabled = prefersReducedMotion();
    byId("whatifPause").disabled = !timer;
    byId("whatifSqlPanel").hidden = !sqlVisible;
    byId("whatifRelatedSql").setAttribute("aria-expanded", String(sqlVisible));
    byId("whatifRelatedSql").textContent = sqlVisible ? "Ocultar SQL relacionado" : "Ver SQL relacionado";
    byId("whatifSqlPanel").textContent = `${scenario.sql}\n\nRelación SQL: FROM, JOIN, ON, WHERE, GROUP BY y ORDER BY describen contexto lógico. No fuerzan una ruta de acceso, método de JOIN, estado de cache, workarea ni TEMP.`;
    globalThis.OracleAnimatedDataFlow?.mount(byId("whatifTrackA").querySelector(".whatif-flow-illustration"), { kind: "performance-what-if", events: comparison.baseline.events, index: indexes.A, label: "Track A · flujo educativo", onSelect: (next) => { stop(); move("A", next); } });
    globalThis.OracleAnimatedDataFlow?.mount(byId("whatifTrackB").querySelector(".whatif-flow-illustration"), { kind: "performance-what-if", events: comparison.variant.events, index: indexes.B, label: "Track B · flujo educativo", onSelect: (next) => { stop(); move("B", next); } });
    globalThis.OraclePresentationMode?.refresh("performance-what-if");
  }
  function start() {
    if (prefersReducedMotion() || timer) return;
    const track = trackFor(activeTrack);
    if (indexes[activeTrack] === track.events.length - 1) move(activeTrack, 0);
    const speed = Number(byId("whatifSpeed").value) || 1;
    timer = window.setInterval(() => {
      const currentTrack = trackFor(activeTrack);
      if (indexes[activeTrack] >= currentTrack.events.length - 1) stop();
      else move(activeTrack, indexes[activeTrack] + 1);
    }, Math.round(1200 / speed));
    byId("whatifPause").disabled = false;
    byId("whatifPlay").setAttribute("aria-pressed", "true");
  }

  function setSpeed(value) {
    byId("whatifSpeed").value = String(value);
    if (timer) { stop(); start(); }
    render();
  }

  byId("whatifScenario").innerHTML = scenarios.map((candidate) => `<option value="${candidate.id}">${candidate.label}</option>`).join("");
  byId("whatifScenario").addEventListener("change", (event) => { scenario = scenarios.find((candidate) => candidate.id === event.target.value) || scenarios[0]; variants = { A: {}, B: {} }; applyControls(selectedTrack()); rebuild(); });
  byId("whatifEditTrack").addEventListener("change", () => { activeTrack = selectedTrack(); applyControls(activeTrack); render(); });
  ["whatifSelectivity", "whatifIndex", "whatifDistribution", "whatifCache", "whatifCapacity", "whatifBudget", "whatifVolume", "whatifPopulation"].forEach((id) => byId(id).addEventListener("change", () => { const trackId = selectedTrack(); variants[trackId] = controlValues(); rebuild(); if (trackId === "B") reportActivity("performance-comparison-reviewed"); }));
  byId("whatifMode").addEventListener("change", () => render());
  byId("whatifPrevious").addEventListener("click", () => { stop(); move(activeTrack, indexes[activeTrack] - 1); });
  byId("whatifNext").addEventListener("click", () => { stop(); move(activeTrack, indexes[activeTrack] + 1); });
  byId("whatifPlay").addEventListener("click", start);
  byId("whatifPause").addEventListener("click", stop);
  byId("whatifReset").addEventListener("click", () => { variants = { A: {}, B: {} }; applyControls(selectedTrack()); rebuild(); });
  byId("whatifSpeed").addEventListener("change", () => setSpeed(Number(byId("whatifSpeed").value)));
  byId("whatifRelatedSql").addEventListener("click", () => { sqlVisible = !sqlVisible; render(); });
  byId("whatifTutor").addEventListener("click", () => { const state = engine.stateAt(comparison, indexes); const selectedState = activeTrack === "A" ? state.a : state.b; byId("whatifTutorOutput").textContent = `Tutor local · Track ${activeTrack}: ${selectedState.current.explanation?.what || selectedState.current.label} ${comparison.comparability.reason} ${comparison.limitations[0]}`; });
  root.addEventListener("click", (event) => { const target = event.target.closest("[data-whatif-event-index]"); if (target) { stop(); move(target.dataset.whatifTrack, Number(target.dataset.whatifEventIndex), true); } });
  root.addEventListener("keydown", (event) => { if (!["Enter", " "].includes(event.key)) return; const target = event.target.closest("[data-whatif-event-index]"); if (target) { event.preventDefault(); stop(); move(target.dataset.whatifTrack, Number(target.dataset.whatifEventIndex), true); } });
  if (prefersReducedMotion()) { byId("whatifPlay").disabled = true; byId("whatifPlay").title = "Reproducción automática desactivada por prefers-reduced-motion"; }
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (prefersReducedMotion()) stop(); render(); });
  applyControls("A");
  rebuild();
  byId("whatifScenario").dataset.performanceFocus = "true";
  const getState = () => {
    const state = engine.stateAt(comparison, indexes);
    const activeState = activeTrack === "A" ? state.a : state.b;
    return Object.freeze({ events: trackFor(activeTrack).events, index: indexes[activeTrack], event: activeState.current, speed: Number(byId("whatifSpeed").value) || 1, playing: Boolean(timer), supportsPlayback: !prefersReducedMotion(), component: `Track ${activeTrack} · ${activeState.current?.target || "comparación"}`, subtitle: comparison.comparability.reason });
  };
  const actions = Object.freeze({ play: start, pause: stop, previous: () => { stop(); move(activeTrack, indexes[activeTrack] - 1); }, next: () => { stop(); move(activeTrack, indexes[activeTrack] + 1); }, reset: () => { variants = { A: {}, B: {} }; applyControls(selectedTrack()); rebuild(); }, setSpeed, select: (next) => { stop(); move(activeTrack, next); } });
  globalThis.OraclePerformanceWhatIfLab = Object.freeze({ getComparison: () => comparison, getState, move, rebuild, ...actions });
  globalThis.OraclePresentationMode?.register({ id: "performance-what-if", root, kind: "performance-what-if", title: "Performance What-If A/B", image: "assets/illustrations/performance-what-if-tech.svg", getState, actions });
})();
