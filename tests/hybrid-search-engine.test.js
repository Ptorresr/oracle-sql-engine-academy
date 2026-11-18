"use strict";
const assert = require("node:assert/strict"); const fs = require("node:fs"); const vm = require("node:vm");
const context = { Object, Array, Number, Math, String, Set, console }; context.globalThis = context; vm.createContext(context);
["content/hybrid-search-scenarios.js", "simulation/hybrid-search-engine.js"].forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), context));
const engine = context.OracleHybridSearchEngine; const run = engine.run(context.oracleHybridSearchScenarios[0], { textWeight: .7 });
assert.equal(run.results[0].id, "hy-retail-1"); assert.equal(run.textWeight, .7); assert.equal(run.vectorWeight, .3); assert.equal(run.events.length, 4);
assert.deepEqual(JSON.parse(JSON.stringify(run)), JSON.parse(JSON.stringify(engine.run(context.oracleHybridSearchScenarios[0], { textWeight: .7 }))));
console.log("hybrid-search-engine: passed");
