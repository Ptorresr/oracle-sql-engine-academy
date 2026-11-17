(() => {
  "use strict";

  function evaluate(input) {
    const scenario = Object.freeze({ cardinality: input.cardinality || "medium", selectivity: input.selectivity || "medium", index: input.index || "unknown", memory: input.memory || "medium", joinOrder: input.joinOrder || "source", algorithm: input.algorithm || "optimizer" });
    const observations = [];
    if (scenario.cardinality === "large") observations.push("Conjuntos mayores podrían amplificar trabajo de acceso, unión, ordenación o agregación.");
    else observations.push("Conjuntos menores podrían reducir trabajo, según distribución y filtros.");
    if (scenario.selectivity === "high" && scenario.index === "available") observations.push("Un filtro selectivo e índice disponible podrían hacer relevante explorar accesos selectivos y NESTED LOOPS.");
    else if (scenario.selectivity === "low") observations.push("Una selectividad baja podría hacer menos útil un acceso selectivo; el contexto real sigue siendo necesario.");
    if (scenario.memory === "limited") observations.push("Memoria limitada podría aumentar presión conceptual sobre workareas de HASH o SORT y el riesgo de TEMP.");
    if (scenario.algorithm !== "optimizer") observations.push(`Se muestra ${scenario.algorithm} como hipótesis educativa; Oracle no necesariamente elegirá ese método.`);
    if (scenario.joinOrder !== "source") observations.push("Cambiar el orden de JOIN puede cambiar cardinalidades intermedias, pero el optimizador puede transformar el SQL.");
    return Object.freeze({ scenario, observations: Object.freeze(observations), disclaimer: "Escenario hipotético local. No modifica estadísticas importadas, no calcula costos reales y no predice el plan de Oracle." });
  }

  globalThis.OracleSqlWhatIfEngine = Object.freeze({ evaluate });
})();
