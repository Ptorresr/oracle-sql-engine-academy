(() => {
  "use strict";

  const root = document.getElementById("sqlIntelligenceLab");
  if (!root || !globalThis.oracleSqlIntelligenceExamples || !globalThis.OraclePlanParser || !globalThis.OraclePlanAnalyzer || !globalThis.OracleSqlAnalyzer || !globalThis.OracleSqlWhatIfEngine || !globalThis.OracleExecutionPlanRenderer || !globalThis.OracleSqlIntelligenceRenderer || !globalThis.OraclePlanOperatorCatalog) return;

  const byId = (id) => document.getElementById(id);
  const parser = globalThis.OraclePlanParser;
  const analyzer = globalThis.OraclePlanAnalyzer;
  const sqlAnalyzer = globalThis.OracleSqlAnalyzer;
  const whatIfEngine = globalThis.OracleSqlWhatIfEngine;
  const planRenderer = globalThis.OracleExecutionPlanRenderer;
  const renderer = globalThis.OracleSqlIntelligenceRenderer;
  const catalog = globalThis.OraclePlanOperatorCatalog;
  const examples = globalThis.oracleSqlIntelligenceExamples;
  let plan = parser.parse("");
  let analysis = analyzer.analyze(plan);
  let selectedId = null;
  let expanded = new Set();

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
    const node = selectedNode();
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
    byId("intelligenceInspectorBody").textContent = `${details.what} ${details.how} ${details.purpose} Componentes internos posibles: ${details.internals}`;
    byId("intelligenceInspectorData").textContent = `Objeto: ${node.object || "no informado"}. Padre: ${parent ? `${parent.id} · ${parent.operation}` : "sin padre identificado"}. Hijos: ${children.length ? children.map((child) => `${child.id} · ${child.operation}`).join("; ") : "ninguno"}. Predicado: ${node.predicate || "no informado"}.`;
    const values = ["eRows", "aRows", "starts", "buffers", "reads", "writes", "oMem", "oneMem", "usedMem", "tempSpc"].filter((name) => node.metrics[name]).map((name) => `${name}: ${node.metrics[name].raw}`).join(" · ");
    byId("intelligenceInspectorDba").textContent = `${details.dba} Métricas importadas: ${values || "no informadas"}.`;
  }

  function renderPlan() {
    if (!selectedId && plan.nodes[0]) selectedId = plan.nodes[0].id;
    const structure = planRenderer.withChildren(plan.nodes);
    if (!expanded.size) structure.byId.forEach((node) => { if (node.children.length) expanded.add(node.id); });
    byId("planTableView").innerHTML = planRenderer.renderTable(plan, selectedId);
    byId("planTreeView").innerHTML = planRenderer.renderTree(plan, selectedId, expanded);
    byId("planGraphView").innerHTML = planRenderer.renderGraph(plan, selectedId);
    byId("planNotes").textContent = plan.metadata.notes.length ? `Notas importadas: ${plan.metadata.notes.join(" ")}` : "No se importaron notas.";
    renderInspector();
    const animatedTimeline = globalThis.OracleAnimatedDataFlow?.planTimeline(plan);
    const selectedPlanIndex = plan.nodes.length ? plan.nodes.findIndex((node) => node.id === selectedId) : 0;
    globalThis.OracleAnimatedDataFlow?.mount(root.querySelector(".intelligence-illustration"), { kind: "intelligence", events: animatedTimeline?.events || [], index: selectedPlanIndex, label: "AI SQL Intelligence · flujo conceptual del plan", onSelect: (next) => { if (plan.nodes[next]) { selectedId = plan.nodes[next].id; renderPlan(); } } });
  }

  function renderInsights() {
    byId("cardinalityView").innerHTML = renderer.renderCardinality(analysis.cardinalities);
    byId("insightsView").innerHTML = renderer.renderFindings(analysis.findings);
  }

  function recordLearningActivity(activity) {
    window.dispatchEvent(new CustomEvent("academy:intelligence-activity", { detail: { activity } }));
  }

  function importPlan(recordProgress = false) {
    plan = parser.parse(byId("planInput").value);
    analysis = analyzer.analyze(plan);
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
    const node = selectedNode();
    const cardinalityRow = analysis.cardinalities.find((item) => item.nodeId === node?.id);
    const answer = {
      event: node ? `${node.id} · ${node.operation}: ${catalog.describe(node.operation).how} Esta respuesta procede de reglas locales y el plan importado.` : "Importe un plan para contextualizar la respuesta.",
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
      selectedId = node.dataset.planNode;
      renderPlan();
      if (event.isTrusted) recordLearningActivity("operator-inspected");
    }
  });
  root.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-plan-node]")) {
      event.preventDefault();
      selectedId = event.target.dataset.planNode;
      renderPlan();
      if (event.isTrusted) recordLearningActivity("operator-inspected");
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
  byId("planExample").dispatchEvent(new Event("change"));
  renderWhatIf();
})();
