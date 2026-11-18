# Session Handoff — Oracle SQL & AI Database Engine Academy

## Estado actual

- **Fecha:** 2026-11-18
- **Rama:** `feature/oracle-ai-architecture-explorer`, creada desde `origin/main` tras los Sprints 0–5 integrados.
- **Sprint:** 6 — Oracle AI Database Architecture Explorer.
- **Estado de entrega:** implementación y auditoría completas. Commit de cierre `c1110b2` creado; pendiente publicar la rama y abrir Pull Request. No se hará merge ni se modificará directamente `main`.

## Sprint 6 — Handoff de implementación

| Área | Resultado |
| --- | --- |
| Explorer | Capítulo 13, tarjeta de catálogo y rutas `#architecture-explorer`, `#architecture-retail`, `#architecture-finance` y `#architecture-operations`. Los capítulos 01–12 y sus rutas no se renumeraron. |
| Referencias | Tres modelos declarativos: Retail/recomendaciones, Finanzas/RAG y Operaciones/agente con acción denegada. Cada uno incluye objetivo, caso de uso, preguntas, conexiones y laboratorio relacionado. |
| Modelo | Catálogo separado de componentes y capacidades; motores puros de grafo, flujo, seguridad, What If y guía de despliegue. `AI Vector Search` se declara como capacidad de base de datos, no como servicio desplegable independiente. |
| UI | Canvas SVG oscuro y accesible, selección de nodos y conexiones con teclado, Component Inspector, Builder local, Data Flow Explorer, Security Inspector, AI What If, guía y perspectivas Developer/DBA sincronizadas. |
| Navegación | Se corrigió una condición de carrera: la carga tardía de AI Internals ya no puede reemplazar el capítulo 13 activo en rutas del Explorer. |
| Fuentes | `docs/OCI_ARCHITECTURE_EXPLORER.md` enlaza documentación oficial de Select AI, AI Profiles, Generative AI Agents/Tools y seguridad de red OCI. |
| Archivos | Se añadieron capas `content/oci-architecture-*`, `simulation/architecture-*`, `renderer/architecture-*`, `ui/architecture-explorer.js`, CSS, cinco pruebas de motor y documentación; se actualizaron RunBook, catálogo, portal, contexto, roadmap y arquitectura. |

## Auditoría funcional Sprint 6

- Correcto: Builder añade un componente, cambia el modelo y el canvas; las posiciones se actualizan mediante controles de teclado.
- Correcto: Builder crea y elimina conexiones; eliminar un nodo elimina sus conexiones; las relaciones incompatibles o los endpoints inexistentes son rechazados por el contrato.
- Correcto: Reset restaura nodos, conexiones y eventos del escenario activo; `oracleReferenceArchitectures` permanece sin mutaciones.
- Correcto: Data Flow utiliza la arquitectura actual, filtra conexiones inválidas, muestra advertencias cuando no hay flujo válido, resalta nodos/conexiones y mantiene el inspector en el evento seleccionado.
- Correcto: Play/Pause/Previous/Next/Reset y el timeline se ejercitaron desde Chrome; las suites verifican determinismo y bloqueo educativo de acciones `DENIED`.
- Correcto: Security Inspector cubre baseline representado, autorización ausente, restauración, RAG sin `AUTHORIZED_CONTEXT` y herramienta Agentic denegada. Ningún mensaje de ausencia de hallazgos afirma seguridad completa.
- Correcto: What If conserva hechos del baseline, hipótesis y métrica de complejidad ilustrativa; repite resultados con los mismos parámetros y no muta datos originales.
- Correcto: Deployment Guide se recalcula tras añadir/eliminar componentes, deduplica requisitos y clasifica capacidades no desplegables.
- Correcto: Chrome confirma capítulo 13 activo único, catálogo, rutas, historial Back/Forward, progreso local, foco de conexiones, 375/768/1440 y reduced motion.

## Pruebas Sprint 6

- Correcto: sintaxis Node de todos los scripts nuevos e integración de `assets/portal.js`.
- Correcto: 20 suites Node pasan, incluidas las seis nuevas de grafo, flujo, renderer, seguridad, What If y guía; las suites históricas de JOINs, planes y AI Labs siguen pasando.
- Correcto: `git diff --check` no detecta errores de espacios.
- Correcto: escaneo de firmas de secretos no encontró claves privadas, tokens GitHub, claves AWS, claves Google ni secretos con formato conocido en el runtime añadido.
- Correcto: los archivos runtime nuevos no contienen URLs HTTP(S); Chrome headless también confirmó que todos los recursos cargados permanecen en el mismo origen local.
- Correcto: Chrome headless validó ruta directa, capítulo activo 13, selección de componente, selección de conexión con `Enter`, Event Inspector del flujo, cambio a Finanzas, hash interno, What If, progreso local y ausencia de ancho extra en escritorio.
- Correcto: emulación CDP confirmó `375 px` y `768 px` con `documentElement.scrollWidth` igual al viewport, Builder visible y scroll horizontal limitado al canvas; movimiento reducido desactiva Play. La carga final a 768 px confirmó las perspectivas Developer/DBA.
- Evidencia local no versionada: `/private/tmp/oracle-sprint6-desktop.png`, `/private/tmp/oracle-sprint6-mobile.png`, `/private/tmp/oracle-sprint6-explorer-desktop.png` y `/private/tmp/oracle-sprint6-explorer-mobile.png`.

## Limitaciones Sprint 6

- El Explorer no crea ni valida recursos OCI, VCN, IAM, políticas, endpoints, Vault, cuotas, costos, observabilidad, residencia de datos o configuraciones reales.
- No existe Oracle AI Database, SQL, embeddings, LLM, agente, MCP, herramienta ni llamada OCI real en el navegador.
- Security Inspector y What If aplican reglas y consideraciones locales; una salida sin hallazgos no es una certificación de seguridad ni una recomendación de despliegue.
- Las rutas y conexiones son explicaciones educativas. No son tráfico, telemetría, SQL Monitor, Audit, Logging ni métricas observadas.

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
| Sprint 5 AI Internals | Se agregaron cinco simulaciones locales: Vector Search, Hybrid Search, Select AI, RAG y Agentic Workflows. Comparten eventos deterministas con ubicación declarada, SVG de flujo, Event Inspector, perspectivas, tutor de reglas, What If y progreso local. |
| Auditoría Sprint 5 | Chrome headless validó los cinco laboratorios, rutas directas e historial, Play/Pause/Step/Reset, Event Inspector, teclado, reduced motion, 375 px, 768 px, 1440 px, ausencia de errores de consola y recursos de la aplicación fuera de la red. |
| Fix acceso Sprint 5 | Tras el merge se comprobó que Pages estaba desplegado, pero el lab solo estaba anidado en el capítulo 10. La rama `fix/ai-internals-runbook-access` agrega capítulo 12, tarjeta de catálogo y sincronización de rutas sin modificar motores. |

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
- `content/ai-vector-scenarios.js`
- `content/hybrid-search-scenarios.js`
- `content/select-ai-scenarios.js`
- `content/rag-scenarios.js`
- `content/agentic-scenarios.js`
- `simulation/vector-distance-engine.js`
- `simulation/vector-search-engine.js`
- `simulation/hybrid-search-engine.js`
- `simulation/select-ai-flow-engine.js`
- `simulation/rag-pipeline-engine.js`
- `simulation/agentic-workflow-engine.js`
- `renderer/ai-data-flow-renderer.js`
- `renderer/vector-search-renderer.js`
- `renderer/hybrid-search-renderer.js`
- `renderer/rag-renderer.js`
- `renderer/agentic-renderer.js`
- `ui/oracle-ai-internals-lab.js`
- `assets/oracle-ai-internals.css`
- `assets/favicon.svg`
- `sql/oracle-ai-internals-examples.sql`
- `docs/ORACLE_AI_INTERNALS_LAB.md`
- `tests/vector-distance-engine.test.js`
- `tests/vector-search-engine.test.js`
- `tests/hybrid-search-engine.test.js`
- `tests/select-ai-flow-engine.test.js`
- `tests/rag-pipeline-engine.test.js`
- `tests/agentic-workflow-engine.test.js`

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
- Correcto: las seis suites de Sprint 5 validan métricas vectoriales, dimensiones incompatibles, vector cero, Top-K, exact/approximate conceptual, recall, recuperación textual/vectorial, fusión, Select AI predefinido, chunking/overlap, permisos RAG y rechazo agéntico.
- Correcto: la suite completa de 14 pruebas Node pasa junto con sintaxis de scripts nuevos, `git diff --check`, entrada HTML y detección de marcadores de merge.
- Correcto: al no estar disponible el servicio de navegador de Codex, se utilizó la instalación local existente de Chrome en modo headless, sin instalar dependencias. Se validaron los cinco tabs, eventos, inspector, Top-K/approximate, fusión, SQL predefinido, permisos RAG, rechazo Agentic, Back, teclado, reduced motion y regresiones visibles.
- Correcto: los viewports de 375 px, 768 px y 1440 px no presentan overflow de documento; Chrome no reportó excepciones ni solicitudes externas de la aplicación. Capturas locales revisadas: `/private/tmp/oracle-sprint5-desktop.png` y `/private/tmp/oracle-sprint5-mobile.png`.
- Corregido: las rutas directas de los cinco laboratorios activan exclusivamente el capítulo 12 tras finalizar el ciclo de renderizado del RunBook; `#ai` conserva el capítulo 10 y sus enlaces previos.
- Correcto: la corrección de acceso valida `#ai-internals`, catálogo, Back, las cinco rutas de laboratorio, un único `aria-current`, teclado, progreso, 375 px, 768 px, 1440 px, movimiento reducido y regresiones sin errores de consola ni solicitudes externas.
- Corregido: se eliminó el overflow de escritorio del SVG nuevo mediante un override responsive local; se añadió favicon local para evitar la solicitud 404 observada durante la auditoría inicial.

## Limitaciones pendientes

- Los AI Labs continúan siendo reglas, plantillas, cálculos o corpus locales; no son inferencias de un modelo, Vector Search real, Select AI ni RAG sobre Oracle Database.
- Las métricas, planes y recorridos del motor son educativos; no sustituyen `DBMS_XPLAN.DISPLAY_CURSOR`, SQL Monitor, AWR ni una ejecución observada.
- El motor reutilizable y HASH JOIN ya se entregan en Sprint 2; los demás operadores permanecen pendientes para los sprints posteriores.
- El HASH JOIN está limitado a INNER JOIN por igualdad, datasets sintéticos y una selección determinista de Build/Probe; no modela paralelismo, particionado real, adaptive plans, estadísticas ni gestión real de memoria.
- La comparación cubre INNER JOIN por igualdad; no pretende reproducir orden físico, adaptive joins, paralelismo, costos ni la selección real del optimizador.
- AI SQL Intelligence Lab no ejecuta SQL, no se conecta a Oracle, no reproduce el optimizador, no calcula costos ni predice planes reales. Los ejemplos son planes sintéticos explícitamente ilustrativos.
- El parser requiere tablas con `Id` y `Operation`; no interpreta formatos gráficos, secciones propietarias no tabulares ni asociaciones ambiguas. No reemplaza `DBMS_XPLAN`, SQL Monitor, AWR o investigación de producción.
- Sprint 5 no implementa HNSW/IVF, `DBMS_VECTOR`, `DBMS_HYBRID_VECTOR`, `DBMS_CLOUD_AI`, `DBMS_CLOUD_AI_AGENT`, modelos, perfiles, credenciales, ACLs ni conexiones reales. Sus recorridos son educativos y no mediciones ni planes de Oracle.
- Las capturas y pruebas Chrome usan un servidor efímero y perfiles temporales no versionados. La academia continúa sin backend, credenciales, LLM, Oracle Database ni instrumentación de producción.

## Integración Obsidian

- Se creó el enlace simbólico `/Users/pedrotor/Documents/VAULT/01-Projects/Oracle SQL & AI Database Engine Academy` hacia este repositorio. Obsidian puede indexar el Markdown sin duplicar ni mover el proyecto.

## Siguiente actividad

1. Publicar `feature/oracle-ai-architecture-explorer` y verificar que el commit `c1110b2` quede sincronizado con `origin`.
2. Abrir el Pull Request hacia `main`, revisar checks y conflictos, y no hacer merge sin aprobación explícita.
