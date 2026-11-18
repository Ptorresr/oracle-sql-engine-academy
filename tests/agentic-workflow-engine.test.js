"use strict";
const assert = require("node:assert/strict"); const fs = require("node:fs"); const vm = require("node:vm");
const context = { Object, Array, console }; context.globalThis = context; vm.createContext(context);
["content/agentic-scenarios.js", "simulation/agentic-workflow-engine.js"].forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), context));
const engine = context.OracleAgenticWorkflowEngine; const allowed = engine.run(context.oracleAgenticScenarios[0]); const denied = engine.run(context.oracleAgenticScenarios[2]);
assert.equal(allowed.permitted, true); assert.equal(denied.permitted, false); assert.match(denied.events[2].label, /rechazada/); assert.equal(denied.events[3].illustrativeMetrics.executionLimit, 0);
assert.deepEqual(JSON.parse(JSON.stringify(denied)), JSON.parse(JSON.stringify(engine.run(context.oracleAgenticScenarios[2]))));
console.log("agentic-workflow-engine: passed");
