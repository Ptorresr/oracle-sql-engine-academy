"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Set, Map, Math };
context.globalThis = context;
vm.createContext(context);

for (const file of [
  "content/performance-scenarios.js",
  "simulation/performance-event-adapter.js",
  "simulation/buffer-cache-engine.js",
  "simulation/workarea-temp-engine.js",
  "simulation/optimizer-cardinality-engine.js",
  "simulation/performance-what-if-engine.js",
  "renderer/performance-what-if-renderer.js"
]) vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });

const scenario = context.oraclePerformanceScenarios.find((candidate) => candidate.id === "finance-settlement-reconciliation");
const comparison = context.OraclePerformanceWhatIfEngine.createComparison(scenario, { b: { memoryBudgetUnits: 4, cacheMode: "warm" } });
const state = context.OraclePerformanceWhatIfEngine.stateAt(comparison, { a: 0, b: 1 });
const renderer = context.OraclePerformanceWhatIfRenderer;

const track = renderer.renderTrack(scenario, comparison.baseline, state.a, { track: "A", index: 0 });
assert.match(track, /Track A/);
assert.match(track, /data-whatif-event-index/);
assert.match(track, /performance-what-if-tech\.svg/);
assert.match(track, /Timeline propio/);
const comparisonMarkup = renderer.renderComparison(comparison);
assert.match(comparisonMarkup, /Resultado lógico comparable/);
assert.match(comparisonMarkup, /La igualdad de cardinalidad no prueba equivalencia/);
const inspector = renderer.renderInspector(state, "B");
assert.match(inspector, /Event Inspector · Track B/);
assert.match(inspector, /Datos involucrados/);
assert.match(inspector, /SQL relacionado/);
assert.match(inspector, /OracleBufferCacheEngine|OracleOptimizerCardinalityEngine|OracleWorkareaTempEngine/);
assert.equal(renderer.escapeHtml("<script>alert(1)</script>"), "&lt;script&gt;alert(1)&lt;/script&gt;", "renderer escapes untrusted text");

const ui = fs.readFileSync(path.join(__dirname, "..", "ui/performance-what-if-lab.js"), "utf8");
assert.match(ui, /whatifMode/);
assert.match(ui, /whatifPlay/);
assert.match(ui, /prefers-reduced-motion/);
assert.match(ui, /aria-pressed/);
assert.match(ui, /OracleAnimatedDataFlow/);
const css = fs.readFileSync(path.join(__dirname, "..", "assets/performance-what-if-lab.css"), "utf8");
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /max-width:\s*768px/);
const svg = fs.readFileSync(path.join(__dirname, "..", "assets/illustrations/performance-what-if-tech.svg"), "utf8");
assert.match(svg, /<title(?:\s|>)/);
assert.match(svg, /<desc(?:\s|>)/);

console.log("performance-what-if-renderer: passed");
