"use strict";
const assert = require("node:assert/strict"); const fs = require("node:fs"); const vm = require("node:vm");
const context = { Object, Array, console }; context.globalThis = context; vm.createContext(context);
["content/select-ai-scenarios.js", "simulation/select-ai-flow-engine.js"].forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), context));
const run = context.OracleSelectAiFlowEngine.run(context.oracleSelectAiScenarios[0]);
assert.deepEqual(JSON.parse(JSON.stringify(run.events.map((event) => event.type))), ["PROMPT_RECEIVED", "SCHEMA_CONTEXT_PREPARED", "SQL_PROPOSED", "SQL_VALIDATED", "SQL_RESULT_SIMULATED"]);
assert.match(run.events[2].explanation.dba, /predefinido/); assert.deepEqual(JSON.parse(JSON.stringify(run)), JSON.parse(JSON.stringify(context.OracleSelectAiFlowEngine.run(context.oracleSelectAiScenarios[0]))));
console.log("select-ai-flow-engine: passed");
