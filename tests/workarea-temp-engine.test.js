"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Set, Map, Math };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/performance-scenarios.js", "simulation/performance-event-adapter.js", "simulation/workarea-temp-engine.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oraclePerformanceScenarios: scenarios, OracleWorkareaTempEngine: engine, OraclePerformanceEventAdapter: adapter } = context;
const byId = (id) => scenarios.find((scenario) => scenario.id === id);
const retail = byId("retail-order-fulfillment");
const finance = byId("finance-settlement-reconciliation");
const warehouse = byId("warehouse-sales-aggregation");

for (const scenario of scenarios) {
  const first = engine.createTimeline(scenario);
  const second = engine.createTimeline(scenario);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(second)), `${scenario.id} remains deterministic`);
  assert.equal(adapter.validateTimeline(first.events).valid, true, `${scenario.id} timeline follows the shared contract`);
  assert.ok(Object.isFrozen(first), "timeline is immutable");
  assert.ok(Object.isFrozen(first.parameters), "normalized parameters are immutable");
  first.events.forEach((event, index) => {
    assert.equal(event.step, index + 1, "steps stay sequential");
    assert.ok(engine.EVENT_TYPES.includes(event.type), `${event.type} is emitted by the workarea engine`);
    assert.ok(Object.isFrozen(event.workareaState), "workarea snapshots are immutable");
    assert.equal(event.workareaState.classification, first.parameters.classification, "event state stays synchronized with the timeline classification");
  });
  const finalState = engine.stateAt(first, first.events.length - 1);
  assert.equal(finalState.current.type, "WORKAREA_COMPLETE", "timelines always finish explicitly");
  assert.equal(finalState.metrics.tempEvents, finalState.metrics.tempWriteEvents + finalState.metrics.tempReadEvents, "TEMP metrics do not double count");
}

const optimal = engine.createTimeline(retail);
assert.equal(optimal.parameters.classification, "OPTIMAL", "retail default is the optimal educational scenario");
assert.equal(optimal.events.some((event) => event.type === "TEMP_WRITE" || event.type === "TEMP_READ"), false, "optimal does not emit TEMP events");

const onePass = engine.createTimeline(finance);
assert.equal(onePass.parameters.classification, "ONE_PASS", "finance default is the one-pass educational scenario");
assert.equal(onePass.events.filter((event) => event.type === "TEMP_WRITE").length, 1, "one-pass emits one conceptual TEMP write");
assert.equal(onePass.events.filter((event) => event.type === "TEMP_READ").length, 1, "one-pass emits one conceptual TEMP read");

const multiPass = engine.createTimeline(warehouse);
assert.equal(multiPass.parameters.classification, "MULTI_PASS", "warehouse default is the multi-pass educational scenario");
assert.ok(multiPass.parameters.temporaryPasses >= 2, "multi-pass declares multiple temporary phases");
assert.equal(multiPass.events.filter((event) => event.type === "TEMP_WRITE").length, multiPass.parameters.temporaryPasses, "each temporary phase has one write");
assert.equal(multiPass.events.filter((event) => event.type === "TEMP_READ").length, multiPass.parameters.temporaryPasses, "each temporary phase has one matching read");
assert.equal(multiPass.events.some((event) => event.type === "SPILL_TEMP"), false, "the new engine does not reinterpret historical SPILL_TEMP events");

const sortOnePass = engine.createTimeline(retail, { operation: "SORT", rows: 12, rowUnits: 2, memoryBudgetUnits: 16, distribution: "mixed" });
assert.equal(sortOnePass.parameters.operation, "SORT", "SORT remains a selectable operation");
assert.equal(sortOnePass.parameters.classification, "ONE_PASS", "SORT follows the documented local rule");

const zeroRows = engine.createTimeline(warehouse, { rows: 0, memoryBudgetUnits: 1 });
assert.equal(zeroRows.parameters.classification, "OPTIMAL", "zero rows stay optimal in the educational model");
assert.equal(zeroRows.events.some((event) => event.type.startsWith("TEMP_")), false, "zero rows never fabricate TEMP events");

const bounded = engine.normalizeParameters(warehouse, { rows: 9999, rowUnits: 999, memoryBudgetUnits: 0 });
assert.equal(bounded.rows, engine.MAX_ROWS, "row input is bounded");
assert.equal(bounded.rowUnits, engine.MAX_ROW_UNITS, "row-unit input is bounded");
assert.equal(bounded.memoryBudgetUnits, 1, "memory input has an educational lower bound");
assert.throws(() => engine.createTimeline({ tables: [], blockLayout: [] }), /perfil educativo/, "missing workarea model fails explicitly");

console.log("workarea-temp-engine: passed");
