(() => {
  "use strict";

  const EVENT_TYPES = Object.freeze(["READ_BLOCK", "CACHE_HIT", "CACHE_MISS", "TABLE_ACCESS", "HASH_BUILD", "HASH_PROBE", "EMIT_ROW", "SPILL_TEMP"]);
  const emptyMetrics = () => ({ logicalReads: 0, physicalReads: 0, rowsRead: 0, hashRows: 0, outputRows: 0, tempPartitions: 0 });

  function createTimeline(scenario) {
    let step = 0;
    const events = [];
    const metrics = emptyMetrics();
    const cache = new Set(scenario.cacheSeed);
    const hash = new Map();
    const buildRows = scenario.build.blocks.flatMap((block) => block.rows);
    const push = (type, source, target, rowIds, blockIds, label, explanation, detail = {}) => {
      events.push(Object.freeze({
        step: ++step,
        type,
        source,
        target,
        rowIds: Object.freeze([...rowIds]),
        blockIds: Object.freeze([...blockIds]),
        label,
        explanation,
        illustrativeMetrics: Object.freeze({ ...metrics }),
        ...detail
      }));
    };
    const accessBlock = (side, block) => {
      push("READ_BLOCK", "SQL Execution Engine", `Datafile · ${block.id}`, [], [block.id], `Solicitud lógica del bloque ${block.id}.`, "Una solicitud lógica no implica todavía una lectura física desde disco.");
      metrics.logicalReads += 1;
      if (cache.has(block.id)) {
        push("CACHE_HIT", "Database Buffer Cache", `TABLE ACCESS · ${side.name}`, [], [block.id], `${block.id} se encuentra en Buffer Cache.`, "El bloque se atiende conceptualmente desde memoria compartida; la métrica es ilustrativa.");
      } else {
        metrics.physicalReads += 1;
        cache.add(block.id);
        push("CACHE_MISS", `Datafile · ${block.id}`, "Database Buffer Cache", [], [block.id], `${block.id} no estaba en la caché y se incorpora conceptualmente.`, "Un cache miss puede requerir I/O físico, pero esta simulación no mide I/O real.");
      }
      metrics.rowsRead += block.rows.length;
      push("TABLE_ACCESS", `TABLE ACCESS FULL · ${side.name}`, "SQL Execution Engine", block.rows.map((row) => row.id), [block.id], `${side.name} entrega ${block.rows.length} fila(s) al operador HASH JOIN.`, "Las filas son flujo lógico del operador, no paquetes físicos moviéndose entre componentes.");
    };

    scenario.build.blocks.forEach((block) => {
      accessBlock(scenario.build, block);
      block.rows.forEach((row) => {
        const key = row[scenario.build.key];
        if (key !== null && key !== undefined) {
          const bucket = hash.get(key) || [];
          bucket.push(row);
          hash.set(key, bucket);
          metrics.hashRows += 1;
          push("HASH_BUILD", `TABLE ACCESS · ${scenario.build.name}`, "PGA Hash Workarea", [row.id], [block.id], `Build: clave ${key} se agrega a un bucket hash.`, "HASH BUILD construye una estructura de trabajo conceptual sobre la entrada elegida por el modelo.");
          if (metrics.hashRows > scenario.memoryCapacity) {
            metrics.tempPartitions += 1;
            push("SPILL_TEMP", "PGA Hash Workarea", "TEMP", [row.id], [block.id], `Workarea limitada: partición de ${row.id} se marca para TEMP.`, "El spill es una hipótesis didáctica del escenario, no una medición de PGA ni TEMP de Oracle.");
          }
        }
      });
    });

    scenario.probe.blocks.forEach((block) => {
      accessBlock(scenario.probe, block);
      block.rows.forEach((row) => {
        const key = row[scenario.probe.key];
        const matches = key === null || key === undefined ? [] : (hash.get(key) || []);
        push("HASH_PROBE", `TABLE ACCESS · ${scenario.probe.name}`, "PGA Hash Workarea", [row.id, ...matches.map((match) => match.id)], [block.id], `Probe: clave ${key ?? "NULL"} encuentra ${matches.length} coincidencia(s).`, "Una clave NULL no coincide con otra NULL en esta comparación de igualdad del INNER JOIN didáctico.", { matches: matches.map((match) => match.id) });
        matches.forEach((match) => {
          metrics.outputRows += 1;
          push("EMIT_ROW", "HASH JOIN", "Resultado lógico", [match.id, row.id], [block.id], `Resultado: ${match.id} se combina con ${row.id}.`, "La salida representa una fila lógica del resultado; no es una traza literal del motor.", { result: { buildId: match.id, probeId: row.id } });
        });
      });
    });

    return Object.freeze({ scenarioId: scenario.id, events: Object.freeze(events), expectedRows: scenario.expectedRows, buildRows: Object.freeze(buildRows) });
  }

  function stateAt(timeline, index) {
    const safeIndex = Math.max(0, Math.min(index, timeline.events.length - 1));
    const seen = timeline.events.slice(0, safeIndex + 1);
    const current = timeline.events[safeIndex] || null;
    const output = seen.filter((event) => event.type === "EMIT_ROW").map((event) => event.result);
    const hashRows = seen.filter((event) => event.type === "HASH_BUILD").flatMap((event) => event.rowIds);
    return Object.freeze({
      index: safeIndex,
      current,
      output: Object.freeze(output),
      hashRows: Object.freeze(hashRows),
      metrics: current ? current.illustrativeMetrics : emptyMetrics()
    });
  }

  globalThis.OracleHashJoinEngine = Object.freeze({ EVENT_TYPES, createTimeline, stateAt });
})();
