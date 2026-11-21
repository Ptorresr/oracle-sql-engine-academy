(() => {
  "use strict";

  const adapter = globalThis.OraclePerformanceEventAdapter;
  if (!adapter) return;

  const EVENT_TYPES = Object.freeze(["WORKAREA_ALLOCATE", "WORKAREA_PROCESS", "TEMP_WRITE", "TEMP_READ", "WORKAREA_COMPLETE"]);
  const OPERATIONS = Object.freeze(["HASH_JOIN", "SORT"]);
  const DISTRIBUTIONS = Object.freeze(["clustered", "mixed", "wide"]);
  const CLASSIFICATIONS = Object.freeze(["OPTIMAL", "ONE_PASS", "MULTI_PASS"]);
  const MAX_ROWS = 256;
  const MAX_ROW_UNITS = 16;
  const MAX_MEMORY_UNITS = 128;
  const MAX_TEMPORARY_PASSES = 4;

  const operationFactors = Object.freeze({ HASH_JOIN: 1, SORT: 1.25 });
  const distributionFactors = Object.freeze({ clustered: 0.85, mixed: 1, wide: 1.25 });
  const classificationLabels = Object.freeze({ OPTIMAL: "Optimal educativo", ONE_PASS: "One-Pass educativo", MULTI_PASS: "Multi-Pass educativo" });

  function freeze(value) {
    if (Array.isArray(value)) value.forEach(freeze);
    else if (value && typeof value === "object") Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }

  function integer(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : fallback;
  }

  function bounded(value, fallback, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, integer(value, fallback)));
  }

  function allRows(scenario) {
    return scenario.tables.flatMap((table) => table.rows.map((row) => row.id));
  }

  function blockIds(scenario) {
    return scenario.blockLayout.map((block) => block.blockId);
  }

  function profileFor(scenario) {
    if (!scenario?.workareaModel) throw new TypeError("El escenario requiere un perfil educativo de workarea.");
    return scenario.workareaModel;
  }

  function classify(estimatedWorkUnits, memoryBudgetUnits) {
    if (estimatedWorkUnits <= memoryBudgetUnits) return freeze({ classification: "OPTIMAL", temporaryPasses: 0, processingPhases: 1 });
    if (estimatedWorkUnits <= memoryBudgetUnits * 2) return freeze({ classification: "ONE_PASS", temporaryPasses: 1, processingPhases: 2 });
    const temporaryPasses = Math.min(MAX_TEMPORARY_PASSES, Math.max(2, Math.ceil(estimatedWorkUnits / memoryBudgetUnits) - 1));
    return freeze({ classification: "MULTI_PASS", temporaryPasses, processingPhases: temporaryPasses + 1 });
  }

  function normalizeParameters(scenario, input = {}) {
    const profile = profileFor(scenario);
    const operation = OPERATIONS.includes(input.operation) ? input.operation : profile.defaultOperation;
    const distribution = DISTRIBUTIONS.includes(input.distribution) ? input.distribution : profile.defaultDistribution;
    const rows = bounded(input.rows, profile.defaultRows, 0, MAX_ROWS);
    const rowUnits = bounded(input.rowUnits, profile.defaultRowUnits, 1, MAX_ROW_UNITS);
    const memoryBudgetUnits = bounded(input.memoryBudgetUnits, profile.defaultMemoryBudgetUnits, 1, MAX_MEMORY_UNITS);
    const operationFactor = operationFactors[operation];
    const distributionFactor = distributionFactors[distribution];
    const estimatedWorkUnits = Math.ceil(rows * rowUnits * operationFactor * distributionFactor);
    const outcome = classify(estimatedWorkUnits, memoryBudgetUnits);
    return freeze({
      operation,
      distribution,
      rows,
      rowUnits,
      memoryBudgetUnits,
      operationFactor,
      distributionFactor,
      estimatedWorkUnits,
      ...outcome,
      classificationLabel: classificationLabels[outcome.classification],
      formula: "filas × unidades de fila × factor de operación × factor de distribución"
    });
  }

  function rowSample(scenario, rows) {
    return allRows(scenario).slice(0, Math.min(rows, 8));
  }

  function metrics(parameters, state) {
    return freeze({
      illustrative: true,
      rowsProcessed: parameters.rows,
      rowUnits: parameters.rowUnits,
      memoryBudgetUnits: parameters.memoryBudgetUnits,
      estimatedWorkUnits: parameters.estimatedWorkUnits,
      workareaUsedUnits: state.workareaUsedUnits,
      tempWriteEvents: state.tempWriteEvents,
      tempReadEvents: state.tempReadEvents,
      tempEvents: state.tempWriteEvents + state.tempReadEvents,
      temporaryPasses: parameters.temporaryPasses,
      processingPhases: parameters.processingPhases,
      classification: parameters.classification
    });
  }

  function workareaState(parameters, state) {
    return freeze({
      memoryBudgetUnits: parameters.memoryBudgetUnits,
      estimatedWorkUnits: parameters.estimatedWorkUnits,
      workareaUsedUnits: state.workareaUsedUnits,
      temporaryPasses: parameters.temporaryPasses,
      currentPhase: state.currentPhase,
      classification: parameters.classification,
      tempActive: state.tempActive
    });
  }

  function explanation(type, parameters, phase = 0) {
    const operation = parameters.operation === "HASH_JOIN" ? "HASH JOIN" : "SORT";
    const base = {
      WORKAREA_ALLOCATE: {
        what: `El modelo reserva una workarea educativa para ${operation}.`,
        where: "PGA / Work Area conceptual.",
        how: `El presupuesto declarado es ${parameters.memoryBudgetUnits} unidades educativas.`,
        why: "Hace visible la memoria de trabajo como entrada del modelo, no como métrica PGA observada.",
        dba: "El presupuesto no representa un parámetro de instancia ni una asignación real de PGA."
      },
      WORKAREA_PROCESS: {
        what: `La fase educativa ${phase || 1} procesa ${parameters.rows} fila(s) con ${operation}.`,
        where: "SQL Operation → PGA / Work Area conceptual.",
        how: `El modelo estima ${parameters.estimatedWorkUnits} unidades mediante ${parameters.formula}.`,
        why: "Relaciona volumen, distribución y presupuesto sin predecir el comportamiento de Oracle.",
        dba: "La clasificación es una regla local; no sustituye estadísticas, SQL Monitor o evidencia de TEMP."
      },
      TEMP_WRITE: {
        what: `La fase temporal educativa ${phase} escribe un lote conceptual en TEMP.`,
        where: "PGA / Work Area conceptual → TEMP conceptual.",
        how: "Solo se emite porque la clasificación local requiere una fase adicional.",
        why: "Permite distinguir presión de workarea de una afirmación de I/O real.",
        dba: "Este evento no prueba uso de TEMP en Oracle ni contabiliza bytes, segmentos o latencia."
      },
      TEMP_READ: {
        what: `La fase temporal educativa ${phase} recupera el lote conceptual desde TEMP.`,
        where: "TEMP conceptual → PGA / Work Area conceptual.",
        how: "Cada lectura temporal corresponde a una escritura previa del mismo modelo.",
        why: "Muestra una fase adicional sin duplicar filas ni métricas de ejecución.",
        dba: "No representa una lectura física observada ni la política real de workareas."
      },
      WORKAREA_COMPLETE: {
        what: `${operation} termina con clasificación ${classificationLabels[parameters.classification]}.`,
        where: "PGA / Work Area conceptual → Results.",
        how: "El timeline finaliza después de las fases temporales declaradas, si existen.",
        why: "Resume la hipótesis educativa y mantiene el resultado separado de métricas reales.",
        dba: "Optimal, One-Pass y Multi-Pass son etiquetas didácticas de este modelo, no diagnósticos Oracle."
      }
    };
    return freeze(base[type]);
  }

  function createTimeline(scenario, input = {}) {
    if (!scenario || !Array.isArray(scenario.tables) || !Array.isArray(scenario.blockLayout)) throw new TypeError("El escenario Work Area requiere tablas y bloques declarados.");
    const parameters = normalizeParameters(scenario, input);
    const rows = rowSample(scenario, parameters.rows);
    const blocks = blockIds(scenario);
    const state = { workareaUsedUnits: 0, tempWriteEvents: 0, tempReadEvents: 0, currentPhase: 0, tempActive: false };
    const events = [];
    let step = 0;
    const operationName = parameters.operation === "HASH_JOIN" ? "HASH JOIN" : "SORT";
    const push = (type, source, target, label, options = {}) => {
      events.push(adapter.adaptEvent({
        step: ++step,
        type,
        source,
        target,
        rowIds: options.rowIds || [],
        blockIds: options.blockIds || [],
        label,
        illustrativeMetrics: metrics(parameters, state),
        scenarioId: scenario.id,
        operatorId: parameters.operation === "HASH_JOIN" ? "op-hash-join-workarea" : "op-sort-workarea",
        workareaId: "pga-workarea-educational",
        executionLocation: "EDUCATIONAL_ABSTRACTION",
        representation: "workarea-temp",
        explanation: explanation(type, parameters, options.phase),
        decisionBasis: freeze(["rows", "rowUnits", "memoryBudgetUnits", "operationFactor", "distributionFactor"]),
        workareaState: workareaState(parameters, state)
      }));
    };

    push("WORKAREA_ALLOCATE", "SQL Operation", "PGA / Work Area", `Se reserva una workarea educativa para ${operationName}.`, { rowIds: rows, blockIds: blocks });
    state.currentPhase = 1;
    state.workareaUsedUnits = Math.min(parameters.estimatedWorkUnits, parameters.memoryBudgetUnits);
    push("WORKAREA_PROCESS", "SQL Operation", "PGA / Work Area", `${operationName} procesa la fase educativa inicial.`, { rowIds: rows, blockIds: blocks, phase: state.currentPhase });

    for (let phase = 1; phase <= parameters.temporaryPasses; phase += 1) {
      state.tempActive = true;
      state.tempWriteEvents += 1;
      push("TEMP_WRITE", "PGA / Work Area", "TEMP", `La fase temporal educativa ${phase} escribe un lote conceptual.`, { rowIds: rows, blockIds: ["TEMP-EDUCATIONAL"], phase });
      state.tempReadEvents += 1;
      push("TEMP_READ", "TEMP", "PGA / Work Area", `La fase temporal educativa ${phase} recupera un lote conceptual.`, { rowIds: rows, blockIds: ["TEMP-EDUCATIONAL"], phase });
      state.currentPhase += 1;
      state.workareaUsedUnits = Math.min(parameters.estimatedWorkUnits, parameters.memoryBudgetUnits);
      push("WORKAREA_PROCESS", "TEMP", "PGA / Work Area", `${operationName} procesa la fase educativa ${state.currentPhase}.`, { rowIds: rows, blockIds: blocks, phase: state.currentPhase });
    }

    state.tempActive = false;
    push("WORKAREA_COMPLETE", "PGA / Work Area", "Results", `${operationName} completa el resultado educativo ${classificationLabels[parameters.classification]}.`, { rowIds: rows, blockIds: blocks, phase: state.currentPhase });
    return freeze({ scenarioId: scenario.id, parameters, events: freeze(events), resultRowIds: freeze(rows) });
  }

  function stateAt(timeline, index) {
    const count = timeline?.events?.length || 0;
    if (!count) return freeze({ index: -1, current: null, parameters: null, metrics: metrics({ rows: 0, rowUnits: 1, memoryBudgetUnits: 1, estimatedWorkUnits: 0, temporaryPasses: 0, processingPhases: 1, classification: "OPTIMAL" }, { workareaUsedUnits: 0, tempWriteEvents: 0, tempReadEvents: 0 }), workareaState: null, processedRowIds: freeze([]), tempActive: false, classification: "OPTIMAL" });
    const safeIndex = Math.max(0, Math.min(Number.isInteger(index) ? index : 0, count - 1));
    const current = timeline.events[safeIndex];
    const processedRowIds = timeline.events.slice(0, safeIndex + 1).filter((event) => event.type === "WORKAREA_PROCESS").flatMap((event) => event.rowIds);
    return freeze({
      index: safeIndex,
      current,
      parameters: timeline.parameters,
      metrics: current.illustrativeMetrics,
      workareaState: current.workareaState,
      processedRowIds: freeze(processedRowIds),
      tempActive: Boolean(current.workareaState?.tempActive),
      classification: timeline.parameters.classification,
      resultRowIds: current.type === "WORKAREA_COMPLETE" ? timeline.resultRowIds : freeze([])
    });
  }

  globalThis.OracleWorkareaTempEngine = Object.freeze({
    EVENT_TYPES,
    OPERATIONS,
    DISTRIBUTIONS,
    CLASSIFICATIONS,
    MAX_ROWS,
    MAX_ROW_UNITS,
    MAX_MEMORY_UNITS,
    MAX_TEMPORARY_PASSES,
    normalizeParameters,
    createTimeline,
    stateAt
  });
})();
