"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Set, Map };
context.globalThis = context;
vm.createContext(context);

for (const file of ["content/performance-scenarios.js", "simulation/performance-event-adapter.js", "simulation/buffer-cache-engine.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oraclePerformanceScenarios: scenarios, OracleBufferCacheEngine: engine } = context;

for (const scenario of scenarios) {
  const first = engine.createTimeline(scenario);
  const second = engine.createTimeline(scenario);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(second)), `${scenario.id} remains deterministic`);
  assert.equal(first.events.length, first.requests.length * 3, `${scenario.id} emits request, cache outcome and table access per block`);
  first.events.forEach((event, index) => {
    assert.equal(event.step, index + 1, "steps remain sequential");
    assert.ok(engine.EVENT_TYPES.includes(event.type), `event ${event.type} is supported`);
    assert.ok(Object.isFrozen(event.cacheState), "cache state is frozen per event");
    assert.ok(event.cacheState.residentBlockIds.length <= first.parameters.capacityBlocks, "cache never exceeds conceptual capacity");
  });
  const finalState = engine.stateAt(first, first.events.length - 1);
  assert.equal(finalState.metrics.logicalRequests, first.requests.length, "logical requests are counted once per request");
  assert.equal(finalState.metrics.cacheHits + finalState.metrics.cacheMisses, first.requests.length, "each request resolves to exactly one hit or miss");
  assert.equal(finalState.metrics.conceptualPhysicalReads, finalState.metrics.cacheMisses, "physical reads stay conceptual and follow misses in this model");
}

const retail = scenarios.find((scenario) => scenario.id === "retail-order-fulfillment");
const warmRetail = engine.createTimeline(retail, { cacheMode: "warm", accessPattern: "declared", requestCount: 4, capacityBlocks: 3 });
assert.ok(warmRetail.events.some((event) => event.type === "CACHE_HIT" && event.blockIds.includes("PRODUCTS-B01")), "warm seed produces a deterministic conceptual hit");
assert.equal(warmRetail.events.some((event) => event.type === "SPILL_TEMP"), false, "buffer cache lab does not emit TEMP events");

const repeatedRetail = engine.createTimeline(retail, { cacheMode: "cold", accessPattern: "reused", requestCount: 3, capacityBlocks: 1 });
assert.equal(repeatedRetail.events.filter((event) => event.type === "CACHE_MISS").length, 1, "repeated request starts cold once");
assert.equal(repeatedRetail.events.filter((event) => event.type === "CACHE_HIT").length, 2, "repeated request reuses the conceptual resident block");

const sequentialRetail = engine.createTimeline(retail, { cacheMode: "cold", accessPattern: "sequential", requestCount: 5, capacityBlocks: 1 });
assert.equal(engine.stateAt(sequentialRetail, 0).cacheState.capacityBlocks, 1, "state reflects selected cache capacity");
assert.ok(engine.stateAt(sequentialRetail, sequentialRetail.events.length - 1).deliveredRowIds.includes("ITEM-03"), "state retains represented NULL row IDs without matching semantics");
assert.equal(engine.normalizeParameters(retail, { capacityBlocks: 999, requestCount: 999 }).requestCount, engine.MAX_REQUESTS, "parameters are bounded deterministically");
assert.equal(engine.normalizeParameters(retail, { capacityBlocks: 0 }).capacityBlocks, 1, "cache capacity has an educational lower bound");

console.log("buffer-cache-engine: passed");
