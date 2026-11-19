# OCI PoC RunBook Design System

## Reference and inspection

Reference inspected: [OCI PoC RunBook](https://efrainsanchez-ai.github.io/OCI/PoC-RunBook/index.html). The public page loads `assets/workbook.css`; the values below were read from that stylesheet on 2026-11-18. They are reference values, not inferred guesses.

## Observed reference tokens

| Role | Light | Dark |
|---|---|---|
| Background | `#faf8f7` | `#171412` |
| Surface | `#ffffff` | `#241f1d` |
| Surface soft | `#f7f4f2` | `#1f1b1a` |
| Surface strong | `#f5f5f4` | `#2f2a27` |
| Primary text | `#1f1b1a` | `#faf8f7` |
| Secondary text | `#57534e` | `#d6d3d1` |
| Subtle text | `#78716c` | `#a8a29e` |
| Border | `#e7e5e4` | `#44403c` |
| Accent | `#c74634` | `#c74634` |
| Accent strong | `#5f2b24` | `#f4b8ad` for links/eyebrows |
| Accent soft | `#fef2f2` | `rgba(199, 70, 52, 0.18)` |
| Success | `#22775f` | `#22775f` |
| Warning/gold | `#b07113` | `#b07113` |
| Info/blue | `#2f5f96` | `#2f5f96` |
| Code background | `#171412` | `#171412` |
| Code text | `#f7f3ec` | `#f7f3ec` |

The reference also uses `8px` radii, `0 18px 50px rgba(31, 27, 26, 0.08)` in light mode, `0 18px 50px rgba(0, 0, 0, 0.35)` in dark mode, a system UI font stack, a sticky top bar with blur, a centered content width of `1280px`, and compact controls with `6px` radii.

## Publication status

The Visual Design System 2.0 implementation is approved for publication on `feature/oci-runbook-visual-system`. The static site remains GitHub Pages compatible; this document records the observed reference values and does not imply that the reference site itself is bundled or copied.

## Academy mapping

`assets/oci-runbook-design-system.css` exposes the observed values as `--oci-*` tokens and maps the existing portal variables (`--bg`, `--surface`, `--card`, `--line`, `--text`, `--muted`, `--cyan`, `--green`, `--orange`, `--red` and `--blue`) to those tokens. It also defines separate SQL/plan/flow tokens (`--oci-sql-*`, `--oci-plan-*`, `--oci-data-flow` and `--oci-selected-node`) so semantic states are not collapsed into the Redwood accent. This keeps existing simulations compatible while removing one-off page-level colors from the visual layer.

The UI uses the RunBook redwood accent and neutral surfaces. The module illustrations remain separate blue/cyan 3D technical assets because they are presentation imagery, not interface tokens. Their role is to explain each module without replacing interactive SVGs or implying real Oracle execution.

## Theme behavior

- The selector exposes `Claro`, `Oscuro` and `Sistema`; `Sistema` follows `prefers-color-scheme` and reacts to operating-system changes.
- Explicit selections persist under `oracle-sql-academy.theme.v2`. Existing `oracle-sql-academy.theme.v1` values are migrated to `v2` without deleting or changing the legacy key.
- Theme changes update `body[data-theme]` and `body[data-theme-mode]` without reload, preserving simulation state and educational progress.
- Theme state changes `body[data-theme]`, `color-scheme`, surfaces, text, borders, focus and navigation states.
- `prefers-reduced-motion: reduce` disables smooth scrolling, transitions and CSS animation durations.
- Dynamic lab panels receive the same tokens through the final override layer, including their selected, focus and inspector states.

## Accessibility and scope

Focus indicators use the reference blue/info token, links and active navigation use the accent token, and status colors retain text/border cues instead of relying only on hue. SVG diagrams, Event Inspector, Architecture Builder, timelines and SQL views remain functional and are not replaced by the generated imagery.

The reference site was used for visual analysis only. No HTML, CSS, JavaScript, assets or content were copied into the academy.

## Sprint 7 presentation layer

`assets/presentation-mode.css` mantiene la jerarquía Redwood, contraste para proyección y responsive en la capa ampliada. La capa no sustituye los SVG ni las ilustraciones 3D locales: aumenta la superficie de lectura y delega el estado en los laboratorios. `prefers-reduced-motion` conserva una representación estática y controles de paso.
