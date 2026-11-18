(() => {
  "use strict";

  const components = globalThis.oracleArchitectureComponents;
  const references = globalThis.oracleReferenceArchitectures;
  const graph = globalThis.OracleArchitectureGraphEngine;
  const flowEngine = globalThis.OracleArchitectureFlowEngine;
  const securityEngine = globalThis.OracleArchitectureSecurityEngine;
  const whatIfEngine = globalThis.OracleArchitectureWhatIfEngine;
  const guideEngine = globalThis.OracleArchitectureDeploymentGuide;
  const canvasRenderer = globalThis.OracleArchitectureCanvasRenderer;
  const flowRenderer = globalThis.OracleArchitectureFlowRenderer;
  const inspectorRenderer = globalThis.OracleArchitectureInspectorRenderer;
  if (!components || !references || !graph || !flowEngine || !securityEngine || !whatIfEngine || !guideEngine || !canvasRenderer || !flowRenderer || !inspectorRenderer) return;

  const escape = canvasRenderer.escape;
  const routeMap = Object.freeze({ "architecture-retail": "retail-recommendations", "architecture-finance": "finance-rag", "architecture-operations": "operations-agent" });
  const root = document.createElement("section");
  root.id = "architecture-explorer";
  root.className = "architecture-explorer module-section";
  root.setAttribute("aria-labelledby", "architectureExplorerTitle");
  document.querySelector("main")?.append(root);

  let architectureId = references[0].id;
  let architecture = graph.clone(references[0]);
  let selectedNodeId = "";
  let selectedEdgeId = "";
  let currentStep = 0;
  let timer = null;
  let speed = 1;
  let counter = 0;
  let whatIf = { users: "medium", documents: "medium", privateConnectivity: "yes", authorization: "yes" };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = (id) => document.getElementById(id);
  const activeReference = () => references.find((item) => item.id === architectureId) || references[0];
  const definitionFor = (nodeId) => {
    const node = architecture.nodes.find((item) => item.id === nodeId);
    return { node, definition: node ? components.find((item) => item.id === node.componentId) : null };
  };
  const activity = (name) => window.dispatchEvent(new CustomEvent("academy:architecture-activity", { detail: { activity: name } }));
  const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
  const selectScenario = (id, updateHash = false) => {
    const reference = references.find((item) => item.id === id);
    if (!reference) return;
    stop();
    architectureId = id;
    architecture = graph.clone(reference);
    selectedNodeId = "";
    selectedEdgeId = "";
    currentStep = 0;
    if (updateHash) {
      const route = Object.entries(routeMap).find(([, scenario]) => scenario === id)?.[0] || "architecture-explorer";
      window.history.pushState({ architectureId: id }, "", `#${route}`);
    }
    activity("architecture-explored");
    render();
    window.dispatchEvent(new CustomEvent("academy:architecture-active"));
  };
  const selectedEvent = () => flowEngine.run(architecture).events[currentStep - 1] || null;
  const diagram = () => {
    const flow = flowEngine.run(architecture);
    const activeEvent = selectedEvent();
    return canvasRenderer.render(architecture, { selectedNodeId, selectedEdgeId, activeEdgeIds: activeEvent ? architecture.edges.filter((edge) => edge.source === activeEvent.source && edge.target === activeEvent.target).map((edge) => edge.id) : [], activeNodeIds: activeEvent ? [activeEvent.source, activeEvent.target] : [] });
  };
  const guide = () => {
    const data = guideEngine.build(architecture, components);
    return `<section class="architecture-guide" aria-labelledby="architectureGuideTitle"><h3 id="architectureGuideTitle">Guía de despliegue educativo</h3><p>Clasifica componentes; no crea infraestructura ni políticas.</p><div class="guide-columns"><div><h4>Recursos a evaluar</h4><ul>${data.required.map((item) => `<li><strong>${escape(item.label)}</strong><span>${escape(item.responsibility)}</span></li>`).join("")}</ul></div><div><h4>Capacidades no desplegables</h4><ul>${data.capabilities.map((item) => `<li><strong>${escape(item.label)}</strong><span>${escape(item.note)}</span></li>`).join("")}</ul></div></div><h4>Prerrequisitos</h4><ol>${data.prerequisites.map((item) => `<li>${escape(item)}</li>`).join("")}</ol><p class="illustrative-note">${escape(data.limitations)}</p></section>`;
  };
  const builder = () => {
    const componentOptions = components.filter((item) => item.deployable).map((item) => `<option value="${escape(item.id)}">${escape(item.label)} · ${escape(item.zone)}</option>`).join("");
    const nodeOptions = architecture.nodes.map((item) => `<option value="${escape(item.id)}">${escape(item.label)}</option>`).join("");
    const selected = selectedNodeId ? definitionFor(selectedNodeId).node : null;
    return `<section class="architecture-builder" aria-labelledby="architectureBuilderTitle"><div><p class="eyebrow">Architecture Builder</p><h3 id="architectureBuilderTitle">Construye y valida una variante local</h3><p>Los cambios viven solo en memoria de esta página y no representan despliegues OCI.</p></div><div class="builder-controls"><label>Biblioteca de componentes<select id="architectureComponentLibrary">${componentOptions}</select></label><button type="button" data-architecture-action="add-node">Añadir componente</button><label>Origen<select id="architectureEdgeSource">${nodeOptions}</select></label><label>Destino<select id="architectureEdgeTarget">${nodeOptions}</select></label><label>Relación<select id="architectureEdgeRelationship">${graph.compatible.map((type) => `<option value="${type}">${type.replaceAll("_", " ")}</option>`).join("")}</select></label><button type="button" data-architecture-action="add-edge">Conectar</button><button type="button" data-architecture-action="remove-edge" ${selectedEdgeId ? "" : "disabled"}>Desconectar selección</button><button type="button" data-architecture-action="remove-node" ${selected ? "" : "disabled"}>Eliminar componente seleccionado</button></div>${selected ? `<div class="builder-nudge" aria-label="Mover componente seleccionado"><span>Posición de ${escape(selected.label)}</span><button type="button" data-architecture-action="nudge-up">↑</button><button type="button" data-architecture-action="nudge-left">←</button><button type="button" data-architecture-action="nudge-right">→</button><button type="button" data-architecture-action="nudge-down">↓</button></div>` : ""}</section>`;
  };
  const render = () => {
    const reference = activeReference();
    const flow = flowEngine.run(architecture);
    currentStep = Math.max(0, Math.min(currentStep, flow.events.length));
    const findings = graph.validate(architecture);
    const security = securityEngine.analyze(architecture);
    const inspection = definitionFor(selectedNodeId);
    const comparison = whatIfEngine.compare(architecture, whatIf);
    root.innerHTML = `<header class="architecture-hero"><div><p class="eyebrow">Capítulo 13 · Oracle AI Database Architecture Explorer</p><h2 id="architectureExplorerTitle">Diseña, recorre y cuestiona una arquitectura de Oracle AI Database</h2><p>Modelos locales y deterministas para comprender responsabilidades, datos, controles, flujos y alternativas. No es un diagrama de despliegue ni una recomendación operativa.</p></div><a href="#ai-internals" class="architecture-lab-link">Abrir laboratorios AI existentes →</a></header><div class="architecture-gallery" role="tablist" aria-label="Arquitecturas de referencia">${references.map((item) => `<button type="button" role="tab" data-architecture-scenario="${escape(item.id)}" aria-selected="${item.id === architectureId}" class="${item.id === architectureId ? "is-selected" : ""}"><span>${escape(item.name)}</span><small>${escape(item.useCase)}</small></button>`).join("")}</div><div class="architecture-route-row"><a href="#architecture-explorer">Vista general</a>${Object.entries(routeMap).map(([route, scenario]) => `<a href="#${route}">${escape(references.find((item) => item.id === scenario).name)}</a>`).join("")}</div><div class="architecture-layout"><div class="architecture-stage"><div class="architecture-stage-title"><div><p class="eyebrow">Interactive SVG canvas</p><h3>${escape(reference.name)}</h3><p>${escape(reference.objective)}</p></div><span class="architecture-badge">Datos y métricas ilustrativos</span></div>${diagram()}</div><aside class="architecture-side-panel" aria-label="Inspector de componente">${inspectorRenderer.component(inspection.node, inspection.definition, reference.relatedLab)}</aside></div>${builder()}<section class="architecture-flow-panel" aria-labelledby="architectureFlowTitle"><div class="architecture-panel-heading"><div><p class="eyebrow">Data Flow Explorer</p><h3 id="architectureFlowTitle">Flujo conceptual de datos</h3><p>El orden deriva de conexiones declaradas, no de tráfico real ni de una traza OCI.</p></div><div class="architecture-player-controls"><button type="button" data-architecture-action="play" ${reducedMotion ? "disabled" : ""}>${reducedMotion ? "Movimiento reducido" : "Play"}</button><button type="button" data-architecture-action="pause">Pause</button><button type="button" data-architecture-action="previous">Paso anterior</button><button type="button" data-architecture-action="next">Siguiente paso</button><button type="button" data-architecture-action="reset">Reset</button><label>Velocidad<select id="architectureSpeed"><option value="1" ${speed === 1 ? "selected" : ""}>1×</option><option value="2" ${speed === 2 ? "selected" : ""}>2×</option><option value="4" ${speed === 4 ? "selected" : ""}>4×</option></select></label></div></div><p id="architectureFlowStatus" aria-live="polite">${currentStep ? `Paso ${currentStep} de ${flow.events.length}` : "Selecciona Play o Siguiente paso."}</p>${flowRenderer.render(flow, currentStep)}<div class="architecture-event-buttons" aria-label="Timeline de eventos">${flow.events.map((event, index) => `<button type="button" data-architecture-step="${index + 1}" aria-pressed="${currentStep === index + 1}">${event.step} · ${escape(event.type.replaceAll("_", " "))}</button>`).join("")}</div><div class="architecture-flow-inspector">${flowRenderer.inspector(selectedEvent())}</div></section><div class="architecture-detail-grid"><section class="architecture-validation" aria-labelledby="architectureValidationTitle"><p class="eyebrow">Graph Validation</p><h3 id="architectureValidationTitle">Validación estructural</h3>${findings.length ? `<ul class="architecture-findings">${findings.map((finding) => `<li data-severity="${escape(finding.severity)}"><strong>${escape(finding.category)}</strong><span>${escape(finding.evidence)}</span></li>`).join("")}</ul>` : "<p class=\"security-ok\">La variante no tiene advertencias estructurales según las reglas locales.</p>"}<p class="illustrative-note">Estas reglas revisan referencias, relaciones y componentes aislados; no validan OCI.</p></section><section class="architecture-security" aria-labelledby="architectureSecurityTitle"><p class="eyebrow">Security Inspector</p><h3 id="architectureSecurityTitle">Hallazgos separados del grafo</h3>${inspectorRenderer.security(security)}<button type="button" data-architecture-action="review-security">Registrar revisión educativa</button></section></div><section class="architecture-what-if" aria-labelledby="architectureWhatIfTitle"><div><p class="eyebrow">AI What If?</p><h3 id="architectureWhatIfTitle">Compara una alternativa cualitativa</h3><p>Hipótesis locales; no son predicciones de costos, latencia, seguridad ni del optimizador.</p></div><div class="what-if-controls"><label>Usuarios<select id="architectureUsers"><option value="medium">Medios</option><option value="high" ${whatIf.users === "high" ? "selected" : ""}>Altos</option></select></label><label>Documentos<select id="architectureDocuments"><option value="medium">Medios</option><option value="high" ${whatIf.documents === "high" ? "selected" : ""}>Altos</option></select></label><label>Conectividad privada<select id="architecturePrivate"><option value="yes">Representada</option><option value="no" ${whatIf.privateConnectivity === "no" ? "selected" : ""}>No representada</option></select></label><label>Autorización<select id="architectureAuthorization"><option value="yes">Representada</option><option value="no" ${whatIf.authorization === "no" ? "selected" : ""}>No representada</option></select></label><button type="button" data-architecture-action="what-if">Comparar</button></div><div class="what-if-result"><strong>Complejidad ilustrativa: ${comparison.alternative.complexity}/5</strong><ul>${comparison.alternative.considerations.map((item) => `<li>${escape(item)}</li>`).join("")}</ul></div></section>${guide()}<section class="architecture-learning" aria-labelledby="architectureLearningTitle"><p class="eyebrow">Contrato educativo</p><h3 id="architectureLearningTitle">Comprueba tu comprensión</h3><ol>${reference.questions.map((question) => `<li>${escape(question)}</li>`).join("")}</ol><p class="illustrative-note">${escape(globalThis.oracleArchitectureLearningContent.limitations)}</p></section>`;
    root.querySelector(".architecture-hero").insertAdjacentHTML("beforeend", '<figure class="architecture-hero-art"><img src="assets/illustrations/architecture-explorer-tech.png" width="1280" height="720" loading="lazy" alt="Ilustración tridimensional de una arquitectura de Oracle AI Database con capas de datos, seguridad y servicios"><figcaption>Referencia visual 3D; el canvas SVG inferior sigue siendo la fuente interactiva del modelo.</figcaption></figure>');
    root.querySelector(".builder-controls").insertAdjacentHTML("beforeend", '<button type="button" data-architecture-action="reset-architecture">Restaurar escenario</button>');
    const flowStatus = root.querySelector("#architectureFlowStatus");
    if (flow.warnings.length) {
      flowStatus.textContent = flow.warnings.map((warning) => warning.label).join(" ");
      flowStatus.classList.add("architecture-flow-warning");
    }
    ["play", "next", "previous"].forEach((action) => {
      const control = root.querySelector(`[data-architecture-action="${action}"]`);
      if (control && !flow.events.length) control.disabled = true;
    });
    root.querySelector(".what-if-result").innerHTML = `<strong>Métrica ilustrativa de complejidad: ${comparison.alternative.illustrativeMetrics.complexity}/5</strong><p><strong>Hechos representados:</strong> ${comparison.baseline.facts.components} componentes y ${comparison.baseline.facts.connections} conexiones en el modelo actual.</p><p><strong>Hipótesis:</strong></p><ul>${comparison.alternative.hypotheses.map((item) => `<li>${escape(item)}</li>`).join("")}</ul><p class="illustrative-note">No son precios, latencias ni mediciones OCI.</p>`;
    const perspectiveTarget = inspection.node?.label || selectedEvent()?.label || "la arquitectura seleccionada";
    root.querySelector(".architecture-flow-panel").insertAdjacentHTML("afterend", `<section class="architecture-perspectives" aria-label="Perspectivas sincronizadas"><article><p class="eyebrow">Developer</p><h3>Contrato y datos</h3><p><strong>${escape(perspectiveTarget)}</strong> se interpreta como responsabilidad y conexión conceptual. Implementa contratos, validación de entradas y autorización; el diagrama no crea recursos ni permisos.</p></article><article><p class="eyebrow">DBA / Architect</p><h3>Controles y operación</h3><p>Revisa identidad, privilegios, red, residencia de datos, observabilidad, cuotas y requisitos del producto. El flujo no equivale a SQL Monitor, Audit o métricas observadas.</p></article></section>`);
  };
  const moveSelected = (x, y) => {
    if (!selectedNodeId) return;
    architecture = { ...architecture, nodes: architecture.nodes.map((node) => node.id === selectedNodeId ? { ...node, position: { x: (node.position?.x || 260) + x, y: (node.position?.y || 160) + y } } : node) };
    render();
  };
  const addNode = () => {
    const componentId = byId("architectureComponentLibrary").value;
    const component = components.find((item) => item.id === componentId);
    if (!component) return;
    counter += 1;
    const id = `${component.id}-custom-${counter}`;
    architecture = graph.addNode(architecture, { id, componentId: component.id, label: component.label, zone: component.zone, position: { x: 500 + (counter % 3) * 55, y: 340 + (counter % 2) * 40 } });
    selectedNodeId = id;
    selectedEdgeId = "";
    render();
  };
  const addEdge = () => {
    const source = byId("architectureEdgeSource").value;
    const target = byId("architectureEdgeTarget").value;
    const relationship = byId("architectureEdgeRelationship").value;
    if (!source || !target || source === target) return;
    counter += 1;
    const id = `custom-edge-${counter}`;
    architecture = graph.addEdge(architecture, { id, source, target, relationship, dataType: "EDUCATIONAL_DATA", securityContext: "AUTHENTICATED" });
    selectedEdgeId = architecture.edges.some((item) => item.id === id) ? id : "";
    render();
  };
  root.addEventListener("click", (event) => {
    const scenario = event.target.closest("[data-architecture-scenario]");
    const node = event.target.closest("[data-architecture-node]");
    const edge = event.target.closest("[data-architecture-edge]");
    const step = event.target.closest("[data-architecture-step]");
    const action = event.target.closest("[data-architecture-action]")?.dataset.architectureAction;
    if (scenario) return selectScenario(scenario.dataset.architectureScenario, true);
    if (node) { selectedNodeId = node.dataset.architectureNode; selectedEdgeId = ""; activity("component-selected"); return render(); }
    if (edge) { selectedEdgeId = edge.dataset.architectureEdge; selectedNodeId = ""; return render(); }
    if (step) { currentStep = Number(step.dataset.architectureStep); activity("flow-ran"); return render(); }
    if (!action) return;
    if (action === "add-node") return addNode();
    if (action === "add-edge") return addEdge();
    if (action === "reset-architecture") { stop(); architecture = graph.clone(activeReference()); selectedNodeId = ""; selectedEdgeId = ""; currentStep = 0; return render(); }
    if (action === "remove-edge" && selectedEdgeId) { architecture = graph.removeEdge(architecture, selectedEdgeId); selectedEdgeId = ""; return render(); }
    if (action === "remove-node" && selectedNodeId) { architecture = graph.removeNode(architecture, selectedNodeId); selectedNodeId = ""; return render(); }
    if (action === "nudge-up") return moveSelected(0, -12);
    if (action === "nudge-down") return moveSelected(0, 12);
    if (action === "nudge-left") return moveSelected(-12, 0);
    if (action === "nudge-right") return moveSelected(12, 0);
    if (action === "previous") { currentStep = Math.max(0, currentStep - 1); return render(); }
    if (action === "next") { currentStep = Math.min(flowEngine.run(architecture).events.length, currentStep + 1); activity("flow-ran"); return render(); }
    if (action === "reset") { stop(); currentStep = 0; return render(); }
    if (action === "pause") return stop();
    if (action === "play" && !reducedMotion) { stop(); timer = window.setInterval(() => { const length = flowEngine.run(architecture).events.length; currentStep = currentStep >= length ? 0 : currentStep + 1; activity("flow-ran"); render(); if (currentStep >= length) stop(); }, 1000 / speed); return; }
    if (action === "review-security") return activity("security-reviewed");
    if (action === "what-if") { whatIf = { users: byId("architectureUsers").value, documents: byId("architectureDocuments").value, privateConnectivity: byId("architecturePrivate").value, authorization: byId("architectureAuthorization").value }; activity("alternative-compared"); return render(); }
  });
  root.addEventListener("change", (event) => { if (event.target.id === "architectureSpeed") speed = Number(event.target.value) || 1; });
  root.addEventListener("keydown", (event) => {
    const edge = event.target.closest("[data-architecture-edge]");
    if (!edge || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    selectedEdgeId = edge.dataset.architectureEdge;
    selectedNodeId = "";
    render();
  });
  window.addEventListener("hashchange", () => {
    const routeId = window.location.hash.replace(/^#/, "");
    const scenarioId = routeMap[routeId];
    if (scenarioId && scenarioId !== architectureId) selectScenario(scenarioId);
    if (routeId === "architecture-explorer" && architectureId !== references[0].id) selectScenario(references[0].id);
  });
  const initialScenario = routeMap[window.location.hash.replace(/^#/, "")];
  if (initialScenario) selectScenario(initialScenario);
  else { activity("architecture-explored"); render(); }
  window.dispatchEvent(new CustomEvent("academy:architecture-ready"));
})();
