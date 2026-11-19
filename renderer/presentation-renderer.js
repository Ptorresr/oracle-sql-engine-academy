(() => {
  "use strict";

  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const explanation = (event) => {
    if (!event) return { what: "Selecciona un paso para ver su explicación.", why: "El recorrido es conceptual y determinista." };
    if (typeof event.explanation === "string") return { what: event.explanation, why: "Revisa el contexto del laboratorio." };
    return { what: event.explanation?.what || event.label || "El motor procesa el evento seleccionado.", why: event.explanation?.why || "Conecta el paso con el objetivo educativo del escenario." };
  };
  const renderStep = (event, state) => {
    const detail = explanation(event);
    const rows = event?.rowIds?.length ? event.rowIds.join(", ") : "No aplica";
    const blocks = event?.blockIds?.length ? event.blockIds.join(", ") : "No aplica";
    return `<div class="presentation-step-meta"><span>PASO ${escape(event?.step ?? 0)}</span><strong>${escape(event?.type?.replaceAll("_", " ") || "Sin evento")}</strong><small>${escape(event?.source || "Origen conceptual")} → ${escape(event?.target || "Destino conceptual")}</small></div><p class="presentation-what"><strong>Qué ocurre:</strong> ${escape(detail.what)}</p><p><strong>Para qué sirve:</strong> ${escape(detail.why)}</p><dl class="presentation-data"><div><dt>Componente</dt><dd>${escape(state?.component || event?.target || "No informado")}</dd></div><div><dt>Filas</dt><dd>${escape(rows)}</dd></div><div><dt>Bloques</dt><dd>${escape(blocks)}</dd></div><div><dt>Perspectiva DBA</dt><dd>${escape(event?.explanation?.dba || "Las métricas son ilustrativas; confirmar con evidencia real.")}</dd></div></dl>`;
  };
  globalThis.OraclePresentationRenderer = Object.freeze({ escape, explanation, renderStep });
})();
