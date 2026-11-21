(() => {
  "use strict";

  const adapter = globalThis.OraclePerformanceEventAdapter;
  const optimizer = globalThis.OracleOptimizerCardinalityEngine;
  const bufferCache = globalThis.OracleBufferCacheEngine;
  const workarea = globalThis.OracleWorkareaTempEngine;
  if (!adapter || !optimizer || !bufferCache || !workarea) return;

  const TRACK_IDS = Object.freeze(["A", "B"]);
  const STAGES = Object.freeze(["optimizer", "bufferCache", "workarea"]);

  function freeze(value) {
    if (Array.isArray(value)) value.forEach(freeze);
    else if (value && typeof value === "object") Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function modelFor(scenario) {
    if (!scenario?.whatIfModel) throw new TypeError("El escenario requiere whatIfModel para Performance What-If.");
    return scenario.whatIfModel;
  }

  function text(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function normalizeVariant(scenario, input = {}) {
    const model = modelFor(scenario);
    const values = { ...model.initialValues };
    model.allowedParameters.forEach((key) => {
      if (Object.hasOwn(input, key)) values[key] = input[key];
    });
    const optimizerParameters = optimizer.normalizeParameters(scenario, {
      baseRows: values.baseRows,
      selectivity: values.selectivity,
      statisticsStatus: values.statisticsStatus,
      indexAvailable: values.indexAvailable,
      distribution: values.optimizerDistribution
    });
    const cacheParameters = bufferCache.normalizeParameters(scenario, {
      cacheMode: values.cacheMode,
      capacityBlocks: values.capacityBlocks,
      accessPattern: values.accessPattern
    });
    const workareaParameters = workarea.normalizeParameters(scenario, {
      operation: values.workareaOperation,
      rows: values.workareaRows,
      rowUnits: values.rowUnits,
      memoryBudgetUnits: values.memoryBudgetUnits,
      distribution: values.workareaDistribution
    });
    const populationId = text(values.populationId, model.initialValues.populationId);
    const volumeChanged = Boolean(model.comparability.volumeChangesPopulation && (optimizerParameters.baseRows !== Number(model.initialValues.baseRows) || workareaParameters.rows !== Number(model.initialValues.workareaRows)));
    return freeze({
      optimizer: optimizerParameters,
      cache: cacheParameters,
      workarea: workareaParameters,
      populationId,
      logicalResultId: model.comparability.logicalResultId,
      volumeChanged,
      restrictions: [...model.restrictions],
      limitations: [...model.limitations],
      allowedParameters: [...model.allowedParameters]
    });
  }

  function rebasedEvents(sourceEvents, offset, stage) {
    return sourceEvents.map((event, index) => adapter.adaptEvent({ ...event, step: offset + index + 1, label: `[${stage}] ${event.label}` }));
  }

  function createTrack(scenario, input = {}, trackId = "A") {
    if (!TRACK_IDS.includes(trackId)) throw new TypeError("El track debe identificarse como A o B.");
    const parameters = normalizeVariant(scenario, input);
    const optimizerTimeline = optimizer.createTimeline(scenario, parameters.optimizer);
    const cacheTimeline = bufferCache.createTimeline(scenario, parameters.cache);
    const workareaTimeline = workarea.createTimeline(scenario, parameters.workarea);
    const sourceTimelines = freeze({ optimizer: optimizerTimeline, bufferCache: cacheTimeline, workarea: workareaTimeline });
    let offset = 0;
    const ranges = {};
    const events = [];
    STAGES.forEach((stage) => {
      const source = sourceTimelines[stage].events;
      const start = offset;
      events.push(...rebasedEvents(source, offset, stage));
      offset += source.length;
      ranges[stage] = freeze({ start, end: offset - 1 });
    });
    const declaredResultRowIds = [...(scenario.optimizerModel?.logicalResultRowIds || [])];
    return freeze({
      id: trackId,
      scenarioId: scenario.id,
      parameters,
      sourceTimelines,
      ranges: freeze(ranges),
      events: freeze(events),
      logicalIdentity: freeze({ populationId: parameters.populationId, logicalResultId: parameters.logicalResultId, declaredResultRowIds, volumeChanged: parameters.volumeChanged }),
      metricProvenance: freeze({ optimizer: "OracleOptimizerCardinalityEngine · métrica ilustrativa", bufferCache: "OracleBufferCacheEngine · métrica ilustrativa", workarea: "OracleWorkareaTempEngine · métrica ilustrativa" }),
      disclaimer: "Track educativo compuesto: ordena explicaciones de tres motores locales y no describe una ejecución física ni temporal de Oracle."
    });
  }

  function comparabilityFor(a, b) {
    const samePopulation = a.logicalIdentity.populationId === b.logicalIdentity.populationId;
    const sameLogicalResult = a.logicalIdentity.logicalResultId === b.logicalIdentity.logicalResultId;
    const volumeChanged = a.logicalIdentity.volumeChanged || b.logicalIdentity.volumeChanged || a.parameters.optimizer.baseRows !== b.parameters.optimizer.baseRows && (a.parameters.volumeChanged || b.parameters.volumeChanged);
    const comparable = samePopulation && sameLogicalResult && !volumeChanged;
    const reason = comparable
      ? "Comparable: ambos tracks declaran la misma población e identidad lógica; las diferencias son hipótesis educativas de parámetros."
      : !samePopulation
        ? "No comparable: los tracks declaran poblaciones distintas."
        : volumeChanged
          ? "No comparable: el escenario declara que un cambio de volumen altera la población comparable."
          : "No comparable: no coinciden las identidades lógicas declaradas.";
    return freeze({ comparable, samePopulation, sameLogicalResult, volumeChanged, reason, rule: "La igualdad de cardinalidad no prueba equivalencia; la comparación exige identidad de población y resultado lógico declarados." });
  }

  function summary(track) {
    const cacheState = bufferCache.stateAt(track.sourceTimelines.bufferCache, track.sourceTimelines.bufferCache.events.length - 1);
    const workareaState = workarea.stateAt(track.sourceTimelines.workarea, track.sourceTimelines.workarea.events.length - 1);
    return freeze({
      estimatedRows: track.parameters.optimizer.estimatedRows,
      accessPath: track.parameters.optimizer.accessPath,
      joinAlternative: track.parameters.optimizer.joinAlternative,
      cacheHits: cacheState.metrics.cacheHits,
      cacheMisses: cacheState.metrics.cacheMisses,
      conceptualPhysicalReads: cacheState.metrics.conceptualPhysicalReads,
      workareaClassification: workareaState.parameters.classification,
      temporaryPasses: workareaState.parameters.temporaryPasses,
      tempEvents: workareaState.metrics.tempEvents,
      metricScope: "educational-comparison-derived-summary"
    });
  }

  function compareSummaries(a, b) {
    const left = summary(a);
    const right = summary(b);
    const changed = Object.keys(left).filter((key) => key !== "metricScope" && JSON.stringify(left[key]) !== JSON.stringify(right[key]));
    return freeze({ a: left, b: right, changed, unchanged: Object.keys(left).filter((key) => key !== "metricScope" && !changed.includes(key)), limitation: "Las diferencias resumen métricas ilustrativas de motores distintos; no son tiempos, costes ni medidas de Oracle." });
  }

  function createComparison(scenario, inputs = {}) {
    if (!scenario?.id) throw new TypeError("Se requiere un escenario declarativo.");
    const a = createTrack(scenario, inputs.a || {}, "A");
    const b = createTrack(scenario, inputs.b || {}, "B");
    return freeze({
      scenarioId: scenario.id,
      scenarioLabel: scenario.label,
      baseline: a,
      variant: b,
      comparability: comparabilityFor(a, b),
      summary: compareSummaries(a, b),
      limitations: freeze(["La comparación usa reglas locales y snapshots independientes.", "No calcula costes, tiempos, I/O real ni predice el plan de Oracle.", "El recorrido de cada track es educativo, no una traza física."])
    });
  }

  function stateForTrack(track, index) {
    const safeIndex = Math.max(0, Math.min(Number.isInteger(index) ? index : 0, track.events.length - 1));
    const stage = STAGES.find((candidate) => safeIndex >= track.ranges[candidate].start && safeIndex <= track.ranges[candidate].end) || "optimizer";
    const localIndex = safeIndex - track.ranges[stage].start;
    const source = track.sourceTimelines[stage];
    const engine = stage === "optimizer" ? optimizer : stage === "bufferCache" ? bufferCache : workarea;
    return freeze({ trackId: track.id, index: safeIndex, current: track.events[safeIndex], stage, stageState: engine.stateAt(source, localIndex), logicalIdentity: track.logicalIdentity, metricProvenance: track.metricProvenance, parameters: track.parameters });
  }

  function stateAt(comparison, indexes = {}) {
    if (!comparison?.baseline || !comparison?.variant) throw new TypeError("Se requiere una comparación A/B.");
    const source = Number.isInteger(indexes) ? { a: indexes, b: indexes } : { a: indexes?.a ?? indexes?.A, b: indexes?.b ?? indexes?.B };
    return freeze({
      a: stateForTrack(comparison.baseline, source.a),
      b: stateForTrack(comparison.variant, source.b),
      comparability: comparison.comparability,
      summary: comparison.summary,
      limitations: comparison.limitations
    });
  }

  globalThis.OraclePerformanceWhatIfEngine = Object.freeze({ TRACK_IDS, STAGES, normalizeVariant, createTrack, createComparison, stateAt });
})();
