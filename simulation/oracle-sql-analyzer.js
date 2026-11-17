(() => {
  "use strict";

  function maskLiteralsAndComments(sql) {
    return String(sql || "").replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/'(?:''|[^'])*'/g, "'literal'");
  }

  function analyze(sql) {
    const original = String(sql || "");
    const text = maskLiteralsAndComments(original);
    const upper = text.toUpperCase();
    const patterns = [];
    const add = (id, title, explanation, limitation) => patterns.push(Object.freeze({ id, title, explanation, limitation }));
    if (/\bSELECT\b/.test(upper)) add("select", "SELECT", "Se identificó una consulta que proyecta columnas o expresiones.", "El analizador local no valida sintaxis Oracle completa.");
    if (/\bFROM\b/.test(upper)) add("from", "FROM", "Se identificó una fuente de filas.", "No se resuelven objetos ni sinónimos.");
    if (/\b(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\b/.test(upper)) add("join", "JOIN", "Se identificó una unión ANSI; sus algoritmos físicos dependen del optimizador.", "No se predice HASH JOIN, NESTED LOOPS ni MERGE JOIN.");
    if (/\bON\b/.test(upper)) add("on", "ON", "Se identificó una condición de unión o relación.", "No se determina selectividad sin datos y estadísticas.");
    if (/\bWHERE\b/.test(upper)) add("where", "WHERE", "Se identificaron filtros potenciales.", "No se determina si un predicado usará índice.");
    if (/\bGROUP\s+BY\b/.test(upper)) add("group-by", "GROUP BY", "Se identificó una agregación por grupos.", "No se estima memoria, TEMP ni algoritmo de agregación.");
    if (/\bHAVING\b/.test(upper)) add("having", "HAVING", "Se identificó un filtro posterior a agrupación.", "La transformación exacta depende del optimizador.");
    if (/\bORDER\s+BY\b/.test(upper)) add("order-by", "ORDER BY", "Se identificó una necesidad de orden lógico.", "Puede o no requerir una ordenación física según el plan real.");
    if (/\(\s*SELECT\b/.test(upper)) add("subquery", "Subconsulta", "Se identificó una subconsulta.", "Las transformaciones de subconsulta no se modelan localmente.");
    if (/\b(?:UPPER|LOWER|TRUNC|TO_CHAR|NVL|COALESCE|SUBSTR)\s*\([^)]*(?:WHERE|ON)?/i.test(text) || /\b(?:UPPER|LOWER|TRUNC|TO_CHAR|NVL|COALESCE|SUBSTR)\s*\(/i.test(text)) add("function", "Función detectada", "Una función en una expresión puede cambiar las opciones de acceso según el diseño y Oracle Database.", "No se afirma que el índice sea inutilizable; podrían existir índices basados en función.");
    if (/\b(?:=|>|<|LIKE|IN)\s*'literal'/i.test(text)) add("predicate", "Predicado con literal", "Se identificó una condición con literal que podría afectar selectividad.", "No se dispone de distribución de datos ni binds reales.");
    const limitations = ["No ejecuta SQL Oracle.", "No se conecta a Oracle Database ni envía la consulta a servicios externos.", "No declara una consulta inválida cuando el patrón supera el soporte local."];
    if (!patterns.length || /\b(?:MODEL|MATCH_RECOGNIZE|PIVOT|JSON_TABLE|CONNECT\s+BY)\b/i.test(upper)) limitations.push("Este patrón SQL no está soportado completamente por el analizador local.");
    return Object.freeze({ original, patterns: Object.freeze(patterns), limitations: Object.freeze(limitations) });
  }

  globalThis.OracleSqlAnalyzer = Object.freeze({ analyze, maskLiteralsAndComments });
})();
