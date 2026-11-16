"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Set, Map, JSON };
context.globalThis = context;
vm.createContext(context);
for (const file of ["content/execution-comparison-scenarios.js", "simulation/join-comparison-engine.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const { oracleExecutionComparisonScenarios: scenarios, OracleJoinComparisonEngine: engine } = context;
const expectedCounts = { retail: 3, finance: 3, warehouse: 5 };

for (const scenario of scenarios) {
  const timelines = ["hash", "nested", "merge"].map((algorithm) => engine.createTimeline(scenario, algorithm));
  assert.ok(engine.compareLogicalResults(...timelines), `${scenario.id} has equivalent logical results`);
  timelines.forEach((timeline) => {
    const replay = engine.createTimeline(scenario, timeline.algorithm);
    assert.deepEqual(JSON.parse(JSON.stringify(timeline.events)), JSON.parse(JSON.stringify(replay.events)), `${scenario.id}/${timeline.algorithm} is deterministic`);
    assert.equal(timeline.results.length, expectedCounts[scenario.id], `${scenario.id}/${timeline.algorithm} result count`);
    assert.ok(timeline.events.every((event, index) => event.step === index + 1 && engine.EVENT_TYPES.includes(event.type)), "typed sequential events");
  });
}

const retail = scenarios.find((scenario) => scenario.id === "retail");
const retailTimelines = ["hash", "nested", "merge"].map((algorithm) => engine.createTimeline(retail, algorithm));
assert.equal(retailTimelines.some((timeline) => timeline.results.some((result) => result.rightId === "p104")), false, "NULL keys do not match");
const finance = scenarios.find((scenario) => scenario.id === "finance");
assert.equal(engine.createTimeline(finance, "nested").results.filter((result) => result.leftId === "l2").length, 2, "duplicate reference emits two rows");
assert.ok(engine.createTimeline(finance, "hash").events.some((event) => event.type === "HASH_BUILD"));
assert.ok(engine.createTimeline(finance, "nested").events.some((event) => event.type === "NESTED_OUTER_ROW"));
assert.ok(engine.createTimeline(finance, "merge").events.some((event) => event.type === "SORT_INPUT"));

console.log("join-comparison-engine: passed");
