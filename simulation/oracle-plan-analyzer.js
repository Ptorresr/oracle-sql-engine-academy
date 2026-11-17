(() => {
  "use strict";

  const valueOf = (metric) => metric && Number.isFinite(metric.value) ? metric.value : null;
  const present = (metric) => metric !== null && metric !== undefined;

  function cardinality(node) {
    const estimated = valueOf(node.metrics.eRows);
    const observed = valueOf(node.metrics.aRows);
    const starts = valueOf(node.metrics.starts);
    const result = { nodeId: node.id, estimated, observed, starts, normalizedObserved: null, difference: null, factor: null, confidence: "insuficiente", interpretation: "No hay suficientes estadísticas para comparar cardinalidad." };
    if (estimated === null || observed === null) return Object.freeze(result);
    if (starts !== null && starts > 1) {
      result.normalizedObserved = observed / starts;
      result.interpretation = "A-Rows puede reflejar filas observadas en el alcance mostrado. Se presenta A-Rows/Starts como cálculo derivado para orientar la comparación, no como equivalencia universal.";
    } else if (starts === 0) {
      result.interpretation = "Starts es cero; no se normalizan filas observadas ni se calcula un factor.";
      return Object.freeze(result);
    } else {
      result.interpretation = "La comparación usa los valores mostrados. El significado exacto depende del alcance de las estadísticas de ejecución.";
    }
    const comparison = result.normalizedObserved ?? observed;
    result.difference = comparison - estimated;
    if (estimated > 0) result.factor = comparison / estimated;
    result.confidence = starts === null ? "media" : "media con Starts informado";
    if (estimated === 0) result.interpretation += " E-Rows es cero; no se calcula un factor para evitar una división engañosa.";
    return Object.freeze(result);
  }

  function finding(severity, title, evidence, explanation, hypothesis, recommendedChecks, limitations, relatedNodeIds) {
    return Object.freeze({ severity, title, evidence, explanation, hypothesis, recommendedChecks: Object.freeze(recommendedChecks), limitations: Object.freeze(limitations), relatedNodeIds: Object.freeze(relatedNodeIds) });
  }

  function analyze(plan) {
    const cardinalities = plan.nodes.map(cardinality);
    const findings = [];
    plan.nodes.forEach((node, index) => {
      const stats = cardinalities[index];
      const operation = node.operation.toUpperCase();
      const buffers = valueOf(node.metrics.buffers);
      const reads = valueOf(node.metrics.reads);
      const starts = valueOf(node.metrics.starts);
      const temp = node.metrics.tempSpc;
      if (stats.factor !== null && (stats.factor >= 4 || stats.factor <= .25)) findings.push(finding("info", "Diferencia relevante de cardinalidad", `Operador ${node.id}: E-Rows ${node.metrics.eRows.raw} y ${stats.normalizedObserved !== null ? "A-Rows/Starts" : "A-Rows"} ${stats.normalizedObserved !== null ? stats.normalizedObserved.toFixed(2) : node.metrics.aRows.raw}.`, "La estimación y la observación difieren de forma relevante en esta representación.", "La distribución de datos, predicados, estadísticas o el alcance mostrado podrían requerir revisión.", ["Revisar estadísticas y histogramas aplicables.", "Contrastar predicados, binds y plan de ejecución completo."], ["No se atribuye causalidad desde esta diferencia aislada.", "A-Rows/Starts es un cálculo derivado cuando Starts es mayor que uno."], [node.id]));
      if (starts !== null && starts > 10) findings.push(finding("info", "Starts elevado informado", `Operador ${node.id}: Starts ${node.metrics.starts.raw}.`, "El operador se inició varias veces según el texto importado.", "La repetición puede ser coherente con el plan, por ejemplo dentro de NESTED LOOPS.", ["Relacionar Starts con las filas de entrada y el operador padre.", "Revisar acceso interno y selectividad."], ["Un Starts elevado no demuestra un problema por sí solo."], [node.id]));
      if (reads !== null && reads > 0) findings.push(finding("info", "Lecturas físicas informadas", `Operador ${node.id}: Reads ${node.metrics.reads.raw}.`, "El plan incluye una métrica de lecturas para este operador.", "Conviene revisar su alcance y correlación con buffers, filas y almacenamiento.", ["Confirmar unidad y alcance de la salida DBMS_XPLAN.", "Comparar con estadísticas de ejecución disponibles."], ["No se extrapolan tiempos ni I/O no presentes."], [node.id]));
      if (buffers !== null && buffers > 1000) findings.push(finding("info", "Buffers informados para investigar", `Operador ${node.id}: Buffers ${node.metrics.buffers.raw}.`, "El valor puede merecer contexto frente a las filas procesadas.", "Volumen, repetición de accesos o la forma de ejecución pueden contribuir.", ["Comparar buffers con A-Rows, Starts y predicados.", "Validar mediante herramientas de diagnóstico autorizadas."], ["No existe un umbral universal de buffers."], [node.id]));
      if (/^SORT\b/.test(operation)) findings.push(finding("info", "Operador de ordenación", `Operador ${node.id}: ${node.operation}.`, "La ordenación responde a una necesidad del plan, por ejemplo ORDER BY o agrupación.", "Con volumen o memoria limitados podría requerir una workarea significativa.", ["Revisar filas, memoria y TempSpc si está disponible."], ["El nombre SORT no prueba uso de TEMP."], [node.id]));
      if (/^HASH\b/.test(operation)) findings.push(finding("info", "Operador hash", `Operador ${node.id}: ${node.operation}.`, "El plan contiene una operación hash.", "El uso de workarea y el comportamiento observado dependen de la ejecución.", ["Revisar cardinalidad, memoria y estadísticas disponibles."], ["HASH no implica por sí mismo uso de TEMP ni superioridad sobre otros métodos."], [node.id]));
      if (temp && temp.raw) findings.push(finding("info", "TEMP informado explícitamente", `Operador ${node.id}: TempSpc ${temp.raw}.`, "El texto importado incluye una columna TempSpc para este operador.", "Puede indicar espacio temporal reportado en el alcance del plan.", ["Confirmar versión, formato y alcance de la estadística.", "Revisar workarea y operadores relacionados."], ["No se infiere una causa única solo desde TempSpc."], [node.id]));
      if (node.predicate) findings.push(finding("info", "Predicado asociado", `Operador ${node.id}: ${node.predicate}.`, "El importador vinculó un predicado usando el identificador reportado por el plan.", "Puede ayudar a relacionar el operador con el SQL sin afirmar una correspondencia física absoluta.", ["Revisar la cláusula SQL y el predicado mostrado."], ["El plan puede no contener todos los detalles de transformación del optimizador."], [node.id]));
    });
    return Object.freeze({ cardinalities: Object.freeze(cardinalities), findings: Object.freeze(findings) });
  }

  globalThis.OraclePlanAnalyzer = Object.freeze({ analyze, cardinality, valueOf, present });
})();
