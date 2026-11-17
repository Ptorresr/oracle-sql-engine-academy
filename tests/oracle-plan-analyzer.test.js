"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Set, Map, JSON, Number, String, Array };
context.globalThis = context;
vm.createContext(context);
["content/sql-intelligence-examples.js", "simulation/oracle-plan-parser.js", "simulation/oracle-plan-analyzer.js", "simulation/oracle-sql-analyzer.js", "simulation/sql-what-if-engine.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file }));

const finance = context.OraclePlanParser.parse(context.oracleSqlIntelligenceExamples.find((item) => item.id === "finance").plan);
const analysis = context.OraclePlanAnalyzer.analyze(finance);
const nested = analysis.cardinalities.find((item) => item.nodeId === "3");
assert.equal(nested.normalizedObserved, 3, "A-Rows normalizes by Starts only when applicable");
assert.ok(analysis.findings.some((item) => item.title.includes("Diferencia")), "cardinality evidence emits a cautious finding");

const zero = context.OraclePlanAnalyzer.cardinality({ id: "x", metrics: { eRows: { raw: "0", value: 0 }, aRows: { raw: "0", value: 0 }, starts: { raw: "0", value: 0 } } });
assert.equal(zero.factor, null, "zero values never divide by zero");

const sql = context.OracleSqlAnalyzer.analyze("SELECT /* comment */ UPPER(c.name) FROM customers c JOIN orders o ON o.id = c.id WHERE c.id = '42' ORDER BY c.name");
assert.ok(sql.patterns.some((item) => item.id === "join"), "SQL analyzer finds joins");
assert.ok(sql.patterns.some((item) => item.id === "function"), "SQL analyzer finds functions");
assert.ok(sql.limitations.some((item) => item.includes("No ejecuta SQL")), "SQL analyzer discloses limits");

const baseline = { cardinality: "medium", selectivity: "medium", index: "unknown", memory: "medium", joinOrder: "source", algorithm: "optimizer" };
const first = context.OracleSqlWhatIfEngine.evaluate({ ...baseline, cardinality: "large", memory: "limited" });
const second = context.OracleSqlWhatIfEngine.evaluate({ ...baseline, cardinality: "large", memory: "limited" });
assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(second)), "What If is deterministic");
assert.deepEqual(baseline, { cardinality: "medium", selectivity: "medium", index: "unknown", memory: "medium", joinOrder: "source", algorithm: "optimizer" }, "What If does not mutate source input");

console.log("oracle-plan-analyzer: passed");
