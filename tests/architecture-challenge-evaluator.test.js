const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { globalThis: {} };
for (const file of ["content/architecture-challenges.js", "simulation/architecture-challenge-evaluator.js", "content/oci-reference-architectures.js"]) vm.runInNewContext(fs.readFileSync(file, "utf8"), context);
const challenges = context.globalThis.oracleArchitectureChallenges;
const references = context.globalThis.oracleReferenceArchitectures;
const evaluator = context.globalThis.OracleArchitectureChallengeEvaluator;

assert.strictEqual(challenges.length, 3);
for (const [challengeId, referenceId] of [["retail-vector-recommendations", "retail-recommendations"], ["finance-secure-rag", "finance-rag"], ["operations-authorized-agent", "operations-agent"]]) {
  const challenge = challenges.find((item) => item.id === challengeId);
  const reference = references.find((item) => item.id === referenceId);
  const result = evaluator.evaluate(challenge, reference);
  assert.strictEqual(result.score.total, 100);
  assert.strictEqual(result.status, "complete");
  assert.deepStrictEqual(Array.from(result.missing), []);
  assert.ok(result.findings.every((item) => item.evidence));
}

const incomplete = evaluator.evaluate(challenges[1], { id: "finance-rag", name: "Incomplete", nodes: [], edges: [] });
assert.ok(incomplete.score.total < 100);
assert.ok(incomplete.findings.some((item) => item.status === "missing"));
assert.ok(incomplete.limitations.some((item) => item.includes("no es certificación")));

const retail = references.find((item) => item.id === "retail-recommendations");
const retailWithoutAccess = evaluator.evaluate(challenges[0], { ...retail, nodes: retail.nodes.filter((node) => node.componentId !== "auth" && node.componentId !== "iam") });
assert.equal(retailWithoutAccess.score.functional, 25, "Security omissions do not reduce functional points");
assert.equal(retailWithoutAccess.score.flow, 20, "Security omissions do not reduce flow points");
assert.equal(retailWithoutAccess.score.security, 0, "Missing access control affects only security points");

const finance = references.find((item) => item.id === "finance-rag");
const financeWithoutFilter = evaluator.evaluate(challenges[1], {
  ...finance,
  edges: finance.edges.map((edge) => edge.dataType === "AUTHORIZED_CONTEXT" ? { ...edge, dataType: "UNFILTERED_CONTEXT" } : edge)
});
assert.equal(financeWithoutFilter.score.functional, 25);
assert.equal(financeWithoutFilter.score.flow, 20);
assert.equal(financeWithoutFilter.score.security, 13);

const operations = challenges.find((item) => item.id === "operations-authorized-agent");
const denied = evaluator.evaluate(operations, { id: "operations-agent", name: "Agent", nodes: [{ id: "agent", componentId: "agent" }, { id: "tool", componentId: "tool" }], edges: [{ id: "call", source: "agent", target: "tool", relationship: "TOOL_CALL", securityContext: "AUTHENTICATED" }] });
assert.ok(denied.findings.some((item) => item.criterion === "Operación sensible denegada" && item.status === "missing" && item.severity === "error"));
console.log("architecture-challenge-evaluator: passed");
