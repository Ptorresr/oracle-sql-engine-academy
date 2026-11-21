(() => {
  "use strict";

  function ensureRoot() {
    let section = document.getElementById("optimizer-cardinality-preview");
    if (section) return section;
    const anchor = document.getElementById("workarea-temp-preview") || document.getElementById("buffer-cache-preview");
    if (!anchor) return null;
    section = document.createElement("section");
    section.id = "optimizer-cardinality-preview";
    section.className = "section";
    section.innerHTML = `<div class="kicker">Laboratorio 3 · Capítulo 15</div><h2 id="optimizerCardinalityTitle">Optimizer &amp; Cardinality · reglas, estimación y alternativas educativas</h2><p>Explora cómo filas conceptuales, selectividad declarada, calidad de estadísticas, índice y distribución cambian una alternativa educativa. No ejecuta SQL ni reproduce decisiones, costes o estadísticas del optimizador Oracle.</p><div class="panel optimizer-cardinality-lab" id="optimizerCardinalityLab"><div class="optimizer-toolbar"><label for="optimizerScenario">Escenario<select id="optimizerScenario"></select></label><label for="optimizerBaseRows">Filas base educativas<select id="optimizerBaseRows"><option value="0">0</option><option value="101">101</option><option value="1000">1,000</option><option value="50000">50,000</option><option value="1000000">1,000,000</option><option value="10000000">10,000,000</option></select></label><label for="optimizerSelectivity">Selectividad declarada<select id="optimizerSelectivity"><option value="0">0%</option><option value="0.02">2%</option><option value="0.05">5%</option><option value="0.1">10%</option><option value="0.125">12.5%</option><option value="0.2">20%</option><option value="0.5">50%</option><option value="0.75">75%</option><option value="1">100%</option></select></label><label for="optimizerStatistics">Estadísticas<select id="optimizerStatistics"><option value="available">Disponibles</option><option value="stale">Desactualizadas</option><option value="absent">Ausentes</option></select></label><label for="optimizerIndex">Índice declarado<select id="optimizerIndex"><option value="true">Disponible</option><option value="false">No disponible</option></select></label><label for="optimizerDistribution">Distribución<select id="optimizerDistribution"><option value="uniform">Uniforme</option><option value="skewed">Sesgada</option></select></label></div><div class="optimizer-controls"><button class="btn" type="button" id="optimizerPrevious">← Anterior</button><button class="btn primary" type="button" id="optimizerNext">Siguiente →</button><button class="btn" type="button" id="optimizerPlay" aria-pressed="false">▶ Play</button><button class="btn" type="button" id="optimizerPause" disabled>Ⅱ Pause</button><button class="btn" type="button" id="optimizerReset">↺ Reset</button><label for="optimizerSpeed">Velocidad<select id="optimizerSpeed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><div class="optimizer-summary" id="optimizerSummary" aria-live="polite"></div><p class="optimizer-learning" id="optimizerPurpose" aria-live="polite"></p><pre class="optimizer-sql" id="optimizerSql"></pre><div class="optimizer-event-status"><strong id="optimizerEventLabel" aria-live="polite"></strong><p id="optimizerEventExplain"></p><p id="optimizerMetrics" aria-live="polite"></p></div><div class="optimizer-layout"><section class="optimizer-view" aria-labelledby="optimizerDeveloperTitle"><div class="kicker">Developer · SQL &amp; predicate</div><h3 id="optimizerDeveloperTitle">Entradas y filas sintéticas</h3><div id="optimizerDeveloperView"></div></section><section class="optimizer-view" aria-labelledby="optimizerPlanTitle"><div class="kicker">Execution Plan · educational</div><h3 id="optimizerPlanTitle">Regla y alternativas</h3><div id="optimizerPlanView"></div></section><section class="optimizer-view" aria-labelledby="optimizerInternalsTitle"><div class="kicker">Database Internals · conceptual</div><h3 id="optimizerInternalsTitle">Estadísticas y estimador</h3><div id="optimizerInternalsView"></div></section><section class="optimizer-view" aria-labelledby="optimizerResultsTitle"><div class="kicker">Results · evidence boundary</div><h3 id="optimizerResultsTitle">Estimación y observación</h3><div id="optimizerResultsView"></div></section></div><section class="optimizer-view"><h3>Timeline determinista</h3><div class="optimizer-timeline" id="optimizerEventList" aria-label="Eventos de Optimizer y Cardinality"></div></section><section class="optimizer-inspector" aria-labelledby="optimizerInspectorHeading"><div class="kicker">Event Inspector · compartido por estado</div><h3 id="optimizerInspectorHeading">Evento y contexto sincronizado</h3><strong id="optimizerInspectorTitle" aria-live="polite"></strong><dl class="optimizer-inspector-grid"><div><dt>¿Qué ocurre?</dt><dd id="optimizerInspectorOccurs"></dd></div><div><dt>¿Dónde ocurre?</dt><dd id="optimizerInspectorWhere"></dd></div><div><dt>¿Cómo funciona?</dt><dd id="optimizerInspectorHow"></dd></div><div><dt>¿Para qué sirve?</dt><dd id="optimizerInspectorWhy"></dd></div><div><dt>Datos involucrados</dt><dd id="optimizerInspectorData"></dd></div><div><dt>Perspectiva DBA</dt><dd id="optimizerInspectorDba"></dd></div></dl><button class="btn" type="button" id="optimizerRelatedSqlButton" aria-expanded="false" aria-controls="optimizerRelatedSqlPanel">Ver SQL relacionado</button><div class="optimizer-related-sql" id="optimizerRelatedSqlPanel" hidden><pre id="optimizerRelatedSql"></pre></div></section><div class="optimizer-explain-grid"><section class="optimizer-tutor"><h3>Tutor contextual local</h3><button class="btn" type="button" id="optimizerTutor">Explicar evento seleccionado</button><p id="optimizerTutorOutput" aria-live="polite">El tutor utiliza reglas locales y no un modelo de IA.</p></section><section class="optimizer-hypothesis-panel"><h3>What If educativo</h3><p id="optimizerHypothesis" aria-live="polite"></p></section></div><p class="optimizer-legend">Las métricas con <strong>*</strong> son ilustrativas. Una observación declarada pertenece al escenario sintético, no es A-Rows ni una medición de Oracle.</p></div>`;
    anchor.insertAdjacentElement("afterend", section);
    return section;
  }

  const section = ensureRoot();
  const root = section?.querySelector("#optimizerCardinalityLab");
  if (!root || !globalThis.oraclePerformanceScenarios || !globalThis.OracleOptimizerCardinalityEngine || !globalThis.OracleOptimizerCardinalityRenderer) return;

  const scenarios = globalThis.oraclePerformanceScenarios;
  const engine = globalThis.OracleOptimizerCardinalityEngine;
  const renderer = globalThis.OracleOptimizerCardinalityRenderer;
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = (id) => document.getElementById(id);
  const reportActivity = (activity) => window.dispatchEvent(new CustomEvent("academy:performance-activity", { detail: { lab: "optimizer-cardinality", activity } }));
  let scenario = scenarios[0];
  let timeline = null;
  let index = 0;
  let selection = { kind: "event", id: 0 };
  let sqlVisible = false;
  let timer = null;

  const components = Object.freeze({
    "Statistics & Predicate Inputs": "Representa filas, selectividad, calidad de estadísticas, índice y distribución declarados como entradas del modelo.",
    "Cardinality Estimator": "Aplica una fórmula visible y redondeo educativo; no calcula E-Rows reales ni lee diccionario Oracle.",
    "Access / JOIN Alternative": "Muestra una alternativa local condicionada por la regla visible. No representa una decisión del CBO.",
    "Logical Result Set": "Representa filas sintéticas declaradas. No ejecuta SQL ni equivale a una estadística observada."
  });

  const rowLookup = () => scenario.tables.flatMap((table) => table.rows.map((row) => ({ ...row, table: table.name })));

  function parametersFromControls() {
    return {
      baseRows: Number(byId("optimizerBaseRows").value),
      selectivity: Number(byId("optimizerSelectivity").value),
      statisticsStatus: byId("optimizerStatistics").value,
      indexAvailable: byId("optimizerIndex").value === "true",
      distribution: byId("optimizerDistribution").value
    };
  }

  function applyScenarioDefaults() {
    const profile = scenario.optimizerModel;
    byId("optimizerBaseRows").value = String(profile.defaultBaseRows);
    byId("optimizerSelectivity").value = String(profile.defaultSelectivity);
    byId("optimizerStatistics").value = profile.defaultStatisticsStatus;
    byId("optimizerIndex").value = String(profile.defaultIndexAvailable);
    byId("optimizerDistribution").value = profile.defaultDistribution;
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    byId("optimizerPause").disabled = true;
    byId("optimizerPlay").setAttribute("aria-pressed", "false");
  }

  function buildTimeline() {
    timeline = engine.createTimeline(scenario, parametersFromControls());
    const parameters = timeline.parameters;
    byId("optimizerBaseRows").value = String(parameters.baseRows);
    byId("optimizerSelectivity").value = String(parameters.declaredSelectivity);
    byId("optimizerStatistics").value = parameters.statisticsStatus;
    byId("optimizerIndex").value = String(parameters.indexAvailable);
    byId("optimizerDistribution").value = parameters.distribution;
  }

  function sqlRelation(event) {
    if (event.type === "EMIT_ROW" || event.type === "TABLE_ACCESS") return "Relación SQL: `SELECT`, `FROM`, `JOIN` y `WHERE` describen el resultado lógico de referencia. No fuerzan una ruta de acceso, operador ni orden físico.";
    return "Relación SQL: `WHERE` y `ON` aportan contexto para selectividad y relación lógica; no fuerzan cardinalidad, índice, full scan ni método de JOIN en Oracle.";
  }

  function statisticLabel(status) {
    return ({ available: "disponibles", stale: "desactualizadas", absent: "ausentes" })[status] || status;
  }

  function eventDetails(state) {
    const event = state.current;
    const explanation = event.explanation || {};
    if (selection.kind === "row") {
      const row = rowLookup().find((candidate) => candidate.id === selection.id);
      return { title: row ? `Fila ${row.id}` : selection.id, occurs: "La fila se resalta sin alterar el paso activo ni convertirla en una estadística.", where: row?.table || "Fila educativa", how: "Es una muestra declarada para explicar NULL, duplicados y resultado lógico.", why: "Relaciona el predicado con datos visibles sin ejecutar SQL.", data: row ? JSON.stringify(row) : "Fila no disponible.", dba: "La fila no representa A-Rows, bloque físico ni evidencia de un plan.", relation: sqlRelation(event) };
    }
    if (selection.kind === "block") {
      const block = scenario.blockLayout.find((candidate) => candidate.blockId === selection.id);
      return { title: selection.id, occurs: "El bloque se resalta como agrupación visual del escenario y conserva el evento activo.", where: block?.table || "Bloque educativo", how: "El Optimizer Lab no deriva acceso físico a partir del bloque.", why: "Distingue la muestra de datos de la regla de cardinalidad.", data: `Filas: ${block?.rowIds.join(", ") || "ninguna"}. Estimación*: ${state.metrics.estimatedRows}.`, dba: "No interpreta el bloque como extensión, datafile ni estadística de Oracle.", relation: sqlRelation(event) };
    }
    if (selection.kind === "operator") {
      const alternative = state.alternatives.find((candidate) => candidate.id === selection.id);
      return { title: alternative?.label || selection.id, occurs: "La alternativa se resalta sin crear un evento ni declarar un plan real.", where: "Execution Plan educativo", how: alternative?.limitation || "La regla se basa en parámetros declarados.", why: scenario.purpose, data: `Acceso*: ${state.parameters.accessPath} · JOIN*: ${state.parameters.joinAlternative}.`, dba: "Validar SQL, estadísticas y plan real antes de atribuir una elección al optimizador.", relation: sqlRelation(event) };
    }
    if (selection.kind === "component") {
      return { title: selection.id, occurs: "El componente se resalta y conserva la posición del timeline.", where: selection.id, how: components[selection.id], why: "Hace visible la separación entre entradas, estimación, alternativa y resultado.", data: `Filas base*: ${state.metrics.baseRows} · selectividad*: ${Math.round(state.metrics.declaredSelectivity * 100)}% · estimación*: ${state.metrics.estimatedRows}.`, dba: explanation.dba || "Las métricas son ilustrativas y no diagnostican Oracle.", relation: sqlRelation(event) };
    }
    return { title: `${event.step}/${timeline.events.length} · ${event.type}`, occurs: event.label, where: explanation.where || `${event.source} → ${event.target}`, how: explanation.how || "El motor aplica reglas locales deterministas.", why: explanation.why || scenario.purpose, data: `Filas*: ${state.metrics.baseRows} · selectividad*: ${Math.round(state.metrics.declaredSelectivity * 100)}% · estimación*: ${state.metrics.estimatedRows} · observación: ${state.metrics.declaredObservationRows ?? "ausente"}.`, dba: explanation.dba || "Las métricas son ilustrativas.", relation: sqlRelation(event) };
  }

  function renderInspector(state) {
    const details = eventDetails(state);
    byId("optimizerInspectorTitle").textContent = details.title;
    byId("optimizerInspectorOccurs").textContent = details.occurs;
    byId("optimizerInspectorWhere").textContent = details.where;
    byId("optimizerInspectorHow").textContent = details.how;
    byId("optimizerInspectorWhy").textContent = details.why;
    byId("optimizerInspectorData").textContent = details.data;
    byId("optimizerInspectorDba").textContent = details.dba;
    byId("optimizerRelatedSql").textContent = `${scenario.sql}\n\n${details.relation}`;
    byId("optimizerRelatedSqlPanel").hidden = !sqlVisible;
    byId("optimizerRelatedSqlButton").setAttribute("aria-expanded", String(sqlVisible));
    byId("optimizerRelatedSqlButton").textContent = sqlVisible ? "Ocultar SQL relacionado" : "Ver SQL relacionado";
  }

  function renderHypothesis() {
    const parameters = timeline.parameters;
    const observation = parameters.observationRows === null ? "No hay observación declarada." : `El escenario declara ${parameters.observationRows} fila(s) lógicas; no son A-Rows.`;
    byId("optimizerHypothesis").textContent = `Hipótesis educativa: ${parameters.formula} = ceil(${parameters.baseRows} × ${parameters.declaredSelectivity}) = ${parameters.estimatedRows}. Estadísticas ${statisticLabel(parameters.statisticsStatus)}, índice ${parameters.indexAvailable ? "declarado" : "no declarado"} y distribución ${parameters.distribution} producen ${parameters.accessPath} + ${parameters.joinAlternative}. ${observation} No predice el plan de Oracle.`;
  }

  function render() {
    const state = engine.stateAt(timeline, index);
    const event = state.current;
    const parameters = timeline.parameters;
    const observation = parameters.observationRows === null ? "Observación ausente" : `${parameters.observationRows} fila(s) declarada(s)`;
    byId("optimizerPurpose").textContent = `¿Qué es? ${scenario.definition} ¿Cómo funciona? ${scenario.mechanism} ¿Para qué sirve? ${scenario.purpose} Developer: ${scenario.developerFocus} DBA: ${scenario.dbaFocus}`;
    byId("optimizerSql").textContent = scenario.sql;
    byId("optimizerSummary").innerHTML = `<strong>Estimación educativa: ${parameters.estimatedRows} fila(s)*</strong><span>${parameters.formula} · ${parameters.roundingRule}</span><span>Estadísticas: ${statisticLabel(parameters.statisticsStatus)} · observación: ${observation}</span><small>Las alternativas son reglas locales visibles; no son decisiones del CBO.</small>`;
    byId("optimizerSummary").dataset.statistics = parameters.statisticsStatus;
    byId("optimizerDeveloperView").innerHTML = renderer.renderDeveloper(scenario, state, selection);
    byId("optimizerPlanView").innerHTML = renderer.renderPlan(state, selection);
    byId("optimizerInternalsView").innerHTML = renderer.renderInternals(scenario, state, selection);
    byId("optimizerResultsView").innerHTML = renderer.renderResults(scenario, state, selection);
    globalThis.OracleAnimatedDataFlow?.mount(byId("optimizerInternalsView").querySelector(".optimizer-illustration"), { kind: "optimizer-cardinality", events: timeline.events, index, label: "Optimizer & Cardinality · flujo conceptual", onSelect: (next) => { stop(); move(next); } });
    byId("optimizerEventLabel").textContent = `${event.step}/${timeline.events.length} · ${event.type} · ${event.label}`;
    byId("optimizerEventExplain").textContent = event.explanation.what;
    byId("optimizerMetrics").textContent = `Filas base*: ${state.metrics.baseRows} · selectividad*: ${Math.round(state.metrics.declaredSelectivity * 100)}% · estimación*: ${state.metrics.estimatedRows} · observación declarada: ${state.metrics.declaredObservationRows ?? "ausente"} · alternativa JOIN*: ${state.metrics.joinAlternative}`;
    byId("optimizerPrevious").disabled = index === 0;
    byId("optimizerNext").disabled = index === timeline.events.length - 1;
    byId("optimizerPlay").disabled = prefersReducedMotion();
    byId("optimizerEventList").innerHTML = timeline.events.map((candidate, candidateIndex) => `<button type="button" class="optimizer-event${candidateIndex === index ? " is-selected" : ""}" data-optimizer-event-index="${candidateIndex}" aria-current="${candidateIndex === index ? "step" : "false"}"><span>${candidate.step}</span>${candidate.type}</button>`).join("");
    renderInspector(state);
    renderHypothesis();
    globalThis.OraclePresentationMode?.refresh("optimizer-cardinality");
  }

  function move(nextIndex) {
    index = Math.max(0, Math.min(nextIndex, timeline.events.length - 1));
    selection = { kind: "event", id: index };
    render();
    if (index > 0) reportActivity("cardinality-rule-reviewed");
  }

  function select(kind, id) {
    selection = { kind, id };
    render();
    const selectors = { row: ["[data-optimizer-row]", "optimizerRow"], block: ["[data-optimizer-block]", "optimizerBlock"], operator: ["[data-optimizer-operator]", "optimizerOperator"], component: ["[data-optimizer-component]", "optimizerComponent"] };
    const [selector, datasetKey] = selectors[kind] || [];
    const target = selector ? [...root.querySelectorAll(selector)].find((candidate) => candidate.dataset[datasetKey] === id) : null;
    if (target) target.focus();
  }

  function rebuild() {
    stop();
    buildTimeline();
    index = 0;
    selection = { kind: "event", id: 0 };
    sqlVisible = false;
    render();
  }

  function start() {
    if (prefersReducedMotion() || timer) return;
    if (index === timeline.events.length - 1) index = 0;
    const speed = Number(byId("optimizerSpeed").value);
    byId("optimizerPause").disabled = false;
    byId("optimizerPlay").setAttribute("aria-pressed", "true");
    timer = window.setInterval(() => {
      if (index === timeline.events.length - 1) stop();
      else move(index + 1);
    }, Math.round(1200 / speed));
  }

  function setSpeed(value) {
    byId("optimizerSpeed").value = String(value);
    if (timer) { stop(); start(); }
    render();
  }

  byId("optimizerScenario").innerHTML = scenarios.map((candidate) => `<option value="${candidate.id}">${candidate.label}</option>`).join("");
  byId("optimizerScenario").addEventListener("change", (event) => { scenario = scenarios.find((candidate) => candidate.id === event.target.value) || scenarios[0]; applyScenarioDefaults(); rebuild(); });
  ["optimizerBaseRows", "optimizerSelectivity", "optimizerStatistics", "optimizerIndex", "optimizerDistribution"].forEach((id) => byId(id).addEventListener("change", rebuild));
  byId("optimizerPrevious").addEventListener("click", () => { stop(); move(index - 1); });
  byId("optimizerNext").addEventListener("click", () => { stop(); move(index + 1); });
  byId("optimizerReset").addEventListener("click", () => { stop(); move(0); });
  byId("optimizerPlay").addEventListener("click", start);
  byId("optimizerPause").addEventListener("click", stop);
  byId("optimizerSpeed").addEventListener("change", () => setSpeed(Number(byId("optimizerSpeed").value)));
  byId("optimizerEventList").addEventListener("click", (event) => { const target = event.target.closest("[data-optimizer-event-index]"); if (target) { stop(); move(Number(target.dataset.optimizerEventIndex)); } });
  root.addEventListener("click", (event) => {
    const row = event.target.closest("[data-optimizer-row]");
    const block = event.target.closest("[data-optimizer-block]");
    const operator = event.target.closest("[data-optimizer-operator]");
    const component = event.target.closest("[data-optimizer-component]");
    if (row) select("row", row.dataset.optimizerRow);
    else if (block) select("block", block.dataset.optimizerBlock);
    else if (operator) select("operator", operator.dataset.optimizerOperator);
    else if (component) select("component", component.dataset.optimizerComponent);
  });
  root.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("[data-optimizer-row]");
    const component = event.target.closest("[data-optimizer-component]");
    if (!row && !component) return;
    event.preventDefault();
    if (row) select("row", row.dataset.optimizerRow);
    else select("component", component.dataset.optimizerComponent);
  });
  byId("optimizerRelatedSqlButton").addEventListener("click", () => { sqlVisible = !sqlVisible; render(); });
  byId("optimizerTutor").addEventListener("click", () => { const event = engine.stateAt(timeline, index).current; byId("optimizerTutorOutput").textContent = `Tutor local basado en reglas · ${event.type}: ${event.explanation.what} ${event.explanation.dba}`; });

  if (prefersReducedMotion()) {
    byId("optimizerPlay").disabled = true;
    byId("optimizerPlay").title = "Reproducción automática desactivada por preferencia de movimiento reducido";
  }
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (prefersReducedMotion()) stop(); render(); });
  applyScenarioDefaults();
  buildTimeline();
  render();
  byId("optimizerScenario").dataset.performanceFocus = "true";
  const getState = () => {
    const state = engine.stateAt(timeline, index);
    return Object.freeze({ events: timeline.events, index, event: state.current, speed: Number(byId("optimizerSpeed").value) || 1, playing: Boolean(timer), supportsPlayback: !prefersReducedMotion(), component: state.current?.target || "Cardinality estimator", subtitle: scenario.label });
  };
  const actions = Object.freeze({ play: start, pause: stop, previous: () => { stop(); move(index - 1); }, next: () => { stop(); move(index + 1); }, reset: () => { stop(); move(0); }, setSpeed, select: (next) => { stop(); move(next); } });
  globalThis.OracleOptimizerCardinalityLab = Object.freeze({ getTimeline: () => timeline, getState, move, rebuild, ...actions });
  globalThis.OraclePresentationMode?.register({ id: "optimizer-cardinality", root, kind: "optimizer-cardinality", title: "Optimizer & Cardinality", image: "assets/illustrations/optimizer-cardinality-tech.svg", getState, actions });
})();
