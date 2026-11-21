"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/performance-scenarios.js", "simulation/performance-event-adapter.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oraclePerformanceScenarios: scenarios, OraclePerformanceScenarioCatalog: catalog, OraclePerformanceEventAdapter: adapter } = context;

assert.equal(scenarios.length, 3, "foundation includes Retail, Finanzas and Data Warehouse scenarios");
assert.equal(new Set(scenarios.map((scenario) => scenario.id)).size, scenarios.length, "scenario IDs are unique");
assert.equal(catalog.SCHEMA_VERSION, 1, "scenario schema version is explicit");

for (const scenario of scenarios) {
  for (const property of ["definition", "mechanism", "purpose", "internalProcessing", "developerFocus", "dbaFocus", "sql", "tables", "blockLayout", "accessPattern", "statisticsModel", "memoryModel", "workareaModel", "optimizerModel", "assumptions", "limitations", "seed"]) {
    assert.ok(property in scenario, `${scenario.id} declares ${property}`);
  }
  assert.ok(Object.isFrozen(scenario), `${scenario.id} is immutable`);
  assert.ok(Object.isFrozen(scenario.tables), `${scenario.id} nested tables are immutable`);
  assert.ok(scenario.tables.flatMap((table) => table.rows).some((row) => Object.values(row).includes(null)), `${scenario.id} keeps a visible NULL case`);
}

assert.equal(catalog.getScenario("retail-order-fulfillment").domain, "Retail");
assert.equal(catalog.getScenario("missing-scenario"), null, "unknown scenarios are explicit");

const legacyEvent = {
  step: 1,
  type: "READ_BLOCK",
  source: "SQL Execution Engine",
  target: "Datafile · ORDERS-B01",
  rowIds: [],
  blockIds: ["ORDERS-B01"],
  label: "Solicitud lógica de bloque.",
  illustrativeMetrics: { logicalReads: 1 },
  explanation: "La solicitud lógica no demuestra una lectura física."
};
const adaptedLegacy = adapter.adaptEvent(legacyEvent);
assert.deepEqual(JSON.parse(JSON.stringify(adaptedLegacy)), legacyEvent, "adapter preserves the existing event contract without new fields");
assert.ok(Object.isFrozen(adaptedLegacy), "adapted event is immutable");
assert.ok(Object.isFrozen(adaptedLegacy.blockIds), "adapted block IDs are immutable");
assert.ok(Object.isFrozen(adaptedLegacy.illustrativeMetrics), "adapted metrics are immutable");

const cardinalityEvent = {
  step: 1,
  type: "CARDINALITY_ESTIMATE",
  source: "Statistics model",
  target: "Access-path decision",
  rowIds: [],
  blockIds: [],
  label: "El modelo estima 120 filas a partir de entradas declaradas.",
  illustrativeMetrics: { inputRows: 1200, declaredSelectivity: 0.1, estimatedRows: 120 },
  scenarioId: "retail-order-fulfillment",
  operatorId: "access-orders",
  executionLocation: "EDUCATIONAL_ABSTRACTION",
  representation: "estimate",
  explanation: {
    what: "Estimación educativa de cardinalidad.",
    where: "Modelo de estadísticas del escenario.",
    why: "Expone la regla local sin representar una decisión real del CBO."
  },
  decisionBasis: ["inputRows", "declaredSelectivity"]
};
const adaptedCardinality = adapter.adaptEvent(cardinalityEvent);
assert.equal(adaptedCardinality.type, "CARDINALITY_ESTIMATE");
assert.ok(Object.isFrozen(adaptedCardinality.explanation), "structured explanations are immutable");
assert.ok(Object.isFrozen(adaptedCardinality.decisionBasis), "decision basis is immutable");

const timeline = [legacyEvent, { ...cardinalityEvent, step: 2 }];
const firstTimeline = adapter.adaptTimeline(timeline);
const secondTimeline = adapter.adaptTimeline(timeline);
assert.deepEqual(JSON.parse(JSON.stringify(firstTimeline)), JSON.parse(JSON.stringify(secondTimeline)), "adapted timelines are deterministic");
assert.ok(Object.isFrozen(firstTimeline), "adapted timeline is immutable");
assert.equal(adapter.validateTimeline(firstTimeline).valid, true, "adapted timeline satisfies its contract");

const workareaEvent = {
  step: 1,
  type: "WORKAREA_PROCESS",
  source: "SQL Operation",
  target: "PGA / Work Area",
  rowIds: ["LEDGER-01"],
  blockIds: ["LEDGER-B01"],
  label: "El modelo procesa una fase educativa de workarea.",
  illustrativeMetrics: { rowsProcessed: 12, memoryBudgetUnits: 16, estimatedWorkUnits: 30, tempEvents: 0 },
  scenarioId: "finance-settlement-reconciliation",
  operatorId: "op-sort-workarea",
  workareaId: "pga-workarea-educational",
  executionLocation: "EDUCATIONAL_ABSTRACTION",
  representation: "workarea-temp",
  workareaState: { memoryBudgetUnits: 16, estimatedWorkUnits: 30, temporaryPasses: 1, classification: "ONE_PASS" },
  explanation: { what: "Procesamiento educativo.", where: "PGA conceptual", why: "Explica una regla local." }
};
const adaptedWorkarea = adapter.adaptEvent(workareaEvent);
assert.equal(adaptedWorkarea.type, "WORKAREA_PROCESS");
assert.ok(Object.isFrozen(adaptedWorkarea.workareaState), "workarea state is immutable");
assert.equal(adapter.validateEvent({ ...workareaEvent, workareaState: { memoryBudgetUnits: 0, estimatedWorkUnits: 30, temporaryPasses: 1, classification: "ONE_PASS" } }).valid, false, "invalid workarea state is rejected");

assert.equal(adapter.validateEvent({ ...legacyEvent, type: "NOT_A_REAL_EVENT" }).valid, false, "unknown events are rejected by default");
assert.equal(adapter.validateEvent({ ...legacyEvent, type: "NOT_A_REAL_EVENT" }, { allowUnknownTypes: true }).valid, true, "unknown events can be surfaced as warnings during migration");
assert.throws(() => adapter.adaptEvent({ ...legacyEvent, rowIds: "ORD-01" }), /rowIds/, "row IDs must remain an array");
assert.throws(() => adapter.adaptEvent({ ...legacyEvent, illustrativeMetrics: [] }), /illustrativeMetrics/, "metrics must remain an object");
assert.throws(() => adapter.adaptEvent({ ...legacyEvent, executionLocation: "DATABASE_REAL" }), /executionLocation/, "real execution locations are not accepted");
assert.throws(() => adapter.adaptTimeline([{ ...legacyEvent, step: 2 }]), /step debe ser 1/, "timeline steps must be sequential");

console.log("performance-event-contract: passed");
