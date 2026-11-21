(() => {
  "use strict";

  const EVENT_CONTRACT = Object.freeze(["step", "type", "source", "target", "rowIds", "blockIds", "label", "illustrativeMetrics"]);
  const anchors = Object.freeze({
    hash: Object.freeze({
      datafile: [12, 54], buffer: [31, 54], engine: [51, 54], workarea: [73, 54], temp: [72, 84], result: [90, 54],
      components: Object.freeze(["Datafiles / blocks", "Database Buffer Cache", "SQL Execution Engine", "PGA Hash Workarea", "TEMP"])
    }),
    "buffer-cache": Object.freeze({
      datafile: [16, 56], buffer: [50, 46], engine: [82, 55],
      components: Object.freeze(["Datafiles / blocks", "Database Buffer Cache", "SQL Execution Engine"])
    }),
    "workarea-temp": Object.freeze({
      sql: [14, 55], workarea: [47, 43], temp: [50, 78], results: [84, 55],
      components: Object.freeze(["SQL Operation", "PGA / Work Area", "TEMP", "Results"])
    }),
    "optimizer-cardinality": Object.freeze({
      statistics: [14, 55], estimator: [38, 45], alternative: [63, 55], results: [86, 55],
      components: Object.freeze(["Statistics & Predicate Inputs", "Cardinality Estimator", "Access / JOIN Alternative", "Logical Result Set"])
    }),
    "performance-what-if": Object.freeze({
      inputs: [12, 48], cache: [39, 42], workarea: [62, 42], temp: [62, 77], results: [88, 48],
      components: Object.freeze(["Entradas declaradas", "Buffer Cache", "PGA / Work Area", "TEMP condicional", "Resultado lógico"])
    }),
    comparison: Object.freeze({
      left: [16, 42], right: [16, 68], join: [51, 52], workarea: [68, 76], result: [88, 52],
      components: Object.freeze(["Entrada izquierda", "Entrada derecha", "Operador seleccionado", "Workarea", "Resultado lógico"])
    }),
    intelligence: Object.freeze({
      sql: [14, 62], plan: [36, 42], operator: [55, 42], statistics: [73, 42], analysis: [72, 70], inspector: [89, 52],
      components: Object.freeze(["SQL", "Plan de ejecución", "Operadores", "Estadísticas", "Análisis", "Event Inspector"])
    }),
    "ai-internals": Object.freeze({
      query: [14, 58], application: [33, 58], database: [55, 40], vector: [72, 38], context: [70, 66], result: [89, 56],
      components: Object.freeze(["Consulta", "Aplicación", "Oracle AI Database", "Vector Search", "Contexto", "Resultado"])
    }),
    architecture: Object.freeze({
      user: [12, 54], app: [28, 41], api: [40, 54], security: [40, 76], database: [58, 40], capability: [73, 34],
      workflow: [50, 59], external: [73, 70], operations: [86, 40], audit: [85, 76],
      components: Object.freeze(["Origen", "Aplicación", "Seguridad", "Base de datos", "Capacidad", "Procesamiento", "Servicios externos", "Operaciones"])
    })
  });

  const aliases = Object.freeze({
    hash: Object.freeze({
      datafile: ["datafile", "storage", "datafiles", "block"], buffer: ["buffer cache", "sga"], engine: ["sql execution engine", "table access", "hash join"],
      workarea: ["pga", "workarea", "hash probe", "hash build"], temp: ["temp"], result: ["resultado"]
    }),
    "buffer-cache": Object.freeze({
      datafile: ["datafile", "datafiles", "block", "bloque"], buffer: ["buffer cache", "sga", "cache"], engine: ["sql execution engine", "table access", "sql engine"]
    }),
    "workarea-temp": Object.freeze({
      sql: ["sql operation", "hash join", "sort"], workarea: ["pga", "work area", "workarea", "workarea allocate", "workarea process", "workarea complete"],
      temp: ["temp", "temp write", "temp read"], results: ["results", "result", "workarea complete"]
    }),
    "optimizer-cardinality": Object.freeze({
      statistics: ["statistics", "statistic", "predicate", "selectivity", "selectividad"], estimator: ["cardinality", "estimator", "estimate", "estimación"],
      alternative: ["access", "join", "alternative", "index", "scan", "acceso"], results: ["logical result", "results", "result", "resultado", "emit"]
    }),
    "performance-what-if": Object.freeze({
      inputs: ["statistics", "predicate", "selectivity", "cardinality", "estimator", "access", "alternative", "sql execution engine"],
      cache: ["buffer cache", "cache", "datafile", "block", "table access"],
      workarea: ["pga", "work area", "workarea", "sort", "hash join"],
      temp: ["temp"], results: ["results", "result", "resultado", "emit", "logical result"]
    }),
    comparison: Object.freeze({
      left: ["left", "entrada izquierda", "comparación a", "customers", "clientes", "source"], right: ["right", "entrada derecha", "comparación b", "orders", "pedidos", "target"], join: ["hash", "nested", "merge", "join", "loops", "sql execution engine", "operador seleccionado"],
      workarea: ["workarea", "sort"], result: ["resultado", "resultado lógico"]
    }),
    intelligence: Object.freeze({
      sql: ["sql", "query"], plan: ["plan", "execution plan"], operator: ["operator", "table access", "join", "scan", "sort"],
      statistics: ["statistics", "e-rows", "a-rows", "starts", "buffers", "reads", "a-time"], analysis: ["analysis", "insight", "what if"], inspector: ["inspector", "tutor"]
    }),
    "ai-internals": Object.freeze({
      query: ["query", "pregunta", "usuario", "prompt"], application: ["application", "aplicación", "policy", "política"], database: ["database", "base de datos", "sql", "storage"],
      vector: ["vector", "embedding", "distance", "ranking", "index"], context: ["context", "contexto", "chunk", "retriev"], result: ["result", "resultado", "response", "respuesta"]
    }),
    architecture: Object.freeze({
      user: ["user", "cliente", "analista", "operador", "origen"], app: ["web", "app", "portal", "aplicación"], api: ["api"], security: ["auth", "iam", "vault", "security", "seguridad"],
      database: ["database", "db", "oracle", "autonomous"], capability: ["vector", "capability", "search"], workflow: ["agent", "rag", "tool", "orchestrator", "procesamiento"],
      external: ["embed", "genai", "external", "llm", "model", "servicio externo"], operations: ["log", "audit", "monitor", "observability", "operaciones"]
    })
  });

  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const clamp = (value, min, max) => Math.max(min, Math.min(Number(value) || 0, max));
  const text = (value) => String(value ?? "").toLowerCase();

  function resolveAnchor(kind, value) {
    const config = anchors[kind];
    const map = aliases[kind];
    if (!config || !map) return null;
    const candidate = text(value);
    const match = Object.entries(map).find(([, terms]) => terms.some((term) => candidate.includes(term)));
    return match ? config[match[0]] : null;
  }

  function pathFor(start, end) {
    const bend = Math.max(8, Math.abs(end[0] - start[0]) * 0.38);
    const direction = end[0] >= start[0] ? 1 : -1;
    return `M ${start[0]} ${start[1]} C ${start[0] + bend * direction} ${start[1]}, ${end[0] - bend * direction} ${end[1]}, ${end[0]} ${end[1]}`;
  }

  function eventRoute(kind, event) {
    if (!event) return null;
    const start = resolveAnchor(kind, event.source);
    const end = resolveAnchor(kind, event.target);
    return start && end ? { start, end, path: pathFor(start, end) } : null;
  }

  function componentEventIndex(kind, events, component) {
    const componentText = text(component);
    const match = Object.entries(aliases[kind] || {}).find(([, terms]) => terms.some((term) => componentText.includes(term) || term.includes(componentText)));
    const terms = match ? match[1] : [componentText];
    return events.findIndex((event) => terms.some((term) => `${event.source} ${event.target} ${event.label}`.toLowerCase().includes(term)));
  }

  function createOverlay(figure, kind, label) {
    const image = figure.querySelector("img");
    if (!image) return null;
    let stage = figure.querySelector(".animated-flow-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "animated-flow-stage";
      image.parentNode.insertBefore(stage, image);
      stage.append(image);
    }
    let overlay = stage.querySelector(".animated-flow-overlay");
    if (!overlay) {
      overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      overlay.classList.add("animated-flow-overlay");
      overlay.setAttribute("viewBox", "0 0 100 100");
      overlay.setAttribute("preserveAspectRatio", "xMidYMid slice");
      overlay.setAttribute("role", "img");
      stage.append(overlay);
    }
    let componentNav = figure.querySelector(".animated-flow-components");
    if (!componentNav) {
      componentNav = document.createElement("div");
      componentNav.className = "animated-flow-components";
      componentNav.setAttribute("role", "group");
      const caption = figure.querySelector("figcaption");
      figure.insertBefore(componentNav, caption || null);
    }
    let status = figure.querySelector(".animated-flow-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "animated-flow-status";
      status.setAttribute("aria-live", "polite");
      const caption = figure.querySelector("figcaption");
      figure.insertBefore(status, caption || null);
    }
    return { stage, overlay, componentNav, status, label };
  }

  function draw(figure, kind, events, index, onSelect, label) {
    const surface = createOverlay(figure, kind, label);
    if (!surface) return;
    const config = anchors[kind] || anchors.hash;
    const safeEvents = Array.isArray(events) ? events : [];
    const safeIndex = safeEvents.length && Number(index) >= 0 ? clamp(index, 0, safeEvents.length - 1) : -1;
    const event = safeEvents[safeIndex] || null;
    const route = eventRoute(kind, event);
    const stepLabel = event ? `Paso ${event.step} · ${event.type.replaceAll("_", " ")}` : "Sin evento seleccionado";
    surface.overlay.setAttribute("aria-label", `${label}. ${stepLabel}. La ruta es conceptual y las métricas son ilustrativas.`);
    surface.overlay.innerHTML = `<title>${escape(label)}</title><desc>${escape(event?.label || "Seleccione un evento desde el timeline para activar el flujo.")}</desc>${route ? `<path class="animated-flow-route" d="${route.path}" pathLength="1"></path><circle class="animated-flow-anchor" cx="${route.start[0]}" cy="${route.start[1]}" r="2.5"></circle><circle class="animated-flow-anchor" cx="${route.end[0]}" cy="${route.end[1]}" r="2.5"></circle><circle class="animated-flow-particle" cx="${route.start[0]}" cy="${route.start[1]}" r="2.2"><animateMotion dur="1.2s" repeatCount="1" path="${route.path}"></animateMotion></circle>` : ""}${event ? `<g class="animated-flow-step-marker"><circle cx="10" cy="12" r="7"></circle><text x="10" y="14.5" text-anchor="middle">${escape(event.step)}</text></g>` : ""}`;
    surface.componentNav.innerHTML = config.components.map((component) => {
      const active = event && componentEventIndex(kind, [event], component) === 0;
      return `<button type="button" class="animated-flow-component${active ? " is-active" : ""}" data-animated-component="${escape(component)}" aria-pressed="${active}">${escape(component)}</button>`;
    }).join("");
    surface.componentNav.querySelectorAll("[data-animated-component]").forEach((button) => button.addEventListener("click", () => {
      const next = componentEventIndex(kind, safeEvents, button.dataset.animatedComponent);
      if (next >= 0 && typeof onSelect === "function") onSelect(next);
    }));
    const context = event ? `${event.source} → ${event.target}. ${event.label}${event.explanation?.what ? ` ${event.explanation.what}` : ""}${event.explanation?.why ? ` ${event.explanation.why}` : ""}${event.rowIds?.length ? ` Datos: ${event.rowIds.join(", ")}.` : ""}` : "Seleccione un evento desde el timeline para activar el flujo y su explicación.";
    surface.status.textContent = `${stepLabel}. ${context} Seleccione un componente conceptual como alternativa al movimiento.`;
    figure.dataset.animatedFlow = kind;
    figure.dataset.animatedFlowStep = event ? String(event.step) : "0";
  }

  function mount(figure, options = {}) {
    if (!figure || !options.kind) return null;
    const events = Array.isArray(options.events) ? options.events : options.timeline?.events || [];
    draw(figure, options.kind, events, options.index, options.onSelect, options.label || "Flujo de datos educativo");
    return Object.freeze({ update: (next = {}) => draw(figure, next.kind || options.kind, next.events || events, next.index ?? options.index, next.onSelect || options.onSelect, next.label || options.label || "Flujo de datos educativo") });
  }

  function planTimeline(plan) {
    const nodes = Array.isArray(plan?.nodes) && plan.nodes.length ? plan.nodes : [];
    const events = nodes.length ? nodes.map((node, index) => {
      const parent = nodes.find((candidate) => candidate.id === node.parentId);
      return Object.freeze({ step: index + 1, type: "PLAN_OPERATOR", source: parent?.operation || "SQL Editor", target: node.operation, rowIds: Object.freeze([]), blockIds: Object.freeze([]), label: `${node.operation}${node.object ? ` · ${node.object}` : ""}`, illustrativeMetrics: Object.freeze({ illustrative: true, imported: true }), explanation: Object.freeze({ what: `Operador identificado en el plan importado: ${node.operation}.`, where: "Plan importado", why: "Permite recorrer la estructura reconocida sin atribuir una ejecución física literal.", dba: "Las estadísticas solo existen si fueron importadas; no se derivan métricas nuevas." }) });
    }) : [
      Object.freeze({ step: 1, type: "SQL_CONTEXT", source: "SQL Editor", target: "Plan", rowIds: Object.freeze([]), blockIds: Object.freeze([]), label: "El SQL aporta el contexto educativo.", illustrativeMetrics: Object.freeze({ illustrative: true, imported: false }) }),
      Object.freeze({ step: 2, type: "PLAN_CONTEXT", source: "Plan", target: "Analysis", rowIds: Object.freeze([]), blockIds: Object.freeze([]), label: "Se presenta una secuencia ilustrativa sin plan importado.", illustrativeMetrics: Object.freeze({ illustrative: true, imported: false }) }),
      Object.freeze({ step: 3, type: "INSPECTOR_CONTEXT", source: "Analysis", target: "Event Inspector", rowIds: Object.freeze([]), blockIds: Object.freeze([]), label: "El inspector explica límites y evidencia disponible.", illustrativeMetrics: Object.freeze({ illustrative: true, imported: false }) })
    ];
    return Object.freeze({ events: Object.freeze(events) });
  }

  globalThis.OracleAnimatedDataFlow = Object.freeze({ EVENT_CONTRACT, anchors, eventRoute, mount, planTimeline });
})();
