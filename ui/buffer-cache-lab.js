(() => {
  "use strict";

  const root = document.getElementById("bufferCacheLab");
  if (!root || !globalThis.oraclePerformanceScenarios || !globalThis.OracleBufferCacheEngine || !globalThis.OracleBufferCacheRenderer) return;

  const scenarios = globalThis.oraclePerformanceScenarios;
  const engine = globalThis.OracleBufferCacheEngine;
  const renderer = globalThis.OracleBufferCacheRenderer;
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = (id) => document.getElementById(id);
  const reportActivity = (activity) => window.dispatchEvent(new CustomEvent("academy:performance-activity", { detail: { lab: "buffer-cache-io", activity } }));
  const rowLookup = () => scenario.tables.flatMap((table) => table.rows.map((row) => ({ ...row, table: table.name })));
  let scenario = scenarios[0];
  let timeline = null;
  let index = 0;
  let selection = { kind: "event", id: 0 };
  let sqlVisible = false;
  let timer = null;

  const components = Object.freeze({
    "Datafiles / blocks": "Representan los bloques y datafiles del escenario educativo. Seleccionarlos conserva el evento activo y no afirma una ubicación física observada.",
    "Database Buffer Cache": "Representa una caché compartida conceptual. Este laboratorio usa una cola FIFO educativa, no el algoritmo interno de Oracle.",
    "SQL Execution Engine": "Representa la solicitud lógica y el acceso conceptual a filas. Las flechas no son una traza física literal."
  });
  const operators = Object.freeze({
    "logical-read": { title: "Solicitud lógica", where: "SQL Execution Engine", how: "Registra que el modelo necesita un bloque antes de decidir hit o miss.", relation: "La cláusula FROM aporta contexto de tabla; no fuerza una lectura física." },
    "cache-lookup": { title: "Búsqueda en caché", where: "Database Buffer Cache educativo", how: "Consulta el estado residente del escenario y aplica FIFO solo cuando hay miss.", relation: "No existe una cláusula SQL que fuerce hit, miss o reemplazo de caché." },
    "table-access": { title: "TABLE ACCESS conceptual", where: "Buffer Cache educativo → SQL Execution Engine", how: "Entrega las filas sintéticas asociadas al bloque solicitado.", relation: "FROM identifica la fuente lógica; el acceso físico depende de la ejecución y no está fijado por esta simulación." }
  });

  function parametersFromControls() {
    return {
      cacheMode: byId("bufferCacheState").value,
      capacityBlocks: Number(byId("bufferCapacity").value),
      accessPattern: byId("bufferPattern").value,
      requestCount: Number(byId("bufferRequestCount").value)
    };
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    byId("bufferPause").disabled = true;
    byId("bufferPlay").setAttribute("aria-pressed", "false");
  }

  function buildTimeline() {
    timeline = engine.createTimeline(scenario, parametersFromControls());
    const parameters = timeline.parameters;
    byId("bufferCacheState").value = parameters.cacheMode;
    byId("bufferCapacity").value = String(parameters.capacityBlocks);
    byId("bufferPattern").value = parameters.accessPattern;
    byId("bufferRequestCount").value = String(parameters.requestCount);
  }

  function sqlRelation(event) {
    if (event.type === "TABLE_ACCESS") return "Relación SQL: `FROM` y, cuando existe, `WHERE` describen las fuentes y filtros lógicos. No obligan a que el acceso ocurra desde caché o datafile.";
    return "Relación SQL: la solicitud, hit, miss y política FIFO son decisiones del modelo educativo; no las obliga una cláusula SQL ni representan una traza de Oracle.";
  }

  function eventDetails(state) {
    const event = state.current;
    const explanation = event.explanation || {};
    if (selection.kind === "row") {
      const row = rowLookup().find((candidate) => candidate.id === selection.id);
      return {
        title: row ? `Fila ${row.id}` : selection.id,
        occurs: "La fila seleccionada se resalta en Developer y conserva el evento actual como contexto.",
        where: row?.table || "Fila no disponible",
        how: "Las filas aparecen cuando un TABLE ACCESS conceptual entrega el bloque correspondiente.",
        why: "Relaciona el bloque solicitado con datos sintéticos visibles.",
        data: row ? JSON.stringify(row) : "Fila no encontrada en el escenario.",
        dba: "La fila del ejemplo no representa una fila física ni una estadística observada.",
        relation: sqlRelation(event)
      };
    }
    if (selection.kind === "block") {
      const block = scenario.blockLayout.find((candidate) => candidate.blockId === selection.id);
      return {
        title: selection.id,
        occurs: "El bloque seleccionado se resalta en Developer e Internals sin cambiar el paso del timeline.",
        where: block?.table || "Bloque educativo",
        how: `El modelo consulta una cola FIFO conceptual de capacidad ${timeline.parameters.capacityBlocks}.`,
        why: "Permite comparar reutilización, hit y miss sobre una secuencia reproducible.",
        data: `Filas: ${block?.rowIds.join(", ") || "ninguna"}. Residentes ahora: ${state.cacheState?.residentBlockIds.join(", ") || "ninguno"}.`,
        dba: "La capacidad y el orden de reemplazo son parámetros educativos, no configuración real de Buffer Cache.",
        relation: sqlRelation(event)
      };
    }
    if (selection.kind === "operator") {
      const operator = operators[selection.id];
      return {
        title: operator.title,
        occurs: "El operador conceptual se resalta sin generar un evento nuevo.",
        where: operator.where,
        how: operator.how,
        why: scenario.purpose,
        data: `Evento sincronizado: ${event.type} · bloques: ${event.blockIds.join(", ") || "ninguno"}.`,
        dba: explanation.dba || "Revisar evidencia real antes de concluir sobre I/O o caché.",
        relation: operator.relation
      };
    }
    if (selection.kind === "component") {
      return {
        title: selection.id,
        occurs: "El componente seleccionado se resalta en Internals y conserva el paso activo.",
        where: selection.id,
        how: components[selection.id],
        why: "Conecta el acceso lógico, el estado de caché y las filas del escenario.",
        data: `Bloques del evento: ${event.blockIds.join(", ") || "ninguno"} · residentes: ${state.cacheState?.residentBlockIds.join(", ") || "ninguno"}.`,
        dba: explanation.dba || "Los componentes son una simplificación visual con métricas ilustrativas.",
        relation: sqlRelation(event)
      };
    }
    return {
      title: `${event.step}/${timeline.events.length} · ${event.type}`,
      occurs: event.label,
      where: explanation.where || `${event.source} → ${event.target}`,
      how: explanation.how || "El modelo reproduce una secuencia declarada.",
      why: explanation.why || scenario.purpose,
      data: `Bloques: ${event.blockIds.join(", ") || "ninguno"} · filas: ${event.rowIds.join(", ") || "ninguna"} · residentes: ${state.cacheState?.residentBlockIds.join(", ") || "ninguno"}.`,
      dba: explanation.dba || "Las métricas son ilustrativas.",
      relation: sqlRelation(event)
    };
  }

  function renderInspector(state) {
    const details = eventDetails(state);
    byId("bufferInspectorTitle").textContent = details.title;
    byId("bufferInspectorOccurs").textContent = details.occurs;
    byId("bufferInspectorWhere").textContent = details.where;
    byId("bufferInspectorHow").textContent = details.how;
    byId("bufferInspectorWhy").textContent = details.why;
    byId("bufferInspectorData").textContent = details.data;
    byId("bufferInspectorDba").textContent = details.dba;
    byId("bufferRelatedSql").textContent = `${scenario.sql}\n\n${details.relation}`;
    byId("bufferRelatedSqlPanel").hidden = !sqlVisible;
    byId("bufferRelatedSqlButton").setAttribute("aria-expanded", String(sqlVisible));
    byId("bufferRelatedSqlButton").textContent = sqlVisible ? "Ocultar SQL relacionado" : "Ver SQL relacionado";
  }

  function updateHypothesis() {
    const parameters = timeline.parameters;
    const cacheState = parameters.cacheMode === "warm" ? "El escenario inicia con bloques residentes declarados." : "El escenario inicia sin bloques residentes.";
    const pattern = parameters.accessPattern === "reused" ? "El patrón repite un bloque para demostrar reutilización en el modelo." : parameters.accessPattern === "sequential" ? "El patrón recorre bloques de forma secuencial dentro del dataset sintético." : "El patrón usa la secuencia declarada del escenario.";
    byId("bufferHypothesis").textContent = `Hipótesis educativa: capacidad ${parameters.capacityBlocks} bloque(s), ${parameters.requestCount} solicitud(es), ${cacheState} ${pattern} La cola FIFO es una regla local y no predice Buffer Cache de Oracle.`;
  }

  function render() {
    const state = engine.stateAt(timeline, index);
    const event = state.current;
    byId("bufferScenarioPurpose").textContent = `¿Qué es? ${scenario.definition} ¿Cómo funciona? ${scenario.mechanism} ¿Para qué sirve? ${scenario.purpose} Developer: ${scenario.developerFocus} DBA: ${scenario.dbaFocus}`;
    byId("bufferSql").textContent = scenario.sql;
    byId("bufferDeveloperView").innerHTML = renderer.renderDeveloper(scenario, state, selection);
    byId("bufferPlanView").innerHTML = renderer.renderPlan(state, selection);
    byId("bufferInternalsView").innerHTML = renderer.renderInternals(state, selection);
    if (byId("bufferResultsView")) byId("bufferResultsView").innerHTML = renderer.renderResults(state);
    globalThis.OracleAnimatedDataFlow?.mount(byId("bufferInternalsView").querySelector(".buffer-illustration"), { kind: "buffer-cache", events: timeline.events, index, label: "Buffer Cache & I/O · flujo conceptual", onSelect: (next) => { stop(); move(next); } });
    byId("bufferEventLabel").textContent = `${event.step}/${timeline.events.length} · ${event.type} · ${event.label}`;
    byId("bufferEventExplain").textContent = event.explanation.what;
    byId("bufferMetrics").textContent = `Solicitudes lógicas*: ${state.metrics.logicalRequests} · hits*: ${state.metrics.cacheHits} · misses*: ${state.metrics.cacheMisses} · lecturas físicas conceptuales*: ${state.metrics.conceptualPhysicalReads} · filas entregadas*: ${state.metrics.rowsDelivered}`;
    byId("bufferPrevious").disabled = index === 0;
    byId("bufferNext").disabled = index === timeline.events.length - 1;
    byId("bufferPlay").disabled = prefersReducedMotion();
    byId("bufferEventList").innerHTML = timeline.events.map((candidate, candidateIndex) => `<button type="button" class="buffer-event${candidateIndex === index ? " is-selected" : ""}" data-buffer-event-index="${candidateIndex}" aria-current="${candidateIndex === index ? "step" : "false"}"><span>${candidate.step}</span>${candidate.type}</button>`).join("");
    renderInspector(state);
    updateHypothesis();
    globalThis.OraclePresentationMode?.refresh("buffer-cache");
  }

  function move(nextIndex) {
    index = Math.max(0, Math.min(nextIndex, timeline.events.length - 1));
    selection = { kind: "event", id: index };
    render();
    if (index > 0) reportActivity("buffer-step-inspected");
  }

  function select(kind, id) {
    selection = { kind, id };
    render();
    const selectors = {
      row: ["[data-buffer-row]", "bufferRow"],
      block: ["[data-buffer-block]", "bufferBlock"],
      operator: ["[data-buffer-operator]", "bufferOperator"],
      component: ["[data-buffer-component]", "bufferComponent"]
    };
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
    const speed = Number(byId("bufferSpeed").value);
    byId("bufferPause").disabled = false;
    byId("bufferPlay").setAttribute("aria-pressed", "true");
    timer = window.setInterval(() => {
      if (index === timeline.events.length - 1) stop();
      else move(index + 1);
    }, Math.round(1200 / speed));
  }

  function setSpeed(value) {
    byId("bufferSpeed").value = String(value);
    if (timer) { stop(); start(); }
    render();
  }

  byId("bufferScenario").innerHTML = scenarios.map((candidate) => `<option value="${candidate.id}">${candidate.label}</option>`).join("");
  byId("bufferScenario").addEventListener("change", (event) => {
    scenario = scenarios.find((candidate) => candidate.id === event.target.value) || scenarios[0];
    rebuild();
  });
  ["bufferCacheState", "bufferCapacity", "bufferPattern", "bufferRequestCount"].forEach((id) => byId(id).addEventListener("change", rebuild));
  byId("bufferPrevious").addEventListener("click", () => { stop(); move(index - 1); });
  byId("bufferNext").addEventListener("click", () => { stop(); move(index + 1); });
  byId("bufferReset").addEventListener("click", () => { stop(); move(0); });
  byId("bufferPlay").addEventListener("click", start);
  byId("bufferPause").addEventListener("click", stop);
  byId("bufferSpeed").addEventListener("change", () => setSpeed(Number(byId("bufferSpeed").value)));
  byId("bufferEventList").addEventListener("click", (event) => {
    const target = event.target.closest("[data-buffer-event-index]");
    if (!target) return;
    stop();
    move(Number(target.dataset.bufferEventIndex));
  });
  root.addEventListener("click", (event) => {
    const row = event.target.closest("[data-buffer-row]");
    const block = event.target.closest("[data-buffer-block]");
    const operator = event.target.closest("[data-buffer-operator]");
    const component = event.target.closest("[data-buffer-component]");
    if (row) select("row", row.dataset.bufferRow);
    else if (block) select("block", block.dataset.bufferBlock);
    else if (operator) select("operator", operator.dataset.bufferOperator);
    else if (component) select("component", component.dataset.bufferComponent);
  });
  root.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("[data-buffer-row]");
    const operator = event.target.closest("[data-buffer-operator]");
    const component = event.target.closest("[data-buffer-component]");
    if (!row && !operator && !component) return;
    event.preventDefault();
    if (row) select("row", row.dataset.bufferRow);
    else if (operator) select("operator", operator.dataset.bufferOperator);
    else select("component", component.dataset.bufferComponent);
  });
  byId("bufferRelatedSqlButton").addEventListener("click", () => { sqlVisible = !sqlVisible; render(); });
  byId("bufferTutor").addEventListener("click", () => {
    const event = engine.stateAt(timeline, index).current;
    byId("bufferTutorOutput").textContent = `Tutor local basado en reglas · ${event.type}: ${event.explanation.what} ${event.explanation.dba}`;
  });

  if (prefersReducedMotion()) {
    byId("bufferPlay").disabled = true;
    byId("bufferPlay").title = "Reproducción automática desactivada por preferencia de movimiento reducido";
  }
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (prefersReducedMotion()) stop(); render(); });
  buildTimeline();
  render();
  byId("bufferScenario").dataset.performanceFocus = "true";
  const getState = () => {
    const state = engine.stateAt(timeline, index);
    return Object.freeze({ events: timeline.events, index, event: state.current, speed: Number(byId("bufferSpeed").value) || 1, playing: Boolean(timer), supportsPlayback: !prefersReducedMotion(), component: state.current?.target || "Database Buffer Cache", subtitle: scenario.label });
  };
  const actions = Object.freeze({ play: start, pause: stop, previous: () => { stop(); move(index - 1); }, next: () => { stop(); move(index + 1); }, reset: () => { stop(); move(0); }, setSpeed, select: (next) => { stop(); move(next); } });
  globalThis.OracleBufferCacheLab = Object.freeze({ getTimeline: () => timeline, getState, move, rebuild, ...actions });
  globalThis.OraclePresentationMode?.register({ id: "buffer-cache", root, kind: "buffer-cache", title: "Buffer Cache & I/O", image: "assets/illustrations/buffer-cache-tech.svg", getState, actions });
})();
