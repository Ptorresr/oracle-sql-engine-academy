"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Array, Number, String, Boolean, JSON, Math, Set, Map };
context.globalThis = context;
vm.createContext(context);
for (const file of ["content/sql-intelligence-examples.js", "simulation/performance-event-adapter.js", "simulation/oracle-plan-parser.js", "simulation/oracle-plan-analyzer.js", "simulation/plan-diagnostics-timeline.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
}

const parser = context.OraclePlanParser;
const analyzer = context.OraclePlanAnalyzer;
const engine = context.OraclePlanDiagnosticsTimeline;
const examples = context.oracleSqlIntelligenceExamples;
const retail = parser.parse(examples.find((example) => example.id === "retail").plan);
const finance = parser.parse(examples.find((example) => example.id === "finance").plan);
const warehouse = parser.parse(examples.find((example) => example.id === "warehouse").plan);

const first = engine.createTimeline(finance, analyzer.analyze(finance));
const second = engine.createTimeline(finance, analyzer.analyze(finance));
assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(second)), "same plan produces the same diagnostic timeline");
assert.ok(Object.isFrozen(first) && Object.isFrozen(first.events) && Object.isFrozen(first.events[0]), "timeline and events are immutable");
assert.equal(first.events.length, finance.nodes.length * 2, "each node has start and end events");
assert.deepEqual(Array.from(first.events, (event) => event.step), Array.from({ length: first.events.length }, (_, index) => index + 1));
assert.equal(first.events[0].type, "PLAN_OPERATOR_START");
assert.equal(first.events[1].type, "PLAN_OPERATOR_END");
assert.equal(context.OraclePerformanceEventAdapter.validateTimeline(first.events).valid, true, "diagnostic events use the common contract");

const state = engine.stateAt(first, 1);
assert.equal(state.node.id, first.events[1].operatorId);
assert.equal(state.current.type, "PLAN_OPERATOR_END");
assert.equal(engine.indexForOperator(first, state.node.id), 0);
assert.equal(engine.indexForOperator(first, state.node.id, "end"), 1);
assert.ok(state.evidence.metricNames.includes("starts"));

assert.equal(retail.format, "DISPLAY", "retail fixture is an estimated DISPLAY plan");
assert.equal(retail.nodes.some((node) => node.metrics.aRows || node.metrics.starts), false, "estimated fixture does not invent observed metrics");
const retailState = engine.stateAt(engine.createTimeline(retail, analyzer.analyze(retail)), 0);
assert.equal(retailState.evidence.hasObservedRows, false);

const financeNode = finance.nodes.find((node) => node.metrics.starts.value > 1);
const financeCardinality = analyzer.analyze(finance).cardinalities.find((item) => item.nodeId === financeNode.id);
assert.equal(financeCardinality.normalizedObserved, financeNode.metrics.aRows.value / financeNode.metrics.starts.value, "A-Rows/Starts remains a derived calculation");
assert.ok(engine.stateAt(first, engine.indexForOperator(first, financeNode.id)).evidence.metricNames.includes("aRows"));

assert.ok(warehouse.nodes.some((node) => node.metrics.tempSpc?.raw), "warehouse preserves explicit TempSpc");
assert.ok(engine.stateAt(engine.createTimeline(warehouse, analyzer.analyze(warehouse)), 0).evidence.metricNames.includes("buffers"));

const startsZero = parser.parse("| Id | Operation | Starts | E-Rows | A-Rows |\n| 0 | SELECT STATEMENT | 0 | 0 | 7 |\n");
const startsZeroAnalysis = analyzer.analyze(startsZero);
assert.equal(startsZeroAnalysis.cardinalities[0].normalizedObserved, null, "Starts zero has no derived average");
assert.equal(startsZeroAnalysis.cardinalities[0].factor, null, "E-Rows zero has no factor division");

const hostile = parser.parse("| Id | Operation | Name |\n| 0 | <script>alert(1)</script> | <img src=x> |\n");
const hostileState = engine.stateAt(engine.createTimeline(hostile, analyzer.analyze(hostile)), 0);
assert.match(hostileState.current.label, /script/, "untrusted operator text remains inert data in the timeline");

const unknown = parser.parse("| Id | Operation |\n| 0 | UNKNOWN OPERATOR |\n");
assert.equal(engine.stateAt(engine.createTimeline(unknown, analyzer.analyze(unknown)), 0).node.operation, "UNKNOWN OPERATOR", "unknown operations remain available to diagnostics");

const multipleRoots = parser.parse("| Id | Operation |\n| 0 | SELECT STATEMENT |\n| 1 | SELECT STATEMENT |\n");
const multipleRootsTimeline = engine.createTimeline(multipleRoots, analyzer.analyze(multipleRoots));
assert.equal(multipleRootsTimeline.events.length, 4, "multiple roots are preserved as imported diagnostic entries");

const incomplete = parser.parse("| Id | Operation | A-Time |\n| 0 | SELECT STATEMENT | 00:00:01.20 |\n| 1 | PARTIAL");
assert.equal(engine.createTimeline(incomplete, analyzer.analyze(incomplete)).events.length, 2, "complete rows of incomplete plans remain diagnosable");

const largePlan = parser.parse(["| Id | Operation |", ...Array.from({ length: engine.MAX_PLAYBACK_NODES + 3 }, (_, index) => `| ${index} | TABLE ACCESS FULL |`)].join("\n"));
const largeTimeline = engine.createTimeline(largePlan, analyzer.analyze(largePlan));
assert.equal(largeTimeline.events.length, engine.MAX_PLAYBACK_NODES * 2, "large plans have an explicit playback limit");
assert.equal(largeTimeline.playbackLimited, true);
assert.equal(largeTimeline.plan.nodes.length, engine.MAX_PLAYBACK_NODES + 3, "parsed plan remains complete when playback is limited");
assert.match(largeTimeline.warnings.at(-1), /reproducción diagnóstica se limita/, "limit is surfaced honestly");

assert.throws(() => engine.createTimeline(null, {}), /plan parseado/, "invalid inputs are explicit");
console.log("plan-diagnostics-timeline: passed");
