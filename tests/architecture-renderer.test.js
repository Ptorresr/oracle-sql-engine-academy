const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { globalThis: {} };
vm.runInNewContext(fs.readFileSync("renderer/architecture-canvas-renderer.js", "utf8"), context);
vm.runInNewContext(fs.readFileSync("renderer/architecture-flow-renderer.js", "utf8"), context);
vm.runInNewContext(fs.readFileSync("renderer/architecture-inspector-renderer.js", "utf8"), context);

const architecture = {
  name: "<Retail>",
  nodes: [{ id: "user", componentId: "user", label: "<User>", zone: "EXTERNAL" }, { id: "db", componentId: "ai-database", label: "Database", zone: "PRIVATE_DATA" }],
  edges: [{ id: "flow", source: "user", target: "db", relationship: "DATABASE_QUERY" }]
};
const canvas = context.globalThis.OracleArchitectureCanvasRenderer.render(architecture, { selectedNodeId: "db", selectedEdgeId: "flow", activeNodeIds: ["user", "db"] });
assert.ok(canvas.includes('role="group"'));
assert.ok(canvas.includes('data-architecture-node="db"'));
assert.ok(canvas.includes('data-architecture-edge="flow"'));
assert.ok(canvas.includes("architecture-node is-active"));
assert.ok(canvas.includes("&lt;Retail&gt;"));

const event = { step: 1, type: "DATABASE_QUERY", label: "Query", executionLocation: "DATABASE_SIMULATED", explanation: { what: "Reads", where: "AUTHENTICATED", why: "Educational", dba: "Illustrative" } };
const flow = { events: [event] };
assert.ok(context.globalThis.OracleArchitectureFlowRenderer.render(flow, 1).includes("is-current"));
assert.ok(context.globalThis.OracleArchitectureFlowRenderer.inspector(event).includes("métricas ilustrativas"));
assert.ok(context.globalThis.OracleArchitectureInspectorRenderer.component({ label: "DB", zone: "PRIVATE_DATA" }, { responsibility: "Stores", security: "IAM", deployable: true, capabilities: [], related: [], limitations: "Local" }, "#ai-vector-search").includes("#ai-vector-search"));
console.log("architecture-renderer: ok");
