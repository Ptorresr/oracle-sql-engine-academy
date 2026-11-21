"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Set, Map, Math };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/performance-scenarios.js", "simulation/performance-event-adapter.js", "simulation/optimizer-cardinality-engine.js", "renderer/optimizer-cardinality-renderer.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oraclePerformanceScenarios: scenarios, OracleOptimizerCardinalityEngine: engine, OracleOptimizerCardinalityRenderer: renderer } = context;
const scenario = scenarios.find((candidate) => candidate.id === "warehouse-sales-aggregation");
const timeline = engine.createTimeline(scenario, { distribution: "uniform" });
const state = engine.stateAt(timeline, 1);

const developer = renderer.renderDeveloper(scenario, state, { kind: "row", id: "FACT-02" });
assert.ok(developer.includes("data-optimizer-row=\"FACT-02\""));
assert.ok(developer.includes("NULL"));
assert.ok(developer.includes("is-selected"));

const plan = renderer.renderPlan(state, { kind: "operator", id: "SORT_MERGE_EDUCATIONAL" });
assert.ok(plan.includes("Regla educativa visible"));
assert.ok(plan.includes("SORT_MERGE_EDUCATIONAL"));
assert.ok(plan.includes("no un plan"));

const internals = renderer.renderInternals(scenario, state, { kind: "component", id: "Cardinality Estimator" });
assert.ok(internals.includes("assets/illustrations/optimizer-cardinality-tech.svg"));
assert.ok(internals.includes("role=\"img\""));
assert.ok(internals.includes("data-optimizer-component=\"Cardinality Estimator\""));

const results = renderer.renderResults(scenario, state, { kind: "component", id: "Logical Result Set" });
assert.ok(results.includes("Observación"));
assert.ok(results.includes("Ausente"));
assert.ok(results.includes("NULL"));

const asset = fs.readFileSync(path.join(__dirname, "..", "assets/illustrations/optimizer-cardinality-tech.svg"), "utf8");
assert.ok(asset.includes("Optimizer y Cardinality educativo"));
assert.ok(asset.includes("<desc"));

const ui = fs.readFileSync(path.join(__dirname, "..", "ui/optimizer-cardinality-lab.js"), "utf8");
assert.ok(ui.includes("optimizer-cardinality-preview"));
assert.ok(ui.includes("aria-expanded"));
assert.ok(ui.includes("OracleAnimatedDataFlow"));
assert.ok(ui.includes('matchMedia("(prefers-reduced-motion: reduce)")'));
assert.ok(ui.includes("Ver SQL relacionado"));
assert.ok(ui.includes("Tutor local basado en reglas"));

const stylesheet = fs.readFileSync(path.join(__dirname, "..", "assets/optimizer-cardinality-lab.css"), "utf8");
assert.ok(stylesheet.includes("@media (max-width: 620px)"));
assert.ok(stylesheet.includes("prefers-reduced-motion"));

const portal = fs.readFileSync(path.join(__dirname, "..", "assets/portal.js"), "utf8");
assert.ok(portal.includes("loadOptimizerCardinalityLab"));
assert.ok(portal.includes("optimizer-cardinality-engine.js"));

console.log("optimizer-cardinality-renderer: passed");
