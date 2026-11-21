(() => {
  "use strict";

  const adapter = globalThis.OraclePerformanceEventAdapter;
  if (!adapter) return;

  const EVENT_TYPES = Object.freeze(["CARDINALITY_ESTIMATE", "ACCESS_PATH_SELECTED", "TABLE_ACCESS", "EMIT_ROW"]);
  const STATISTICS_STATUSES = Object.freeze(["available", "stale", "absent"]);
  const DISTRIBUTIONS = Object.freeze(["uniform", "skewed"]);
  const ACCESS_PATHS = Object.freeze(["NO_ROWS_EXPECTED", "EVIDENCE_INSUFFICIENT", "INDEX_LOOKUP_EDUCATIONAL", "FULL_SCAN_EDUCATIONAL"]);
  const JOIN_ALTERNATIVES = Object.freeze(["NO_JOIN_ROWS_EXPECTED", "NESTED_LOOPS_EDUCATIONAL", "SORT_MERGE_EDUCATIONAL", "HASH_JOIN_EDUCATIONAL"]);
  const MAX_BASE_ROWS = 10000000;
  const INDEX_SELECTIVITY_THRESHOLD = 0.1;
  const SORT_MERGE_SELECTIVITY_THRESHOLD = 0.5;

  function freeze(value) {
    if (Array.isArray(value)) value.forEach(freeze);
    else if (value && typeof value === "object") Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function integer(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : fallback;
  }

  function boundedInteger(value, fallback, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, integer(value, fallback)));
  }

  function boundedNumber(value, fallback, minimum, maximum) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(minimum, Math.min(maximum, parsed));
  }

  function boolean(value, fallback) {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return fallback;
  }

  function profileFor(scenario) {
    if (!scenario?.optimizerModel) throw new TypeError("El escenario requiere un perfil educativo de optimizer.");
    return scenario.optimizerModel;
  }

  function estimateRows(baseRows, selectivity) {
    if (baseRows === 0 || selectivity === 0) return 0;
    return Math.ceil(baseRows * selectivity);
  }

  function chooseAccessPath(parameters) {
    if (parameters.estimatedRows === 0) return "NO_ROWS_EXPECTED";
    if (parameters.statisticsStatus === "absent") return "EVIDENCE_INSUFFICIENT";
    if (parameters.indexAvailable && parameters.effectiveSelectivity <= INDEX_SELECTIVITY_THRESHOLD) return "INDEX_LOOKUP_EDUCATIONAL";
    return "FULL_SCAN_EDUCATIONAL";
  }

  function chooseJoinAlternative(parameters, accessPath) {
    if (parameters.estimatedRows === 0) return "NO_JOIN_ROWS_EXPECTED";
    if (accessPath === "INDEX_LOOKUP_EDUCATIONAL") return "NESTED_LOOPS_EDUCATIONAL";
    if (parameters.statisticsStatus === "available" && parameters.distribution === "uniform" && parameters.effectiveSelectivity >= SORT_MERGE_SELECTIVITY_THRESHOLD) return "SORT_MERGE_EDUCATIONAL";
    return "HASH_JOIN_EDUCATIONAL";
  }

  function alternatives(parameters, accessPath, joinAlternative) {
    return freeze([
      {
        id: "INDEX_LOOKUP_EDUCATIONAL",
        label: "Índice educativo",
        available: parameters.statisticsStatus !== "absent" && parameters.indexAvailable && parameters.effectiveSelectivity <= INDEX_SELECTIVITY_THRESHOLD,
        selected: accessPath === "INDEX_LOOKUP_EDUCATIONAL",
        limitation: "No representa un index range scan real ni garantiza que Oracle use un índice."
      },
      {
        id: "FULL_SCAN_EDUCATIONAL",
        label: "Acceso amplio educativo",
        available: parameters.estimatedRows > 0 && parameters.statisticsStatus !== "absent",
        selected: accessPath === "FULL_SCAN_EDUCATIONAL",
        limitation: "No afirma que un full scan sea bueno o malo ni mide I/O."
      },
      {
        id: "NESTED_LOOPS_EDUCATIONAL",
        label: "Nested Loops educativo",
        available: parameters.estimatedRows > 0 && accessPath === "INDEX_LOOKUP_EDUCATIONAL",
        selected: joinAlternative === "NESTED_LOOPS_EDUCATIONAL",
        limitation: "Es una alternativa conceptual; no reproduce la elección del optimizador."
      },
      {
        id: "SORT_MERGE_EDUCATIONAL",
        label: "Sort Merge educativo",
        available: parameters.estimatedRows > 0 && parameters.statisticsStatus === "available" && parameters.distribution === "uniform" && parameters.effectiveSelectivity >= SORT_MERGE_SELECTIVITY_THRESHOLD,
        selected: joinAlternative === "SORT_MERGE_EDUCATIONAL",
        limitation: "No implica un sort real, uso de TEMP ni coste temporal."
      },
      {
        id: "HASH_JOIN_EDUCATIONAL",
        label: "Hash Join educativo",
        available: parameters.estimatedRows > 0,
        selected: joinAlternative === "HASH_JOIN_EDUCATIONAL",
        limitation: "No implica buckets, memoria ni una decisión real de Oracle."
      }
    ]);
  }

  function normalizeParameters(scenario, input = {}) {
    const profile = profileFor(scenario);
    const baseRows = boundedInteger(input.baseRows, profile.defaultBaseRows, 0, MAX_BASE_ROWS);
    const declaredSelectivity = boundedNumber(input.selectivity, profile.defaultSelectivity, 0, 1);
    const statisticsStatus = STATISTICS_STATUSES.includes(input.statisticsStatus) ? input.statisticsStatus : profile.defaultStatisticsStatus;
    const indexAvailable = boolean(input.indexAvailable, profile.defaultIndexAvailable);
    const distribution = DISTRIBUTIONS.includes(input.distribution) ? input.distribution : profile.defaultDistribution;
    const estimatedRows = estimateRows(baseRows, declaredSelectivity);
    const provisional = { baseRows, declaredSelectivity, effectiveSelectivity: declaredSelectivity, statisticsStatus, indexAvailable, distribution, estimatedRows };
    const accessPath = chooseAccessPath(provisional);
    const joinAlternative = chooseJoinAlternative(provisional, accessPath);
    const observationRows = Number.isInteger(profile.declaredObservationRows) ? profile.declaredObservationRows : null;
    const observationSource = observationRows === null ? "not-declared" : profile.observationSource;
    const decisionBasis = freeze([
      "La cardinalidad educativa usa ceil(filas base × selectividad declarada).",
      `Estado de estadísticas: ${statisticsStatus}.`,
      `Índice declarado: ${indexAvailable ? "disponible" : "no disponible"}.`,
      `Distribución declarada: ${distribution}.`,
      `Umbral de índice educativo: selectividad ≤ ${INDEX_SELECTIVITY_THRESHOLD}.`,
      `Umbral de Sort Merge educativo: selectividad ≥ ${SORT_MERGE_SELECTIVITY_THRESHOLD} con distribución uniforme y estadísticas disponibles.`
    ]);
    return freeze({
      baseRows,
      declaredSelectivity,
      effectiveSelectivity: declaredSelectivity,
      statisticsStatus,
      indexAvailable,
      distribution,
      estimatedRows,
      observationRows,
      observationSource,
      accessPath,
      joinAlternative,
      alternatives: alternatives(provisional, accessPath, joinAlternative),
      decisionBasis,
      formula: "ceil(filas base × selectividad declarada)",
      roundingRule: "El modelo redondea hacia arriba al siguiente entero; cero se conserva como cero.",
      metricScope: "optimizer-cardinality-educational-model"
    });
  }

  function allBlockIds(scenario) {
    return scenario.blockLayout.map((block) => block.blockId);
  }

  function scenarioResultRows(scenario, parameters) {
    if (parameters.estimatedRows === 0) return freeze([]);
    return freeze([...(profileFor(scenario).logicalResultRowIds || [])]);
  }

  function metrics(parameters, resultRows, emittedRows) {
    return freeze({
      illustrative: true,
      metricScope: parameters.metricScope,
      baseRows: parameters.baseRows,
      declaredSelectivity: parameters.declaredSelectivity,
      estimatedRows: parameters.estimatedRows,
      statisticsStatus: parameters.statisticsStatus,
      indexAvailable: parameters.indexAvailable,
      distribution: parameters.distribution,
      declaredObservationRows: parameters.observationRows,
      observationSource: parameters.observationSource,
      accessPath: parameters.accessPath,
      joinAlternative: parameters.joinAlternative,
      logicalResultRows: resultRows.length,
      emittedLogicalRows: emittedRows
    });
  }

  function explanation(type, scenario, parameters, rowId) {
    const statsDescription = parameters.statisticsStatus === "available" ? "Las estadísticas declaradas están disponibles para la regla local." : parameters.statisticsStatus === "stale" ? "Las estadísticas declaradas son desactualizadas y reducen la confianza educativa de la interpretación." : "No hay estadísticas declaradas; el cálculo usa una hipótesis explícita, no estadísticas inventadas.";
    const accessDescription = parameters.accessPath === "EVIDENCE_INSUFFICIENT" ? "El modelo no presenta una ruta preferida porque faltan estadísticas declaradas." : `La regla local selecciona ${parameters.accessPath} y ${parameters.joinAlternative} como alternativas educativas.`;
    const values = {
      CARDINALITY_ESTIMATE: {
        what: `El modelo calcula ${parameters.estimatedRows} fila(s) estimada(s) con ${parameters.formula}.`,
        where: "Statistics & Predicate Inputs → Cardinality Estimator educativo.",
        how: `${parameters.roundingRule} ${statsDescription}`,
        why: "Separa una estimación reproducible de una observación real de Oracle.",
        dba: "La estimación es una hipótesis del laboratorio; no es E-Rows importado ni una medición observada."
      },
      ACCESS_PATH_SELECTED: {
        what: accessDescription,
        where: "Cardinality Estimator → alternativas de acceso y JOIN educativas.",
        how: parameters.decisionBasis.join(" "),
        why: "Hace visible qué entradas cambian una alternativa sin afirmar una decisión del CBO.",
        dba: "Índices, distribución y selectividad reales requieren evidencia del plan y del entorno antes de concluir una causa."
      },
      TABLE_ACCESS: {
        what: parameters.estimatedRows === 0 ? "No se representa una muestra de filas porque la estimación educativa es cero." : "El laboratorio presenta una muestra lógica del resultado declarado del escenario.",
        where: "Alternativa educativa → resultado lógico sintético.",
        how: "Las filas visibles proceden del escenario y no representan lecturas físicas, bloques reales ni cardinalidad observada.",
        why: "Conecta predicado, cardinalidad conceptual y resultado sin ejecutar SQL.",
        dba: `NULL y duplicados se conservan en la narrativa: ${profileFor(scenario).nullBehavior}`
      },
      EMIT_ROW: {
        what: `Se muestra la fila lógica sintética ${rowId}.`,
        where: "Resultado lógico educativo.",
        how: "El motor recorre una lista declarada y no ejecuta la consulta ni reproduce un orden físico.",
        why: "Distingue resultado esperado de una estimación de cardinalidad.",
        dba: "La fila no es A-Rows, una estadística observada ni evidencia de una ejecución real."
      }
    };
    return freeze(values[type]);
  }

  function createTimeline(scenario, input = {}) {
    if (!scenario || !Array.isArray(scenario.blockLayout)) throw new TypeError("El escenario Optimizer requiere bloques declarados.");
    const parameters = normalizeParameters(scenario, input);
    const resultRows = scenarioResultRows(scenario, parameters);
    const events = [];
    let step = 0;
    const push = (type, source, target, label, options = {}) => {
      events.push(adapter.adaptEvent({
        step: ++step,
        type,
        source,
        target,
        rowIds: options.rowIds || [],
        blockIds: options.blockIds || [],
        label,
        illustrativeMetrics: metrics(parameters, resultRows, options.emittedRows || 0),
        scenarioId: scenario.id,
        operatorId: options.operatorId || "optimizer-cardinality-educational",
        executionLocation: "EDUCATIONAL_ABSTRACTION",
        representation: "optimizer-cardinality",
        explanation: explanation(type, scenario, parameters, options.rowId),
        decisionBasis: parameters.decisionBasis
      }));
    };

    push("CARDINALITY_ESTIMATE", "Statistics & Predicate Inputs", "Cardinality Estimator", "El modelo calcula una cardinalidad educativa a partir de filas y selectividad declaradas.", { blockIds: allBlockIds(scenario) });
    push("ACCESS_PATH_SELECTED", "Cardinality Estimator", "Access / JOIN Alternative", "La regla visible selecciona una alternativa educativa de acceso y JOIN.", { blockIds: allBlockIds(scenario), operatorId: parameters.joinAlternative });
    push("TABLE_ACCESS", "Access / JOIN Alternative", "Logical Result Set", "El laboratorio relaciona la alternativa con una muestra lógica del escenario.", { rowIds: resultRows, blockIds: allBlockIds(scenario) });
    resultRows.forEach((rowId, index) => {
      push("EMIT_ROW", "Logical Result Set", "Results", `Se presenta la fila lógica educativa ${rowId}.`, { rowIds: [rowId], blockIds: [], rowId, emittedRows: index + 1, operatorId: parameters.joinAlternative });
    });
    return freeze({ scenarioId: scenario.id, parameters, events: freeze(events), resultRowIds: resultRows });
  }

  function stateAt(timeline, index) {
    const count = timeline?.events?.length || 0;
    if (!count) return freeze({ index: -1, current: null, parameters: null, metrics: null, emittedRowIds: freeze([]), resultRowIds: freeze([]), alternatives: freeze([]) });
    const safeIndex = Math.max(0, Math.min(Number.isInteger(index) ? index : 0, count - 1));
    const current = timeline.events[safeIndex];
    const emittedRowIds = freeze(timeline.events.slice(0, safeIndex + 1).filter((event) => event.type === "EMIT_ROW").flatMap((event) => event.rowIds));
    return freeze({
      index: safeIndex,
      current,
      parameters: timeline.parameters,
      metrics: current.illustrativeMetrics,
      emittedRowIds,
      resultRowIds: current.type === "EMIT_ROW" ? emittedRowIds : freeze([]),
      alternatives: timeline.parameters.alternatives
    });
  }

  globalThis.OracleOptimizerCardinalityEngine = Object.freeze({
    EVENT_TYPES,
    STATISTICS_STATUSES,
    DISTRIBUTIONS,
    ACCESS_PATHS,
    JOIN_ALTERNATIVES,
    MAX_BASE_ROWS,
    INDEX_SELECTIVITY_THRESHOLD,
    SORT_MERGE_SELECTIVITY_THRESHOLD,
    normalizeParameters,
    createTimeline,
    stateAt
  });
})();
