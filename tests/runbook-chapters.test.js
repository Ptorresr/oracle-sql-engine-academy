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
assert.deepEqual(JSON.parse(JSON.stringify(runbook.chapters.map((chapter) => chapter.id))), ["que", "como", "simulador", "hashjoin", "comparison", "casos", "dba", "internals", "intelligence", "ai", "reto", "ai-internals"], "RunBook preserves chapters 01–11 and appends AI Internals as chapter 12");
assert.equal(runbook.getChapter("intelligence").order, 9, "Intelligence uses a stable chapter order");
assert.equal(runbook.getChapter("intelligence").route, "#intelligence", "Intelligence has a stable direct route");
assert.equal(runbook.previous("intelligence").id, "internals", "previous navigation reaches Internals");
assert.equal(runbook.next("intelligence").id, "ai", "next navigation reaches AI Learning Lab");
assert.equal(runbook.previous("ai").id, "intelligence", "AI Learning Lab returns to Intelligence");
assert.equal(runbook.getChapter("ai-internals").order, 12, "AI Internals uses chapter 12");
assert.equal(runbook.getChapter("ai-internals").route, "#ai-internals", "AI Internals has a stable direct route");
assert.equal(runbook.previous("ai-internals").id, "reto", "chapter 12 follows the existing chapter 11");
assert.deepEqual(JSON.parse(JSON.stringify(runbook.getChapter("intelligence").completionActivities)), ["plan-imported", "operator-inspected"], "Intelligence completion requires educational activities");

console.log("runbook-chapters: passed");
