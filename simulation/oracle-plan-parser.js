(() => {
  "use strict";

  const MAX_INPUT_LENGTH = 200000;
  const aliases = Object.freeze({
    "id": "id", "operation": "operation", "name": "object", "object name": "object", "starts": "starts", "e-rows": "eRows", "e rows": "eRows", "a-rows": "aRows", "a rows": "aRows", "rows": "rows", "cost": "cost", "bytes": "bytes", "a-time": "aTime", "a time": "aTime", "buffers": "buffers", "reads": "reads", "writes": "writes", "omem": "oMem", "1mem": "oneMem", "used-mem": "usedMem", "used mem": "usedMem", "tempspc": "tempSpc", "temp spc": "tempSpc" });
  const emptyMetrics = () => ({ starts: null, eRows: null, aRows: null, rows: null, cost: null, bytes: null, aTime: null, buffers: null, reads: null, writes: null, oMem: null, oneMem: null, usedMem: null, tempSpc: null, extra: {} });

  function metricValue(raw) {
    const text = String(raw || "").trim();
    if (!text) return null;
    const match = text.replace(/,/g, "").match(/^(-?[\d.]+)\s*([KMGTP])?$/i);
    if (!match) return Object.freeze({ raw: text, value: null });
    const multiplier = { K: 1000, M: 1000000, G: 1000000000, T: 1000000000000, P: 1000000000000000 }[String(match[2] || "").toUpperCase()] || 1;
    return Object.freeze({ raw: text, value: Number(match[1]) * multiplier });
  }

  function normalizeHeader(cell) {
    return String(cell || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function splitTable(line) {
    const trimmed = String(line || "").trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
    return trimmed.slice(1, -1).split("|").map((cell) => cell.replace(/\r/g, ""));
  }

  function findPlanTable(lines) {
    for (let index = 0; index < lines.length; index += 1) {
      const cells = splitTable(lines[index]);
      if (!cells) continue;
      const normalized = cells.map(normalizeHeader);
      if (normalized.includes("operation") && normalized.some((value) => value === "id" || value === "id ")) return { headerIndex: index, headers: cells };
    }
    return null;
  }

  function indentation(operationCell) {
    const leading = (String(operationCell || "").match(/^\s*/) || [""])[0].length;
    return leading;
  }

  function parseNode(cells, headers, line, stack, warnings) {
    const values = {};
    headers.forEach((header, index) => { values[aliases[normalizeHeader(header)] || `extra:${normalizeHeader(header)}`] = cells[index] || ""; });
    const idCell = String(values.id || "").trim();
    const idMatch = idCell.match(/\*?\s*(\d+)/);
    if (!idMatch) return null;
    const rawOperation = String(values.operation || "");
    const depth = indentation(rawOperation);
    const operation = rawOperation.trim().replace(/\s+/g, " ");
    if (!operation) return null;
    const metrics = emptyMetrics();
    Object.keys(values).forEach((key) => {
      if (key in metrics && key !== "extra") metrics[key] = metricValue(values[key]);
      if (key.startsWith("extra:") && String(values[key]).trim()) metrics.extra[key.slice(6)] = String(values[key]).trim();
    });
    while (stack.length && stack.at(-1).depth >= depth) stack.pop();
    const parentId = stack.at(-1)?.id ?? null;
    const node = { id: idMatch[1], parentId, depth, operation, rawOperation: rawOperation.trimEnd(), object: String(values.object || "").trim() || null, metrics, predicate: null, predicateMarker: idCell.includes("*"), line, warnings: [] };
    stack.push(node);
    return node;
  }

  function parsePredicates(lines, nodes, warnings) {
    const start = lines.findIndex((line) => /^\s*Predicate Information/i.test(line));
    if (start < 0) return;
    const lookup = new Map(nodes.map((node) => [node.id, node]));
    for (let index = start + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^\s*(Note|Query Block Name|Column Projection Information|Outline Data)/i.test(line)) break;
      const match = line.match(/^\s*(\d+)\s*-\s*((?:access|filter)\(.+)$/i);
      if (!match) continue;
      const node = lookup.get(match[1]);
      if (!node) {
        warnings.push(`Se encontró un predicado para el operador ${match[1]}, que no se pudo asociar.`);
      } else if (node.predicate) {
        node.predicate += `\n${match[2].trim()}`;
      } else {
        node.predicate = match[2].trim();
      }
    }
  }

  function parseNotes(lines) {
    const start = lines.findIndex((line) => /^\s*Note\s*$/i.test(line));
    if (start < 0) return [];
    const notes = [];
    for (let index = start + 1; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line || /^-+$/.test(line)) continue;
      if (/^(Predicate Information|Query Block Name|Column Projection Information)/i.test(line)) break;
      notes.push(line.replace(/^-\s*/, ""));
    }
    return notes;
  }

  function parse(input) {
    const rawText = typeof input === "string" ? input.replace(/\r\n?/g, "\n") : "";
    const warnings = [];
    if (!rawText.trim()) return Object.freeze({ source: "empty", rawText: "", format: "unknown", nodes: Object.freeze([]), metadata: Object.freeze({ planHash: null, notes: [], columns: [] }), warnings: Object.freeze(["Pegue un plan de texto antes de importarlo."]) });
    if (rawText.length > MAX_INPUT_LENGTH) return Object.freeze({ source: "input", rawText: "", format: "unknown", nodes: Object.freeze([]), metadata: Object.freeze({ planHash: null, notes: [], columns: [] }), warnings: Object.freeze([`El plan supera el límite local de ${MAX_INPUT_LENGTH} caracteres.`]) });
    const lines = rawText.split("\n");
    const table = findPlanTable(lines);
    const hash = rawText.match(/Plan hash value:\s*([^\n]+)/i)?.[1]?.trim() || null;
    const format = /DISPLAY_CURSOR/i.test(rawText) || table?.headers.some((header) => /a-rows|starts|buffers/i.test(header)) ? "DISPLAY_CURSOR" : table ? "DISPLAY" : "unknown";
    if (!table) warnings.push("No se reconoció una tabla de plan con columnas Id y Operation.");
    const stack = [];
    const nodes = [];
    if (table) {
      for (let index = table.headerIndex + 1; index < lines.length; index += 1) {
        const cells = splitTable(lines[index]);
        if (!cells) continue;
        const node = parseNode(cells, table.headers, index + 1, stack, warnings);
        if (node) nodes.push(node);
      }
      if (!nodes.length) warnings.push("La tabla fue reconocida, pero no contiene operadores interpretables.");
    }
    parsePredicates(lines, nodes, warnings);
    if (nodes.some((node) => node.depth === 0) && nodes.filter((node) => node.depth === 0).length > 1) warnings.push("Se detectaron varios nodos raíz; la estructura puede estar incompleta.");
    return Object.freeze({ source: "imported", rawText, format, nodes: Object.freeze(nodes.map((node) => Object.freeze({ ...node, metrics: Object.freeze({ ...node.metrics, extra: Object.freeze({ ...node.metrics.extra }) }) }))), metadata: Object.freeze({ planHash: hash, notes: Object.freeze(parseNotes(lines)), columns: Object.freeze((table?.headers || []).map((header) => String(header).trim()).filter(Boolean)) }), warnings: Object.freeze([...new Set(warnings)]) });
  }

  globalThis.OraclePlanParser = Object.freeze({ MAX_INPUT_LENGTH, parse, metricValue });
})();
