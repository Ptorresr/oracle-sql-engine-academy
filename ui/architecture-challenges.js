(() => {
  "use strict";

  const root = document.getElementById("architecture-challenges");
  const challenges = globalThis.oracleArchitectureChallenges;
  const components = globalThis.oracleArchitectureComponents;
  const graph = globalThis.OracleArchitectureGraphEngine;
  const evaluator = globalThis.OracleArchitectureChallengeEvaluator;
  const canvas = globalThis.OracleArchitectureCanvasRenderer;
  const feedback = globalThis.OracleChallengeFeedbackRenderer;
  if (!root || !challenges || !components || !graph || !evaluator || !canvas || !feedback) return;

  let challenge = challenges[0];
  let architecture = { id: challenge.id, name: challenge.title, nodes: [], edges: [] };
  let selectedNodeId = "";
  let selectedEdgeId = "";
  let counter = 0;
  let result = null;
  const progressKey = "oracle-sql-academy.challenges.v1";
  const byId = (id) => root.querySelector(`#${id}`);
  const activity = (name) => window.dispatchEvent(new CustomEvent("academy:architecture-challenge-activity", { detail: { activity: name } }));
  const readProgress = () => { try { return JSON.parse(localStorage.getItem(progressKey) || '{"started":[],"completed":[],"scores":{}}'); } catch { return { started: [], completed: [], scores: {} }; } };
  const saveProgress = (data) => { try { localStorage.setItem(progressKey, JSON.stringify(data)); } catch {} };
  const escape = canvas.escape;
  const activeComponent = (id) => components.find((item) => item.id === id);
  const nodeOptions = () => architecture.nodes.map((node) => `<option value="${escape(node.id)}">${escape(node.label)} · ${escape(node.componentId)}</option>`).join("");
  const availableOptions = () => challenge.availableComponents.map((id) => { const item = activeComponent(id); return item ? `<option value="${escape(id)}">${escape(item.label)} · ${escape(item.category)}</option>` : ""; }).join("");
  const referenceForChallenge = () => {
    const references = globalThis.oracleReferenceArchitectures || [];
    const ref = references.find((item) => item.id === ({ "retail-vector-recommendations": "retail-recommendations", "finance-secure-rag": "finance-rag", "operations-authorized-agent": "operations-agent" }[challenge.id]));
    return ref ? graph.clone(ref) : { id: challenge.id, name: challenge.title, nodes: [], edges: [] };
  };
  const resetArchitecture = () => { architecture = { id: challenge.id, name: challenge.title, nodes: [], edges: [] }; selectedNodeId = ""; selectedEdgeId = ""; counter = 0; result = null; render(); };
  const loadReference = () => { architecture = referenceForChallenge(); selectedNodeId = ""; selectedEdgeId = ""; result = null; activity("challenge-started"); render(); };
  const render = () => {
    const progress = readProgress();
    const score = Object.values(progress.scores || {});
    byId("challengeTitle").textContent = challenge.title;
    byId("challengeIndustry").textContent = `${challenge.industry} · ${challenge.level}`;
    byId("challengeObjective").textContent = challenge.objective;
    byId("challengeContext").textContent = challenge.context;
    byId("challengeRequirements").innerHTML = challenge.requirements.map((item) => `<li><strong>${escape(item.label)}</strong><span>${escape(item.kind === "security" ? "Seguridad" : item.kind === "flow" ? "Flujo" : "Componente")}</span></li>`).join("");
    byId("challengeRestrictions").innerHTML = challenge.restrictions.map((item) => `<li>${escape(item)}</li>`).join("");
    root.querySelectorAll("[data-challenge-id]").forEach((button) => { const selected = button.dataset.challengeId === challenge.id; button.setAttribute("aria-selected", String(selected)); button.classList.toggle("is-selected", selected); });
    byId("challengeCanvas").innerHTML = canvas.render(architecture, { selectedNodeId, selectedEdgeId });
    byId("challengeComponentLibrary").innerHTML = availableOptions();
    byId("challengeEdgeSource").innerHTML = nodeOptions();
    byId("challengeEdgeTarget").innerHTML = nodeOptions();
    byId("challengeRemoveNode").disabled = !selectedNodeId;
    byId("challengeRemoveEdge").disabled = !selectedEdgeId;
    byId("challengeDashboard").innerHTML = `<strong>${score.length} desafío(s) evaluado(s)</strong><span>${progress.completed?.length || 0} completado(s) · mejor puntuación ${score.length ? Math.max(...score) : 0}/100</span>`;
    byId("challengeFeedback").innerHTML = result ? feedback.render(result) : `<p class="challenge-empty">Construye una variante con el Builder y pulsa <strong>Evaluar arquitectura</strong>. La evaluación no modifica tu diseño.</p>`;
    activity("challenge-opened");
  };
  const addNode = () => { const componentId = byId("challengeComponentLibrary").value; const item = activeComponent(componentId); if (!item) return; counter += 1; architecture = graph.addNode(architecture, { id: `${componentId}-challenge-${counter}`, componentId, label: item.label, zone: item.zone, position: { x: 90 + (counter % 5) * 165, y: 90 + (Math.floor(counter / 5) % 2) * 170 } }); render(); };
  const addEdge = () => { const source = byId("challengeEdgeSource").value; const target = byId("challengeEdgeTarget").value; if (!source || !target || source === target) return; counter += 1; architecture = graph.addEdge(architecture, { id: `challenge-edge-${counter}`, source, target, relationship: byId("challengeEdgeRelationship").value, dataType: "EDUCATIONAL_FLOW", securityContext: "AUTHENTICATED" }); render(); };
  const evaluate = () => { result = evaluator.evaluate(challenge, architecture); const progress = readProgress(); progress.started = [...new Set([...(progress.started || []), challenge.id])]; progress.scores = { ...(progress.scores || {}), [challenge.id]: result.score.total }; if (result.status === "complete") progress.completed = [...new Set([...(progress.completed || []), challenge.id])]; saveProgress(progress); activity("challenge-evaluated"); render(); };
  const selectChallenge = (id) => { challenge = challenges.find((item) => item.id === id) || challenges[0]; resetArchitecture(); history.replaceState({ challenge: id }, "", "#architecture-challenges"); };
  root.innerHTML = `<div class="kicker">Sprint 7 · Architecture Challenges</div><h2 id="architectureChallengesTitle">Resuelve desafíos de arquitectura con evidencia</h2><p>Construye una variante con el Architecture Builder, valida requisitos y mejora la solución. La puntuación es educativa, local y determinista; no certifica Oracle, seguridad ni producción.</p><div class="challenge-tabs" role="tablist" aria-label="Desafíos de arquitectura">${challenges.map((item) => `<button type="button" role="tab" data-challenge-id="${item.id}" aria-selected="false">${item.order} · ${item.industry}</button>`).join("")}</div><div id="challengeDashboard" class="challenge-dashboard"></div><section class="challenge-brief" aria-labelledby="challengeTitle"><div><p class="eyebrow" id="challengeIndustry"></p><h3 id="challengeTitle"></h3><p id="challengeObjective"></p><p id="challengeContext"></p></div><div class="challenge-brief-columns"><div><h4>Requisitos</h4><ul id="challengeRequirements"></ul></div><div><h4>Restricciones</h4><ul id="challengeRestrictions"></ul></div></div></section><section class="challenge-builder" aria-labelledby="challengeBuilderTitle"><div class="challenge-heading"><div><p class="eyebrow">Architecture Builder reutilizado</p><h3 id="challengeBuilderTitle">Construye tu solución</h3><p>El grafo vive solo en memoria. Los controles ofrecen una alternativa operable al drag-and-drop.</p></div><div class="challenge-actions"><button type="button" class="btn" data-challenge-action="load-reference">Cargar referencia educativa</button><button type="button" class="btn" data-challenge-action="reset">Reiniciar desafío</button><button type="button" class="btn primary" data-challenge-action="evaluate">Evaluar arquitectura</button></div></div><div class="challenge-builder-controls"><label>Componente<select id="challengeComponentLibrary"></select></label><button type="button" class="btn" data-challenge-action="add-node">Añadir componente</button><label>Origen<select id="challengeEdgeSource"></select></label><label>Destino<select id="challengeEdgeTarget"></select></label><label>Relación<select id="challengeEdgeRelationship">${graph.compatible.map((item) => `<option value="${item}">${item.replaceAll("_", " ")}</option>`).join("")}</select></label><button type="button" class="btn" data-challenge-action="add-edge">Conectar</button><button type="button" class="btn" id="challengeRemoveNode" data-challenge-action="remove-node" disabled>Eliminar componente</button><button type="button" class="btn" id="challengeRemoveEdge" data-challenge-action="remove-edge" disabled>Eliminar conexión</button></div><div id="challengeCanvas" class="challenge-canvas-wrap"></div></section><section class="challenge-feedback" aria-labelledby="challengeFeedbackTitle"><div class="challenge-heading"><div><p class="eyebrow">Learning Assessment</p><h3 id="challengeFeedbackTitle">Evaluación y recomendaciones</h3></div></div><div id="challengeFeedback" aria-live="polite"></div></section><p class="hint">Cada hallazgo distingue evidencia, interpretación y recomendación. Una conexión no prueba autorización; una alternativa válida no tiene que copiar la topología de referencia.</p>`;
  root.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-challenge-id]");
    if (tab) return selectChallenge(tab.dataset.challengeId);
    const node = event.target.closest("[data-architecture-node]");
    const edge = event.target.closest("[data-architecture-edge]");
    const finding = event.target.closest("[data-challenge-finding]");
    if (node) { selectedNodeId = node.dataset.architectureNode; selectedEdgeId = ""; return render(); }
    if (edge) { selectedEdgeId = edge.dataset.architectureEdge; selectedNodeId = ""; return render(); }
    if (finding && result) { const item = result.findings[Number(finding.dataset.challengeFinding)]; selectedNodeId = item.affectedNodes[0] || ""; selectedEdgeId = item.affectedEdges[0] || ""; return render(); }
    const action = event.target.closest("[data-challenge-action]")?.dataset.challengeAction;
    if (action === "load-reference") loadReference();
    if (action === "reset") resetArchitecture();
    if (action === "evaluate") evaluate();
    if (action === "add-node") addNode();
    if (action === "add-edge") addEdge();
    if (action === "remove-node" && selectedNodeId) { architecture = graph.removeNode(architecture, selectedNodeId); selectedNodeId = ""; render(); }
    if (action === "remove-edge" && selectedEdgeId) { architecture = graph.removeEdge(architecture, selectedEdgeId); selectedEdgeId = ""; render(); }
  });
  root.addEventListener("keydown", (event) => { const node = event.target.closest?.("[data-architecture-node]"); const edge = event.target.closest?.("[data-architecture-edge]"); if (!node && !edge) return; if (["Enter", " "].includes(event.key)) { event.preventDefault(); if (node) selectedNodeId = node.dataset.architectureNode; if (edge) selectedEdgeId = edge.dataset.architectureEdge; render(); } });
  render();
  window.dispatchEvent(new CustomEvent("academy:architecture-challenges-ready"));
  window.addEventListener("popstate", () => { if (location.hash === "#architecture-challenges") render(); });
  globalThis.OracleArchitectureChallenges = Object.freeze({ getState: () => ({ challenge, architecture, result }), reset: resetArchitecture, evaluate });
})();
