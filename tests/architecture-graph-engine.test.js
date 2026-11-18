const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { globalThis: {} };
vm.runInNewContext(fs.readFileSync("simulation/architecture-graph-engine.js", "utf8"), context);
const engine = context.globalThis.OracleArchitectureGraphEngine;
const architecture = { id: "test", nodes: [{ id: "user", componentId: "user", label: "User" }, { id: "api", componentId: "api", label: "API" }], edges: [{ id: "request", source: "user", target: "api", relationship: "HTTPS_REQUEST" }] };

const cloned = engine.clone(architecture);
assert.deepStrictEqual(JSON.parse(JSON.stringify(cloned)), architecture);
cloned.nodes[0].label = "Changed";
assert.strictEqual(architecture.nodes[0].label, "User");

const withNode = engine.addNode(architecture, { id: "db", componentId: "ai-database", label: "Database" });
assert.strictEqual(withNode.nodes.length, 3);
assert.strictEqual(engine.addNode(withNode, withNode.nodes[2]), withNode);

const withEdge = engine.addEdge(withNode, { id: "query", source: "api", target: "db", relationship: "DATABASE_QUERY" });
assert.strictEqual(withEdge.edges.length, 2);
assert.strictEqual(engine.addEdge(withEdge, { id: "invalid", source: "api", target: "missing", relationship: "DATABASE_QUERY" }), withEdge);
assert.strictEqual(engine.addEdge(withEdge, { id: "invalid-type", source: "api", target: "db", relationship: "UNKNOWN" }), withEdge);
assert.strictEqual(engine.removeNode(withEdge, "api").edges.length, 0);

const findings = engine.validate({ ...architecture, nodes: [...architecture.nodes, { id: "orphan", componentId: "logging", label: "Logging" }], edges: [...architecture.edges, { id: "broken", source: "api", target: "missing", relationship: "UNKNOWN" }] });
assert.ok(findings.some((finding) => finding.category === "STRUCTURE"));
assert.ok(findings.some((finding) => finding.category === "RELATIONSHIP"));
assert.ok(findings.some((finding) => finding.category === "CONNECTIVITY"));
console.log("architecture-graph-engine: ok");
