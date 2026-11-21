"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { console, Object, Set, Map, JSON, Number, String, Array };
context.globalThis = context;
vm.createContext(context);
["content/sql-intelligence-examples.js", "simulation/oracle-plan-parser.js"].forEach((file) => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file }));

const parser = context.OraclePlanParser;
const examples = context.oracleSqlIntelligenceExamples;
for (const example of examples) {
  const parsed = parser.parse(example.plan);
  assert.ok(parsed.nodes.length >= 4, `${example.id} parses operators`);
  assert.equal(parsed.metadata.planHash !== null, true, `${example.id} gets plan hash`);
  assert.ok(parsed.nodes.every((node) => node.operation && node.metrics), "nodes preserve operation and metrics");
}

const finance = parser.parse(examples.find((example) => example.id === "finance").plan);
const index = finance.nodes.find((node) => node.operation === "INDEX RANGE SCAN");
assert.match(index.predicate, /access/i, "predicates associate by id");
assert.equal(index.metrics.starts.value, 6, "variable stats columns parse");
assert.equal(finance.nodes.find((node) => node.id === "3").parentId, "1", "indentation reconstructs hierarchy");
assert.equal(finance.warnings.length, 0, "root indentation does not produce a false ambiguity warning");

const retail = parser.parse(examples.find((example) => example.id === "retail").plan);
assert.equal(retail.format, "DISPLAY", "retail fixture remains an estimated DISPLAY plan");
assert.equal(retail.nodes.some((node) => node.metrics.aRows || node.metrics.starts), false, "DISPLAY fixture does not manufacture observed metrics");
assert.equal(retail.nodes.find((node) => node.id === "1").predicateMarker, true, "asterisk identifier is preserved");
assert.match(retail.nodes.find((node) => node.id === "3").predicate, /filter/i, "filter predicate associates by id");
assert.ok(retail.metadata.notes.some((note) => note.includes("ilustrativo")), "notes are preserved");

const warehouse = parser.parse(examples.find((example) => example.id === "warehouse").plan);
const warehouseSort = warehouse.nodes.find((node) => node.id === "1");
assert.equal(warehouseSort.metrics.aTime, null, "absent A-Time remains absent");
assert.equal(warehouseSort.metrics.tempSpc.raw, "64M", "abbreviated values preserve original text");
assert.equal(warehouseSort.metrics.tempSpc.value, 64000000, "abbreviated values obtain a derived numeric value");
assert.equal(warehouseSort.metrics.oMem.raw, "2048K", "optional workarea columns parse");

const minimal = parser.parse("Plan hash value: 1\n| Id | Operation | Name | Cost |\n| 0 | SELECT STATEMENT | | 2 |\n| 1 | UNKNOWN OPERATOR | X | |\n");
assert.equal(minimal.format, "DISPLAY", "DISPLAY plan recognized");
assert.equal(minimal.nodes[1].operation, "UNKNOWN OPERATOR", "unknown operation preserved");
assert.equal(minimal.nodes[1].metrics.cost, null, "absent metric remains absent");

const incomplete = parser.parse("| Id | Operation | A-Time |\n| 0 | SELECT STATEMENT | 00:00:01.20 |\n| 1 | PARTIAL");
assert.equal(incomplete.nodes.length, 1, "complete rows in an incomplete plan remain available");
assert.equal(incomplete.nodes[0].metrics.aTime.raw, "00:00:01.20", "A-Time is preserved without invented numeric conversion");

const malformed = parser.parse("<img src=x onerror=alert(1)>\nnot a plan");
assert.equal(malformed.nodes.length, 0, "malformed text has no operators");
assert.ok(malformed.warnings.length, "malformed text warns");
assert.ok(parser.parse("x".repeat(parser.MAX_INPUT_LENGTH + 1)).warnings[0].includes("límite"), "oversized text is rejected");

console.log("oracle-plan-parser: passed");
