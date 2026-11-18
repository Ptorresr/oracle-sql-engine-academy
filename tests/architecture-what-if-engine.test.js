const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { globalThis: {} };
vm.runInNewContext(fs.readFileSync("simulation/architecture-what-if-engine.js", "utf8"), context);
const engine = context.globalThis.OracleArchitectureWhatIfEngine;
const architecture = { id: "what-if", nodes: [{ id: "a" }, { id: "b" }], edges: [{ id: "flow" }] };
const options = { users: "high", documents: "high", privateConnectivity: "no", authorization: "no" };
const first = engine.compare(architecture, options);
assert.deepStrictEqual(first, engine.compare(architecture, options));
assert.strictEqual(first.illustrative, true);
assert.strictEqual(first.alternative.illustrativeMetrics.complexity, 5);
assert.ok(first.alternative.hypotheses.some((item) => item.includes("autorización")));
assert.deepStrictEqual(JSON.parse(JSON.stringify(first.baseline.facts)), { components: 2, connections: 1 });
assert.deepStrictEqual(architecture, { id: "what-if", nodes: [{ id: "a" }, { id: "b" }], edges: [{ id: "flow" }] });
console.log("architecture-what-if-engine: ok");
