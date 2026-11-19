(() => {
  "use strict";

  const root = document.getElementById("hashJoinLab");
  if (!root || !globalThis.OracleHashJoinEngine || !globalThis.oracleHashJoinScenarios || !globalThis.OracleHashJoinRenderer) return;

  const byId = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scenarios = globalThis.oracleHashJoinScenarios;
  const engine = globalThis.OracleHashJoinEngine;
  const renderer = globalThis.OracleHashJoinRenderer;
  let scenario = scenarios[0];
  let timeline = engine.createTimeline(scenario);
  let index = 0;
  let timer = null;
  let selection = { kind: "event", id: 0 };
  let sqlVisible = false;

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    byId("hashPause").disabled = true;
    byId("hashPlay").setAttribute("aria-pressed", "false");
  }

  function describeComponent(component) {
    const descriptions = {
      Storage: "Storage representa datafiles y bloques conceptuales. Un READ_BLOCK es una solicitud lógica; no acredita un I/O físico por sí mismo.",
      "Database Buffer Cache": "El Database Buffer Cache pertenece a la SGA. CACHE_HIT y CACHE_MISS son decisiones didácticas reproducibles de este dataset, no estadísticas de Oracle.",
      "SQL Execution Engine": "Los operadores TABLE ACCESS y HASH JOIN consumen y producen filas lógicas. El diagrama no pretende mostrar el transporte físico de esas filas.",
      "PGA Hash Workarea": "La hash workarea es el área conceptual de trabajo para Build y Probe. La memoria real depende de la ejecución, configuración y otras cargas.",
      TEMP: "TEMP aparece solamente en el escenario Data Warehouse con workarea limitada. Es una hipótesis educativa, no un spill observado."
    };
    byId("hashComponentExplain").textContent = descriptions[component] || "Selecciona un componente del diagrama para ver su interpretación didáctica.";
  }

  function allRows() {
    return [scenario.build, scenario.probe].flatMap((side) => side.blocks.flatMap((block) => block.rows.map((row) => ({ ...row, blockId: block.id, source: side.name }))));
  }

  function dbaInsight(event) {
    const insights = {
      READ_BLOCK: "DBA: una solicitud lógica no prueba I/O físico; compárala con estadísticas reales antes de concluir sobre lecturas.",
      CACHE_HIT: "DBA: un hit didáctico no equivale a Buffer Gets observados; revisa el comportamiento real bajo la carga correspondiente.",
      CACHE_MISS: "DBA: un miss conceptual puede requerir I/O, pero el origen real depende de la caché, concurrencia y almacenamiento.",
      TABLE_ACCESS: "DBA: revisa selectividad, cardinalidad y el camino de acceso elegido; TABLE ACCESS FULL no es intrínsecamente incorrecto.",
      HASH_BUILD: "DBA: contrasta cardinalidad estimada y real, tamaño de la entrada Build y memoria de workarea.",
      HASH_PROBE: "DBA: revisa distribución de claves, filas Probe y posibles sesgos que afecten buckets y trabajo.",
      EMIT_ROW: "DBA: las filas emitidas reflejan cardinalidad lógica del ejemplo; valida duplicados y condiciones de unión en SQL real.",
      SPILL_TEMP: "DBA: un spill real exige observar workareas, TEMP y ejecución; aquí solo es una hipótesis explícita del escenario."
    };
    return insights[event?.type] || "DBA: interpreta el evento junto con estadísticas y ejecución observada, no como telemetría real.";
  }

  function sqlRelation(event) {
    if (["HASH_BUILD", "HASH_PROBE", "EMIT_ROW"].includes(event.type)) return `Cláusula relacionada: ON ${scenario.build.name.toLowerCase()}.${scenario.build.key} = ${scenario.probe.name.toLowerCase()}.${scenario.probe.key}. La cláusula expresa la condición lógica; HASH BUILD/PROBE son decisiones físicas del optimizador.`;
    if (event.type === "TABLE_ACCESS") return `Cláusula relacionada: FROM ${event.source.includes(scenario.build.name) ? scenario.build.name.toLowerCase() : scenario.probe.name.toLowerCase()}. El acceso físico no se deduce directamente de FROM; depende del plan elegido.`;
    return "No existe una cláusula SQL que ordene directamente este comportamiento de memoria o almacenamiento. Se relaciona con las fuentes y la condición JOIN, pero cache, PGA y TEMP dependen del optimizador y de la ejecución.";
  }

  function selectionDetails(state) {
    const event = state.current;
    const rows = allRows();
    if (selection.kind === "row") {
      const row = rows.find((candidate) => candidate.id === selection.id);
      return { title: `Fila ${row.id}`, occurs: "La fila queda resaltada en Developer y puede participar en el evento actual.", where: `${row.source} · bloque ${row.blockId}`, how: "La condición de igualdad compara la clave visible del escenario; la fila se usa para Build o Probe según su fuente.", why: scenario.useCase, data: Object.entries(row).filter(([key]) => !["id", "source"].includes(key)).map(([key, value]) => `${key}: ${value ?? "NULL"}`).join(" · "), dba: "DBA: la fila individual es una simplificación didáctica; cardinalidad y distribución de claves son las señales relevantes a escala.", relation: `La fila participa en FROM ${row.source.toLowerCase()} y, si tiene clave no nula, en la condición ON del escenario.` };
    }
    if (selection.kind === "block") {
      const side = [scenario.build, scenario.probe].find((candidate) => candidate.blocks.some((block) => block.id === selection.id));
      const block = side.blocks.find((candidate) => candidate.id === selection.id);
      return { title: `Bloque ${block.id}`, occurs: "El bloque queda resaltado como fuente conceptual de las filas asociadas.", where: `Datafile conceptual · ${side.name}`, how: "READ_BLOCK solicita el bloque y CACHE_HIT/CACHE_MISS ilustra cómo podría atenderse antes de TABLE ACCESS.", why: "Conecta las filas del escenario con la lectura lógica de bloques.", data: `${block.rows.map((row) => row.id).join(", ")} · ${block.rows.length} fila(s)`, dba: "DBA: el bloque no representa una dirección real ni una lectura física medida; confirma con estadísticas y trazas autorizadas.", relation: `La fuente ${side.name} aparece en FROM; ninguna cláusula SQL obliga un bloque concreto a residir en caché.` };
    }
    if (selection.kind === "operator") {
      const operators = {
        "build-access": { title: `TABLE ACCESS FULL ${scenario.build.name}`, how: "Entrega filas de la entrada Build al operador HASH BUILD.", where: "SQL Execution Engine", relation: `FROM ${scenario.build.name.toLowerCase()}. El acceso físico depende del optimizador.` },
        "hash-build": { title: "HASH BUILD", how: "Construye buckets conceptuales a partir de la entrada Build.", where: "PGA Hash Workarea", relation: `ON ${scenario.build.name.toLowerCase()}.${scenario.build.key} = ${scenario.probe.name.toLowerCase()}.${scenario.probe.key}; la cláusula no fuerza HASH BUILD.` },
        "hash-join": { title: "HASH JOIN", how: "Consulta buckets con la entrada Probe y emite coincidencias lógicas.", where: "SQL Execution Engine / PGA", relation: `ON ${scenario.build.name.toLowerCase()}.${scenario.build.key} = ${scenario.probe.name.toLowerCase()}.${scenario.probe.key}; el método HASH JOIN es una decisión física.` },
        "probe-access": { title: `TABLE ACCESS FULL ${scenario.probe.name}`, how: "Entrega filas de la entrada Probe para consultar la estructura hash.", where: "SQL Execution Engine", relation: `FROM ${scenario.probe.name.toLowerCase()}. El acceso físico depende del optimizador.` }
      };
      const operator = operators[selection.id];
      return { title: operator.title, occurs: "El operador seleccionado se resalta dentro del plan conceptual sin cambiar el evento actual.", where: operator.where, how: operator.how, why: scenario.useCase, data: `Evento sincronizado: ${event.type} · filas: ${event.rowIds.join(", ") || "ninguna"}`, dba: dbaInsight(event), relation: operator.relation };
    }
    if (selection.kind === "component") {
      return { title: selection.id, occurs: "El componente seleccionado se resalta en Internals y conserva el evento actual como contexto.", where: selection.id, how: byId("hashComponentExplain").textContent, why: "Relaciona operadores, memoria y almacenamiento con la misma simulación determinista.", data: `Bloques: ${event.blockIds.join(", ") || "ninguno"} · filas: ${event.rowIds.join(", ") || "ninguna"}`, dba: dbaInsight(event), relation: sqlRelation(event) };
    }
    const eventRows = rows.filter((row) => event.rowIds.includes(row.id));
    return { title: `${event.step}/${timeline.events.length} · ${event.type}`, occurs: event.label, where: `${event.source} → ${event.target}`, how: event.explanation, why: scenario.useCase, data: `Filas: ${eventRows.map((row) => `${row.id} (${row.source})`).join(", ") || "ninguna"} · bloques: ${event.blockIds.join(", ") || "ninguno"}`, dba: dbaInsight(event), relation: sqlRelation(event) };
  }

  function renderInspector(state) {
    const details = selectionDetails(state);
    byId("hashInspectorTitle").textContent = details.title;
    byId("hashInspectorOccurs").textContent = details.occurs;
    byId("hashInspectorWhere").textContent = details.where;
    byId("hashInspectorHow").textContent = details.how;
    byId("hashInspectorWhy").textContent = details.why;
    byId("hashInspectorData").textContent = details.data;
    byId("hashInspectorDba").textContent = details.dba;
    byId("hashRelatedSql").textContent = `${scenario.sql}\n\n${details.relation}`;
    byId("hashRelatedSqlPanel").hidden = !sqlVisible;
    byId("hashRelatedSqlButton").setAttribute("aria-expanded", String(sqlVisible));
    byId("hashRelatedSqlButton").textContent = sqlVisible ? "Ocultar SQL relacionado" : "Ver SQL relacionado";
  }

  function render() {
    const state = engine.stateAt(timeline, index);
    const event = state.current;
    byId("hashScenarioPurpose").innerHTML = `<strong>¿Qué es?</strong> ${scenario.purpose}<br><strong>¿Cómo funciona?</strong> ${scenario.mechanism}<br><strong>¿Para qué sirve?</strong> ${scenario.useCase}<br><strong>Rendimiento:</strong> ${scenario.performance}`;
    byId("hashSql").textContent = scenario.sql;
    byId("hashDeveloperView").innerHTML = renderer.renderDeveloper(scenario, state, selection);
    byId("hashPlanView").innerHTML = renderer.renderPlan(scenario, state, selection);
    byId("hashInternalsView").innerHTML = renderer.renderInternals(scenario, state, selection);
    globalThis.OracleAnimatedDataFlow?.mount(byId("hashInternalsView").querySelector(".hash-illustration"), { kind: "hash", events: timeline.events, index, label: "HASH JOIN · flujo conceptual sobre ilustración 3D", onSelect: (next) => { stop(); move(next); } });
    byId("hashEventLabel").textContent = event ? `${event.step}/${timeline.events.length} · ${event.type} · ${event.label}` : "Sin evento";
    byId("hashEventExplain").textContent = event?.explanation || "Elige un evento para revisar su explicación técnica.";
    byId("hashMetrics").textContent = `Lecturas lógicas*: ${state.metrics.logicalReads} · lecturas físicas*: ${state.metrics.physicalReads} · filas leídas*: ${state.metrics.rowsRead} · salida: ${state.metrics.outputRows} · TEMP*: ${state.metrics.tempPartitions}`;
    byId("hashPrevious").disabled = index === 0;
    byId("hashNext").disabled = index === timeline.events.length - 1;
    byId("hashEventList").innerHTML = timeline.events.map((candidate, candidateIndex) => `<button type="button" class="hash-event ${candidateIndex === index ? "is-selected" : ""}" data-event-index="${candidateIndex}" aria-current="${candidateIndex === index ? "step" : "false"}"><span>${candidate.step}</span>${candidate.type}</button>`).join("");
    renderInspector(state);
    globalThis.OraclePresentationMode?.refresh("hash");
  }

  function move(nextIndex) {
    index = Math.max(0, Math.min(nextIndex, timeline.events.length - 1));
    selection = { kind: "event", id: index };
    render();
  }

  function select(kind, id) {
    selection = { kind, id };
    if (kind === "component") describeComponent(id);
    render();
    const attributes = { row: ["[data-engine-row]", "engineRow"], block: ["[data-engine-block]", "engineBlock"], operator: ["[data-engine-operator]", "engineOperator"], component: ["[data-engine-component]", "engineComponent"] };
    const [selector, datasetKey] = attributes[kind] || [];
    const target = selector ? [...root.querySelectorAll(selector)].find((candidate) => candidate.dataset[datasetKey] === id) : null;
    if (target) target.focus();
  }

  function start() {
    if (reduceMotion || timer) return;
    if (index === timeline.events.length - 1) index = 0;
    const speed = Number(byId("hashSpeed").value);
    byId("hashPause").disabled = false;
    byId("hashPlay").setAttribute("aria-pressed", "true");
    timer = window.setInterval(() => {
      if (index === timeline.events.length - 1) {
        stop();
      } else {
        move(index + 1);
      }
    }, Math.round(1200 / speed));
  }

  function updateWhatIf() {
    const cardinality = byId("hashWhatCardinality").value;
    const memory = byId("hashWhatMemory").value;
    const indexAccess = byId("hashWhatIndex").value;
    const size = cardinality === "large" ? "una cardinalidad mayor puede incrementar el tamaño de las entradas y el trabajo del operador" : "una cardinalidad menor puede reducir el trabajo del operador";
    const workarea = memory === "limited" ? "con memoria limitada, una operación hash podría particionar y utilizar TEMP" : "con memoria amplia, podría disminuir la necesidad de particionar";
    const access = indexAccess === "yes" ? "un acceso selectivo mediante índice puede cambiar las alternativas consideradas" : "sin acceso selectivo, el optimizador podría considerar otros caminos de acceso";
    byId("hashWhatIfOutput").textContent = `Hipótesis educativa: ${size}; ${workarea}; ${access}. No predice el plan de Oracle ni sustituye estadísticas y mediciones reales.`;
  }

  function updateTutor() {
    const event = engine.stateAt(timeline, index).current;
    byId("hashTutorOutput").textContent = `Tutor local basado en reglas · ${event.type}: ${event.explanation} Implicación: revisa cardinalidad, estadísticas y memoria antes de concluir que HASH JOIN es la mejor opción.`;
  }

  byId("hashScenario").innerHTML = scenarios.map((candidate) => `<option value="${candidate.id}">${candidate.label}</option>`).join("");
  byId("hashScenario").addEventListener("change", (event) => {
    stop();
    scenario = scenarios.find((candidate) => candidate.id === event.target.value) || scenarios[0];
    timeline = engine.createTimeline(scenario);
    index = 0;
    selection = { kind: "event", id: 0 };
    sqlVisible = false;
    render();
    updateWhatIf();
  });
  byId("hashPrevious").addEventListener("click", () => { stop(); move(index - 1); });
  byId("hashNext").addEventListener("click", () => { stop(); move(index + 1); });
  byId("hashReset").addEventListener("click", () => { stop(); move(0); });
  byId("hashPlay").addEventListener("click", start);
  byId("hashPause").addEventListener("click", stop);
  byId("hashSpeed").addEventListener("change", () => { if (timer) { stop(); start(); } });
  byId("hashEventList").addEventListener("click", (event) => {
    const target = event.target.closest("[data-event-index]");
    if (!target) return;
    stop();
    move(Number(target.dataset.eventIndex));
  });
  root.addEventListener("click", (event) => {
    const operator = event.target.closest("[data-engine-operator]");
    const row = event.target.closest("[data-engine-row]");
    const block = event.target.closest("[data-engine-block]");
    const component = event.target.closest("[data-engine-component]");
    if (operator) select("operator", operator.dataset.engineOperator);
    else if (row) select("row", row.dataset.engineRow);
    else if (block) select("block", block.dataset.engineBlock);
    else if (component) select("component", component.dataset.engineComponent);
  });
  root.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("[data-engine-row]");
    const component = event.target.closest("[data-engine-component]");
    if (!row && !component) return;
    event.preventDefault();
    select(row ? "row" : "component", row ? row.dataset.engineRow : component.dataset.engineComponent);
  });
  byId("hashRelatedSqlButton").addEventListener("click", () => { sqlVisible = !sqlVisible; render(); });
  ["hashWhatCardinality", "hashWhatMemory", "hashWhatIndex"].forEach((id) => byId(id).addEventListener("change", updateWhatIf));
  byId("hashTutor").addEventListener("click", updateTutor);

  if (reduceMotion) {
    byId("hashPlay").disabled = true;
    byId("hashPlay").title = "Reproducción automática desactivada por preferencia de movimiento reducido";
  }
  render();
  updateWhatIf();
  describeComponent("SQL Execution Engine");
  globalThis.OraclePresentationMode?.register({ id: "hash", root, kind: "hash", title: "HASH JOIN — Execution Engine", image: "assets/illustrations/hash-join-tech.png", getState: () => ({ events: timeline.events, index, event: timeline.events[index], speed: Number(byId("hashSpeed").value), playing: Boolean(timer), component: selection.kind === "component" ? selection.id : "SQL Execution Engine", subtitle: `${scenario.label} · flujo conceptual` }), actions: { play: () => byId("hashPlay").click(), pause: () => byId("hashPause").click(), previous: () => byId("hashPrevious").click(), next: () => byId("hashNext").click(), reset: () => byId("hashReset").click(), setSpeed: (value) => { byId("hashSpeed").value = String(value); byId("hashSpeed").dispatchEvent(new Event("change")); }, select: (next) => { stop(); move(next); } } });
  globalThis.OracleHashJoinLab = Object.freeze({ getTimeline: () => timeline, getState: () => engine.stateAt(timeline, index), move });
})();
