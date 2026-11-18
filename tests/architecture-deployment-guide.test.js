const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { globalThis: {} };
vm.runInNewContext(fs.readFileSync("simulation/architecture-deployment-guide.js", "utf8"), context);
const guide = context.globalThis.OracleArchitectureDeploymentGuide;
const architecture = { id: "guide", nodes: [{ componentId: "database" }, { componentId: "vector" }, { componentId: "database" }] };
const components = [{ id: "database", label: "Database", deployable: true, responsibility: "Stores data" }, { id: "vector", label: "Vector Search", deployable: false }];
const result = guide.build(architecture, components);
assert.strictEqual(result.required.length, 1);
assert.strictEqual(result.capabilities.length, 1);
assert.ok(result.limitations.includes("educativa"));
const changed = guide.build({ id: "changed", nodes: [{ componentId: "vector" }, { componentId: "database" }, { componentId: "new-service" }] }, [...components, { id: "new-service", label: "New Service", deployable: true, responsibility: "New" }]);
assert.deepStrictEqual(JSON.parse(JSON.stringify(changed.required.map((item) => item.id))), ["database", "new-service"]);
assert.deepStrictEqual(JSON.parse(JSON.stringify(changed.capabilities.map((item) => item.id))), ["vector"]);
console.log("architecture-deployment-guide: ok");
