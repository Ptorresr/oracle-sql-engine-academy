# Oracle SQL & AI Database Engine Academy — Agent Guide

## Objetivo y alcance

Este repositorio publica una academia estática en GitHub Pages para aprender Oracle SQL, optimización y componentes internos de Oracle AI Database. La experiencia actual en `index.html` es una demo educativa funcional; conservarla y extenderla de forma incremental. No implementar conexiones a Oracle Database, LLMs ni nuevas simulaciones sin una historia aceptada en el roadmap.

## Arquitectura acordada

- El runtime base es HTML, CSS, JavaScript y SVG estáticos, sin secretos ni servicios obligatorios.
- Separar futuras funcionalidades en `content/` (datos y lecciones), `simulation/` (modelo y timeline deterministas), `ui/` (controles y vistas) y `renderer/` (SVG/Canvas). No introducir esa estructura mediante una reescritura masiva de la demo.
- Un evento de simulación usa `{ step, type, source, target, rowIds, blockIds, label, illustrativeMetrics }`.
- Sincronizar las vistas Developer, Execution Plan e Internals desde el mismo estado. Rotular siempre las métricas inventadas como `ilustrativas`.
- Distinguir flujo lógico de filas de movimiento físico de memoria, y plan estimado de ejecución observada (`DISPLAY_CURSOR` con estadísticas).

## Estándares de código y accesibilidad

- Preferir HTML semántico, CSS con tokens y JavaScript modular sin dependencias innecesarias.
- Mantener interfaz oscura, responsive, teclado operable, foco visible, contraste suficiente y soporte para `prefers-reduced-motion`.
- Usar SVG accesible (`role`, nombre accesible y leyenda cuando aplique); evitar IDs SVG duplicados.
- Mantener contenido y lógica separados. El código de simulación no debe depender de temporizadores para calcular resultados.
- No incorporar librerías, activos ni scripts de terceros sin revisar licencia, código, versión fijada, dependencias y necesidad.

## Requisitos educativos y técnicos

Cada módulo debe cumplir `skills/oracle-sql-academy-builder/references/module-contract.md`: qué es, cómo funciona, para qué sirve, procesamiento interno, implicaciones de rendimiento, tres casos de uso, SQL Oracle, infografía, simulación, chequeo y vistas Developer/DBA/Internals.

- Validar SQL Oracle, `NULL`, duplicados, cardinalidad y afirmaciones de plan antes de publicar.
- No afirmar que un método de JOIN es universalmente mejor; explicar las condiciones y la necesidad de medir.
- Las experiencias AI locales deben declararse como simuladas o basadas en reglas. Nunca representarlas como inferencia de un modelo real.
- No exponer claves, tokens, conexiones SQLcl, credenciales OCI ni prompts con datos sensibles en GitHub Pages.

## Skills y herramientas

- Antes de crear o cambiar un módulo, leer `skills/oracle-sql-academy-builder/SKILL.md` y su contrato de módulo.
- La ruta compatible para descubrimiento de Codex es `.agents/skills/oracle-sql-academy-builder`, enlazada al directorio fuente `skills/oracle-sql-academy-builder`; editar únicamente la fuente.
- Usar `sql-query-reviewer`, `sql-plsql-formatting`, `drawio-oci-arch`, `freesql`, `senior-developer` y `code-reviewer` solo si están disponibles en la sesión o instalados explícitamente.
- Anatomy es una referencia opcional para figuras isométricas; no instalarlo, ejecutar sus scripts ni incorporar su kit sin la revisión registrada en `docs/ANATOMY_EVALUATION.md`.

## Pruebas y entrega

- Ejecutar las comprobaciones existentes antes de entregar: `test -s index.html` y la detección de marcadores de merge. Ejecutar validaciones adicionales solo cuando existan o se agreguen.
- Para cambios visuales, comprobar escritorio, móvil, teclado y movimiento reducido. Para simulaciones, comprobar repetición determinista y reinicio.
- Actualizar `SESSION_HANDOFF.md` al terminar cada tarea con cambios, decisiones, pruebas, riesgos y siguiente actividad.

## Git y documentación

- Trabajar en una rama `feature/*`; para este sprint, `feature/project-foundation`. No modificar `main`, hacer merge ni push sin aprobación explícita.
- Mantener commits pequeños con Conventional Commits cuando se solicite un commit; no crear commits automáticos.
- Conservar documentación en Markdown dentro del repositorio para que Obsidian pueda indexarla. No duplicar ni mover el repositorio desde `Documents/CODEX`.
