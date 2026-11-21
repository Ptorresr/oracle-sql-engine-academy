"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Set, Map, Math };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/performance-scenarios.js", "simulation/performance-event-adapter.js", "simulation/optimizer-cardinality-engine.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oraclePerformanceScenarios: scenarios, OracleOptimizerCardinalityEngine: engine, OraclePerformanceEventAdapter: adapter } = context;
const retail = scenarios.find((scenario) => scenario.id === "retail-order-fulfillment");
const finance = scenarios.find((scenario) => scenario.id === "finance-settlement-reconciliation");
const warehouse = scenarios.find((scenario) => scenario.id === "warehouse-sales-aggregation");

const retailParameters = engine.normalizeParameters(retail);
assert.equal(retailParameters.estimatedRows, 20, "retail rounds declared cardinality with ceil");
assert.equal(retailParameters.accessPath, "INDEX_LOOKUP_EDUCATIONAL", "selective indexed retail path is explicit");
assert.equal(retailParameters.joinAlternative, "NESTED_LOOPS_EDUCATIONAL", "retail join alternative follows the visible rule");
assert.ok(retailParameters.formula.includes("ceil"));
assert.ok(retailParameters.roundingRule.includes("arriba"));
assert.ok(Object.isFrozen(retailParameters));

const rounded = engine.normalizeParameters(retail, { baseRows: 101, selectivity: 0.125 });
assert.equal(rounded.estimatedRows, 13, "fractional educational estimates round up");
assert.equal(engine.normalizeParameters(retail, { baseRows: 101, selectivity: 0 }).estimatedRows, 0, "zero selectivity remains zero");
assert.equal(engine.normalizeParameters(retail, { baseRows: 101, selectivity: 1 }).estimatedRows, 101, "selectivity one preserves base rows");
assert.equal(engine.normalizeParameters(retail, { baseRows: 0, selectivity: 1 }).accessPath, "NO_ROWS_EXPECTED", "zero cardinality has an explicit state");

const absent = engine.normalizeParameters(retail, { statisticsStatus: "absent" });
assert.equal(absent.accessPath, "EVIDENCE_INSUFFICIENT", "missing statistics never invent an access decision");
assert.equal(absent.observationRows, null, "missing declared observation remains absent");
assert.equal(absent.observationSource, "not-declared");

const financeParameters = engine.normalizeParameters(finance);
assert.equal(financeParameters.statisticsStatus, "stale", "finance exposes stale statistics");
assert.equal(financeParameters.observationRows, 2, "finance observation is scenario-declared");
assert.equal(financeParameters.observationSource, "scenario-declared-logical-result");
assert.equal(financeParameters.joinAlternative, "HASH_JOIN_EDUCATIONAL", "skewed finance defaults to a visible educational alternative");

const warehouseHash = engine.normalizeParameters(warehouse);
const warehouseMerge = engine.normalizeParameters(warehouse, { distribution: "uniform" });
const warehouseNested = engine.normalizeParameters(warehouse, { baseRows: 1000000, selectivity: 0.05, indexAvailable: true });
assert.equal(warehouseHash.joinAlternative, "HASH_JOIN_EDUCATIONAL", "skewed warehouse defaults to hash alternative");
assert.equal(warehouseMerge.joinAlternative, "SORT_MERGE_EDUCATIONAL", "uniform high-selectivity warehouse selects sort merge educational alternative");
assert.equal(warehouseNested.joinAlternative, "NESTED_LOOPS_EDUCATIONAL", "selective indexed warehouse selects nested loops educational alternative");
assert.notDeepEqual(JSON.parse(JSON.stringify(warehouseHash.decisionBasis)), JSON.parse(JSON.stringify(warehouseMerge.decisionBasis)), "decision basis preserves changed distribution");

const first = engine.createTimeline(finance);
const second = engine.createTimeline(finance);
assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(second)), "same inputs produce the same timeline");
assert.equal(adapter.validateTimeline(first.events).valid, true, "optimizer timeline preserves the event contract");
assert.deepEqual(JSON.parse(JSON.stringify(first.events.map((event) => event.type))), ["CARDINALITY_ESTIMATE", "ACCESS_PATH_SELECTED", "TABLE_ACCESS", "EMIT_ROW", "EMIT_ROW", "EMIT_ROW"]);
assert.ok(first.events.every((event) => event.illustrativeMetrics.illustrative), "all optimizer metrics are labelled illustrative");
assert.ok(first.events.every((event) => event.illustrativeMetrics.metricScope === "optimizer-cardinality-educational-model"));
assert.ok(first.events.every((event) => event.decisionBasis.length > 0));
assert.ok(Object.isFrozen(first.events));

const initial = engine.stateAt(first, 0);
const final = engine.stateAt(first, first.events.length - 1);
assert.deepEqual(JSON.parse(JSON.stringify(initial.emittedRowIds)), [], "initial state emits no logical sample row");
assert.deepEqual(JSON.parse(JSON.stringify(final.emittedRowIds)), ["LEDGER-01/SETTLE-01", "LEDGER-02/SETTLE-02", "LEDGER-02/SETTLE-03"], "duplicate logical source row remains visible in declared output");
assert.ok(finance.optimizerModel.nullBehavior.includes("NULL"), "NULL behavior remains explicit in content");

const noRows = engine.createTimeline(retail, { selectivity: 0 });
assert.deepEqual(JSON.parse(JSON.stringify(noRows.events.map((event) => event.type))), ["CARDINALITY_ESTIMATE", "ACCESS_PATH_SELECTED", "TABLE_ACCESS"], "zero cardinality does not emit result rows");
assert.equal(engine.stateAt(noRows, 2).metrics.estimatedRows, 0);
assert.throws(() => engine.createTimeline({ id: "missing" }), /bloques declarados/, "invalid scenario fails explicitly");
assert.equal(engine.normalizeParameters(retail, { baseRows: -9 }).baseRows, 0, "negative base rows normalize to zero");
assert.equal(engine.normalizeParameters(retail, { selectivity: -1 }).declaredSelectivity, 0, "negative selectivity normalizes to zero");
assert.equal(engine.normalizeParameters(retail, { selectivity: 9 }).declaredSelectivity, 1, "selectivity above one normalizes to one");

console.log("optimizer-cardinality-engine: passed");
