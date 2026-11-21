"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Set, Map, JSON, Number, String, Array };
context.globalThis = context;
vm.createContext(context);
["content/sql-intelligence-examples.js", "simulation/oracle-plan-parser.js", "renderer/execution-plan-renderer.js", "renderer/sql-intelligence-renderer.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file }));

const plan = context.OraclePlanParser.parse(context.oracleSqlIntelligenceExamples[0].plan);
const planRenderer = context.OracleExecutionPlanRenderer;
const tree = planRenderer.renderTree(plan, "1", new Set(plan.nodes.map((node) => node.id)));
assert.match(tree, /data-plan-node="1"/, "tree exposes selectable nodes");
assert.match(planRenderer.renderGraph(plan, "1"), /role="img"/, "graph is accessible SVG");
const warehouse = context.OraclePlanParser.parse(context.oracleSqlIntelligenceExamples[2].plan);
assert.match(planRenderer.renderTable(warehouse, "1"), /TempSpc/, "table keeps optional imported columns visible");
assert.match(planRenderer.renderTable(warehouse, "1"), /2048K/, "table shows original workarea metric text");
const timingPlan = context.OraclePlanParser.parse("| Id | Operation | A-Time |\n| 0 | SELECT STATEMENT | 00:00:01.20 |\n");
assert.match(planRenderer.renderTable(timingPlan, "0"), /00:00:01.20/, "table shows imported A-Time without deriving a value");
const injected = context.OraclePlanParser.parse("| Id | Operation | Name |\n| 0 | <img src=x> | <script> |\n");
assert.match(planRenderer.renderTable(injected, "0"), /&lt;img/, "imported text is escaped before rendering");
assert.match(context.OracleSqlIntelligenceRenderer.renderWhatIf({ observations: ["safe < text"], disclaimer: "no <script>" }), /&lt;script&gt;/, "derived content escapes text");
assert.match(context.OracleSqlIntelligenceRenderer.renderDiagnosticRecord({ current: { explanation: { how: "safe < text", dba: "no <script>" } }, node: injected.nodes[0], evidence: { format: "DISPLAY", metricNames: [] }, findings: [], cardinality: null }), /&lt;script&gt;/, "diagnostic record escapes imported content");

const ui = fs.readFileSync(path.join(__dirname, "..", "ui/sql-intelligence-lab.js"), "utf8");
const bootstrap = fs.readFileSync(path.join(__dirname, "..", "ui/sql-intelligence-bootstrap.js"), "utf8");
const portal = fs.readFileSync(path.join(__dirname, "..", "assets/portal.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets/sql-intelligence.css"), "utf8");
for (const control of ["diagnosticsPrevious", "diagnosticsNext", "diagnosticsPlay", "diagnosticsPause", "diagnosticsReset", "diagnosticsSpeed"]) assert.match(bootstrap, new RegExp(control));
assert.match(ui, /OraclePlanDiagnosticsTimeline/, "UI consumes the pure diagnostics timeline");
assert.match(ui, /setDiagnosticIndex/, "all controls share one diagnostic index");
assert.match(portal, /plan-diagnostics-timeline\.js/, "diagnostics timeline loads locally");
assert.match(css, /prefers-reduced-motion/, "existing stylesheet retains reduced-motion coverage");

console.log("sql-intelligence-renderer: passed");
