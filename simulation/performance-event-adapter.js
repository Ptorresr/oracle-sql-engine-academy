(() => {
  "use strict";

  const BASE_EVENT_FIELDS = Object.freeze(["step", "type", "source", "target", "rowIds", "blockIds", "label", "illustrativeMetrics"]);
  const EXISTING_EVENT_TYPES = Object.freeze([
    "READ_BLOCK", "CACHE_HIT", "CACHE_MISS", "TABLE_ACCESS", "HASH_BUILD", "HASH_PROBE", "EMIT_ROW", "SPILL_TEMP",
    "NESTED_OUTER_ROW", "INDEX_LOOKUP", "SORT_INPUT", "MERGE_ADVANCE"
  ]);
  const PERFORMANCE_EVENT_TYPES = Object.freeze([
    "WORKAREA_ALLOCATE", "WORKAREA_PROCESS", "WORKAREA_COMPLETE", "WORKAREA_GROW", "SORT_RUN", "TEMP_WRITE", "TEMP_READ",
    "CARDINALITY_ESTIMATE", "ACCESS_PATH_SELECTED", "PLAN_OPERATOR_START", "PLAN_OPERATOR_END"
  ]);
  const EVENT_TYPES = Object.freeze([...EXISTING_EVENT_TYPES, ...PERFORMANCE_EVENT_TYPES]);
  const EXECUTION_LOCATIONS = Object.freeze([
    "DATABASE_SIMULATED", "APPLICATION_SIMULATED", "EXTERNAL_AI_SIMULATED", "EDUCATIONAL_ABSTRACTION"
  ]);
  const OPTIONAL_EVENT_FIELDS = Object.freeze([
    "scenarioId", "operatorId", "workareaId", "executionLocation", "representation", "explanation", "decisionBasis", "cacheState", "workareaState", "matches", "result"
  ]);

  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function copyFrozen(value) {
    if (Array.isArray(value)) return Object.freeze(value.map(copyFrozen));
    if (isRecord(value)) return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copyFrozen(item)])));
    return value;
  }

  function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function validateEvent(event, options = {}) {
    const errors = [];
    const warnings = [];
    if (!isRecord(event)) return Object.freeze({ valid: false, errors: Object.freeze(["El evento debe ser un objeto." ]), warnings: Object.freeze([]) });
    if (!Number.isInteger(event.step) || event.step < 1) errors.push("step debe ser un entero positivo.");
    if (!hasText(event.type)) errors.push("type debe ser texto no vacío.");
    else if (!EVENT_TYPES.includes(event.type)) {
      if (options.allowUnknownTypes) warnings.push(`Tipo de evento no reconocido: ${event.type}.`);
      else errors.push(`Tipo de evento no reconocido: ${event.type}.`);
    }
    ["source", "target", "label"].forEach((field) => {
      if (!hasText(event[field])) errors.push(`${field} debe ser texto no vacío.`);
    });
    ["rowIds", "blockIds"].forEach((field) => {
      if (!Array.isArray(event[field])) errors.push(`${field} debe ser un array.`);
    });
    if (!isRecord(event.illustrativeMetrics)) errors.push("illustrativeMetrics debe ser un objeto.");
    if (event.explanation !== undefined && !hasText(event.explanation) && !isRecord(event.explanation)) errors.push("explanation debe ser texto u objeto.");
    if (event.executionLocation !== undefined && !EXECUTION_LOCATIONS.includes(event.executionLocation)) errors.push("executionLocation no es una ubicación educativa permitida.");
    ["scenarioId", "operatorId", "workareaId", "representation"].forEach((field) => {
      if (event[field] !== undefined && !hasText(event[field])) errors.push(`${field} debe ser texto no vacío cuando exista.`);
    });
    if (event.decisionBasis !== undefined && (!Array.isArray(event.decisionBasis) || event.decisionBasis.some((item) => !hasText(item)))) errors.push("decisionBasis debe ser un array de textos no vacíos.");
    if (event.cacheState !== undefined && (!isRecord(event.cacheState) || !Array.isArray(event.cacheState.residentBlockIds) || !Number.isInteger(event.cacheState.capacityBlocks) || event.cacheState.capacityBlocks < 1)) errors.push("cacheState debe declarar residentBlockIds y capacityBlocks educativo válido.");
    if (event.workareaState !== undefined && (!isRecord(event.workareaState) || !Number.isInteger(event.workareaState.memoryBudgetUnits) || event.workareaState.memoryBudgetUnits < 1 || !Number.isInteger(event.workareaState.estimatedWorkUnits) || event.workareaState.estimatedWorkUnits < 0 || !Number.isInteger(event.workareaState.temporaryPasses) || event.workareaState.temporaryPasses < 0 || !hasText(event.workareaState.classification))) errors.push("workareaState debe declarar presupuesto, trabajo, pasadas y clasificación educativa válidos.");
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze(warnings) });
  }

  function adaptEvent(event, options = {}) {
    const validation = validateEvent(event, options);
    if (!validation.valid) throw new TypeError(`Evento de rendimiento inválido: ${validation.errors.join(" ")}`);
    const adapted = {
      step: event.step,
      type: event.type,
      source: event.source,
      target: event.target,
      rowIds: copyFrozen(event.rowIds),
      blockIds: copyFrozen(event.blockIds),
      label: event.label,
      illustrativeMetrics: copyFrozen(event.illustrativeMetrics)
    };
    OPTIONAL_EVENT_FIELDS.forEach((field) => {
      if (event[field] !== undefined) adapted[field] = copyFrozen(event[field]);
    });
    return copyFrozen(adapted);
  }

  function validateTimeline(events, options = {}) {
    if (!Array.isArray(events)) return Object.freeze({ valid: false, errors: Object.freeze(["El timeline debe ser un array de eventos."]), warnings: Object.freeze([]) });
    const errors = [];
    const warnings = [];
    events.forEach((event, index) => {
      const validation = validateEvent(event, options);
      validation.errors.forEach((message) => errors.push(`Evento ${index + 1}: ${message}`));
      validation.warnings.forEach((message) => warnings.push(`Evento ${index + 1}: ${message}`));
      if (event?.step !== index + 1) errors.push(`Evento ${index + 1}: step debe ser ${index + 1}.`);
    });
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze(warnings) });
  }

  function adaptTimeline(events, options = {}) {
    const validation = validateTimeline(events, options);
    if (!validation.valid) throw new TypeError(`Timeline de rendimiento inválido: ${validation.errors.join(" ")}`);
    return Object.freeze(events.map((event) => adaptEvent(event, options)));
  }

  globalThis.OraclePerformanceEventAdapter = Object.freeze({
    BASE_EVENT_FIELDS,
    EXISTING_EVENT_TYPES,
    PERFORMANCE_EVENT_TYPES,
    EVENT_TYPES,
    EXECUTION_LOCATIONS,
    validateEvent,
    adaptEvent,
    validateTimeline,
    adaptTimeline
  });
})();
