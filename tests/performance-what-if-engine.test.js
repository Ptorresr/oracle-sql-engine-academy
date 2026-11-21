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
  "simulation/performance-what-if-engine.js"
]) vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });

const { oraclePerformanceScenarios: scenarios, OraclePerformanceWhatIfEngine: engine, OraclePerformanceEventAdapter: adapter } = context;
const retail = scenarios.find((scenario) => scenario.id === "retail-order-fulfillment");
const finance = scenarios.find((scenario) => scenario.id === "finance-settlement-reconciliation");
const warehouse = scenarios.find((scenario) => scenario.id === "warehouse-sales-aggregation");

assert.ok(Object.isFrozen(retail.whatIfModel), "what-if model is immutable content");
assert.ok(retail.whatIfModel.allowedParameters.includes("selectivity"));

const retailVariant = engine.normalizeVariant(retail, { selectivity: 0.1, indexAvailable: false, ignored: "nope" });
assert.equal(retailVariant.optimizer.declaredSelectivity, 0.1);
assert.equal(retailVariant.optimizer.indexAvailable, false);
assert.equal(retailVariant.cache.capacityBlocks, 3, "initial cache values flow through existing normalization");
assert.ok(Object.isFrozen(retailVariant));

const retailTrack = engine.createTrack(retail, { selectivity: 0.1 }, "A");
const repeatTrack = engine.createTrack(retail, { selectivity: 0.1 }, "A");
assert.deepEqual(JSON.parse(JSON.stringify(retailTrack)), JSON.parse(JSON.stringify(repeatTrack)), "tracks are deterministic");
assert.ok(Object.isFrozen(retailTrack.events));
assert.ok(retailTrack.events.every((event, index) => event.step === index + 1), "composed timeline has sequential steps");
assert.equal(adapter.validateTimeline(retailTrack.events).valid, true, "composed events retain the existing contract");
assert.ok(retailTrack.events.some((event) => event.type === "CARDINALITY_ESTIMATE"));
assert.ok(retailTrack.events.some((event) => event.type === "CACHE_HIT"));
assert.ok(retailTrack.events.some((event) => event.type === "WORKAREA_COMPLETE"));

const retailComparison = engine.createComparison(retail, { a: {}, b: { selectivity: 0.1, indexAvailable: false } });
assert.equal(retailComparison.comparability.comparable, true, "retail selectivity/index hypothesis preserves declared population");
assert.ok(retailComparison.summary.changed.includes("estimatedRows"));
assert.notEqual(retailComparison.baseline.parameters.optimizer.estimatedRows, retailComparison.variant.parameters.optimizer.estimatedRows, "B changes without mutating A");
assert.equal(retailComparison.baseline.parameters.optimizer.declaredSelectivity, 0.02, "A retains original snapshot");
assert.equal(retail.optimizerModel.defaultSelectivity, 0.02, "scenario content remains unchanged");

const financeComparison = engine.createComparison(finance, { a: {}, b: { cacheMode: "warm", capacityBlocks: 1, memoryBudgetUnits: 4 } });
assert.equal(financeComparison.comparability.comparable, true, "cache and workarea changes preserve finance logical identity");
assert.ok(financeComparison.summary.changed.some((key) => ["cacheHits", "cacheMisses", "workareaClassification", "temporaryPasses", "tempEvents"].includes(key)), "finance exposes derived educational differences");

const warehouseComparable = engine.createComparison(warehouse, { a: {}, b: { optimizerDistribution: "uniform", workareaOperation: "SORT" } });
assert.equal(warehouseComparable.comparability.comparable, true, "warehouse alternative remains comparable on same declared population and volume");
const warehouseChangedVolume = engine.createComparison(warehouse, { a: {}, b: { baseRows: 10000000, workareaRows: 120 } });
assert.equal(warehouseChangedVolume.comparability.comparable, false, "warehouse volume changes are explicitly not comparable");
assert.match(warehouseChangedVolume.comparability.reason, /volumen/i);
const warehousePopulation = engine.createComparison(warehouse, { a: {}, b: { populationId: "warehouse-different-population" } });
assert.equal(warehousePopulation.comparability.comparable, false, "different population identifiers are never comparable");
assert.match(warehousePopulation.comparability.reason, /poblaciones/i);

const state = engine.stateAt(financeComparison, { a: 0, b: financeComparison.variant.events.length - 1 });
assert.equal(state.a.trackId, "A");
assert.equal(state.b.trackId, "B");
assert.ok(state.a.current && state.b.current, "state resolves independent track positions");
assert.ok(Object.isFrozen(state));
assert.equal(engine.stateAt(financeComparison, 0).a.index, 0, "single index supports synchronized control");
assert.equal(engine.stateAt(financeComparison, { a: -9, b: 9999 }).a.index, 0, "track positions clamp safely");
assert.equal(engine.stateAt(financeComparison, { A: 2, B: 3 }).a.index, 2, "UI-style uppercase track keys preserve A position");
assert.equal(engine.stateAt(financeComparison, { A: 2, B: 3 }).b.index, 3, "UI-style uppercase track keys preserve B position");

const zero = engine.createComparison(retail, { a: {}, b: { selectivity: 0, workareaRows: 0 } });
assert.equal(zero.variant.parameters.optimizer.estimatedRows, 0, "zero selectivity stays explicit");
assert.equal(zero.variant.parameters.workarea.rows, 0, "zero workarea rows stay explicit");
assert.ok(retail.optimizerModel.nullBehavior.includes("NULL"), "NULL behavior remains declared in the source scenario");
assert.ok(finance.optimizerModel.logicalResultRowIds.filter((id) => id.startsWith("LEDGER-02")).length === 2, "duplicate logical source rows stay visible in content");
assert.throws(() => engine.createTrack({}, {}, "A"), /whatIfModel/, "invalid scenario fails explicitly");
assert.throws(() => engine.createTrack(retail, {}, "C"), /A o B/, "invalid track identifier fails explicitly");

console.log("performance-what-if-engine: passed");
