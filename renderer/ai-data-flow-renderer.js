(() => {
  "use strict";
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const locationLabel = (location) => ({ DATABASE_SIMULATED: "Base de datos simulada", APPLICATION_SIMULATED: "Aplicación simulada", EXTERNAL_AI_SIMULATED: "Servicio externo simulado", EDUCATIONAL_ABSTRACTION: "Abstracción educativa" })[location] || "Ubicación no especificada";
  const renderFlow = (events, index = 0, label = "Flujo de datos educativo") => {
    const selected = events[Math.max(0, Math.min(index, events.length - 1))] || null;
    const nodes = events.map((event, eventIndex) => {
      const x = 22 + (eventIndex % 3) * 245;
      const y = 38 + Math.floor(eventIndex / 3) * 100;
      const active = selected && selected.step === event.step;
      return `<g class="ai-flow-node${active ? " is-selected" : ""}" data-ai-event="${eventIndex}" tabindex="0" role="button" aria-label="Paso ${event.step}: ${escape(event.label)}"><rect x="${x}" y="${y}" width="210" height="66" rx="10"/><text x="${x + 12}" y="${y + 24}">${event.step}. ${escape(event.type)}</text><text x="${x + 12}" y="${y + 46}">${escape(event.target).slice(0, 29)}</text></g>`;
    }).join("");
    const links = events.slice(1).map((event, eventIndex) => {
      const fromX = 22 + ((eventIndex) % 3) * 245 + 210;
      const fromY = 71 + Math.floor(eventIndex / 3) * 100;
      const toX = 22 + ((eventIndex + 1) % 3) * 245;
      const toY = 71 + Math.floor((eventIndex + 1) / 3) * 100;
      return `<path class="ai-flow-link" d="M${fromX} ${fromY} H${toX - 12}" marker-end="url(#aiFlowArrow)"/>`;
    }).join("");
    return `<svg class="ai-data-flow" viewBox="0 0 760 ${Math.max(150, Math.ceil(events.length / 3) * 105 + 30)}" role="img" aria-label="${escape(label)}"><defs><marker id="aiFlowArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs>${links}${nodes}</svg>`;
  };
  const renderInspector = (event) => event ? `<div class="ai-inspector-title"><span class="data-pill">${escape(event.type)}</span><strong>${escape(event.label)}</strong></div><dl class="ai-inspector-grid"><div><dt>¿Qué ocurre?</dt><dd>${escape(event.explanation.what)}</dd></div><div><dt>¿Dónde ocurre?</dt><dd>${escape(locationLabel(event.executionLocation))}</dd></div><div><dt>¿Cómo funciona?</dt><dd>${escape(event.explanation.where)}</dd></div><div><dt>¿Para qué sirve?</dt><dd>${escape(event.explanation.why)}</dd></div><div><dt>Datos involucrados</dt><dd>${event.rowIds.length ? escape(event.rowIds.join(", ")) : "Sin filas físicas: flujo conceptual."}</dd></div><div><dt>Perspectiva DBA y seguridad</dt><dd>${escape(event.explanation.dba)}</dd></div></dl><p class="muted">Métricas ilustrativas · ${escape(JSON.stringify(event.illustrativeMetrics))}</p>` : "Seleccione un evento para inspeccionarlo.";
  const renderPerspectives = (event, sql) => `<div class="ai-perspectives"><section><div class="kicker">Developer</div><pre>${escape(sql || "API / SQL educativo no aplicable.")}</pre></section><section><div class="kicker">Processing Flow</div><p>${escape(event ? `${event.source} → ${event.target}` : "Seleccione un evento.")}</p></section><section><div class="kicker">Database Internals</div><p>${escape(event ? `${locationLabel(event.executionLocation)}. ${event.explanation.dba}` : "No se representan internals no documentados.")}</p></section></div>`;
  globalThis.OracleAiDataFlowRenderer = Object.freeze({ escape, locationLabel, renderFlow, renderInspector, renderPerspectives });
})();
