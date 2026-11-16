# Session Handoff — Oracle SQL & AI Database Engine Academy

## Estado actual

- **Fecha:** 2026-11-16
- **Rama:** `feature/database-engine-visualizer` (creada desde `feature/interactive-learning-portal` en `caebdbb`)
- **Sprint:** 2 — Oracle Database Execution Engine Visualizer
- **Referencia base:** `f7dc9e6` (`feat: add interactive learning portal`).
- **Cierre:** `9411fc8` (`chore: close sprint 1 validation`).
- **Estado de entrega:** Sprint 1 permanece publicado en `origin/feature/interactive-learning-portal`. Sprint 2 está cerrado, validado y publicado en `origin/feature/database-engine-visualizer`; no hay PR ni merge a `main`.

## Trabajo realizado

| Área | Resultado |
| --- | --- |
| Diagnóstico | Se revisaron `README.md`, documentación de arquitectura/backlog/brief, Skill local, contrato del módulo e `index.html`. |
| Estado existente | La demo estática contiene JOIN Lab, simulador de JOINs, tres casos de uso, SVGs, explicación conceptual del motor y laboratorios AI locales. |
| Foundation | Se completaron `AGENTS.md`, `PROJECT_CONTEXT.md`, `ROADMAP.md` y este documento. |
| Skills | La Skill `oracle-sql-academy-builder` conserva `SKILL.md`, contrato y manifiesto `agents/openai.yaml`; se expone mediante el enlace relativo `.agents/skills/oracle-sql-academy-builder`. |
| Anatomy | Se revisaron licencia MIT, compatibilidad, requisitos y workflow upstream; no se instaló ni ejecutó código externo. Ver `docs/ANATOMY_EVALUATION.md`. |
| Sprint 1 portal | Se añadió un catálogo declarativo, dashboard de progreso local, breadcrumbs, índice RunBook, navegación anterior/siguiente y workspace con pestañas Developer, Execution Plan e Internals. |
| Cierre Sprint 1 | Se corrigió el desbordamiento horizontal confirmado a 375 px en los casos de uso, permitiendo que los elementos internos de la cuadrícula se contraigan sin alterar las simulaciones. |
| Sprint 2 engine | Se añadieron escenarios declarativos, motor determinista, renderer SVG/UI sincronizada y pruebas del visualizador HASH JOIN sin sustituir los laboratorios existentes. |
| Auditoría Sprint 2 | Se incorporó Event Inspector: selección de eventos, filas, bloques, operadores y componentes; SQL relacionado con límites explícitos, resaltado sincronizado y prueba de regresión en navegador. |

## Decisiones vigentes

1. Mantener la demo `index.html` como baseline y evitar una reescritura masiva durante los primeros sprints.
2. La evolución modular separará contenido, modelo de simulación, renderer y UI de manera incremental.
3. Todas las simulaciones son deterministas y sus métricas inventadas llevan etiqueta `ilustrativas`.
4. La IA inicial es local y basada en reglas/datasets; no se presenta como inferencia de LLM ni usa secretos.
5. Anatomy se usará primero como referencia visual; una instalación requiere versión fijada y revisión adicional de scripts.
6. Markdown dentro del repositorio es la fuente de verdad y permanece indexable por el vault de Obsidian sin duplicación.

## Archivos modificados o añadidos

- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `ROADMAP.md`
- `SESSION_HANDOFF.md`
- `docs/ANATOMY_EVALUATION.md`
- `.agents/skills/oracle-sql-academy-builder` (enlace simbólico relativo)
- `assets/portal.css`
- `assets/portal.js`
- `content/module-catalog.js`
- `index.html`
- `docs/ARCHITECTURE.md`
- `content/hash-join-scenarios.js`
- `simulation/hash-join-engine.js`
- `renderer/hash-join-renderer.js`
- `ui/hash-join-visualizer.js`
- `assets/hash-join-visualizer.css`
- `tests/hash-join-engine.test.js`
- `tests/hash-join-renderer.test.js`

## Pruebas

- Correcto: `test -s index.html`.
- Correcto: detección de marcadores de merge en `index.html`.
- Correcto: el enlace de Skill resuelve a `SKILL.md`.
- Correcto: `git diff --check` no detectó errores en archivos versionados.
- Correcto: los documentos nuevos pasan `git diff --no-index --check` sin espacios finales.
- Correcto: sintaxis de `assets/portal.js` y `content/module-catalog.js` validada con Node.
- Correcto: 16 enlaces internos del portal resuelven a un ID presente.
- Correcto: 16 controles existentes del módulo JOIN permanecen presentes; jerarquía de página, tabs, responsive y movimiento reducido superan 8 comprobaciones estáticas.
- Correcto: prueba funcional local de Chrome a 375 px y 768 px; el contenido principal no presenta scroll horizontal y el índice lateral conserva desplazamiento horizontal intencional.
- Correcto: navegación con teclado en las pestañas del workspace; `ArrowRight` activa Execution Plan y muestra su panel asociado.
- Correcto: simulador JOIN, timeline de Internals, AI Tutor, SQL Analyzer, Execution Plan Explainer, AI What If?, Select AI y RAG local actualizan su salida esperada.
- Correcto: con `prefers-reduced-motion: reduce`, el scroll suave pasa a `auto` y se desactivan los autoplay de JOINs e Internals.
- Correcto: las pruebas locales usaron Chrome headless y un servidor efímero; no se añadieron dependencias de producción.
- Correcto: `tests/hash-join-engine.test.js` valida determinismo, contrato de evento, resultados, `NULL`, duplicados, estado reconstruido y `SPILL_TEMP` didáctico.
- Correcto: Chrome headless valida las tres vistas, selección de escenarios, Play/Pause/Next/Previous/Reset, tutor local, selección de componentes, foco y diseño a 375 px y 768 px.
- Correcto: el control Play nuevo y los autoplay existentes se desactivan con `prefers-reduced-motion: reduce`.
- Correcto: comprobación final de sintaxis Node, `git diff --check`, marcadores de merge y referencias locales de HTML; no hay URLs, credenciales ni secretos en el runtime añadido.
- Evidencia visual local: captura del laboratorio HASH JOIN revisada con Chrome headless; no se versionó ningún artefacto de prueba.
- Correcto: auditoría de navegador selecciona eventos, filas, bloques, operadores y nodos Internals; valida el inspector, SQL relacionado, tutor local, navegación por teclado, 375 px, 768 px y las experiencias JOIN/AI existentes.
- Correcto: `tests/hash-join-renderer.test.js` verifica los contratos de selección del renderer para filas, bloques, operadores y componentes SVG.
- Correcto: cierre aprobado revisó cambios exclusivos de Sprint 2, secretos, artefactos temporales, dependencias y recursos locales antes de publicar la rama.
- No se ejecutaron scripts de Anatomy ni se hicieron llamadas a una base de datos Oracle.

## Limitaciones pendientes

- Los AI Labs continúan siendo reglas, plantillas, cálculos o corpus locales; no son inferencias de un modelo, Vector Search real, Select AI ni RAG sobre Oracle Database.
- Las métricas, planes y recorridos del motor son educativos; no sustituyen `DBMS_XPLAN.DISPLAY_CURSOR`, SQL Monitor, AWR ni una ejecución observada.
- El motor reutilizable y HASH JOIN ya se entregan en Sprint 2; los demás operadores permanecen pendientes para los sprints posteriores.
- El HASH JOIN está limitado a INNER JOIN por igualdad, datasets sintéticos y una selección determinista de Build/Probe; no modela paralelismo, particionado real, adaptive plans, estadísticas ni gestión real de memoria.

## Integración Obsidian

- Se creó el enlace simbólico `/Users/pedrotor/Documents/VAULT/01-Projects/Oracle SQL & AI Database Engine Academy` hacia este repositorio. Obsidian puede indexar el Markdown sin duplicar ni mover el proyecto.

## Siguiente actividad

1. Abrir o revisar un Pull Request hacia `main` solo cuando se solicite; no hacer merge sin aprobación.
2. Mantener el portal sin backend; antes de instalar Anatomy, fijar versión y revisar los scripts concretos que se pretendan ejecutar.
3. Para Sprint 3, reutilizar el contrato de eventos del motor al comparar NESTED LOOPS y MERGE JOIN sin afirmaciones absolutas de rendimiento.
