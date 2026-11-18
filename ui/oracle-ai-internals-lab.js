(() => {
  "use strict";

  const labRoot = document.getElementById("ai");
  if (!labRoot || !globalThis.OracleVectorSearchEngine) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const labs = Object.freeze([
    { id: "ai-vector-search", label: "AI Vector Search", scenarios: globalThis.oracleAiVectorScenarios, engine: globalThis.OracleVectorSearchEngine, renderer: globalThis.OracleVectorSearchRenderer, kind: "vector", definition: "Compara embeddings sintéticos mediante una métrica de distancia y recupera vecinos Top-K.", mechanism: "El motor calcula distancias deterministas sobre vectores del dataset y ordena los resultados.", purpose: "Explorar similitud semántica sin invocar un modelo ni un índice real.", internals: "VECTOR, índice y HNSW/IVF se explican como conceptos; la proyección 2D y la búsqueda approximate son abstracciones educativas." },
    { id: "hybrid-vector-search", label: "Hybrid Vector Search", scenarios: globalThis.oracleHybridSearchScenarios, engine: globalThis.OracleHybridSearchEngine, renderer: globalThis.OracleHybridSearchRenderer, kind: "hybrid", definition: "Combina señales textuales y semánticas sobre documentos sintéticos.", mechanism: "Recorre una ruta textual y una vectorial, normaliza señales y aplica una fusión ponderada explícita.", purpose: "Entender por qué los scores nativos no deben mezclarse sin una estrategia declarada.", internals: "DBMS_HYBRID_VECTOR.SEARCH usa índices híbridos documentados; la fusión mostrada es local y no describe el ranking interno de Oracle." },
    { id: "select-ai-flow", label: "Select AI", scenarios: globalThis.oracleSelectAiScenarios, engine: globalThis.OracleSelectAiFlowEngine, renderer: null, kind: "select", definition: "Explica el flujo conceptual de lenguaje natural a SQL autorizado.", mechanism: "Presenta pregunta, contexto de esquema, SQL predefinido, validación y resultado sintético.", purpose: "Distinguir una propuesta de SQL de una consulta ejecutada y autorizada.", internals: "DBMS_CLOUD_AI y los AI Profiles requieren configuración, privilegios y, según proveedor, credenciales y conectividad; aquí no se usan." },
    { id: "rag-architecture", label: "RAG Architecture", scenarios: globalThis.oracleRagScenarios, engine: globalThis.OracleRagPipelineEngine, renderer: globalThis.OracleRagRenderer, kind: "rag", definition: "Muestra preparación, recuperación autorizada y respuesta educativa predefinida.", mechanism: "Segmenta documentos permitidos, representa embeddings y construye contexto limitado por rol.", purpose: "Explicar cómo una respuesta puede referenciar fuentes recuperadas sin exponer datos restringidos.", internals: "DBMS_VECTOR y DBMS_VECTOR_CHAIN pueden participar según producto y configuración; este pipeline no llama a servicios ni reproduce componentes reales." },
    { id: "agentic-workflows", label: "Agentic Workflows", scenarios: globalThis.oracleAgenticScenarios, engine: globalThis.OracleAgenticWorkflowEngine, renderer: globalThis.OracleAgenticRenderer, kind: "agent", definition: "Explica cómo un agente aplica una política antes de llamar una herramienta.", mechanism: "Selecciona una herramienta del escenario, valida permiso y limita o rechaza la operación.", purpose: "Mostrar autorización, parámetros, auditoría y confirmación en un flujo agéntico.", internals: "DBMS_CLOUD_AI_AGENT depende de versión, paquetes, grants y despliegue; este workflow es local y no utiliza MCP ni herramientas externas." }
  ]);
  const progressKey = "oracle-sql-academy.ai-internals.progress.v1";
  let activeLabId = labs[0].id;
  let selectedScenarioId = labs[0].scenarios[0].id;
  let selectedStep = 0;
  let timer = null;
  let speed = 1;
  const settings = { metric: "COSINE", topK: 2, mode: "exact", candidateCount: 3, textWeight: 0.5, chunkSize: 8, overlap: 1 };
  const byId = (id) => document.getElementById(id);
  const activeLab = () => labs.find((lab) => lab.id === activeLabId);
  const activeScenario = () => activeLab().scenarios.find((scenario) => scenario.id === selectedScenarioId) || activeLab().scenarios[0];
  const readProgress = () => { try { return JSON.parse(localStorage.getItem(progressKey) || "{\"visited\":[],\"completed\":[]}"); } catch { return { visited: [], completed: [] }; } };
  const markProgress = (id) => { const progress = readProgress(); if (!progress.visited.includes(id)) progress.visited.push(id); if (!progress.completed.includes(id)) progress.completed.push(id); localStorage.setItem(progressKey, JSON.stringify(progress)); byId("aiInternalsProgress").textContent = `${progress.completed.length} de ${labs.length} laboratorios explorados en este navegador.`; };
  const run = () => {
    const lab = activeLab();
    const scenario = activeScenario();
    if (lab.kind === "vector") return lab.engine.run(scenario, settings);
    if (lab.kind === "hybrid") return lab.engine.run(scenario, settings);
    if (lab.kind === "rag") return lab.engine.run(scenario, settings);
    return lab.engine.run(scenario);
  };
  const eventButtons = (timeline) => timeline.events.map((event, index) => `<button type="button" class="ai-event${index === selectedStep ? " is-selected" : ""}" data-ai-step="${index}" aria-pressed="${index === selectedStep}"><span>${event.step}</span>${event.type.replaceAll("_", " ")}</button>`).join("");
  const contentFor = (timeline) => {
    const lab = activeLab();
    const scenario = activeScenario();
    const event = timeline.events[selectedStep] || timeline.events[0];
    let visual = "";
    if (lab.kind === "vector") visual = lab.renderer.render(timeline);
    else if (lab.kind === "hybrid" || lab.kind === "rag" || lab.kind === "agent") visual = lab.renderer.render(timeline);
    else visual = `<div class="select-ai-result"><h4>SQL propuesto de ejemplo</h4><pre>${globalThis.OracleAiDataFlowRenderer.escape(scenario.sql)}</pre><p>${globalThis.OracleAiDataFlowRenderer.escape(scenario.result)}</p></div>`;
    return { event, visual, scenario };
  };
  const render = () => {
    const lab = activeLab();
    const scenario = activeScenario();
    const timeline = run();
    selectedStep = Math.max(0, Math.min(selectedStep, timeline.events.length - 1));
    const { event, visual } = contentFor(timeline);
    document.querySelectorAll("[data-ai-lab]").forEach((button) => {
      const selected = button.dataset.aiLab === lab.id;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll(".oracle-ai-lab-panel").forEach((panel) => { panel.hidden = panel.id !== lab.id; });
    byId("aiInternalsTitle").textContent = lab.label;
    byId("aiInternalsDefinition").textContent = lab.definition;
    byId("aiInternalsMechanism").textContent = lab.mechanism;
    byId("aiInternalsPurpose").textContent = lab.purpose;
    byId("aiInternalsInternals").textContent = lab.internals;
    byId("aiInternalsScenario").innerHTML = lab.scenarios.map((item) => `<option value="${item.id}">${item.title}</option>`).join("");
    byId("aiInternalsScenario").value = scenario.id;
    byId("aiDataVisual").innerHTML = visual;
    byId("aiLearningQuestions").innerHTML = `<h4>Comprueba tu comprensión</h4><ol>${scenario.questions.map((question) => `<li>${globalThis.OracleAiDataFlowRenderer.escape(question)}</li>`).join("")}</ol>`;
    byId("aiFlowVisual").innerHTML = globalThis.OracleAiDataFlowRenderer.renderFlow(timeline.events, selectedStep, `${lab.label}: flujo de procesamiento educativo`);
    byId("aiEventTimeline").innerHTML = eventButtons(timeline);
    byId("aiEventInspector").innerHTML = globalThis.OracleAiDataFlowRenderer.renderInspector(event);
    byId("aiPerspectives").innerHTML = globalThis.OracleAiDataFlowRenderer.renderPerspectives(event, scenario.sql);
    byId("aiWhatIfOutput").textContent = whatIfMessage(timeline);
    byId("aiTutorOutput").textContent = tutorMessage(event);
    byId("aiCurrentStep").textContent = `Paso ${event.step} de ${timeline.events.length} · ${event.label}`;
    byId("aiPlay").disabled = reducedMotion;
    byId("aiPlay").textContent = reducedMotion ? "▶ Movimiento reducido" : "▶ Play";
    markProgress(lab.id);
    bindDynamic(timeline);
  };
  const whatIfMessage = (timeline) => {
    const lab = activeLab();
    if (lab.kind === "vector") return `Hipótesis educativa: ${timeline.mode === "approximate" ? `se evaluaron ${timeline.candidates.length} candidatos, con recall ${timeline.recall.toFixed(2)} en este dataset.` : "la búsqueda exacta evalúa todos los vectores del ejemplo."} No predice el optimizador ni rendimiento real.`;
    if (lab.kind === "hybrid") return `Fusión local documentada: peso textual ${timeline.textWeight.toFixed(2)} y vectorial ${timeline.vectorWeight.toFixed(2)}. No equivale a una fórmula de Oracle.`;
    if (lab.kind === "rag") return `Chunk size ${settings.chunkSize}, overlap ${settings.overlap}; solo ${timeline.chunks.length} chunks autorizados pueden formar contexto.`;
    if (lab.kind === "agent") return timeline.permitted ? "La herramienta de lectura está permitida por el escenario; en producción se requieren controles independientes." : "La acción sensible permanece rechazada sin permiso y confirmación; no se ejecutó ninguna herramienta.";
    return "La simulación muestra SQL y resultado predefinidos; no usa un proveedor, perfil ni credenciales reales.";
  };
  const tutorMessage = (event) => {
    const question = byId("aiTutorQuestion")?.value || "event";
    const answers = {
      embedding: "Un embedding es un vector numérico que representa una entrada según un modelo. En este laboratorio todos los vectores son sintéticos y fijos.",
      distance: "La distancia coseno compara orientación entre vectores; su elección debe ser coherente con el modelo y el índice configurado. La simulación no selecciona una métrica por el optimizador.",
      hybrid: "Hybrid Vector Search combina recuperación textual y semántica. La fórmula mostrada aquí es una fusión educativa local, no una afirmación sobre el ranking interno de Oracle.",
      rag: "RAG recupera contexto autorizado antes de una respuesta. La respuesta de este laboratorio es predefinida y nunca incluye el documento restringido del escenario.",
      agent: "Un agente coordina herramientas bajo políticas. Seleccionar una herramienta no equivale a autorizarla; la operación sensible del escenario se rechaza."
      ,index: "HNSW es un tipo de índice In-Memory Neighbor Graph e IVF es un índice de particiones vecinas en Oracle. Esta academia solo reduce candidatos de forma fija y no reproduce ninguna de las dos estructuras."
      ,location: "Una búsqueda vectorial puede representarse como procesamiento de base de datos, pero proveedores de embeddings y LLM se etiquetan como externos simulados. La ubicación depende de producto y configuración."
    };
    if (question !== "event") return `Tutor educativo basado en reglas: ${answers[question]} No es IA generativa.`;
    const location = globalThis.OracleAiDataFlowRenderer.locationLabel(event.executionLocation);
    return `Tutor educativo basado en reglas: ${event.explanation.what} Ocurre en: ${location}. ${event.explanation.dba} No es IA generativa ni telemetría real.`;
  };
  const selectLab = (id, updateRoute = true) => {
    stop();
    activeLabId = id;
    selectedScenarioId = activeLab().scenarios[0].id;
    selectedStep = 0;
    if (updateRoute && location.hash !== `#${id}`) history.pushState({ aiLab: id }, "", `#${id}`);
    render();
    window.dispatchEvent(new CustomEvent("academy:oracle-ai-active", { detail: { labId: id } }));
  };
  const step = (delta) => { const timeline = run(); selectedStep = (selectedStep + delta + timeline.events.length) % timeline.events.length; render(); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; byId("aiPause").disabled = true; };
  const play = () => { if (reducedMotion || timer) return; byId("aiPause").disabled = false; timer = setInterval(() => step(1), Math.round(1400 / speed)); };
  const bindDynamic = (timeline) => {
    document.querySelectorAll("[data-ai-step]").forEach((button) => button.addEventListener("click", () => { selectedStep = Number(button.dataset.aiStep); render(); }));
    document.querySelectorAll(".ai-flow-node").forEach((node) => { const select = () => { selectedStep = Number(node.dataset.aiEvent); render(); }; node.addEventListener("click", select); node.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); } }); });
    document.querySelectorAll("[data-vector-id]").forEach((node) => node.addEventListener("click", () => { const index = timeline.events.findIndex((event) => event.rowIds.includes(node.dataset.vectorId) && event.type === "VECTOR_DISTANCE_CALCULATED"); if (index >= 0) { selectedStep = index; render(); } }));
  };
  const shell = document.createElement("section");
  shell.className = "panel oracle-ai-internals";
  shell.innerHTML = `<div class="kicker">Sprint 5 · Oracle AI Database Internals Lab</div><h3>Flujos de datos, no promesas de ejecución real</h3><p>Los cinco laboratorios son simulaciones locales, deterministas y con datos sintéticos. Diferencian Oracle Database simulado, aplicación, servicios externos simulados y abstracciones educativas.</p><div class="ai-lab-tabs" role="tablist" aria-label="Laboratorios de Oracle AI Database">${labs.map((lab, index) => `<button type="button" role="tab" data-ai-lab="${lab.id}" aria-controls="${lab.id}" aria-selected="${index === 0}">${lab.label}</button>`).join("")}</div><p id="aiInternalsProgress" class="muted"></p>${labs.map((lab, index) => `<section class="oracle-ai-lab-panel" id="${lab.id}" ${index ? "hidden" : ""}></section>`).join("")}<div class="ai-lab-overview"><h3 id="aiInternalsTitle"></h3><div class="ai-learning-grid"><div><h4>¿Qué es?</h4><p id="aiInternalsDefinition"></p></div><div><h4>¿Cómo funciona?</h4><p id="aiInternalsMechanism"></p></div><div><h4>¿Para qué sirve?</h4><p id="aiInternalsPurpose"></p></div><div><h4>Internals y límites</h4><p id="aiInternalsInternals"></p></div></div><div class="ai-toolbar"><label>Escenario <select id="aiInternalsScenario"></select></label><label>Métrica <select id="aiMetric"><option value="COSINE">Coseno</option><option value="EUCLIDEAN">Euclidiana</option><option value="DOT">Producto punto</option></select></label><label>Top-K <select id="aiTopK"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option></select></label><label>Modo <select id="aiMode"><option value="exact">Exacta</option><option value="approximate">Approximate conceptual</option></select></label><label>Peso texto <input id="aiTextWeight" type="range" min="0" max="1" step="0.1" value="0.5"></label><button class="btn" type="button" id="aiPrevious">← Anterior</button><button class="btn primary" type="button" id="aiNext">Siguiente →</button><button class="btn" type="button" id="aiPlay">▶ Play</button><button class="btn" type="button" id="aiPause" disabled>Ⅱ Pause</button><button class="btn" type="button" id="aiReset">↺ Reset</button><label>Velocidad <select id="aiSpeed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><p class="stepbox" id="aiCurrentStep" aria-live="polite"></p><div class="ai-lab-canvas"><section><h4>Datos y visualización</h4><div id="aiDataVisual"></div></section><section><h4>Processing Flow</h4><div id="aiFlowVisual"></div></section></div><div id="aiLearningQuestions" class="ai-learning-questions"></div><div class="ai-event-list" id="aiEventTimeline" aria-label="Timeline de eventos AI"></div><section class="ai-event-inspector"><div class="kicker">Event Inspector</div><h4>Evento seleccionado</h4><div id="aiEventInspector" aria-live="polite"></div></section><div id="aiPerspectives"></div><section class="ai-whatif"><h4>AI What If? local</h4><div class="ai-whatif-controls"><label>Chunk size <input id="aiChunkSize" type="number" min="3" max="24" value="8"></label><label>Overlap <input id="aiOverlap" type="number" min="0" max="12" value="1"></label><button class="btn" type="button" id="aiApplyWhatIf">Aplicar hipótesis</button></div><p id="aiWhatIfOutput" aria-live="polite"></p></section><section class="ai-tutor"><h4>AI Tutor contextual local</h4><label>Pregunta <select id="aiTutorQuestion"><option value="event">¿Qué ocurre en este evento?</option><option value="embedding">¿Qué es un embedding?</option><option value="distance">¿Por qué distancia coseno?</option><option value="index">¿Qué diferencia hay entre HNSW e IVF?</option><option value="hybrid">¿Cuándo Hybrid Vector Search?</option><option value="rag">¿Cuál es el papel del LLM en RAG?</option><option value="agent">¿Qué diferencia hay entre RAG y un agente?</option><option value="location">¿Qué procesamiento ocurre dentro de Oracle?</option></select></label><button class="btn" type="button" id="aiAskTutor">Explicar contexto</button><p id="aiTutorOutput" aria-live="polite"></p></section><p class="hint">Las métricas, rankings, recall, proyecciones y resultados son <strong>ilustrativos</strong>. No ejecutan SQL, no llaman proveedores, no representan HNSW/IVF internamente ni miden Oracle Database.</p></div>`;
  labRoot.append(shell);
  document.querySelectorAll("[data-ai-lab]").forEach((tab, index) => {
    tab.addEventListener("click", () => selectLab(tab.dataset.aiLab));
    tab.addEventListener("keydown", (event) => { const keys = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: labs.length - index - 1 }; if (!(event.key in keys)) return; event.preventDefault(); const next = (index + keys[event.key] + labs.length) % labs.length; document.querySelectorAll("[data-ai-lab]")[next].focus(); selectLab(labs[next].id); });
  });
  byId("aiInternalsScenario").addEventListener("change", (event) => { selectedScenarioId = event.target.value; selectedStep = 0; render(); });
  byId("aiMetric").addEventListener("change", (event) => { settings.metric = event.target.value; selectedStep = 0; render(); });
  byId("aiTopK").addEventListener("change", (event) => { settings.topK = Number(event.target.value); selectedStep = 0; render(); });
  byId("aiMode").addEventListener("change", (event) => { settings.mode = event.target.value; selectedStep = 0; render(); });
  byId("aiTextWeight").addEventListener("input", (event) => { settings.textWeight = Number(event.target.value); selectedStep = 0; render(); });
  byId("aiChunkSize").addEventListener("change", (event) => { settings.chunkSize = Number(event.target.value); render(); });
  byId("aiOverlap").addEventListener("change", (event) => { settings.overlap = Number(event.target.value); render(); });
  byId("aiApplyWhatIf").addEventListener("click", render); byId("aiTutorQuestion").addEventListener("change", render);
  byId("aiPrevious").addEventListener("click", () => step(-1)); byId("aiNext").addEventListener("click", () => step(1)); byId("aiReset").addEventListener("click", () => { stop(); selectedStep = 0; render(); }); byId("aiPlay").addEventListener("click", play); byId("aiPause").addEventListener("click", stop); byId("aiSpeed").addEventListener("change", (event) => { speed = Number(event.target.value); if (timer) { stop(); play(); } }); byId("aiAskTutor").addEventListener("click", () => { byId("aiTutorOutput").focus?.(); });
  window.addEventListener("hashchange", () => { const id = location.hash.slice(1); if (labs.some((lab) => lab.id === id) && id !== activeLabId) selectLab(id, false); });
  const directLab = location.hash.slice(1); if (labs.some((lab) => lab.id === directLab)) activeLabId = directLab, selectedScenarioId = activeLab().scenarios[0].id;
  render();
  if (labs.some((lab) => lab.id === directLab)) requestAnimationFrame(() => byId(directLab)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }));
  window.dispatchEvent(new CustomEvent("academy:oracle-ai-ready", { detail: { labId: activeLabId } }));
})();
