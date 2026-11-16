"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Set, Map };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/hash-join-scenarios.js", "simulation/hash-join-engine.js", "renderer/hash-join-renderer.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const scenario = context.oracleHashJoinScenarios[0];
const timeline = context.OracleHashJoinEngine.createTimeline(scenario);
const state = context.OracleHashJoinEngine.stateAt(timeline, 5);
const renderer = context.OracleHashJoinRenderer;

const developer = renderer.renderDeveloper(scenario, state, { kind: "row", id: "c1" });
assert.match(developer, /data-engine-row="c1"/);
assert.match(developer, /data-engine-block="CUST-01"/);
assert.match(developer, /is-selected/);

const plan = renderer.renderPlan(scenario, state, { kind: "operator", id: "hash-build" });
assert.match(plan, /data-engine-operator="hash-build"/);
assert.match(plan, /plan-operator[^>]*is-selected/);

const internals = renderer.renderInternals(scenario, state, { kind: "component", id: "PGA Hash Workarea" });
assert.match(internals, /data-engine-component="PGA Hash Workarea"/);
assert.match(internals, /engine-node-selected/);
assert.match(internals, /role="button"/);

console.log("hash-join-renderer: passed");
