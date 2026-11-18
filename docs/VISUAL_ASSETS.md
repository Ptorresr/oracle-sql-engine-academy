# Visual Assets

## Scope

These assets support the educational portal presentation layer. They are contextual illustrations only; interactive SVG diagrams, event timelines, metrics and simulation state remain the source of truth for technical behavior.

## Asset manifest

| Asset | Module concept | Format | Source and license status |
|---|---|---|---|
| `assets/illustrations/sql-comparison-tech.png` | Compare HASH JOIN, NESTED LOOPS and SORT MERGE JOIN | PNG, 1280×720 | Original project illustration generated with Codex ImageGen; no third-party asset or license identified |
| `assets/illustrations/hash-join-tech.png` | HASH BUILD, HASH PROBE, workarea and TEMP concept | PNG, 1280×720 | Original project illustration generated with Codex ImageGen; no third-party asset or license identified |
| `assets/illustrations/sql-intelligence-tech.png` | Plan import, evidence, analysis and What If | PNG, 1280×720 | Original project illustration generated with Codex ImageGen; no third-party asset or license identified |
| `assets/illustrations/ai-internals-tech.png` | Vector Search, Hybrid Search, Select AI, RAG and Agentic flows | PNG, 1280×720 | Original project illustration generated with Codex ImageGen; no third-party asset or license identified |
| `assets/illustrations/architecture-explorer-tech.png` | Enterprise architecture, trust boundary and data flows | PNG, 1280×720 | Original project illustration generated with Codex ImageGen; no third-party asset or license identified |

## Usage rules

- The reference images supplied during design were used as style guidance only; their pixels, logos, text and compositions were not copied.
- No Anatomy code or assets, OCI PoC RunBook assets, OCI Pipeline Dashboard assets or external image URLs are bundled.
- Do not add readable claims, SQL text, credentials, product logos or production measurements inside generated artwork.
- Keep the `alt` text and HTML caption in the consuming UI. Do not rely on generated imagery alone for meaning.
- Use `loading="lazy"` for illustrations outside the initial viewport; keep explicit dimensions or aspect-ratio to avoid layout shift when adding new assets.
- If a repository-wide license is added later, review these assets and this manifest before publication.

## Publication status

The five assets are approved for publication with the visual redesign. They remain optional presentation assets: technical meaning continues to come from the accessible SVG diagrams, controls, timelines and inspectors.
