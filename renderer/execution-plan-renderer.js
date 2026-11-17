(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "—").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]);
  const rawMetric = (node, name) => node.metrics[name]?.raw || "—";
  const selected = (id, selectedId) => id === selectedId ? " is-selected" : "";
  const metricColumns = Object.freeze({ "starts": "starts", "e-rows": "eRows", "e rows": "eRows", "a-rows": "aRows", "a rows": "aRows", "rows": "rows", "cost": "cost", "bytes": "bytes", "a-time": "aTime", "a time": "aTime", "buffers": "buffers", "reads": "reads", "writes": "writes", "omem": "oMem", "1mem": "oneMem", "used-mem": "usedMem", "used mem": "usedMem", "tempspc": "tempSpc", "temp spc": "tempSpc" });
  const normalizedColumn = (column) => String(column || "").trim().toLowerCase().replace(/\s+/g, " ");

  function valueForColumn(node, column) {
    const normalized = normalizedColumn(column);
    if (normalized === "id") return node.id;
    if (normalized === "operation") return node.operation;
    if (normalized === "name" || normalized === "object name") return node.object;
    const metric = metricColumns[normalized];
    return metric ? rawMetric(node, metric) : (node.metrics.extra[normalized] || "—");
  }

  function nodeButton(node, selectedId, expanded) {
    const hasChildren = node.children?.length > 0;
    const control = hasChildren ? `<button class="plan-tree-toggle" type="button" data-plan-toggle="${escapeHtml(node.id)}" aria-label="${expanded.has(node.id) ? "Contraer" : "Expandir"} operador ${escapeHtml(node.id)}" aria-expanded="${expanded.has(node.id)}">${expanded.has(node.id) ? "−" : "+"}</button>` : "<span class=\"plan-tree-spacer\" aria-hidden=\"true\"></span>";
    return `<li class="plan-tree-node${selected(node.id, selectedId)}" style="--plan-depth:${node.depth}">${control}<button class="plan-tree-label" type="button" data-plan-node="${escapeHtml(node.id)}" aria-pressed="${node.id === selectedId}"><strong>${escapeHtml(node.id)} · ${escapeHtml(node.operation)}</strong><span>${escapeHtml(node.object || "sin objeto")} · E ${escapeHtml(rawMetric(node, "eRows"))} · A ${escapeHtml(rawMetric(node, "aRows"))}</span></button></li>`;
  }

  function withChildren(nodes) {
    const byId = new Map(nodes.map((node) => [node.id, { ...node, children: [] }]));
    const roots = [];
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId).children.push(node);
      else roots.push(node);
    });
    return { roots, byId };
  }

  function visibleNodes(nodes, expanded) {
    const structure = withChildren(nodes);
    const output = [];
    function visit(node) {
      output.push(node);
      if (expanded.has(node.id)) node.children.forEach(visit);
    }
    structure.roots.forEach(visit);
    return output;
  }

  function renderTable(plan, selectedId) {
    const columns = plan.metadata.columns.length ? plan.metadata.columns : ["Id", "Operation"];
    const rows = plan.nodes.map((node) => `<tr class="plan-table-row${selected(node.id, selectedId)}" data-plan-node="${escapeHtml(node.id)}" tabindex="0" role="button" aria-label="Seleccionar operador ${escapeHtml(node.id)} ${escapeHtml(node.operation)}">${columns.map((column) => `<td>${escapeHtml(valueForColumn(node, column))}</td>`).join("")}</tr>`).join("");
    return `<div class="scroll"><table class="intelligence-plan-table"><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="${columns.length}">No hay operadores importados.</td></tr>`}</tbody></table></div>`;
  }

  function renderTree(plan, selectedId, expanded) {
    const rows = visibleNodes(plan.nodes, expanded).map((node) => nodeButton(node, selectedId, expanded)).join("");
    return `<ul class="plan-tree" aria-label="Jerarquía conceptual del plan">${rows || "<li>Importe un plan para ver su jerarquía.</li>"}</ul>`;
  }

  function renderGraph(plan, selectedId) {
    const nodes = plan.nodes.slice(0, 12);
    const height = Math.max(230, nodes.length * 48 + 35);
    const links = nodes.filter((node) => node.parentId).map((node) => {
      const parent = nodes.find((candidate) => candidate.id === node.parentId);
      if (!parent) return "";
      const sourceY = 35 + nodes.indexOf(parent) * 48;
      const targetY = 35 + nodes.indexOf(node) * 48;
      return `<path d="M${120 + parent.depth * 55} ${sourceY} C${160 + parent.depth * 55} ${sourceY}, ${160 + node.depth * 55} ${targetY}, ${190 + node.depth * 55} ${targetY}"/>`;
    }).join("");
    const cards = nodes.map((node, index) => `<g class="plan-svg-node${selected(node.id, selectedId)}" data-plan-node="${escapeHtml(node.id)}" tabindex="0" role="button" aria-label="Seleccionar operador ${escapeHtml(node.id)} ${escapeHtml(node.operation)}"><rect x="${190 + node.depth * 55}" y="${14 + index * 48}" width="215" height="35" rx="8"/><text x="${202 + node.depth * 55}" y="${36 + index * 48}">${escapeHtml(`${node.id} · ${node.operation}`).slice(0, 30)}</text></g>`).join("");
    return `<svg class="plan-graph" viewBox="0 0 720 ${height}" role="img" aria-labelledby="planGraphTitle planGraphDesc"><title id="planGraphTitle">Jerarquía del plan importado</title><desc id="planGraphDesc">Representación estructural, no una traza temporal de ejecución.</desc><g class="plan-svg-links">${links}</g>${cards}</svg>`;
  }

  globalThis.OracleExecutionPlanRenderer = Object.freeze({ escapeHtml, renderTable, renderTree, renderGraph, withChildren, visibleNodes, valueForColumn });
})();
