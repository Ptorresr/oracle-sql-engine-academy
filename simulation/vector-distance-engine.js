(() => {
  "use strict";

  const valid = (left, right) => Array.isArray(left) && Array.isArray(right) && left.length > 0 && left.length === right.length && left.every(Number.isFinite) && right.every(Number.isFinite);
  const dot = (left, right) => valid(left, right) ? left.reduce((sum, value, index) => sum + value * right[index], 0) : null;
  const euclidean = (left, right) => valid(left, right) ? Math.sqrt(left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0)) : null;
  const cosine = (left, right) => {
    const product = dot(left, right);
    if (product === null) return null;
    const leftMagnitude = Math.sqrt(dot(left, left));
    const rightMagnitude = Math.sqrt(dot(right, right));
    return leftMagnitude === 0 || rightMagnitude === 0 ? null : 1 - product / (leftMagnitude * rightMagnitude);
  };
  const calculate = (metric, left, right) => {
    const normalized = String(metric || "COSINE").toUpperCase();
    if (normalized === "DOT") {
      const value = dot(left, right);
      return value === null ? { value: null, reason: "Vectores incompatibles." } : { value: -value, similarity: value };
    }
    const functionByMetric = { COSINE: cosine, EUCLIDEAN: euclidean }[normalized];
    const value = functionByMetric ? functionByMetric(left, right) : null;
    return value === null ? { value: null, reason: normalized === "COSINE" ? "Dimensiones incompatibles o vector cero; la distancia coseno no se calcula." : "Métrica no soportada o vectores incompatibles." } : { value };
  };
  globalThis.OracleVectorDistanceEngine = Object.freeze({ valid, dot, euclidean, cosine, calculate });
})();
