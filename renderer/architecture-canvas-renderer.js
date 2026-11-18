(() => {
  "use strict";

  const escape = (value) => String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
  const zonePositions = Object.freeze({ EXTERNAL: [90, 100], APPLICATION: [310, 100], SECURITY: [530, 100], NETWORK: [530, 270], PRIVATE_DATA: [310, 270], EXTERNAL_AI: [750, 270], OPERATIONS: [750, 100] });
  const positionFor = (node, index) => {
    if (node.position && Number.isFinite(node.position.x) && Number.isFinite(node.position.y)) return node.position;
    const base = zonePositions[node.zone] || [80, 80];
    return { x: base[0] + (index % 2) * 18, y: base[1] + (Math.floor(index / 2) % 3) * 54 };
  };
  const nodeMap = (architecture) => new Map(architecture.nodes.map((node, index) => [node.id, { ...node, position: positionFor(node, index) }]));
  const render = (architecture, options = {}) => {
    const nodes = nodeMap(architecture);
    const selectedNodeId = options.selectedNodeId || "";
    const selectedEdgeId = options.selectedEdgeId || "";
    const activeEdgeIds = new Set(options.activeEdgeIds || []);
    const activeNodeIds = new Set(options.activeNodeIds || []);
    const zoneLabels = [["EXTERNAL", "Usuarios y canales"], ["APPLICATION", "Aplicación y orquestación"], ["SECURITY", "Identidad y controles"], ["NETWORK", "Red"], ["PRIVATE_DATA", "Datos privados"], ["EXTERNAL_AI", "Servicios AI externos"], ["OPERATIONS", "Operación"]];
    const zones = zoneLabels.map(([zone, label]) => {
      const [x, y] = zonePositions[zone];
      return `<g class="architecture-zone"><rect x="${x - 42}" y="${y - 48}" width="200" height="148" rx="14"></rect><text x="${x - 28}" y="${y - 24}">${escape(label)}</text></g>`;
    }).join("");
    const edges = architecture.edges.map((edge) => {
      const source = nodes.get(edge.source);
      const target = nodes.get(edge.target);
      if (!source || !target) return "";
      const selected = edge.id === selectedEdgeId;
      const active = activeEdgeIds.has(edge.id);
      return `<g class="architecture-edge${selected ? " is-selected" : ""}${active ? " is-active" : ""}" data-architecture-edge="${escape(edge.id)}" role="button" tabindex="0" aria-label="Conexión ${escape(edge.relationship)} de ${escape(source.label)} a ${escape(target.label)}"><line class="architecture-edge-hit" x1="${source.position.x + 118}" y1="${source.position.y + 18}" x2="${target.position.x + 2}" y2="${target.position.y + 18}"></line><line x1="${source.position.x + 118}" y1="${source.position.y + 18}" x2="${target.position.x + 2}" y2="${target.position.y + 18}" marker-end="url(#architectureArrow)"></line></g>`;
    }).join("");
    const nodeMarkup = [...nodes.values()].map((node) => {
      const selected = node.id === selectedNodeId;
      const active = activeNodeIds.has(node.id);
      return `<button class="architecture-node${selected ? " is-selected" : ""}${active ? " is-active" : ""}" data-architecture-node="${escape(node.id)}" type="button" style="--node-x:${node.position.x}px;--node-y:${node.position.y}px" aria-pressed="${selected}" aria-label="Componente ${escape(node.label)}"><span>${escape(node.label)}</span><small>${escape(node.componentId)}</small></button>`;
    }).join("");
    return `<div class="architecture-canvas" role="group" aria-label="Diagrama SVG interactivo de ${escape(architecture.name)}"><svg class="architecture-svg" viewBox="0 0 980 470" role="group" aria-labelledby="architectureSvgTitle architectureSvgDescription"><title id="architectureSvgTitle">${escape(architecture.name)}</title><desc id="architectureSvgDescription">Diagrama conceptual con zonas, componentes y conexiones seleccionables. No representa una topología de OCI desplegada.</desc><defs><marker id="architectureArrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"></path></marker></defs>${zones}${edges}</svg><div class="architecture-nodes">${nodeMarkup}</div></div>`;
  };
  globalThis.OracleArchitectureCanvasRenderer = Object.freeze({ render, escape, positionFor });
})();
