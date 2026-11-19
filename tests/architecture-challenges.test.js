const assert = require("assert");
const fs = require("fs");

const source = fs.readFileSync("ui/architecture-challenges.js", "utf8");
assert.ok(source.includes("Cargar referencia educativa"));
assert.ok(source.includes("Evaluar arquitectura"));
assert.ok(source.includes("localStorage"));
assert.ok(source.includes("OracleArchitectureGraphEngine"));
assert.ok(source.includes("OracleArchitectureChallengeEvaluator"));
assert.ok(source.includes("data-challenge-finding"));
console.log("architecture-challenges: passed");
