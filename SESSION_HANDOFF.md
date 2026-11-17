# Session Handoff — Oracle SQL & AI Database Engine Academy

## Estado actual

- **Fecha:** 2026-11-16
- **Rama:** `feature/sprint4-runbook-navigation` creada desde `origin/main` en `07e8daf` tras la integración de Sprint 4.
- **Sprint:** 4.1 — RunBook Navigation & UX Integration.
- **Estado de entrega:** Sprint 4.1 cerrado y publicado en `origin/feature/sprint4-runbook-navigation`; el siguiente paso es revisión mediante Pull Request. No se hace merge automático y `main` no fue modificado.

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
| Sprint 3 comparison | Se añadieron tres motores deterministas equivalentes, comparación sincronizada/independiente, inspector y What If? local, sin modificar el laboratorio HASH JOIN original. |
| Sprint 4 intelligence | Se añadieron tres ejemplos de planes ilustrativos, importación local de texto `DBMS_XPLAN`, parser puro, visualizador tabular/jerárquico/SVG, inspector de operadores, cardinalidad prudente, hallazgos basados en evidencia, SQL Analyzer, What If? y tutor por reglas. |
| Auditoría Sprint 4 | Se corrigió la tabla del visualizador para mostrar todas las columnas presentes, incluido `A-Time`; se amplió la cobertura de parser para predicados `filter`, Notes, marcadores `*`, métricas abreviadas, workarea, entrada incompleta y estadísticas ausentes. |
| Sprint 4.1 RunBook | Se centralizó la definición de 11 capítulos, se integró Intelligence como capítulo 09, se sincronizaron hash/breadcrumbs/estado activo/historial y se añadieron actividades educativas persistentes sin sobrescribir progreso previo. |

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
- `content/execution-comparison-scenarios.js`
- `simulation/join-comparison-engine.js`
- `renderer/join-comparison-renderer.js`
- `ui/join-comparison-lab.js`
- `assets/join-comparison.css`
- `tests/join-comparison-engine.test.js`
- `tests/join-comparison-renderer.test.js`
- `assets/sql-intelligence.css`
- `content/oracle-plan-operator-catalog.js`
- `content/sql-intelligence-examples.js`
- `simulation/oracle-plan-parser.js`
- `simulation/oracle-plan-analyzer.js`
- `simulation/oracle-sql-analyzer.js`
- `simulation/sql-what-if-engine.js`
- `renderer/execution-plan-renderer.js`
- `renderer/sql-intelligence-renderer.js`
- `ui/sql-intelligence-bootstrap.js`
- `ui/sql-intelligence-lab.js`
- `tests/oracle-plan-parser.test.js`
- `tests/oracle-plan-analyzer.test.js`
- `tests/sql-intelligence-renderer.test.js`
- `content/runbook-chapters.js`
- `tests/runbook-chapters.test.js`

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
- Correcto: `tests/join-comparison-engine.test.js` valida determinismo, `NULL`, duplicados, eventos tipados y resultados lógicos equivalentes para los tres métodos y escenarios.
- Correcto: Chrome headless valida comparación HASH/NESTED/MERGE, modo sincronizado e independiente, controles, inspector, What If?, foco, 375 px, 768 px y regresiones de JOINs, HASH JOIN y AI Labs.
- Correcto: con `prefers-reduced-motion: reduce`, el Play del laboratorio comparativo y los autoplay existentes quedan desactivados.
- Correcto: cierre aprobado volvió a validar alcance exclusivo de Sprint 3, equivalencia HASH/NESTED/MERGE, simulaciones originales, responsive, movimiento reducido, secretos, dependencias y recursos locales.
- Correcto: preparación del PR corrigió el enlace RunBook activo para exponer `aria-current="location"`; navegación por teclado y las pestañas del workspace pasan nuevamente en navegador.
- No se ejecutaron scripts de Anatomy ni se hicieron llamadas a una base de datos Oracle.
- Correcto: parser unitario cubre planes DISPLAY/DISPLAY_CURSOR con columnas variables, predicados, notas, jerarquía, operaciones desconocidas, valores ausentes, entrada malformada, límite de tamaño y texto con intento de inyección HTML.
- Correcto: análisis unitario cubre normalización de A-Rows/Starts, división entre cero, hallazgos prudentes, SQL con JOIN/funciones y determinismo/aislamiento de What If.
- Correcto: todos los tests existentes y nuevos de Node pasan; `node --check`, `test -s index.html`, búsqueda de marcadores de merge y `git diff --check` pasan.
- Correcto: Chrome headless verificó recursos locales, importación de Retail, selección y contracción de árbol, inspector, SQL relacionado, SQL Analyzer, What If, tutor, navegación por teclado, 375 px, 768 px, `prefers-reduced-motion` y ausencia de errores de consola.
- Correcto: auditoría final de navegador importó un plan con `A-Time` y HTML hostil; confirmó columna y valor originales, ausencia de nodos HTML ejecutables, texto escapado, enlaces RunBook, catálogo, Event Inspector, SQL relacionado, insights, What If, tutor y regresiones de JOIN/HASH/Comparison/AI Labs.
- Correcto: la preferencia `prefers-reduced-motion` se aplicó antes de la carga y desactivó los autoplay existentes; todas las solicitudes de recursos permanecieron en el mismo origen local de GitHub Pages.
- Correcto: Chrome headless abrió `#intelligence`, confirmó capítulos 01–11, un único `aria-current`, transición 08 → 09 → 10, Back/Forward, foco de teclado, 375 px, 768 px y ausencia de errores de consola.
- Correcto: el progreso local deja Intelligence incompleto al importar un plan y lo completa solo tras seleccionar un operador; la estructura `visited`, `activities` y `completed` persiste en la clave existente de `localStorage`.
- Evidencia visual local: `/private/tmp/oracle-sprint4-intelligence.png` muestra el catálogo con la tarjeta AI SQL Intelligence; el artefacto no se versionó.

## Limitaciones pendientes

- Los AI Labs continúan siendo reglas, plantillas, cálculos o corpus locales; no son inferencias de un modelo, Vector Search real, Select AI ni RAG sobre Oracle Database.
- Las métricas, planes y recorridos del motor son educativos; no sustituyen `DBMS_XPLAN.DISPLAY_CURSOR`, SQL Monitor, AWR ni una ejecución observada.
- El motor reutilizable y HASH JOIN ya se entregan en Sprint 2; los demás operadores permanecen pendientes para los sprints posteriores.
- El HASH JOIN está limitado a INNER JOIN por igualdad, datasets sintéticos y una selección determinista de Build/Probe; no modela paralelismo, particionado real, adaptive plans, estadísticas ni gestión real de memoria.
- La comparación cubre INNER JOIN por igualdad; no pretende reproducir orden físico, adaptive joins, paralelismo, costos ni la selección real del optimizador.
- AI SQL Intelligence Lab no ejecuta SQL, no se conecta a Oracle, no reproduce el optimizador, no calcula costos ni predice planes reales. Los ejemplos son planes sintéticos explícitamente ilustrativos.
- El parser requiere tablas con `Id` y `Operation`; no interpreta formatos gráficos, secciones propietarias no tabulares ni asociaciones ambiguas. No reemplaza `DBMS_XPLAN`, SQL Monitor, AWR o investigación de producción.

## Integración Obsidian

- Se creó el enlace simbólico `/Users/pedrotor/Documents/VAULT/01-Projects/Oracle SQL & AI Database Engine Academy` hacia este repositorio. Obsidian puede indexar el Markdown sin duplicar ni mover el proyecto.

## Siguiente actividad

1. Revisar el Pull Request de Sprint 4.1 hacia `main`; no hacer merge sin aprobación explícita.
2. Considerar Sprint 5 para ampliar formatos de plan e integración visual avanzada, sin afirmar diagnóstico productivo.
3. Mantener el portal sin backend; antes de instalar Anatomy, fijar versión y revisar los scripts concretos que se pretendan ejecutar.
