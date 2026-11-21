(() => {
  "use strict";

  const root = document.getElementById("sqlIntelligenceLab");
  if (!root || !globalThis.oracleSqlIntelligenceExamples || !globalThis.OraclePlanParser || !globalThis.OraclePlanAnalyzer || !globalThis.OraclePlanDiagnosticsTimeline || !globalThis.OracleSqlAnalyzer || !globalThis.OracleSqlWhatIfEngine || !globalThis.OracleExecutionPlanRenderer || !globalThis.OracleSqlIntelligenceRenderer || !globalThis.OraclePlanOperatorCatalog) return;

  const byId = (id) => document.getElementById(id);
  const parser = globalThis.OraclePlanParser;
  const analyzer = globalThis.OraclePlanAnalyzer;
  const diagnostics = globalThis.OraclePlanDiagnosticsTimeline;
  const sqlAnalyzer = globalThis.OracleSqlAnalyzer;
  const whatIfEngine = globalThis.OracleSqlWhatIfEngine;
  const planRenderer = globalThis.OracleExecutionPlanRenderer;
  const renderer = globalThis.OracleSqlIntelligenceRenderer;
  const catalog = globalThis.OraclePlanOperatorCatalog;
  const examples = globalThis.oracleSqlIntelligenceExamples;
  let plan = parser.parse("");
  let analysis = analyzer.analyze(plan);
  let diagnosticTimeline = diagnostics.createTimeline(plan, analysis);
  let diagnosticIndex = -1;
  let selectedId = null;
  let expanded = new Set();
  let intelligenceTimer = null;
  let intelligenceSpeed = 1;

  function stopIntelligencePlayback() {
    if (intelligenceTimer) window.clearInterval(intelligenceTimer);
    intelligenceTimer = null;
    byId("diagnosticsPlay")?.setAttribute("aria-pressed", "false");
    if (byId("diagnosticsPause")) byId("diagnosticsPause").disabled = true;
  }

  function playIntelligencePlayback() {
    if (intelligenceTimer || !diagnosticTimeline.events.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (diagnosticIndex >= diagnosticTimeline.events.length - 1) diagnosticIndex = 0;
    byId("diagnosticsPlay")?.setAttribute("aria-pressed", "true");
    if (byId("diagnosticsPause")) byId("diagnosticsPause").disabled = false;
    intelligenceTimer = window.setInterval(() => {
      if (diagnosticIndex >= diagnosticTimeline.events.length - 1) return stopIntelligencePlayback();
      setDiagnosticIndex(diagnosticIndex + 1);
    }, Math.round(1100 / intelligenceSpeed));
  }

  function diagnosticState() {
    return diagnostics.stateAt(diagnosticTimeline, diagnosticIndex);
  }

  function setDiagnosticIndex(nextIndex) {
    if (!diagnosticTimeline.events.length) return;
    diagnosticIndex = Math.max(0, Math.min(nextIndex, diagnosticTimeline.events.length - 1));
    selectedId = diagnosticState().node?.id || selectedId;
    renderPlan();
  }

  function syncDiagnosticsControls(state) {
    const hasEvents = diagnosticTimeline.events.length > 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    byId("diagnosticsPrevious").disabled = !hasEvents || diagnosticIndex <= 0;
    byId("diagnosticsNext").disabled = !hasEvents || diagnosticIndex >= diagnosticTimeline.events.length - 1;
    byId("diagnosticsPlay").disabled = !hasEvents || reduced;
    byId("diagnosticsPause").disabled = !intelligenceTimer;
    byId("diagnosticsSpeed").value = String(intelligenceSpeed);
    byId("diagnosticsStatus").textContent = state.current ? `${state.current.step}/${diagnosticTimeline.events.length} · ${state.current.type} · ${state.current.label}${state.playbackLimited ? ` ${state.warnings.at(-1)}` : ""}` : "Importe un plan con operadores para iniciar el recorrido diagnóstico.";
    if (reduced) byId("diagnosticsPlay").title = "Reproducción automática desactivada por preferencia de movimiento reducido";
  }

  function selectedNode() {
    return plan.nodes.find((node) => node.id === selectedId) || plan.nodes[0] || null;
  }

  function nodeChildren(node) {
    return plan.nodes.filter((candidate) => candidate.parentId === node.id);
  }

  function writeStatus() {
    const messages = [...plan.warnings];
    const recognized = plan.nodes.length ? `Formato reconocido: ${plan.format}. ${plan.nodes.length} operador(es) importado(s).` : "Aún no hay un plan importado.";
    byId("planImportStatus").textContent = [recognized, ...messages].join(" ");
    byId("planMetadata").textContent = `Plan hash: ${plan.metadata.planHash || "no informado"} · Columnas presentes: ${plan.metadata.columns.join(", ") || "ninguna"}.`;
  }

  function renderInspector() {
    const state = diagnosticState();
    const node = state.node || selectedNode();
    if (!node) {
      byId("intelligenceInspectorTitle").textContent = "Seleccione un operador";
      byId("intelligenceInspectorBody").textContent = "Importe un plan y seleccione un operador para ver una explicación contextual.";
      byId("intelligenceInspectorData").textContent = "Los datos importados aparecerán aquí.";
      byId("intelligenceInspectorDba").textContent = "Las métricas se mostrarán solo si existen en el plan.";
      return;
    }
    const details = catalog.describe(node.operation);
    const parent = plan.nodes.find((candidate) => candidate.id === node.parentId);
    const children = nodeChildren(node);
    byId("intelligenceInspectorTitle").textContent = `${node.id} · ${node.operation}`;
    byId("intelligenceInspectorBody").textContent = `${state.current?.explanation?.what || details.what} ${state.current?.explanation?.how || details.how} Componentes internos posibles: ${details.internals}`;
    byId("intelligenceInspectorData").textContent = `Objeto: ${node.object || "no informado"}. Padre: ${parent ? `${parent.id} · ${parent.operation}` : "sin padre identificado"}. Hijos: ${children.length ? children.map((child) => `${child.id} · ${child.operation}`).join("; ") : "ninguno"}. Predicado: ${node.predicate || "no informado"}.`;
    const values = ["eRows", "aRows", "starts", "buffers", "reads", "writes", "oMem", "oneMem", "usedMem", "tempSpc"].filter((name) => node.metrics[name]).map((name) => `${name}: ${node.metrics[name].raw}`).join(" · ");
    byId("intelligenceInspectorDba").textContent = `${state.current?.explanation?.dba || details.dba} Métricas importadas: ${values || "No informado"}.`;
  }

  function renderPlan() {
    const state = diagnosticState();
    if (state.node) selectedId = state.node.id;
    if (!selectedId && plan.nodes[0]) selectedId = plan.nodes[0].id;
    const structure = planRenderer.withChildren(plan.nodes);
    if (!expanded.size) structure.byId.forEach((node) => { if (node.children.length) expanded.add(node.id); });
    byId("planTableView").innerHTML = planRenderer.renderTable(plan, selectedId);
    byId("planTreeView").innerHTML = planRenderer.renderTree(plan, selectedId, expanded);
    byId("planGraphView").innerHTML = planRenderer.renderGraph(plan, selectedId);
    byId("planNotes").textContent = `${plan.metadata.notes.length ? `Notas importadas: ${plan.metadata.notes.join(" ")}` : "No se importaron notas."}${diagnosticTimeline.warnings.length ? ` ${diagnosticTimeline.warnings.join(" ")}` : ""}`;
    renderInspector();
    byId("diagnosticsResults").innerHTML = renderer.renderDiagnosticRecord(state);
    globalThis.OracleAnimatedDataFlow?.mount(root.querySelector(".intelligence-illustration"), { kind: "intelligence", events: diagnosticTimeline.events, index: diagnosticIndex, label: "AI SQL Intelligence · recorrido diagnóstico educativo", onSelect: (next) => { stopIntelligencePlayback(); setDiagnosticIndex(next); } });
    syncDiagnosticsControls(state);
    globalThis.OraclePresentationMode?.refresh("intelligence");
  }

  function renderInsights() {
    byId("cardinalityView").innerHTML = renderer.renderCardinality(analysis.cardinalities);
    byId("insightsView").innerHTML = renderer.renderFindings(analysis.findings);
  }

  function recordLearningActivity(activity) {
    window.dispatchEvent(new CustomEvent("academy:intelligence-activity", { detail: { activity } }));
  }

  function importPlan(recordProgress = false) {
    stopIntelligencePlayback();
    plan = parser.parse(byId("planInput").value);
    analysis = analyzer.analyze(plan);
    diagnosticTimeline = diagnostics.createTimeline(plan, analysis);
    diagnosticIndex = diagnosticTimeline.events.length ? 0 : -1;
    selectedId = plan.nodes[0]?.id || null;
    expanded = new Set();
    writeStatus();
    renderPlan();
    renderInsights();
    if (recordProgress) recordLearningActivity("plan-imported");
  }

  function showRelatedSql() {
    const node = selectedNode();
    const sql = byId("intelligenceSqlInput").value.trim();
    const output = byId("relatedSqlOutput");
    if (!sql) {
      output.textContent = "Proporcione SQL para relacionarlo con el operador. El plan por sí solo no permite atribuir una cláusula SQL exacta a cada operación física.";
      return;
    }
    if (!node) {
      output.textContent = "No hay operador seleccionado. Se conserva el SQL sin ejecutarlo.";
      return;
    }
    const relation = node.predicate ? `El plan informa el predicado ${node.predicate}. Puede relacionarse con una condición SQL, pero no prueba una correspondencia física exclusiva.` : /JOIN/i.test(node.operation) ? "El operador de unión puede relacionarse con cláusulas JOIN u ON, pero la elección física depende del optimizador." : "No se puede asignar una cláusula SQL exacta a este operador solo con la información disponible.";
    output.textContent = `Operador ${node.id} · ${node.operation}. ${relation}`;
  }

  function renderSqlAnalysis() {
    byId("sqlAnalysisOutput").innerHTML = renderer.renderSqlAnalysis(sqlAnalyzer.analyze(byId("intelligenceSqlInput").value));
  }

  function renderWhatIf() {
    const result = whatIfEngine.evaluate({ cardinality: byId("whatIfCardinality").value, selectivity: byId("whatIfSelectivity").value, index: byId("whatIfIndex").value, memory: byId("whatIfMemory").value, joinOrder: byId("whatIfJoinOrder").value, algorithm: byId("whatIfAlgorithm").value });
    byId("whatIfOutput").innerHTML = renderer.renderWhatIf(result);
  }

  function tutorAnswer() {
    const question = byId("intelligenceTutorQuestion").value;
    const state = diagnosticState();
    const node = state.node || selectedNode();
    const cardinalityRow = analysis.cardinalities.find((item) => item.nodeId === node?.id);
    const answer = {
      event: node ? `${node.id} · ${node.operation}: ${state.current?.explanation?.what || catalog.describe(node.operation).how} Esta respuesta procede de reglas locales y el plan importado.` : "Importe un plan para contextualizar la respuesta.",
      starts: node?.metrics.starts ? `Starts informado: ${node.metrics.starts.raw}. Puede indicar cuántas veces se inició el operador en el alcance mostrado; relácionelo con sus entradas antes de concluir.` : "El plan no informa Starts para el operador seleccionado.",
      cardinality: cardinalityRow ? `E-Rows: ${cardinalityRow.estimated ?? "no informado"}; A-Rows: ${cardinalityRow.observed ?? "no informado"}; ${cardinalityRow.interpretation}` : "No hay datos de cardinalidad para este operador.",
      evidence: "Para confirmar rendimiento faltan contexto de SQL, estadísticas, binds, datos, configuración y mediciones autorizadas. Este laboratorio no sustituye SQL Monitor, AWR ni DBMS_XPLAN completo."
    };
    byId("tutorOutput").textContent = answer[question];
  }

  function activateTab(tab) {
    const tabs = [...root.querySelectorAll("[role=tab]")];
    tabs.forEach((candidate) => {
      const active = candidate === tab;
      candidate.setAttribute("aria-selected", String(active));
      byId(candidate.getAttribute("aria-controls")).hidden = !active;
    });
  }

  byId("planExample").innerHTML = examples.map((example) => `<option value="${example.id}">${example.label}</option>`).join("");
  byId("planExample").addEventListener("change", (event) => {
    const example = examples.find((candidate) => candidate.id === event.target.value) || examples[0];
    byId("planInput").value = example.plan;
    byId("intelligenceSqlInput").value = example.sql;
    byId("exampleContext").textContent = `${example.objective} ${example.relation} Preguntas: ${example.questions.join(" ")} ${example.notice}`;
    importPlan(event.isTrusted);
    renderSqlAnalysis();
  });
  byId("planImport").addEventListener("click", () => importPlan(true));
  byId("planClear").addEventListener("click", () => { byId("planInput").value = ""; importPlan(); });
  byId("diagnosticsPrevious").addEventListener("click", () => { stopIntelligencePlayback(); setDiagnosticIndex(diagnosticIndex - 1); });
  byId("diagnosticsNext").addEventListener("click", () => { stopIntelligencePlayback(); setDiagnosticIndex(diagnosticIndex + 1); });
  byId("diagnosticsPlay").addEventListener("click", playIntelligencePlayback);
  byId("diagnosticsPause").addEventListener("click", () => { stopIntelligencePlayback(); syncDiagnosticsControls(diagnosticState()); });
  byId("diagnosticsReset").addEventListener("click", () => { stopIntelligencePlayback(); setDiagnosticIndex(0); });
  byId("diagnosticsSpeed").addEventListener("change", () => { intelligenceSpeed = Number(byId("diagnosticsSpeed").value) || 1; if (intelligenceTimer) { stopIntelligencePlayback(); playIntelligencePlayback(); } });
  byId("showRelatedSql").addEventListener("click", showRelatedSql);
  byId("analyzeSqlIntelligence").addEventListener("click", renderSqlAnalysis);
  byId("askIntelligenceTutor").addEventListener("click", tutorAnswer);
  ["whatIfCardinality", "whatIfSelectivity", "whatIfIndex", "whatIfMemory", "whatIfJoinOrder", "whatIfAlgorithm"].forEach((id) => byId(id).addEventListener("change", renderWhatIf));
  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-plan-toggle]");
    const node = event.target.closest("[data-plan-node]");
    if (toggle) {
      const id = toggle.dataset.planToggle;
      if (expanded.has(id)) expanded.delete(id);
      else expanded.add(id);
      renderPlan();
    } else if (node) {
      const index = diagnostics.indexForOperator(diagnosticTimeline, node.dataset.planNode);
      if (index >= 0) setDiagnosticIndex(index);
      else {
        selectedId = node.dataset.planNode;
        renderPlan();
      }
      recordLearningActivity("operator-inspected");
    }
  });
  root.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-plan-node]")) {
      event.preventDefault();
      const index = diagnostics.indexForOperator(diagnosticTimeline, event.target.dataset.planNode);
      if (index >= 0) setDiagnosticIndex(index);
      else {
        selectedId = event.target.dataset.planNode;
        renderPlan();
      }
      recordLearningActivity("operator-inspected");
    }
  });
  [...root.querySelectorAll("[role=tab]")].forEach((tab, index, tabs) => tab.addEventListener("keydown", (event) => {
    const offset = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1, Home: -index, End: tabs.length - index - 1 }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const target = tabs[(index + offset + tabs.length) % tabs.length];
    target.focus();
    activateTab(target);
  }));
  [...root.querySelectorAll("[role=tab]")].forEach((tab) => tab.addEventListener("click", () => activateTab(tab)));
  window.addEventListener("academy:diagnostics-launch", () => {
    activateTab(byId("intelligencePlanTab"));
    window.requestAnimationFrame(() => byId("planImport")?.focus());
  });
  byId("planExample").dispatchEvent(new Event("change"));
  renderWhatIf();
  globalThis.OraclePresentationMode?.register({ id: "intelligence", root, kind: "intelligence", title: "AI SQL Intelligence Lab", image: "assets/illustrations/sql-intelligence-tech.png", getState: () => { const state = diagnosticState(); return { events: diagnosticTimeline.events, index: Math.max(0, diagnosticIndex), event: state.current, speed: intelligenceSpeed, playing: Boolean(intelligenceTimer), component: state.node?.operation || "Plan importado", subtitle: plan.nodes.length ? `${plan.nodes.length} operador(es) importado(s)` : "Sin plan importado" }; }, actions: { play: playIntelligencePlayback, pause: () => { stopIntelligencePlayback(); syncDiagnosticsControls(diagnosticState()); globalThis.OraclePresentationMode?.refresh("intelligence"); }, previous: () => { stopIntelligencePlayback(); setDiagnosticIndex(diagnosticIndex - 1); }, next: () => { stopIntelligencePlayback(); setDiagnosticIndex(diagnosticIndex + 1); }, reset: () => { stopIntelligencePlayback(); setDiagnosticIndex(0); }, setSpeed: (value) => { intelligenceSpeed = Number(value) || 1; byId("diagnosticsSpeed").value = String(intelligenceSpeed); if (intelligenceTimer) { stopIntelligencePlayback(); playIntelligencePlayback(); } }, select: (next) => { stopIntelligencePlayback(); setDiagnosticIndex(next); } } });
})();
