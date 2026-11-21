"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { Object };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "content/runbook-chapters.js"), "utf8"), context, { filename: "content/runbook-chapters.js" });

const runbook = context.oracleAcademyRunbook;
assert.deepEqual(JSON.parse(JSON.stringify(runbook.chapters.map((chapter) => chapter.id))), ["que", "como", "simulador", "hashjoin", "comparison", "casos", "dba", "internals", "intelligence", "ai", "reto", "ai-internals", "architecture-explorer", "architecture-challenges", "database-performance"], "RunBook preserves chapters 01–14 and appends Database Performance as chapter 15");
assert.equal(runbook.getChapter("intelligence").order, 9, "Intelligence uses a stable chapter order");
assert.equal(runbook.getChapter("intelligence").route, "#intelligence", "Intelligence has a stable direct route");
assert.equal(runbook.previous("intelligence").id, "internals", "previous navigation reaches Internals");
assert.equal(runbook.next("intelligence").id, "ai", "next navigation reaches AI Learning Lab");
assert.equal(runbook.previous("ai").id, "intelligence", "AI Learning Lab returns to Intelligence");
assert.equal(runbook.getChapter("ai-internals").order, 12, "AI Internals uses chapter 12");
assert.equal(runbook.getChapter("ai-internals").route, "#ai-internals", "AI Internals has a stable direct route");
assert.equal(runbook.previous("ai-internals").id, "reto", "chapter 12 follows the existing chapter 11");
assert.equal(runbook.getChapter("architecture-explorer").order, 13, "Architecture Explorer uses chapter 13");
assert.equal(runbook.getChapter("architecture-explorer").route, "#architecture-explorer", "Architecture Explorer has a stable direct route");
assert.equal(runbook.previous("architecture-explorer").id, "ai-internals", "chapter 13 follows AI Internals");
assert.deepEqual(JSON.parse(JSON.stringify(runbook.getChapter("architecture-explorer").completionActivities)), ["architecture-explored", "component-selected", "flow-ran", "security-reviewed", "alternative-compared"], "Architecture Explorer completion requires educational activities");
assert.deepEqual(JSON.parse(JSON.stringify(runbook.getChapter("intelligence").completionActivities)), ["plan-imported", "operator-inspected"], "Intelligence completion requires educational activities");
assert.equal(runbook.getChapter("architecture-challenges").order, 14, "Architecture Challenges uses chapter 14");
assert.equal(runbook.getChapter("architecture-challenges").route, "#architecture-challenges", "Architecture Challenges has a stable direct route");
assert.equal(runbook.previous("architecture-challenges").id, "architecture-explorer", "chapter 14 follows Architecture Explorer");
assert.deepEqual(JSON.parse(JSON.stringify(runbook.getChapter("architecture-challenges").completionActivities)), ["challenge-started", "challenge-evaluated"], "Challenges completion requires educational activities");
assert.equal(runbook.getChapter("database-performance").order, 15, "Database Performance uses chapter 15");
assert.equal(runbook.getChapter("database-performance").route, "#database-performance", "Database Performance has a stable direct route");
assert.equal(runbook.previous("database-performance").id, "architecture-challenges", "chapter 15 follows Architecture Challenges");
assert.equal(runbook.next("database-performance"), null, "chapter 15 ends the RunBook");
assert.deepEqual(JSON.parse(JSON.stringify(runbook.getChapter("database-performance").routes)), ["buffer-cache-io", "pga-workareas-temp", "optimizer-cardinality", "execution-plan-diagnostics", "performance-what-if"], "Database Performance declares the five internal routes");
assert.deepEqual(JSON.parse(JSON.stringify(runbook.getChapter("database-performance").completionActivities)), ["buffer-step-inspected", "workarea-case-compared", "cardinality-rule-reviewed", "plan-diagnostic-inspected", "performance-comparison-reviewed"], "Database Performance completion requires valid lab activities");

console.log("runbook-chapters: passed");
