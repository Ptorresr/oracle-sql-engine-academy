---
name: oracle-sql-academy-builder
description: Build and maintain educational GitHub Pages modules for Oracle SQL, Oracle Database internals and Oracle AI Database with interactive deterministic simulations, anatomy-style diagrams, developer and DBA views, validated SQL examples, and at least three business use cases. Use for new modules, visualization updates, technical review, and learning experience consistency in Oracle SQL Interactive Academy.
---

# Oracle SQL Academy Builder

1. Read `references/module-contract.md` before designing or changing a module.
2. Define audience, learning objectives, dataset, SQL statements and expected outputs before writing animation code.
3. Implement a deterministic event timeline with synchronized Developer, Execution Plan and Database Internals views. Mark any invented metrics as illustrative.
4. For isometric anatomy diagrams, review Anatomy upstream at `https://github.com/wheresryan22/anatomy` and its license before reusing source or assets; do not assume it is installed.
5. Produce sections: ¿Qué es?, ¿Cómo funciona?, ¿Para qué sirve?, three distinct use cases, animation, DBA interpretation, interactive check.
6. Validate Oracle SQL semantics, NULL handling, cardinality, plan claims and source data; never confuse estimated plans with observed executions.
7. Keep GitHub Pages deployment static; no client-side API secrets. AI demos without a backend must explicitly say simulated, rules-based or illustrative.
8. Test navigation, animation controls, keyboard operation, reduced motion, mobile layout and deterministic replay before delivery.
9. Follow existing project design tokens and RunBook navigation patterns; avoid duplicating large libraries unnecessarily.

For review, apply patterns from the user's SQL reviewer, SQL formatter, senior-developer and code-reviewer skills when available. For OCI diagrams use drawio-oci-arch when available. For optional SQLcl verification use authorized local Oracle connections only.
