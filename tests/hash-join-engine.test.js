"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Set, Map };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/hash-join-scenarios.js", "simulation/hash-join-engine.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oracleHashJoinScenarios: scenarios, OracleHashJoinEngine: engine } = context;
const eventTypes = new Set(engine.EVENT_TYPES);

for (const scenario of scenarios) {
  const first = engine.createTimeline(scenario);
  const second = engine.createTimeline(scenario);
  assert.deepEqual(JSON.parse(JSON.stringify(first.events)), JSON.parse(JSON.stringify(second.events)), `${scenario.id} must be deterministic`);
  assert.equal(first.events.at(-1).illustrativeMetrics.outputRows, scenario.expectedRows, `${scenario.id} result cardinality`);
  first.events.forEach((event, index) => {
    assert.equal(event.step, index + 1, "steps must be sequential");
    assert.ok(eventTypes.has(event.type), `known event ${event.type}`);
    for (const property of ["source", "target", "rowIds", "blockIds", "label", "illustrativeMetrics"]) assert.ok(property in event, `event has ${property}`);
  });
}

const retail = engine.createTimeline(scenarios.find((scenario) => scenario.id === "retail"));
assert.equal(retail.events.filter((event) => event.type === "EMIT_ROW").length, 3, "retail emits one row per matching order");
assert.equal(retail.events.some((event) => event.type === "EMIT_ROW" && event.rowIds.includes("p104")), false, "NULL probe key does not match");

const finance = engine.createTimeline(scenarios.find((scenario) => scenario.id === "finance"));
assert.equal(finance.events.filter((event) => event.type === "EMIT_ROW" && event.rowIds.includes("l2")).length, 2, "duplicate reference emits two logical rows");

const warehouse = engine.createTimeline(scenarios.find((scenario) => scenario.id === "warehouse"));
assert.ok(warehouse.events.some((event) => event.type === "SPILL_TEMP"), "warehouse includes a conceptual TEMP spill");
assert.equal(engine.stateAt(warehouse, warehouse.events.length - 1).output.length, 5, "state reconstructs expected output");

console.log("hash-join-engine: passed");
