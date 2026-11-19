const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("renderer/animated-data-flow-renderer.js", "utf8");
const context = { globalThis: {}, document: {}, window: {} };
vm.runInNewContext(source, context);
const layer = context.globalThis.OracleAnimatedDataFlow;

assert.deepStrictEqual(Array.from(layer.EVENT_CONTRACT), ["step", "type", "source", "target", "rowIds", "blockIds", "label", "illustrativeMetrics"]);
assert.deepStrictEqual(Array.from(layer.eventRoute("hash", { source: "Datafile · B1", target: "Database Buffer Cache" }).start), [12, 54]);
assert.deepStrictEqual(Array.from(layer.eventRoute("hash", { source: "PGA Hash Workarea", target: "TEMP" }).end), [72, 84]);
assert.strictEqual(layer.eventRoute("hash", { source: "unknown", target: "TEMP" }), null);
assert.notStrictEqual(layer.eventRoute("comparison", { source: "TABLE ACCESS · CLIENTES", target: "SQL Execution Engine" }), null);
assert.notStrictEqual(layer.eventRoute("architecture", { source: "retail-user", target: "retail-web" }), null);

const imported = layer.planTimeline({ nodes: [{ id: "1", operation: "TABLE ACCESS", object: "CLIENTES" }, { id: "2", operation: "HASH JOIN", parentId: "1" }] });
assert.strictEqual(imported.events.length, 2);
assert.strictEqual(imported.events[1].target, "HASH JOIN");
assert.strictEqual(imported.events[1].illustrativeMetrics.imported, true);

const empty = layer.planTimeline({ nodes: [] });
assert.strictEqual(empty.events.length, 3);
assert.strictEqual(empty.events[0].illustrativeMetrics.imported, false);
assert.strictEqual(fs.readFileSync("assets/animated-data-flow.css", "utf8").includes("prefers-reduced-motion"), true);
assert.strictEqual(fs.readFileSync("assets/animated-data-flow.css", "utf8").includes(".architecture-hero-art .animated-flow-stage"), true);
assert.strictEqual(fs.readFileSync("renderer/animated-data-flow-renderer.js", "utf8").includes("aria-pressed"), true);
assert.strictEqual(fs.readFileSync("ui/oracle-ai-internals-lab.js", "utf8").includes('id="aiPlay" aria-pressed="false"'), true);
assert.strictEqual(fs.readFileSync("index.html", "utf8").includes("renderer/animated-data-flow-renderer.js"), true);
for (const file of ["ui/hash-join-visualizer.js", "ui/join-comparison-lab.js", "ui/sql-intelligence-lab.js", "ui/oracle-ai-internals-lab.js", "ui/architecture-explorer.js"]) {
  assert.strictEqual(fs.readFileSync(file, "utf8").includes("OracleAnimatedDataFlow"), true, `${file} must integrate the animated layer`);
}
console.log("animated-data-flow: passed");
