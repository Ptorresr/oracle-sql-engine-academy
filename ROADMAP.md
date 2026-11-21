# Roadmap — Oracle SQL & AI Database Engine Academy

## Principios de entrega

Cada sprint conserva la experiencia previa, entrega valor visible en GitHub Pages y no presenta métricas educativas como telemetría real. Las historias de simulación se aceptan solo si el modelo determinista, el contenido y las vistas sincronizadas están definidos antes del renderizado.

## Sprint 8 — Advanced Database Internals & Performance Lab

**Estado:** implementado y validado localmente en `feature/database-performance-foundation`. La planificación parte de `origin/main` (`ec05173`), que ya incluye Sprint 7 integrado. Los incrementos 8.1–8.7 están preservados sin commit, push, Pull Request ni merge; la publicación queda pendiente de aprobación.

**Objetivo:** ampliar la academia con cinco laboratorios educativos, deterministas y locales sobre Buffer Cache & I/O, PGA/Work Areas/TEMP, Optimizer & Cardinality, Execution Plan Diagnostics y Performance What-If.

**Criterios de aceptación de planificación**

- El inventario prioriza reutilizar los motores HASH JOIN/Comparison, parser/analyzer de planes, Event Inspector, Animated Data Flow, Presentation Mode, RunBook y persistencia local existentes.
- El contrato conserva los campos base de eventos y propone extensiones compatibles; no introduce un segundo Event Inspector, parser, comparador ni controlador global de reproducción.
- Cada laboratorio declara las preguntas educativas, tres casos de uso sintéticos, SQL de referencia, supuestos, límites, métricas ilustrativas y perspectivas Developer/DBA.
- La propuesta reserva el capítulo 15 `#database-performance` y rutas internas sin modificar ni renumerar los capítulos 01–14.
- La estrategia de pruebas cubre determinismo, seguridad, planes, temas, reduced motion, responsive, navegación, Presentation Mode y GitHub Pages sin Oracle Database real.

**Incrementos propuestos:** 8.1 Foundation & Event Model; 8.2 Buffer Cache & I/O; 8.3 PGA & TEMP; 8.4 Optimizer & Cardinality; 8.5 Execution Plan Diagnostics; 8.6 Performance What-If; 8.7 RunBook, Presentation & QA.

**Documentos de decisión:** `docs/SPRINT8_ARCHITECTURE_PLAN.md`, `docs/SPRINT8_EVENT_CONTRACT.md`, `docs/SPRINT8_SCENARIOS.md` y `docs/SPRINT8_ACCEPTANCE_CRITERIA.md`.

**Entrega 8.1:** `content/performance-scenarios.js` aporta tres escenarios sintéticos e inmutables; `simulation/performance-event-adapter.js` valida/adapta el contrato compatible de eventos, y `tests/performance-event-contract.test.js` cubre contrato, inmutabilidad, determinismo y casos inválidos. Esta fundación no se carga todavía en el runtime ni altera capítulos 01–14.

**Entrega 8.2:** `simulation/buffer-cache-engine.js` materializa el primer motor puro de rendimiento con una regla FIFO educativa, escenarios frío/caliente y patrones declarados, secuenciales o reutilizados. `renderer/buffer-cache-renderer.js`, `ui/buffer-cache-lab.js`, `assets/buffer-cache-lab.css` y `assets/illustrations/buffer-cache-tech.svg` aportan Developer, Flujo conceptual e Internals sincronizados con el único timeline, Event Inspector, SQL relacionado, tutor local y What If. El preview se carga localmente mediante `assets/portal.js`; no añade aún capítulo 15, rutas, progreso ni Presentation Mode. Las métricas y el posible I/O son explícitamente ilustrativos, no telemetría ni algoritmo real de Oracle.

**Entrega 8.3:** `simulation/workarea-temp-engine.js` aplica una fórmula local, visible y determinista para clasificar HASH JOIN o SORT como Optimal, One-Pass o Multi-Pass educativos. Emite `WORKAREA_ALLOCATE`, `WORKAREA_PROCESS`, `TEMP_WRITE`, `TEMP_READ` y `WORKAREA_COMPLETE`; TEMP aparece solo en los dos últimos tipos cuando la regla requiere fases adicionales. `renderer/workarea-temp-renderer.js`, `ui/workarea-temp-lab.js`, `assets/workarea-temp-lab.css` y `assets/illustrations/workarea-temp-tech.svg` presentan SQL Operation, PGA / Work Area, TEMP y Results sobre un único timeline con Event Inspector, SQL relacionado, tutor local, What If y Animated Data Flow. El preview se carga localmente mediante `assets/portal.js`; no añade capítulo 15, rutas, progreso ni Presentation Mode. La clasificación, unidades, pasadas y métricas son ilustrativas y no reproducen la administración de PGA ni los criterios internos de Oracle.

**Entrega 8.4:** `optimizerModel` añade perfiles inmutables de cardinalidad a los tres escenarios. `OracleOptimizerCardinalityEngine` normaliza filas base, selectividad de 0 a 1, estado de estadísticas, índice y distribución; aplica `ceil(filas base × selectividad declarada)` y conserva cero como cero. Su timeline único emite `CARDINALITY_ESTIMATE` → `ACCESS_PATH_SELECTED` → `TABLE_ACCESS` → filas lógicas declaradas. `renderer/optimizer-cardinality-renderer.js`, `ui/optimizer-cardinality-lab.js`, `assets/optimizer-cardinality-lab.css` y `assets/illustrations/optimizer-cardinality-tech.svg` presentan Developer, Execution Plan educativo, Internals, Results, Event Inspector, SQL relacionado, tutor local, What If y Animated Data Flow. Las alternativas son reglas locales visibles, con `decisionBasis`; no son costes ni decisiones del CBO y una observación declarada nunca se presenta como A-Rows. El preview se carga localmente mediante `assets/portal.js` y no añade capítulo 15, rutas, progreso ni Presentation Mode.

**Entrega 8.5:** `simulation/plan-diagnostics-timeline.js` transforma exclusivamente nodos ya parseados y analizados en un único recorrido reversible `PLAN_OPERATOR_START` → `PLAN_OPERATOR_END` por operador. Conserva el plan y sus métricas importadas congelados, limita de forma explícita la reproducción de planes grandes sin ocultar la tabla completa y no rellena ausencias. `ui/sql-intelligence-lab.js` reutiliza el laboratorio Intelligence, Event Inspector, Animated Data Flow, AI Tutor, What If y Presentation Mode existentes para sincronizar la selección de tabla, árbol, SVG y timeline. El preview añade controles locales, evidencia/resultados diagnósticos y la leyenda persistente de que no es una traza física o temporal de Oracle. No crea parser, capítulo 15, rutas, progreso ni Presentation Mode nuevo.

**Entrega 8.6:** `whatIfModel` añade snapshots declarativos y reglas de comparabilidad a Retail, Finanzas y Data Warehouse. `OraclePerformanceWhatIfEngine` compone los contratos públicos de Optimizer, Buffer Cache y Workarea en tracks A/B independientes, sin tipos de evento ni métricas inventadas. `renderer/performance-what-if-renderer.js`, `ui/performance-what-if-lab.js`, `assets/performance-what-if-lab.css` y una infografía SVG local muestran Developer, Execution Plan educativo, Internals, Results, Event Inspector, SQL relacionado, Tutor y Animated Data Flow por track. La equivalencia requiere identidad declarada de población y resultado; en Data Warehouse, cambiar volumen o población marca la comparación como no comparable. No registra capítulo 15, rutas, progreso ni Presentation Mode.

**Entrega 8.7:** `content/runbook-chapters.js`, `content/module-catalog.js`, `index.html` y `assets/portal.js` integran el capítulo 15 **Database Internals & Performance** sin renumerar 01–14. Las rutas internas resuelven de forma centralizada, esperan la carga local e idempotente de los cuatro laboratorios nativos y emiten `academy:performance-ready`; Execution Plan Diagnostics delega en AI SQL Intelligence sin duplicar parser, analyzer ni timeline. El progreso conserva `oracle-sql-academy.joins.progress.v1` y exige una actividad educativa válida por laboratorio. Buffer Cache, PGA/TEMP, Optimizer y What-If registran adaptadores de Presentation Mode que delegan en sus propios timelines. La validación local incluye 36 suites Node, sintaxis, recursos, seguridad estática y Chrome/CDP a 375/768/1440 px; no se añaden motores, eventos, dependencias, backend ni conexiones Oracle.

## Sprint 0 — Foundation & Development Environment

**Objetivo:** establecer reglas, arquitectura, trazabilidad y evaluación de dependencias sin crear nuevas simulaciones.

**Criterios de aceptación**

- La rama de trabajo es `feature/project-foundation` y no se modifica `main`.
- `AGENTS.md`, `PROJECT_CONTEXT.md`, `ROADMAP.md` y `SESSION_HANDOFF.md` describen el modo de trabajo.
- La Skill local conserva su contrato y queda visible desde `.agents/skills/` para Codex.
- Anatomy está evaluado por licencia, compatibilidad, dependencias, riesgos y plan de adopción; no se ejecutan scripts de upstream.
- La documentación existente y la demo no se eliminan ni sobrescriben sin justificación.
- Las comprobaciones estáticas existentes pasan.

## Sprint 1 — Shell educativo y arquitectura modular

**Estado:** completado y publicado en `origin/feature/interactive-learning-portal`; pendiente de revisión/merge autorizado.

**Objetivo:** convertir la demo conservada en una experiencia RunBook navegable y preparar el primer módulo modular sin ampliar el alcance del motor.

**Criterios de aceptación**

- Navegación, breadcrumbs, índice, foco de teclado y diseño móvil siguen el patrón RunBook.
- Tokens de diseño y componentes reutilizables conservan la interfaz oscura actual.
- Un contrato de contenido separa narrativa, datasets, SQL y casos del renderizado.
- El primer módulo cumple las cinco preguntas educativas y documenta los límites técnicos.
- Validación manual en escritorio, móvil, teclado y movimiento reducido.

**Entrega implementada:** catálogo de módulos con estados disponible/futuro, progreso persistente local, breadcrumbs, índice lateral, navegación anterior/siguiente y Simulation Workspace con resúmenes Developer, Execution Plan e Internals. El catálogo y la capa visual se separan en archivos nuevos; el contenido y los simuladores JOIN existentes se conservan.

## Sprint 2 — Motor determinista y HASH JOIN

**Estado:** cerrado y publicado en `origin/feature/database-engine-visualizer`; pendiente únicamente de revisión/merge autorizado hacia `main`.

**Objetivo:** extraer un motor de eventos reutilizable y aplicarlo a HASH JOIN.

**Criterios de aceptación**

- Un modelo puro genera un timeline reproducible de eventos tipados.
- Developer, Execution Plan e Internals se sincronizan al avanzar, pausar, reiniciar y cambiar velocidad.
- Se distinguen cache hit/miss conceptuales, workarea PGA, posible spill a TEMP y resultado lógico.
- Tres casos de uso, SQL Oracle, `NULL`, cardinalidad y leyendas de métricas ilustrativas están validados.

**Entrega implementada:** escenarios declarativos de Retail, Finanzas y Data Warehouse; timeline con `READ_BLOCK`, `CACHE_HIT`, `CACHE_MISS`, `TABLE_ACCESS`, `HASH_BUILD`, `HASH_PROBE`, `EMIT_ROW` y `SPILL_TEMP`; vistas sincronizadas Developer, Execution Plan e Internals; controles Play/Pause/Next/Previous/Reset/velocidad; tutor local y What If? didáctico.

## Sprint 3 — Comparación de operadores y modos

**Estado:** cerrado y publicado en `origin/feature/sql-execution-comparison`; pendiente únicamente de revisión/merge autorizado hacia `main`.

**Objetivo:** incorporar NESTED LOOPS, MERGE JOIN y comparativas de acceso sin reglas absolutas.

**Criterios de aceptación**

- Los tres métodos de JOIN comparten contrato de evento y pueden compararse sobre datasets definidos.
- Los modos Developer y DBA enfocan información distinta sin divergir en el estado.
- Se explican estimaciones, filas reales conceptuales, selectividad, índices, memoria y TEMP con advertencias.
- La accesibilidad y la reproducción determinista se prueban en todos los operadores.

**Entrega implementada:** laboratorio con selección de dos métodos, timelines sincronizados o independientes, controles Play/Pause/Previous/Next/Reset/velocidad, Event Inspector, AI What If? local y validación de resultados equivalentes entre HASH JOIN, NESTED LOOPS y SORT MERGE JOIN.

## Sprint 4 — Planes y laboratorios AI locales

**Estado:** completado, auditado e integrado en `main`.

**Objetivo:** ampliar el aprendizaje con explicador de planes, SQL Analyzer y AI What If? locales.

**Criterios de aceptación**

- El importador de `DBMS_XPLAN` procesa texto sin ejecutar SQL ni enviar datos.
- Las explicaciones distinguen reglas locales de IA generativa real.
- What If? usa hipótesis explícitas y no afirma predicción de plan.
- Los flujos Vector Search, Select AI y RAG son reproducibles y etiquetados como demo.

**Entrega implementada:** importador seguro de texto `DBMS_XPLAN`, parser puro con columnas variables y advertencias, tabla/árbol/SVG de operadores, Event Inspector contextual, análisis prudente de E-Rows/A-Rows/Starts, hallazgos deterministas basados en evidencia, SQL Analyzer local, What If? aislado, tutor de reglas y tres ejemplos educativos. La auditoría final confirmó el renderizado de todas las columnas presentes —incluido `A-Time`—, el escape de entradas hostiles y la ausencia de solicitudes externas. Los laboratorios anteriores continúan como módulos independientes.

## Sprint 4.1 — RunBook Navigation & UX Integration

**Estado:** completado, validado y publicado en `origin/feature/sprint4-runbook-navigation`; pendiente de revisión mediante Pull Request hacia `main`.

**Objetivo:** integrar AI SQL Intelligence como capítulo oficial del RunBook sin duplicar fuentes de navegación ni alterar los simuladores existentes.

**Criterios de aceptación**

- Un contrato declarativo define los capítulos 01–11, sus rutas estables y secuencia anterior/siguiente.
- `#intelligence` activa exclusivamente el capítulo 09 y sincroniza menú, breadcrumb, título e historial.
- AI Learning Lab pasa a capítulo 10 y Comprueba a capítulo 11.
- El progreso local distingue exploración de finalización educativa; Intelligence exige importar un plan y seleccionar un operador.
- Navegación responsive, teclado, movimiento reducido y módulos existentes superan pruebas de regresión.

**Entrega implementada:** contrato único de once capítulos, capítulo 09 para AI SQL Intelligence, menú RunBook generado y sincronizado, rutas hash con Back/Forward, navegación 08 → 09 → 10, estado activo único y progreso local basado en actividades educativas. La validación final cubrió pruebas unitarias, Chrome headless, 375 px, 768 px, movimiento reducido y laboratorios existentes.

## Sprint 5 — Oracle AI Database Internals Lab

**Estado:** completado y validado localmente en `feature/oracle-ai-database-internals`; pendiente de commit, publicación y Pull Request hacia `main`.

**Objetivo:** explicar AI Vector Search, Hybrid Vector Search, Select AI, RAG y Agentic Workflows mediante cinco simulaciones deterministas, visuales y seguras, sin backend ni servicios externos.

**Criterios de aceptación**

- Cinco laboratorios con tres escenarios sintéticos de Retail, Finanzas y Operaciones, contrato educativo, SQL/API de referencia, preguntas y advertencias DBA/seguridad.
- Eventos reproducibles con ubicación explícita: `DATABASE_SIMULATED`, `APPLICATION_SIMULATED`, `EXTERNAL_AI_SIMULATED` o `EDUCATIONAL_ABSTRACTION`.
- Vector Search calcula métricas validadas, Top-K, empates deterministas, exact/approximate conceptual y recall del dataset sin presentar HNSW/IVF como implementación local.
- Hybrid Search declara y visualiza su fusión educativa; Select AI no genera SQL; RAG filtra permisos antes del contexto; Agentic rechaza operaciones no autorizadas.
- Event Inspector, vistas Developer/Processing Flow/Internals, tutor local, What If, controles Play/Pause/Step/Reset/velocidad, SVG accesible, rutas directas y progreso local permanecen sincronizados.
- Las 14 suites de motores/renderers y regresiones pasan; Chrome headless valida escritorio, 375 px, 768 px, teclado, rutas, reduced motion, recursos locales y ausencia de errores de consola.

**Entrega implementada:** capas `content/`, `simulation/`, `renderer/`, `ui/`, `assets/`, `tests/` y `sql/` incrementales. No se modifican motores previos, no se añaden dependencias y no se habilitan llamadas de red.

**Acceso publicado:** el capítulo 12, **Oracle AI Database Internals**, conserva los capítulos 01–11 y expone AI Vector Search, Hybrid Search, Select AI, RAG y Agentic Workflows mediante rutas directas, estado activo y progreso local.

## Sprint 6 — Oracle AI Database Architecture Explorer

**Estado:** completado y validado en `feature/oracle-ai-architecture-explorer`; pendiente únicamente de commit, publicación y Pull Request autorizados.

**Objetivo:** enseñar responsabilidades, flujos de datos, controles y alternativas de arquitecturas Oracle AI Database mediante un Explorer y Builder deterministas, sin backend.

**Criterios de aceptación**

- El capítulo 13 y la tarjeta de catálogo conservan los capítulos 01–12, rutas existentes y progreso local.
- Tres arquitecturas de referencia declaran nodos, conexiones, zonas, preguntas, laboratorios relacionados y límites educativos.
- El canvas SVG permite inspeccionar componentes y conexiones; el Builder añade, conecta, elimina, mueve por teclado y valida una variante solo local.
- Data Flow Explorer, Security Inspector, What If y Deployment Guide consumen el mismo modelo, separan sus hallazgos y nunca se presentan como OCI real.
- Las pruebas cubren determinismo, grafo, seguridad, What If, guía, navegación, responsive, teclado, reduced motion, recursos locales y regresiones.

**Entrega implementada:** catálogo de componentes, tres escenarios (Retail, Finanzas y Operaciones), motores puros de grafo/flujo/seguridad/alternativas/guía, canvas SVG accesible inspirado en Anatomy, inspector contextual, controles de timeline, capítulo 13 con criterios educativos de finalización y documentación de fuentes Oracle.

## Visual Design System 2.0 — Redwood + Futuristic 3D

**Estado:** completado y validado en `feature/oci-runbook-visual-system`; listo para commit, publicación y Pull Request hacia `main`.

**Objetivo:** unificar claro, oscuro y Sistema con tokens derivados del OCI PoC RunBook, sin reescribir motores ni reemplazar visualizaciones interactivas.

**Criterios de aceptación**

- El selector `Claro | Oscuro | Sistema` es accesible, no recarga la página, persiste la selección y migra preferencias `theme.v1` a `theme.v2` sin borrar la clave anterior.
- `Sistema` sigue y reacciona a `prefers-color-scheme`; `prefers-reduced-motion` desactiva scroll suave, transiciones y animaciones no esenciales.
- Dashboard, RunBook, Workspace, formularios, SQL, planes, Event Inspector, HASH JOIN, Comparison, AI Labs y Architecture Explorer consumen tokens centralizados; los colores semánticos de gráficos permanecen diferenciados.
- Ilustraciones 3D locales, específicas por módulo, optimizadas a 1280×720, con `loading="lazy"`, dimensiones, alt text y licencia/procedencia documentadas.
- Responsive 375/768/1440 px, foco visible, teclado, `aria-current`, SVG accesible, GitHub Pages sin backend ni recursos externos.

**Entrega implementada:** sistema de tokens OCI, overrides de laboratorios dinámicos, selector de tema de tres estados, migración de preferencias, cinco ilustraciones 3D, documentación visual y prueba de contrato para temas. Las pruebas de motores permanecen sin cambios.

## Visual Design System 2.1 — Animated 3D Data Flow

**Estado:** completado y validado en `feature/animated-3d-data-flow`; listo para publicación mediante Pull Request hacia `main`.

**Objetivo:** convertir las ilustraciones 3D en vistas conceptuales sincronizadas con los eventos deterministas, sin reemplazar SVG, timelines, Event Inspector o controles existentes.

**Criterios de aceptación**

- Una capa reutilizable recibe un timeline existente y muestra ruta, anchors, partícula, paso activo y componentes seleccionables sobre la imagen correspondiente.
- HASH JOIN distingue acceso, Buffer Cache, Build, Probe, emisión y TEMP solo según los eventos generados por el motor.
- Comparison, SQL Intelligence, AI Internals y Architecture Explorer usan el mismo contrato visual; los planes importados solo muestran operadores identificados por el parser.
- Play/Pause/Previous/Next/Reset, velocidad, selección de timeline, selección textual de componentes, Event Inspector y progreso permanecen sincronizados.
- SVG relativo, temas Redwood, responsive 375/768/1440, teclado, foco y reduced motion se validan sin dependencias externas.

**Entrega implementada:** `renderer/animated-data-flow-renderer.js`, `assets/animated-data-flow.css`, integraciones incrementales en cinco laboratorios, `planTimeline` para planes importados o secuencia ilustrativa sin plan, pruebas de contrato y evidencia Chrome local.

## Sprint 7 — Interactive Learning & Presentation Experience

**Estado:** auditado, validado e integrado en `origin/main` mediante PR #9 (merge `ec05173`).

**Criterios de aceptación:**

- Presentation Mode funciona en HASH JOIN, Comparison, AI SQL Intelligence, AI Internals y Architecture Explorer.
- Play/Pause/Previous/Next/Reset, velocidad, Escape y reduced motion delegan en el estado existente.
- Existen tres desafíos de Retail, Finanzas y Operaciones, con Builder SVG y evaluación 0–100 explicable.
- Se detectan componentes faltantes, conexiones inválidas, RAG sin contexto autorizado y Agentic sin denegación.
- La evaluación separa evidencia funcional, flujo, componentes y seguridad; retirar un control no elimina el flujo y no produce doble penalización.
- Progreso y puntuaciones permanecen locales; no se modifican capítulos 01–13.
- Las 25 suites Node, sintaxis, `git diff --check`, Chrome local, responsive, teclado, Escape y reduced motion pasan; axe no está instalado.
- Chrome Headless/CDP validó cinco laboratorios, capítulo 14, temas claro/oscuro, reevaluación financiera, Escape real y ausencia de errores de consola.
- Se corrigió la sincronización del tema entre `html` y `body` y el anclaje diferido del capítulo 14 bajo el encabezado sticky.

**Limitaciones auditadas:** las puntuaciones son educativas y deterministas; no son una auditoría de seguridad real. `axe` no está instalado; las capturas visuales se obtuvieron localmente y no equivalen a una validación de GitHub Pages.

**Siguiente actividad:** revisar PR #9; no realizar merge automáticamente.
