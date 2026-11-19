(() => {
  "use strict";
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  const renderFinding = (item, index) => `<li class="challenge-finding" data-status="${escape(item.status)}" data-severity="${escape(item.severity)}"><button type="button" data-challenge-finding="${index}"><strong>${escape(item.criterion)}</strong><span>${escape(item.status === "met" ? "Cumplido" : "Pendiente")}</span></button><p>${escape(item.evidence)} ${escape(item.explanation)}</p><p><strong>Recomendación:</strong> ${escape(item.recommendation)}</p></li>`;
  const render = (result) => `<div class="challenge-score" aria-label="Puntuación educativa ${result.score.total} de 100"><strong>${result.score.total}/100</strong><span>Puntuación educativa</span></div><p class="challenge-facts">${result.facts.components} componentes · ${result.facts.connections} conexiones · ${result.status === "complete" ? "criterios completos" : `${result.missing.length} criterio(s) pendiente(s)`}</p><ul class="challenge-findings">${result.findings.map(renderFinding).join("")}</ul><p class="illustrative-note">${result.limitations.join(" ")}</p>`;
  globalThis.OracleChallengeFeedbackRenderer = Object.freeze({ escape, render });
})();
