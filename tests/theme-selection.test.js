const assert = require("node:assert/strict");
const fs = require("node:fs");

const portal = fs.readFileSync("assets/portal.js", "utf8");
const designSystem = fs.readFileSync("assets/oci-runbook-design-system.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");

assert.match(portal, /oracle-sql-academy\.theme\.v2/);
assert.match(portal, /oracle-sql-academy\.theme\.v1/);
assert.match(portal, /new Set\(\["light", "dark", "system"\]\)/);
assert.match(portal, /window\.matchMedia\("\(prefers-color-scheme: dark\)"\)/);
assert.match(portal, /window\.localStorage\.setItem\(themeKey, legacy\)/);
assert.match(portal, /window\.localStorage\.setItem\(themeKey, mode\)/);
assert.match(portal, /id="themeSelect"/);
assert.match(portal, /value="system">Sistema/);
assert.match(portal, /selector\.addEventListener\("change"/);
assert.match(portal, /systemTheme\.addEventListener\("change"/);
assert.match(portal, /document\.body\.dataset\.themeMode = mode/);
assert.doesNotMatch(portal, /location\.reload\(\)/);
assert.match(designSystem, /\.theme-picker/);
assert.match(designSystem, /prefers-reduced-motion: reduce/);
assert.match(index, /oracle-sql-academy\.theme\.v2/);
assert.match(index, /prefers-color-scheme: dark/);
assert.match(index, /dataset\.themeMode/);

console.log("theme-selection: passed");
