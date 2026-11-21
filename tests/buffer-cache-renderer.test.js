"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Set, Map };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/performance-scenarios.js", "simulation/performance-event-adapter.js", "simulation/buffer-cache-engine.js", "renderer/buffer-cache-renderer.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oraclePerformanceScenarios: scenarios, OracleBufferCacheEngine: engine, OracleBufferCacheRenderer: renderer } = context;
const scenario = scenarios[0];
const timeline = engine.createTimeline(scenario, { cacheMode: "warm", accessPattern: "declared", requestCount: 4, capacityBlocks: 3 });
const hitIndex = timeline.events.findIndex((event) => event.type === "CACHE_HIT");
const state = engine.stateAt(timeline, hitIndex);

const developer = renderer.renderDeveloper(scenario, state, { kind: "block", id: "PRODUCTS-B01" });
assert.ok(developer.includes("data-buffer-block=\"PRODUCTS-B01\""));
assert.ok(developer.includes("data-buffer-row=\"PROD-01\""));
assert.ok(developer.includes("is-selected"));

const plan = renderer.renderPlan(state, { kind: "operator", id: "cache-lookup" });
assert.ok(plan.includes("data-buffer-operator=\"cache-lookup\""));
assert.ok(plan.includes("Flujo conceptual"));
assert.ok(plan.includes("No es un plan"));

const internals = renderer.renderInternals(state, { kind: "component", id: "Database Buffer Cache" });
assert.ok(internals.includes("assets/illustrations/buffer-cache-tech.svg"));
assert.ok(internals.includes("data-buffer-component=\"Database Buffer Cache\""));
assert.ok(internals.includes("role=\"img\""));
assert.ok(internals.includes("FIFO"));

const index = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const loader = fs.readFileSync(path.join(__dirname, "..", "assets/portal.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets/buffer-cache-lab.css"), "utf8");
const ui = fs.readFileSync(path.join(__dirname, "..", "ui/buffer-cache-lab.js"), "utf8");
assert.ok(index.includes('id="bufferCacheLab"'));
assert.ok(loader.includes("loadBufferCacheLab"));
assert.ok(loader.includes("simulation/buffer-cache-engine.js"));
assert.ok(ui.includes("OracleAnimatedDataFlow"));
assert.ok(ui.includes("prefers-reduced-motion"));
assert.ok(css.includes("prefers-reduced-motion"));

console.log("buffer-cache-renderer: passed");
