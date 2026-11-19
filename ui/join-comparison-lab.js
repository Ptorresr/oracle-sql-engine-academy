(() => {
  "use strict";

  const root = document.getElementById("executionComparisonLab");
  if (!root || !globalThis.OracleJoinComparisonEngine || !globalThis.oracleExecutionComparisonScenarios || !globalThis.OracleJoinComparisonRenderer) return;

  const byId = (id) => document.getElementById(id);
  const engine = globalThis.OracleJoinComparisonEngine;
  const renderer = globalThis.OracleJoinComparisonRenderer;
  const scenarios = globalThis.oracleExecutionComparisonScenarios;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scenario = scenarios[0];
  let tracks = {};
  let activeTrack = "left";
  let selection = { kind: "event", track: "left" };
  let timer = null;

  function createTrack(algorithm) {
    const timeline = engine.createTimeline(scenario, algorithm);
    return { algorithm, timeline, index: 0 };
  }

  function resetTracks() {
    tracks = { left: createTrack(byId("comparisonLeftAlgorithm").value), right: createTrack(byId("comparisonRightAlgorithm").value) };
    activeTrack = "left";
    selection = { kind: "event", track: "left" };
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    byId("comparisonPause").disabled = true;
    byId("comparisonPlay").setAttribute("aria-pressed", "false");
  }

  function dba(event) {
    const notes = {
      HASH_BUILD: "DBA: revisar cardinalidad de la entrada Build y memoria de workarea antes de atribuir ventajas al método.",
      HASH_PROBE: "DBA: validar distribución de claves y filas reales; los buckets y comparaciones son ilustrativos.",
      NESTED_OUTER_ROW: "DBA: revisar tamaño de la entrada externa y número de Starts en la ejecución observada.",
      INDEX_LOOKUP: "DBA: un índice conceptual no garantiza selección; revisar selectividad, clustering factor y acceso a tabla.",
      SORT_INPUT: "DBA: una ordenación puede requerir memoria o TEMP; este laboratorio no mide workareas reales.",
      MERGE_ADVANCE: "DBA: entradas ordenadas pueden cambiar costos, pero el método depende de estadísticas y del optimizador.",
      EMIT_ROW: "DBA: comparar cardinalidad estimada y real; duplicados y NULL explican diferencias lógicas de salida.",
      TABLE_ACCESS: "DBA: un acceso completo no es bueno ni malo por sí mismo; interpretar selectividad y volumen."
    };
    return notes[event.type] || "DBA: las métricas son educativas; confirmar con plan y estadísticas observadas.";
  }

  function inspectorDetails() {
    const track = tracks[selection.track];
    const state = engine.stateAt(track.timeline, track.index);
    const event = state.current;
    if (selection.kind === "operator") {
      const name = engine.ALGORITHMS[selection.algorithm].label;
      return { title: name, body: engine.ALGORITHMS[selection.algorithm].description, data: `Evento activo: ${event.type} · ${event.rowIds.join(", ") || "sin filas"}`, dba: dba(event) };
    }
    return { title: `${selection.track === "left" ? "A" : "B"} · ${event.type}`, body: `${event.label} ${event.explanation}`, data: `Origen: ${event.source} → ${event.target} · bloques: ${event.blockIds.join(", ") || "ninguno"} · filas: ${event.rowIds.join(", ") || "ninguna"}`, dba: dba(event) };
  }

  function renderInspector() {
    const detail = inspectorDetails();
    byId("comparisonInspectorTitle").textContent = detail.title;
    byId("comparisonInspectorBody").textContent = detail.body;
    byId("comparisonInspectorData").textContent = detail.data;
    byId("comparisonInspectorDba").textContent = detail.dba;
  }

  function renderWhatIf() {
    const rows = byId("comparisonWhatRows").value;
    const memory = byId("comparisonWhatMemory").value;
    const index = byId("comparisonWhatIndex").value;
    const output = [`Hipótesis local: ${rows === "large" ? "más filas pueden amplificar el costo de comparar entradas" : "menos filas pueden reducir el trabajo de los operadores"}.`, memory === "limited" ? "Memoria limitada podría aumentar el riesgo conceptual de ordenación o particionado." : "Memoria amplia podría reducir presión de workarea, sin garantizar un método.", index === "yes" ? "Un acceso selectivo puede hacer más relevante una alternativa con NESTED LOOPS." : "Sin acceso selectivo, el optimizador puede considerar otras rutas.", "No se predice el plan de Oracle; faltan estadísticas, parámetros y ejecución observada."];
    byId("comparisonWhatIfOutput").textContent = output.join(" ");
  }

  function render() {
    const leftState = engine.stateAt(tracks.left.timeline, tracks.left.index);
    const rightState = engine.stateAt(tracks.right.timeline, tracks.right.index);
    byId("comparisonQuestion").textContent = `${scenario.question} ${scenario.performance}`;
    byId("comparisonSql").textContent = scenario.sql;
    byId("comparisonIsometric").innerHTML = renderer.renderIsometricOverview();
    globalThis.OracleAnimatedDataFlow?.mount(byId("comparisonIsometric").querySelector(".comparison-illustration"), { kind: "comparison", events: tracks[activeTrack].timeline.events, index: tracks[activeTrack].index, label: "Comparación SQL · flujo conceptual del método seleccionado", onSelect: (next) => { stop(); tracks[activeTrack].index = next; if (byId("comparisonSync").checked) tracks[activeTrack === "left" ? "right" : "left"].index = Math.min(next, tracks[activeTrack === "left" ? "right" : "left"].timeline.events.length - 1); selection = { kind: "event", track: activeTrack }; render(); } });
    byId("comparisonLeftView").innerHTML = renderer.renderAlgorithmCard(scenario, "left", tracks.left.timeline, leftState, selection);
    byId("comparisonRightView").innerHTML = renderer.renderAlgorithmCard(scenario, "right", tracks.right.timeline, rightState, selection);
    const equivalent = engine.compareLogicalResults(tracks.left.timeline, tracks.right.timeline);
    byId("comparisonResultCheck").textContent = equivalent ? `✓ Resultados lógicos equivalentes: ${tracks.left.timeline.results.length} pares en ambos métodos.` : "! Los resultados lógicos no coinciden; revisa el modelo.";
    byId("comparisonResultCheck").className = equivalent ? "comparison-result is-valid" : "comparison-result is-invalid";
    byId("comparisonPrevious").disabled = tracks[activeTrack].index === 0;
    byId("comparisonNext").disabled = tracks.left.index === tracks.left.timeline.events.length - 1 && tracks.right.index === tracks.right.timeline.events.length - 1;
    renderInspector();
  }

  function move(direction) {
    const sync = byId("comparisonSync").checked;
    const moveTrack = (track) => { track.index = Math.max(0, Math.min(track.index + direction, track.timeline.events.length - 1)); };
    if (sync) {
      moveTrack(tracks.left);
      moveTrack(tracks.right);
    } else {
      moveTrack(tracks[activeTrack]);
    }
    selection = { kind: "event", track: activeTrack };
    render();
  }

  function play() {
    if (reduceMotion || timer) return;
    byId("comparisonPause").disabled = false;
    byId("comparisonPlay").setAttribute("aria-pressed", "true");
    const speed = Number(byId("comparisonSpeed").value);
    timer = window.setInterval(() => {
      const before = `${tracks.left.index}:${tracks.right.index}`;
      move(1);
      if (before === `${tracks.left.index}:${tracks.right.index}` || (tracks.left.index === tracks.left.timeline.events.length - 1 && tracks.right.index === tracks.right.timeline.events.length - 1)) stop();
    }, Math.round(1100 / speed));
  }

  function setAlgorithms() {
    if (byId("comparisonLeftAlgorithm").value === byId("comparisonRightAlgorithm").value) {
      const alternatives = Object.keys(engine.ALGORITHMS).filter((algorithm) => algorithm !== byId("comparisonLeftAlgorithm").value);
      byId("comparisonRightAlgorithm").value = alternatives[0];
    }
    stop();
    resetTracks();
    render();
  }

  byId("comparisonScenario").innerHTML = scenarios.map((candidate) => `<option value="${candidate.id}">${candidate.label}</option>`).join("");
  ["comparisonLeftAlgorithm", "comparisonRightAlgorithm"].forEach((id) => byId(id).innerHTML = Object.entries(engine.ALGORITHMS).map(([value, algorithm]) => `<option value="${value}">${algorithm.label}</option>`).join(""));
  byId("comparisonLeftAlgorithm").value = "hash";
  byId("comparisonRightAlgorithm").value = "nested";
  resetTracks();
  byId("comparisonScenario").addEventListener("change", (event) => { scenario = scenarios.find((candidate) => candidate.id === event.target.value) || scenarios[0]; setAlgorithms(); renderWhatIf(); });
  ["comparisonLeftAlgorithm", "comparisonRightAlgorithm"].forEach((id) => byId(id).addEventListener("change", setAlgorithms));
  byId("comparisonSync").addEventListener("change", () => { stop(); render(); });
  byId("comparisonPrevious").addEventListener("click", () => { stop(); move(-1); });
  byId("comparisonNext").addEventListener("click", () => { stop(); move(1); });
  byId("comparisonReset").addEventListener("click", () => { stop(); tracks.left.index = 0; tracks.right.index = 0; activeTrack = "left"; selection = { kind: "event", track: "left" }; render(); });
  byId("comparisonPlay").addEventListener("click", play);
  byId("comparisonPause").addEventListener("click", stop);
  byId("comparisonSpeed").addEventListener("change", () => { if (timer) { stop(); play(); } });
  root.addEventListener("click", (event) => {
    const timelineEvent = event.target.closest("[data-comparison-event]");
    const operator = event.target.closest("[data-comparison-operator]");
    if (timelineEvent) {
      stop();
      activeTrack = timelineEvent.dataset.comparisonTrack;
      tracks[activeTrack].index = Number(timelineEvent.dataset.comparisonEvent);
      selection = { kind: "event", track: activeTrack };
      render();
    } else if (operator) {
      activeTrack = operator.dataset.comparisonTrack;
      selection = { kind: "operator", track: activeTrack, algorithm: operator.dataset.comparisonOperator };
      render();
    }
  });
  ["comparisonWhatRows", "comparisonWhatMemory", "comparisonWhatIndex"].forEach((id) => byId(id).addEventListener("change", renderWhatIf));
  if (reduceMotion) {
    byId("comparisonPlay").disabled = true;
    byId("comparisonPlay").title = "Reproducción automática desactivada por preferencia de movimiento reducido";
  }
  render();
  renderWhatIf();
  globalThis.OracleJoinComparisonLab = Object.freeze({ getTracks: () => tracks, getScenario: () => scenario, move });
})();
