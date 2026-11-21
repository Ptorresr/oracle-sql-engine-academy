"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = (file) => fs.readFileSync(file, "utf8");
const portal = read("assets/portal.js");
const portalCss = read("assets/portal.css");
const index = read("index.html");
const catalog = read("content/module-catalog.js");

for (const route of ["database-performance", "buffer-cache-io", "pga-workareas-temp", "optimizer-cardinality", "execution-plan-diagnostics", "performance-what-if"]) {
  assert.ok(portal.includes(`"${route}"`) || index.includes(`id="${route}"`), `route ${route} is declared locally`);
}
for (const contract of ["resolveRoute", "academy:performance-ready", "performanceLabsPromise", "academy:performance-activity", "oracle-sql-academy.joins.progress.v1"]) assert.ok(portal.includes(contract), `${contract} is part of the integration contract`);
for (const navigationContract of ["syncStickyHeaderOffset", "ResizeObserver", "scrollIntoView", "keepTargetBelowStickyHeader"]) assert.ok(portal.includes(navigationContract), `${navigationContract} keeps internal routes below the sticky header`);
assert.ok(portalCss.includes("--portal-sticky-offset"), "the sticky header offset is centralized as a CSS custom property");
assert.ok(portalCss.includes("scroll-margin-top: var(--portal-sticky-offset)"), "sections use the measured sticky header offset");
assert.ok(index.includes('id="database-performance"'), "chapter 15 has a stable mount");
assert.ok(catalog.includes('id: "database-performance"'), "catalog exposes Database Performance");
assert.ok(read("renderer/buffer-cache-renderer.js").includes("renderResults"), "Buffer Cache renders an explicit Results view from existing state");

for (const file of ["ui/buffer-cache-lab.js", "ui/workarea-temp-lab.js", "ui/optimizer-cardinality-lab.js", "ui/performance-what-if-lab.js"]) {
  const source = read(file);
  for (const action of ["getState", "play", "pause", "previous", "next", "reset", "setSpeed", "select"]) assert.ok(source.includes(action), `${file} exposes ${action}`);
  assert.ok(source.includes("academy:performance-activity"), `${file} reports a valid performance activity`);
  assert.ok(source.includes("OraclePresentationMode?.register"), `${file} registers Presentation Mode after initialization`);
  assert.ok(!source.includes("Preview técnico fuera del RunBook"), `${file} does not expose an obsolete preview label`);
}

const adapter = read("simulation/performance-event-adapter.js");
for (const forbidden of ["PERFORMANCE_COMPARE", "PERFORMANCE_PRESENTATION"]) assert.ok(!adapter.includes(forbidden), `${forbidden} is not a new simulation event type`);

console.log("database-performance-integration: passed");
