"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Set, Map, Math };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/performance-scenarios.js", "simulation/performance-event-adapter.js", "simulation/workarea-temp-engine.js", "renderer/workarea-temp-renderer.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oraclePerformanceScenarios: scenarios, OracleWorkareaTempEngine: engine, OracleWorkareaTempRenderer: renderer } = context;
const scenario = scenarios.find((candidate) => candidate.id === "finance-settlement-reconciliation");
const timeline = engine.createTimeline(scenario);
const tempIndex = timeline.events.findIndex((event) => event.type === "TEMP_WRITE");
const state = engine.stateAt(timeline, tempIndex);

const developer = renderer.renderDeveloper(scenario, state, { kind: "block", id: "LEDGER-B01" });
assert.ok(developer.includes("data-workarea-block=\"LEDGER-B01\""));
assert.ok(developer.includes("data-workarea-row=\"LEDGER-01\""));
assert.ok(developer.includes("is-selected"));

const plan = renderer.renderPlan(state, { kind: "operator", id: "temp" });
assert.ok(plan.includes("data-workarea-operator=\"temp\""));
assert.ok(plan.includes("Este flujo conceptual"));
assert.ok(plan.includes("DBMS_XPLAN"));

const internals = renderer.renderInternals(state, { kind: "component", id: "TEMP" });
assert.ok(internals.includes("assets/illustrations/workarea-temp-tech.svg"));
assert.ok(internals.includes("data-workarea-component=\"PGA / Work Area\""));
assert.ok(internals.includes("data-workarea-component=\"TEMP\""));
assert.ok(internals.includes("role=\"img\""));

const results = renderer.renderResults(state, { kind: "component", id: "Results" });
assert.ok(results.includes("One-Pass educativo"));
assert.ok(results.includes("eventos TEMP"));

const portal = fs.readFileSync(path.join(__dirname, "..", "assets/portal.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets/workarea-temp-lab.css"), "utf8");
const ui = fs.readFileSync(path.join(__dirname, "..", "ui/workarea-temp-lab.js"), "utf8");
assert.ok(portal.includes("loadWorkareaTempLab"));
assert.ok(portal.includes("simulation/workarea-temp-engine.js"));
assert.ok(portal.includes("assets/workarea-temp-lab.css"));
assert.ok(ui.includes("OracleAnimatedDataFlow"));
assert.ok(ui.includes("prefers-reduced-motion"));
assert.ok(ui.includes("function applyScenarioDefaults()"));
assert.ok(ui.includes("applyScenarioDefaults();\n  buildTimeline();"));
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(css.includes("workarea-layout"));

console.log("workarea-temp-renderer: passed");
