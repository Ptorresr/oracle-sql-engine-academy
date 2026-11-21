(() => {
  "use strict";

  const adapter = globalThis.OraclePerformanceEventAdapter;
  if (!adapter) return;

  const EVENT_TYPES = Object.freeze(["READ_BLOCK", "CACHE_HIT", "CACHE_MISS", "TABLE_ACCESS"]);
  const CACHE_MODES = Object.freeze(["cold", "warm"]);
  const ACCESS_PATTERNS = Object.freeze(["declared", "sequential", "reused"]);
  const MAX_REQUESTS = 12;

  function freeze(value) {
    if (Array.isArray(value)) value.forEach(freeze);
    else if (value && typeof value === "object") Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function blockIdsFor(scenario) {
    return scenario.blockLayout.map((block) => block.blockId);
  }

  function blockById(scenario, blockId) {
    return scenario.blockLayout.find((block) => block.blockId === blockId) || null;
  }

  function normalizeParameters(scenario, input = {}) {
    const availableBlockIds = blockIdsFor(scenario);
    if (!availableBlockIds.length) throw new TypeError("El escenario requiere al menos un bloque educativo.");
    const defaultCapacity = Math.min(3, availableBlockIds.length);
    const requestedCapacity = Number.parseInt(input.capacityBlocks, 10);
    const capacityBlocks = Math.max(1, Math.min(availableBlockIds.length, Number.isInteger(requestedCapacity) ? requestedCapacity : defaultCapacity));
    const cacheMode = CACHE_MODES.includes(input.cacheMode) ? input.cacheMode : scenario.accessPattern.defaultMode;
    const accessPattern = ACCESS_PATTERNS.includes(input.accessPattern) ? input.accessPattern : "declared";
    const declaredCount = scenario.accessPattern.coldRequests.length || availableBlockIds.length;
    const requestedCount = Number.parseInt(input.requestCount, 10);
    const requestCount = Math.max(1, Math.min(MAX_REQUESTS, Number.isInteger(requestedCount) ? requestedCount : declaredCount));
    return freeze({ cacheMode, capacityBlocks, accessPattern, requestCount, replacementPolicy: "FIFO educativo" });
  }

  function requestSequence(scenario, parameters) {
    const availableBlockIds = blockIdsFor(scenario);
    const declared = scenario.accessPattern.coldRequests.filter((blockId) => availableBlockIds.includes(blockId));
    const source = parameters.accessPattern === "declared" ? declared : availableBlockIds;
    const repeatedBlock = scenario.accessPattern.warmSeed.find((blockId) => availableBlockIds.includes(blockId)) || availableBlockIds[0];
    const requests = [];
    for (let index = 0; index < parameters.requestCount; index += 1) {
      if (parameters.accessPattern === "reused") requests.push(repeatedBlock);
      else requests.push(source[index % source.length]);
    }
    return freeze(requests);
  }

  function initialCache(scenario, parameters) {
    if (parameters.cacheMode === "cold") return [];
    const known = scenario.accessPattern.warmSeed.filter((blockId) => blockIdsFor(scenario).includes(blockId));
    return known.slice(-parameters.capacityBlocks);
  }

  function cacheState(cache, parameters) {
    return freeze({ residentBlockIds: [...cache], capacityBlocks: parameters.capacityBlocks, replacementPolicy: parameters.replacementPolicy });
  }

  function emptyMetrics() {
    return { logicalRequests: 0, conceptualPhysicalReads: 0, cacheHits: 0, cacheMisses: 0, rowsDelivered: 0, residentBlockCount: 0 };
  }

  function eventExplanation(type, blockId, tableName) {
    const explanations = {
      READ_BLOCK: {
        what: `El modelo solicita lógicamente ${blockId}.`,
        where: "SQL Execution Engine → bloque educativo.",
        how: "La solicitud se registra antes de resolver si el bloque está residente.",
        why: "Distingue la intención lógica de un posible I/O físico.",
        dba: "Una solicitud lógica no prueba por sí sola una lectura física observada."
      },
      CACHE_HIT: {
        what: `${blockId} ya está en la caché conceptual.`,
        where: "Database Buffer Cache educativo.",
        how: "El conjunto residente del escenario contiene el bloque solicitado.",
        why: "Permite observar reutilización de bloques dentro del modelo.",
        dba: "El hit no reproduce la política real de Buffer Cache ni mide latencia."
      },
      CACHE_MISS: {
        what: `${blockId} no estaba en la caché conceptual.`,
        where: "Datafile educativo → Database Buffer Cache educativo.",
        how: "El modelo incorpora el bloque usando una cola FIFO declarada.",
        why: "Explica una lectura física conceptual sin afirmar I/O real.",
        dba: "El contador es ilustrativo; no equivale a una estadística de Oracle."
      },
      TABLE_ACCESS: {
        what: `Las filas de ${tableName} quedan disponibles para el operador lógico.`,
        where: "Database Buffer Cache educativo → SQL Execution Engine.",
        how: "El bloque entrega las filas sintéticas asociadas en el escenario.",
        why: "Relaciona bloque, filas y acceso lógico en las tres vistas.",
        dba: "El flujo de filas es conceptual; no representa movimiento físico literal."
      }
    };
    return freeze(explanations[type]);
  }

  function createTimeline(scenario, input = {}) {
    if (!scenario || !Array.isArray(scenario.blockLayout) || !scenario.accessPattern) throw new TypeError("El escenario Buffer Cache no tiene el modelo requerido.");
    const parameters = normalizeParameters(scenario, input);
    const requests = requestSequence(scenario, parameters);
    const cache = initialCache(scenario, parameters);
    const metrics = emptyMetrics();
    const events = [];
    let step = 0;

    const push = (type, source, target, rowIds, blockIds, label, detail) => {
      metrics.residentBlockCount = cache.length;
      events.push(adapter.adaptEvent({
        step: ++step,
        type,
        source,
        target,
        rowIds,
        blockIds,
        label,
        illustrativeMetrics: { ...metrics },
        scenarioId: scenario.id,
        executionLocation: "EDUCATIONAL_ABSTRACTION",
        representation: "buffer-cache",
        cacheState: cacheState(cache, parameters),
        ...detail
      }));
    };

    requests.forEach((blockId) => {
      const block = blockById(scenario, blockId);
      if (!block) throw new TypeError(`El bloque ${blockId} no existe en el escenario.`);
      const rowIds = [...block.rowIds];
      metrics.logicalRequests += 1;
      push(
        "READ_BLOCK",
        "SQL Execution Engine",
        `Datafile · ${blockId}`,
        [],
        [blockId],
        `Solicitud lógica del bloque ${blockId}.`,
        { explanation: eventExplanation("READ_BLOCK", blockId, block.table) }
      );

      if (cache.includes(blockId)) {
        metrics.cacheHits += 1;
        push(
          "CACHE_HIT",
          "Database Buffer Cache",
          "SQL Execution Engine",
          [],
          [blockId],
          `${blockId} se atiende desde la caché conceptual.`,
          { explanation: eventExplanation("CACHE_HIT", blockId, block.table) }
        );
      } else {
        metrics.cacheMisses += 1;
        metrics.conceptualPhysicalReads += 1;
        if (cache.length >= parameters.capacityBlocks) cache.shift();
        cache.push(blockId);
        push(
          "CACHE_MISS",
          `Datafile · ${blockId}`,
          "Database Buffer Cache",
          [],
          [blockId],
          `${blockId} se incorpora a la caché conceptual tras un miss.`,
          { explanation: eventExplanation("CACHE_MISS", blockId, block.table) }
        );
      }

      metrics.rowsDelivered += rowIds.length;
      push(
        "TABLE_ACCESS",
        "Database Buffer Cache",
        `TABLE ACCESS · ${block.table}`,
        rowIds,
        [blockId],
        `${block.table} entrega ${rowIds.length} fila(s) sintéticas desde ${blockId}.`,
        { explanation: eventExplanation("TABLE_ACCESS", blockId, block.table) }
      );
    });

    return freeze({ scenarioId: scenario.id, parameters, requests, events: freeze(events) });
  }

  function stateAt(timeline, index) {
    const eventCount = timeline?.events?.length || 0;
    if (!eventCount) return freeze({ index: -1, current: null, cacheState: null, deliveredRowIds: freeze([]), metrics: freeze(emptyMetrics()) });
    const safeIndex = Math.max(0, Math.min(Number.isInteger(index) ? index : 0, eventCount - 1));
    const seen = timeline.events.slice(0, safeIndex + 1);
    const current = timeline.events[safeIndex];
    return freeze({
      index: safeIndex,
      current,
      cacheState: current.cacheState,
      deliveredRowIds: freeze(seen.filter((event) => event.type === "TABLE_ACCESS").flatMap((event) => event.rowIds)),
      metrics: current.illustrativeMetrics
    });
  }

  globalThis.OracleBufferCacheEngine = Object.freeze({ EVENT_TYPES, CACHE_MODES, ACCESS_PATTERNS, MAX_REQUESTS, normalizeParameters, createTimeline, stateAt });
})();
