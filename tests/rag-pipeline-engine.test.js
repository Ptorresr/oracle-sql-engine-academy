"use strict";
const assert = require("node:assert/strict"); const fs = require("node:fs"); const vm = require("node:vm");
const context = { Object, Array, Number, Math, String, console }; context.globalThis = context; vm.createContext(context);
["content/rag-scenarios.js", "simulation/rag-pipeline-engine.js"].forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), context));
const scenario = context.oracleRagScenarios[0], engine = context.OracleRagPipelineEngine, run = engine.run(scenario, { chunkSize: 4, overlap: 1, topK: 2 });
assert.ok(run.chunks.length > 0); assert.ok(run.chunks.every((chunk) => !chunk.documentId.includes("restricted"))); assert.ok(run.events.some((event) => event.type === "CONTEXT_RETRIEVED"));
assert.equal(engine.chunk("uno dos tres cuatro", 3, 1).length, 2); assert.deepEqual(JSON.parse(JSON.stringify(run)), JSON.parse(JSON.stringify(engine.run(scenario, { chunkSize: 4, overlap: 1, topK: 2 }))));
console.log("rag-pipeline-engine: passed");
