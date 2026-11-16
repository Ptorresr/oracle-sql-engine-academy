(() => {
  "use strict";

  const ALGORITHMS = Object.freeze({
    hash: { label: "HASH JOIN", description: "Construye una estructura hash sobre una entrada y consulta la otra por clave." },
    nested: { label: "NESTED LOOPS", description: "Toma una fila externa y busca coincidencias en la entrada interna." },
    merge: { label: "SORT MERGE JOIN", description: "Ordena conceptualmente ambas entradas y avanza sus claves en coordinación." }
  });
  const EVENT_TYPES = Object.freeze(["READ_BLOCK", "TABLE_ACCESS", "HASH_BUILD", "HASH_PROBE", "NESTED_OUTER_ROW", "INDEX_LOOKUP", "SORT_INPUT", "MERGE_ADVANCE", "EMIT_ROW"]);
  const emptyMetrics = () => ({ logicalReads: 0, physicalReads: 0, rowsRead: 0, outputRows: 0, comparisons: 0, workareaRows: 0 });
  const keyOf = (row, side) => row[side.key];
  const canonical = (results) => results.map((result) => `${result.leftId}:${result.rightId}`).sort();

  function createTimeline(scenario, algorithm) {
    if (!ALGORITHMS[algorithm]) throw new Error(`Unsupported algorithm: ${algorithm}`);
    let step = 0;
    const events = [];
    const metrics = emptyMetrics();
    const push = (type, source, target, rowIds, blockIds, label, explanation, detail = {}) => events.push(Object.freeze({
      step: ++step, type, source, target, rowIds: Object.freeze([...rowIds]), blockIds: Object.freeze([...blockIds]), label, explanation,
      illustrativeMetrics: Object.freeze({ ...metrics }), ...detail
    }));
    const access = (side) => {
      const blocks = [...new Set(side.rows.map((row) => row.block))];
      blocks.forEach((block) => {
        const rows = side.rows.filter((row) => row.block === block);
        metrics.logicalReads += 1;
        push("READ_BLOCK", "SQL Execution Engine", `Datafile · ${block}`, [], [block], `Solicitud lógica del bloque ${block}.`, "El bloque es una unidad conceptual de lectura; esta simulación no mide I/O físico real.");
        metrics.rowsRead += rows.length;
        push("TABLE_ACCESS", `TABLE ACCESS · ${side.name}`, "SQL Execution Engine", rows.map((row) => row.id), [block], `${side.name} entrega ${rows.length} fila(s).`, "Las filas fluyen lógicamente hacia el operador de unión, no como una traza física literal.");
      });
    };
    const emit = (left, right, source) => {
      metrics.outputRows += 1;
      push("EMIT_ROW", source, "Resultado lógico", [left.id, right.id], [left.block, right.block], `Resultado: ${left.id} se combina con ${right.id}.`, "Cada emisión representa una fila lógica del INNER JOIN del escenario.", { result: { leftId: left.id, rightId: right.id } });
    };
    const matchesFor = (left) => scenario.right.rows.filter((right) => keyOf(left, scenario.left) !== null && keyOf(left, scenario.left) !== undefined && keyOf(left, scenario.left) === keyOf(right, scenario.right));

    if (algorithm === "hash") {
      access(scenario.left);
      const buckets = new Map();
      scenario.left.rows.forEach((left) => {
        const key = keyOf(left, scenario.left);
        if (key === null || key === undefined) return;
        const bucket = buckets.get(key) || [];
        bucket.push(left);
        buckets.set(key, bucket);
        metrics.workareaRows += 1;
        push("HASH_BUILD", `TABLE ACCESS · ${scenario.left.name}`, "PGA Hash Workarea", [left.id], [left.block], `Build: clave ${key} entra al bucket hash.`, "La entrada Build y los buckets son una representación conceptual del método HASH JOIN.");
      });
      access(scenario.right);
      scenario.right.rows.forEach((right) => {
        const key = keyOf(right, scenario.right);
        const matches = key === null || key === undefined ? [] : (buckets.get(key) || []);
        metrics.comparisons += 1;
        push("HASH_PROBE", `TABLE ACCESS · ${scenario.right.name}`, "PGA Hash Workarea", [right.id, ...matches.map((left) => left.id)], [right.block], `Probe: clave ${key ?? "NULL"} encuentra ${matches.length} coincidencia(s).`, "HASH PROBE consulta el bucket por la clave de unión; no describe instrucciones internas literales.");
        matches.forEach((left) => emit(left, right, "HASH JOIN"));
      });
    }

    if (algorithm === "nested") {
      access(scenario.left);
      scenario.left.rows.forEach((left) => {
        const key = keyOf(left, scenario.left);
        push("NESTED_OUTER_ROW", `TABLE ACCESS · ${scenario.left.name}`, "NESTED LOOPS", [left.id], [left.block], `Fila externa ${left.id} inicia una búsqueda.`, "NESTED LOOPS repite la búsqueda interna para cada fila externa del modelo.");
        const matches = matchesFor(left);
        metrics.comparisons += scenario.right.rows.length;
        push("INDEX_LOOKUP", "NESTED LOOPS", scenario.right.indexed ? `Índice conceptual · ${scenario.right.name}` : `TABLE ACCESS · ${scenario.right.name}`, [left.id, ...matches.map((right) => right.id)], [left.block], `Búsqueda de clave ${key ?? "NULL"}: ${matches.length} coincidencia(s).`, scenario.right.indexed ? "El índice es una hipótesis del escenario; no garantiza que Oracle lo elija." : "Sin acceso selectivo supuesto, la búsqueda representa comparación conceptual de filas.");
        matches.forEach((right) => emit(left, right, "NESTED LOOPS"));
      });
    }

    if (algorithm === "merge") {
      access(scenario.left);
      access(scenario.right);
      const leftRows = [...scenario.left.rows].filter((row) => keyOf(row, scenario.left) !== null).sort((a, b) => keyOf(a, scenario.left) - keyOf(b, scenario.left));
      const rightRows = [...scenario.right.rows].filter((row) => keyOf(row, scenario.right) !== null).sort((a, b) => keyOf(a, scenario.right) - keyOf(b, scenario.right));
      metrics.workareaRows = leftRows.length + rightRows.length;
      push("SORT_INPUT", scenario.left.name, "Sort Workarea", leftRows.map((row) => row.id), [...new Set(leftRows.map((row) => row.block))], `${scenario.left.name} se ordena conceptualmente por ${scenario.left.key}.`, "SORT MERGE JOIN puede aprovechar entradas ya ordenadas o requerir ordenación; este modelo usa la segunda explicación conceptual.");
      push("SORT_INPUT", scenario.right.name, "Sort Workarea", rightRows.map((row) => row.id), [...new Set(rightRows.map((row) => row.block))], `${scenario.right.name} se ordena conceptualmente por ${scenario.right.key}.`, "La memoria y TEMP reales de una ordenación dependen de la ejecución, no de este contador ilustrativo.");
      leftRows.forEach((left) => {
        const matches = rightRows.filter((right) => keyOf(left, scenario.left) === keyOf(right, scenario.right));
        metrics.comparisons += rightRows.length;
        push("MERGE_ADVANCE", "SORT MERGE JOIN", "Entradas ordenadas", [left.id, ...matches.map((right) => right.id)], [left.block], `Merge: clave ${keyOf(left, scenario.left)} alinea ${matches.length} coincidencia(s).`, "El avance coordinado se simplifica para mostrar claves y duplicados, no punteros internos del motor.");
        matches.forEach((right) => emit(left, right, "SORT MERGE JOIN"));
      });
    }

    const results = events.filter((event) => event.type === "EMIT_ROW").map((event) => event.result);
    return Object.freeze({ scenarioId: scenario.id, algorithm, events: Object.freeze(events), results: Object.freeze(results), canonicalResults: Object.freeze(canonical(results)) });
  }

  function stateAt(timeline, index) {
    const safeIndex = Math.max(0, Math.min(index, timeline.events.length - 1));
    const seen = timeline.events.slice(0, safeIndex + 1);
    const current = timeline.events[safeIndex] || null;
    return Object.freeze({ index: safeIndex, current, output: Object.freeze(seen.filter((event) => event.type === "EMIT_ROW").map((event) => event.result)), metrics: current ? current.illustrativeMetrics : emptyMetrics() });
  }

  function compareLogicalResults(...timelines) {
    return timelines.every((timeline) => JSON.stringify(timeline.canonicalResults) === JSON.stringify(timelines[0].canonicalResults));
  }

  globalThis.OracleJoinComparisonEngine = Object.freeze({ ALGORITHMS, EVENT_TYPES, createTimeline, stateAt, compareLogicalResults });
})();
