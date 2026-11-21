(() => {
  "use strict";

  function ensureRoot() {
    const existing = document.getElementById("workareaTempLab");
    if (existing) return existing;
    const anchor = document.getElementById("buffer-cache-preview");
    if (!anchor) return null;
    const section = document.createElement("section");
    section.id = "workarea-temp-preview";
    section.className = "section";
    section.setAttribute("aria-labelledby", "workareaTempTitle");
    section.innerHTML = `<div class="kicker">Laboratorio 2 · Capítulo 15</div><h2 id="workareaTempTitle">PGA, Work Areas &amp; TEMP · presupuesto, fases y clasificación educativa</h2><p>Explora cómo un modelo local clasifica una operación HASH JOIN o SORT según volumen conceptual, tamaño de fila, distribución y memoria de trabajo. Optimal, One-Pass y Multi-Pass son reglas didácticas; no reproducen las políticas internas ni las métricas reales de Oracle Database.</p><div class="panel workarea-temp-lab" id="workareaTempLab"><div class="workarea-toolbar"><label for="workareaScenario">Escenario<select id="workareaScenario"></select></label><label for="workareaOperation">Operación<select id="workareaOperation"><option value="HASH_JOIN">HASH JOIN</option><option value="SORT">SORT</option></select></label><label for="workareaRows">Filas educativas<select id="workareaRows"><option value="0">0</option><option value="4">4</option><option value="12">12</option><option value="30">30</option><option value="60">60</option><option value="120">120</option></select></label><label for="workareaRowUnits">Tamaño de fila*<select id="workareaRowUnits"><option value="1">1 unidad</option><option value="2">2 unidades</option><option value="3">3 unidades</option><option value="4">4 unidades</option><option value="8">8 unidades</option></select></label><label for="workareaBudget">Presupuesto de memoria*<select id="workareaBudget"><option value="4">4 unidades</option><option value="8">8 unidades</option><option value="12">12 unidades</option><option value="16">16 unidades</option><option value="32">32 unidades</option><option value="64">64 unidades</option></select></label><label for="workareaDistribution">Distribución<select id="workareaDistribution"><option value="clustered">Agrupada</option><option value="mixed">Mixta</option><option value="wide">Amplia</option></select></label></div><div class="workarea-controls"><button class="btn" type="button" id="workareaPrevious">← Anterior</button><button class="btn primary" type="button" id="workareaNext">Siguiente →</button><button class="btn" type="button" id="workareaPlay" aria-pressed="false">▶ Play</button><button class="btn" type="button" id="workareaPause" disabled>Ⅱ Pause</button><button class="btn" type="button" id="workareaReset">↺ Reset</button><label for="workareaSpeed">Velocidad<select id="workareaSpeed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><div class="workarea-classification" id="workareaClassification" aria-live="polite"></div><p class="workarea-learning" id="workareaPurpose" aria-live="polite"></p><pre class="workarea-sql" id="workareaSql"></pre><div class="workarea-event-status"><strong id="workareaEventLabel" aria-live="polite"></strong><p id="workareaEventExplain"></p><p id="workareaMetrics" aria-live="polite"></p></div><div class="workarea-layout"><section class="workarea-view" aria-labelledby="workareaDeveloperTitle"><div class="kicker">Developer · SQL Operation</div><h3 id="workareaDeveloperTitle">Operación y filas sintéticas</h3><div id="workareaDeveloperView"></div></section><section class="workarea-view" aria-labelledby="workareaPlanTitle"><div class="kicker">Execution Plan</div><h3 id="workareaPlanTitle">Flujo conceptual de operación</h3><div id="workareaPlanView"></div></section><section class="workarea-view" aria-labelledby="workareaInternalsTitle"><div class="kicker">Database Internals</div><h3 id="workareaInternalsTitle">PGA / Work Area y TEMP</h3><div id="workareaInternalsView"></div></section><section class="workarea-view" aria-labelledby="workareaResultsTitle"><div class="kicker">Results</div><h3 id="workareaResultsTitle">Clasificación y fases</h3><div id="workareaResultsView"></div></section></div><section class="workarea-view"><h3>Timeline determinista</h3><div class="workarea-timeline" id="workareaEventList" aria-label="Eventos de PGA Work Area y TEMP"></div></section><section class="workarea-inspector" aria-labelledby="workareaInspectorHeading"><div class="kicker">Event Inspector · compartido por estado</div><h3 id="workareaInspectorHeading">Evento y contexto sincronizado</h3><strong id="workareaInspectorTitle" aria-live="polite"></strong><dl class="workarea-inspector-grid"><div><dt>¿Qué ocurre?</dt><dd id="workareaInspectorOccurs"></dd></div><div><dt>¿Dónde ocurre?</dt><dd id="workareaInspectorWhere"></dd></div><div><dt>¿Cómo funciona?</dt><dd id="workareaInspectorHow"></dd></div><div><dt>¿Para qué sirve?</dt><dd id="workareaInspectorWhy"></dd></div><div><dt>Datos involucrados</dt><dd id="workareaInspectorData"></dd></div><div><dt>Perspectiva DBA</dt><dd id="workareaInspectorDba"></dd></div></dl><button class="btn" type="button" id="workareaRelatedSqlButton" aria-expanded="false" aria-controls="workareaRelatedSqlPanel">Ver SQL relacionado</button><div class="workarea-related-sql" id="workareaRelatedSqlPanel" hidden><pre id="workareaRelatedSql"></pre></div></section><div class="workarea-explain-grid"><section class="workarea-tutor"><h3>Tutor contextual local</h3><button class="btn" type="button" id="workareaTutor">Explicar evento seleccionado</button><p id="workareaTutorOutput" aria-live="polite">El tutor utiliza reglas locales del escenario, no un modelo de IA.</p></section><section class="workarea-hypothesis-panel"><h3>What If educativo</h3><p id="workareaHypothesis" aria-live="polite"></p></section></div><p class="workarea-legend">Las métricas con <strong>*</strong> son ilustrativas. TEMP aparece únicamente cuando el motor emite eventos <code>TEMP_WRITE</code> y <code>TEMP_READ</code>; no representa métricas reales de Oracle.</p></div>`;
    anchor.insertAdjacentElement("afterend", section);
    return document.getElementById("workareaTempLab");
  }

  const root = ensureRoot();
  if (!root || !globalThis.oraclePerformanceScenarios || !globalThis.OracleWorkareaTempEngine || !globalThis.OracleWorkareaTempRenderer) return;

  const scenarios = globalThis.oraclePerformanceScenarios;
  const engine = globalThis.OracleWorkareaTempEngine;
  const renderer = globalThis.OracleWorkareaTempRenderer;
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = (id) => document.getElementById(id);
  const reportActivity = (activity) => window.dispatchEvent(new CustomEvent("academy:performance-activity", { detail: { lab: "pga-workareas-temp", activity } }));
  const rowLookup = () => scenario.tables.flatMap((table) => table.rows.map((row) => ({ ...row, table: table.name })));
  let scenario = scenarios[0];
  let timeline = null;
  let index = 0;
  let selection = { kind: "event", id: 0 };
  let sqlVisible = false;
  let timer = null;

  const components = Object.freeze({
    "SQL Operation": "Representa el operador SQL educativo. HASH JOIN y SORT son entradas visibles del modelo, no decisiones del optimizador real.",
    "PGA / Work Area": "Representa un espacio de trabajo conceptual privado. No es Buffer Cache ni una medición PGA observada.",
    TEMP: "Representa fases temporales conceptuales. Solo se activa cuando este timeline emite escritura y lectura TEMP.",
    Results: "Representa el resultado y la clasificación educativa, no una duración ni una estadística de ejecución."
  });
  const operators = Object.freeze({
    "sql-operation": { title: "Operación SQL", where: "SQL Operation educativa", how: "HASH JOIN o SORT cambia un factor declarativo del modelo.", relation: "JOIN, ON, GROUP BY u ORDER BY aportan contexto SQL; no fuerzan PGA, TEMP ni la clasificación." },
    workarea: { title: "PGA / Work Area", where: "Workarea educativa", how: "Compara el trabajo estimado del modelo con el presupuesto elegido.", relation: "No hay una cláusula SQL que garantice un presupuesto o una fase de workarea." },
    temp: { title: "TEMP conceptual", where: "TEMP educativa", how: "Solo aparece tras la regla local One-Pass o Multi-Pass.", relation: "Una cláusula SQL no prueba uso de TEMP; se requiere evidencia real fuera de esta simulación." },
    results: { title: "Results", where: "Resultado educativo", how: "Resume fases y clasificación sin fabricar una medición temporal.", relation: "La salida no predice un plan ni una duración de Oracle." }
  });

  function parametersFromControls() {
    return {
      operation: byId("workareaOperation").value,
      rows: Number(byId("workareaRows").value),
      rowUnits: Number(byId("workareaRowUnits").value),
      memoryBudgetUnits: Number(byId("workareaBudget").value),
      distribution: byId("workareaDistribution").value
    };
  }

  function applyScenarioDefaults() {
    const profile = scenario.workareaModel;
    byId("workareaOperation").value = profile.defaultOperation;
    byId("workareaRows").value = String(profile.defaultRows);
    byId("workareaRowUnits").value = String(profile.defaultRowUnits);
    byId("workareaBudget").value = String(profile.defaultMemoryBudgetUnits);
    byId("workareaDistribution").value = profile.defaultDistribution;
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    byId("workareaPause").disabled = true;
    byId("workareaPlay").setAttribute("aria-pressed", "false");
  }

  function buildTimeline() {
    timeline = engine.createTimeline(scenario, parametersFromControls());
    const parameters = timeline.parameters;
    byId("workareaOperation").value = parameters.operation;
    byId("workareaRows").value = String(parameters.rows);
    byId("workareaRowUnits").value = String(parameters.rowUnits);
    byId("workareaBudget").value = String(parameters.memoryBudgetUnits);
    byId("workareaDistribution").value = parameters.distribution;
  }

  function sqlRelation() {
    const operation = timeline.parameters.operation;
    if (operation === "SORT") return "Relación SQL: ORDER BY o GROUP BY dan contexto lógico a SORT, pero no prueban uso de workarea, TEMP ni una clasificación real.";
    return "Relación SQL: JOIN y ON dan contexto lógico a HASH JOIN, pero no fuerzan workarea, TEMP ni una clasificación real.";
  }

  function eventDetails(state) {
    const event = state.current;
    const explanation = event.explanation || {};
    if (selection.kind === "row") {
      const row = rowLookup().find((candidate) => candidate.id === selection.id);
      return { title: row ? `Fila ${row.id}` : selection.id, occurs: "La fila seleccionada se resalta en Developer y conserva el evento actual como contexto.", where: row?.table || "Fila educativa", how: "Las filas son una muestra sintética del volumen parametrizado; no se duplican por cada fase TEMP.", why: "Relaciona datos visibles con volumen conceptual.", data: row ? JSON.stringify(row) : "Fila no disponible.", dba: "La fila no representa un buffer ni una estadística observada.", relation: sqlRelation() };
    }
    if (selection.kind === "block") {
      const block = scenario.blockLayout.find((candidate) => candidate.blockId === selection.id);
      return { title: selection.id, occurs: "El bloque seleccionado se resalta sin alterar el paso actual.", where: block?.table || "Bloque educativo", how: "Se usa para conectar muestras de filas con la operación; no describe una lectura física.", why: "Distingue datos representados de las unidades de workarea.", data: `Filas: ${block?.rowIds.join(", ") || "ninguna"}. Trabajo estimado*: ${state.metrics.estimatedWorkUnits}.`, dba: "El bloque no determina PGA, TEMP ni la clasificación del modelo.", relation: sqlRelation() };
    }
    if (selection.kind === "operator") {
      const operator = operators[selection.id];
      return { title: operator.title, occurs: "El operador conceptual se resalta sin crear un evento nuevo.", where: operator.where, how: operator.how, why: scenario.purpose, data: `Evento sincronizado: ${event.type} · clasificación*: ${timeline.parameters.classificationLabel}.`, dba: explanation.dba || "Revisar evidencia real antes de atribuir presión de memoria o TEMP.", relation: operator.relation };
    }
    if (selection.kind === "component") {
      return { title: selection.id, occurs: "El componente se resalta y conserva el paso activo.", where: selection.id, how: components[selection.id], why: "Conecta operación, workarea, TEMP condicional y resultado educativo.", data: `Trabajo*: ${state.metrics.estimatedWorkUnits} · presupuesto*: ${state.metrics.memoryBudgetUnits} · eventos TEMP*: ${state.metrics.tempEvents}.`, dba: explanation.dba || "Los componentes son una simplificación visual con métricas ilustrativas.", relation: sqlRelation() };
    }
    return { title: `${event.step}/${timeline.events.length} · ${event.type}`, occurs: event.label, where: explanation.where || `${event.source} → ${event.target}`, how: explanation.how || "El motor aplica reglas locales deterministas.", why: explanation.why || scenario.purpose, data: `Filas representadas: ${event.rowIds.join(", ") || "ninguna"} · bloques: ${event.blockIds.join(", ") || "ninguno"} · TEMP*: ${state.metrics.tempEvents}.`, dba: explanation.dba || "Las métricas son ilustrativas.", relation: sqlRelation() };
  }

  function renderInspector(state) {
    const details = eventDetails(state);
    byId("workareaInspectorTitle").textContent = details.title;
    byId("workareaInspectorOccurs").textContent = details.occurs;
    byId("workareaInspectorWhere").textContent = details.where;
    byId("workareaInspectorHow").textContent = details.how;
    byId("workareaInspectorWhy").textContent = details.why;
    byId("workareaInspectorData").textContent = details.data;
    byId("workareaInspectorDba").textContent = details.dba;
    byId("workareaRelatedSql").textContent = `${scenario.sql}\n\n${details.relation}`;
    byId("workareaRelatedSqlPanel").hidden = !sqlVisible;
    byId("workareaRelatedSqlButton").setAttribute("aria-expanded", String(sqlVisible));
    byId("workareaRelatedSqlButton").textContent = sqlVisible ? "Ocultar SQL relacionado" : "Ver SQL relacionado";
  }

  function renderHypothesis() {
    const parameters = timeline.parameters;
    byId("workareaHypothesis").textContent = `Hipótesis educativa: ${parameters.rows} filas × ${parameters.rowUnits} unidades × factor ${parameters.operationFactor} (${parameters.operation}) × factor ${parameters.distributionFactor} (${parameters.distribution}) = ${parameters.estimatedWorkUnits} unidades de trabajo*. Frente a ${parameters.memoryBudgetUnits} unidades de presupuesto*, el modelo clasifica ${parameters.classificationLabel} con ${parameters.temporaryPasses} pasada(s) temporal(es). No predice PGA ni TEMP reales.`;
  }

  function render() {
    const state = engine.stateAt(timeline, index);
    const event = state.current;
    const parameters = timeline.parameters;
    byId("workareaPurpose").textContent = `¿Qué es? ${scenario.definition} ¿Cómo funciona? ${scenario.mechanism} ¿Para qué sirve? ${scenario.purpose} Developer: ${scenario.developerFocus} DBA: ${scenario.dbaFocus}`;
    byId("workareaSql").textContent = scenario.sql;
    byId("workareaClassification").dataset.classification = parameters.classification;
    byId("workareaClassification").innerHTML = `<strong>${parameters.classificationLabel}</strong><span>Trabajo estimado*: ${parameters.estimatedWorkUnits} · presupuesto*: ${parameters.memoryBudgetUnits} · fases temporales*: ${parameters.temporaryPasses}</span><small>Regla educativa visible: ${parameters.formula}. No reproduce la clasificación interna de Oracle.</small>`;
    byId("workareaDeveloperView").innerHTML = renderer.renderDeveloper(scenario, state, selection);
    byId("workareaPlanView").innerHTML = renderer.renderPlan(state, selection);
    byId("workareaInternalsView").innerHTML = renderer.renderInternals(state, selection);
    byId("workareaResultsView").innerHTML = renderer.renderResults(state, selection);
    globalThis.OracleAnimatedDataFlow?.mount(byId("workareaInternalsView").querySelector(".workarea-illustration"), { kind: "workarea-temp", events: timeline.events, index, label: "PGA, Work Areas & TEMP · flujo conceptual", onSelect: (next) => { stop(); move(next); } });
    byId("workareaEventLabel").textContent = `${event.step}/${timeline.events.length} · ${event.type} · ${event.label}`;
    byId("workareaEventExplain").textContent = event.explanation.what;
    byId("workareaMetrics").textContent = `Filas procesadas*: ${state.metrics.rowsProcessed} · presupuesto*: ${state.metrics.memoryBudgetUnits} · trabajo estimado*: ${state.metrics.estimatedWorkUnits} · eventos TEMP*: ${state.metrics.tempEvents} · pasadas temporales*: ${state.metrics.temporaryPasses}`;
    byId("workareaPrevious").disabled = index === 0;
    byId("workareaNext").disabled = index === timeline.events.length - 1;
    byId("workareaPlay").disabled = prefersReducedMotion();
    byId("workareaEventList").innerHTML = timeline.events.map((candidate, candidateIndex) => `<button type="button" class="workarea-event${candidateIndex === index ? " is-selected" : ""}" data-workarea-event-index="${candidateIndex}" aria-current="${candidateIndex === index ? "step" : "false"}"><span>${candidate.step}</span>${candidate.type}</button>`).join("");
    renderInspector(state);
    renderHypothesis();
    globalThis.OraclePresentationMode?.refresh("workarea-temp");
  }

  function move(nextIndex) {
    index = Math.max(0, Math.min(nextIndex, timeline.events.length - 1));
    selection = { kind: "event", id: index };
    render();
  }

  function select(kind, id) {
    selection = { kind, id };
    render();
    const selectors = { row: ["[data-workarea-row]", "workareaRow"], block: ["[data-workarea-block]", "workareaBlock"], operator: ["[data-workarea-operator]", "workareaOperator"], component: ["[data-workarea-component]", "workareaComponent"] };
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
    const speed = Number(byId("workareaSpeed").value);
    byId("workareaPause").disabled = false;
    byId("workareaPlay").setAttribute("aria-pressed", "true");
    timer = window.setInterval(() => {
      if (index === timeline.events.length - 1) stop();
      else move(index + 1);
    }, Math.round(1200 / speed));
  }

  function setSpeed(value) {
    byId("workareaSpeed").value = String(value);
    if (timer) { stop(); start(); }
    render();
  }

  byId("workareaScenario").innerHTML = scenarios.map((candidate) => `<option value="${candidate.id}">${candidate.label}</option>`).join("");
  byId("workareaScenario").addEventListener("change", (event) => { scenario = scenarios.find((candidate) => candidate.id === event.target.value) || scenarios[0]; applyScenarioDefaults(); rebuild(); reportActivity("workarea-case-compared"); });
  ["workareaOperation", "workareaRows", "workareaRowUnits", "workareaBudget", "workareaDistribution"].forEach((id) => byId(id).addEventListener("change", () => { rebuild(); reportActivity("workarea-case-compared"); }));
  byId("workareaPrevious").addEventListener("click", () => { stop(); move(index - 1); });
  byId("workareaNext").addEventListener("click", () => { stop(); move(index + 1); });
  byId("workareaReset").addEventListener("click", () => { stop(); move(0); });
  byId("workareaPlay").addEventListener("click", start);
  byId("workareaPause").addEventListener("click", stop);
  byId("workareaSpeed").addEventListener("change", () => setSpeed(Number(byId("workareaSpeed").value)));
  byId("workareaEventList").addEventListener("click", (event) => { const target = event.target.closest("[data-workarea-event-index]"); if (target) { stop(); move(Number(target.dataset.workareaEventIndex)); } });
  root.addEventListener("click", (event) => {
    const row = event.target.closest("[data-workarea-row]");
    const block = event.target.closest("[data-workarea-block]");
    const operator = event.target.closest("[data-workarea-operator]");
    const component = event.target.closest("[data-workarea-component]");
    if (row) select("row", row.dataset.workareaRow);
    else if (block) select("block", block.dataset.workareaBlock);
    else if (operator) select("operator", operator.dataset.workareaOperator);
    else if (component) select("component", component.dataset.workareaComponent);
  });
  root.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("[data-workarea-row]");
    const operator = event.target.closest("[data-workarea-operator]");
    const component = event.target.closest("[data-workarea-component]");
    if (!row && !operator && !component) return;
    event.preventDefault();
    if (row) select("row", row.dataset.workareaRow);
    else if (operator) select("operator", operator.dataset.workareaOperator);
    else select("component", component.dataset.workareaComponent);
  });
  byId("workareaRelatedSqlButton").addEventListener("click", () => { sqlVisible = !sqlVisible; render(); });
  byId("workareaTutor").addEventListener("click", () => { const event = engine.stateAt(timeline, index).current; byId("workareaTutorOutput").textContent = `Tutor local basado en reglas · ${event.type}: ${event.explanation.what} ${event.explanation.dba}`; });

  if (prefersReducedMotion()) {
    byId("workareaPlay").disabled = true;
    byId("workareaPlay").title = "Reproducción automática desactivada por preferencia de movimiento reducido";
  }
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (prefersReducedMotion()) stop(); render(); });
  applyScenarioDefaults();
  buildTimeline();
  render();
  byId("workareaScenario").dataset.performanceFocus = "true";
  const getState = () => {
    const state = engine.stateAt(timeline, index);
    return Object.freeze({ events: timeline.events, index, event: state.current, speed: Number(byId("workareaSpeed").value) || 1, playing: Boolean(timer), supportsPlayback: !prefersReducedMotion(), component: state.current?.target || "PGA / Work Area", subtitle: scenario.label });
  };
  const actions = Object.freeze({ play: start, pause: stop, previous: () => { stop(); move(index - 1); }, next: () => { stop(); move(index + 1); }, reset: () => { stop(); move(0); }, setSpeed, select: (next) => { stop(); move(next); } });
  globalThis.OracleWorkareaTempLab = Object.freeze({ getTimeline: () => timeline, getState, move, rebuild, ...actions });
  globalThis.OraclePresentationMode?.register({ id: "workarea-temp", root, kind: "workarea-temp", title: "PGA, Work Areas & TEMP", image: "assets/illustrations/workarea-temp-tech.svg", getState, actions });
})();
