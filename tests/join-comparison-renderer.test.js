"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Set, Map, JSON };
context.globalThis = context;
vm.createContext(context);
for (const file of ["content/execution-comparison-scenarios.js", "simulation/join-comparison-engine.js", "renderer/join-comparison-renderer.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const scenario = context.oracleExecutionComparisonScenarios[0];
const timeline = context.OracleJoinComparisonEngine.createTimeline(scenario, "nested");
const state = context.OracleJoinComparisonEngine.stateAt(timeline, 3);
const card = context.OracleJoinComparisonRenderer.renderAlgorithmCard(scenario, "left", timeline, state, { track: "left" });
assert.match(card, /NESTED LOOPS/);
assert.match(card, /data-comparison-event=/);
assert.match(card, /data-comparison-operator="nested"/);
assert.match(card, /comparison-card is-selected/);
const isometric = context.OracleJoinComparisonRenderer.renderIsometricOverview();
assert.match(isometric, /role="img"/);
assert.match(isometric, /isométrica conceptual/);

console.log("join-comparison-renderer: passed");
