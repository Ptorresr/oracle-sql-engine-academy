const assert = require("assert");
const fs = require("fs");

const renderer = fs.readFileSync("renderer/presentation-renderer.js", "utf8");
const manager = fs.readFileSync("ui/presentation-mode.js", "utf8");
const css = fs.readFileSync("assets/presentation-mode.css", "utf8");
assert.ok(renderer.includes("renderStep"));
for (const action of ["previous", "play", "pause", "next", "reset", "toggle-detail", "toggle-inspector"]) assert.ok(manager.includes(`data-presentation-action=\"${action}\"`) || manager.includes(`action === \"${action}\"`), action);
assert.ok(manager.includes("Escape"));
assert.ok(manager.includes("isFormField"));
assert.ok(manager.includes("supportsPlayback === false"));
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(css.includes("presentation-mode"));
for (const file of ["ui/hash-join-visualizer.js", "ui/join-comparison-lab.js", "ui/sql-intelligence-lab.js", "ui/oracle-ai-internals-lab.js", "ui/architecture-explorer.js"]) assert.ok(fs.readFileSync(file, "utf8").includes("OraclePresentationMode"), file);
assert.ok(fs.readFileSync("content/runbook-chapters.js", "utf8").includes('id: "architecture-challenges"'));
console.log("presentation-mode: passed");
