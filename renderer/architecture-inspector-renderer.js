(() => {
  "use strict";
  const escape = globalThis.OracleArchitectureCanvasRenderer?.escape || ((value) => String(value ?? ""));
  const component = (node, definition, relatedLab) => {
    if (!node || !definition) return `<p class="muted">Selecciona un componente o una conexión del diagrama para ver su responsabilidad, entradas, salidas y límites educativos.</p>`;
    const list = (values) => values.length ? `<ul>${values.map((value) => `<li>${escape(value)}</li>`).join("")}</ul>` : "<p>No se representan datos adicionales.</p>";
    return `<section class="architecture-inspector-copy"><p class="eyebrow">Component Inspector</p><h4>${escape(node.label)}</h4><p>${escape(definition.responsibility)}</p><dl><div><dt>Zona</dt><dd>${escape(node.zone)}</dd></div><div><dt>Seguridad</dt><dd>${escape(definition.security)}</dd></div><div><dt>Requisito</dt><dd>${escape(definition.deployable ? "Recurso/servicio a evaluar en el despliegue" : "Capacidad conceptual, no un servicio independiente")}</dd></div></dl><h5>Capacidades y relaciones</h5>${list(definition.capabilities.concat(definition.related))}<p class="illustrative-note">${escape(definition.limitations)}</p>${relatedLab ? `<a class="inspector-link" href="${escape(relatedLab)}">Abrir laboratorio relacionado →</a>` : ""}</section>`;
  };
  const security = (findings) => findings.length ? `<ul class="architecture-findings">${findings.map((finding) => `<li data-severity="${escape(finding.severity)}"><strong>${escape(finding.id)} · ${escape(finding.category)}</strong><span>${escape(finding.evidence)}</span><small>${escape(finding.recommendation)}</small></li>`).join("")}</ul>` : '<p class="security-ok">No hay hallazgos de las reglas educativas representadas. Esto no certifica la seguridad de una arquitectura real.</p>';
  globalThis.OracleArchitectureInspectorRenderer = Object.freeze({ component, security });
})();
