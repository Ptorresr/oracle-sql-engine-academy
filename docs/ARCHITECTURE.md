# Arquitectura técnica

## Runtime
GitHub Pages (HTML/CSS/JS estáticos). Simulaciones deterministas del navegador, sin claves API ni acceso directo a Oracle Database.

## Capas propuestas
- `content`: lecciones y datasets declarativos por módulo.
- `simulation`: máquina de estados determinista con eventos (READ_BLOCK, CACHE_HIT, HASH_BUILD, HASH_PROBE, EMIT_ROW, SPILL_TEMP).
- `renderer`: SVG/Canvas isométrico, inspirado en Anatomy. Usar la skill Anatomy durante generación de activos; no asumir que el ZIP de Anatomy está instalado.
- `ui`: navegación estilo RunBook, vistas sincronizadas, controles y métricas.
- `ai`: explicaciones locales predefinidas y laboratorio de vectores; LLM real solo mediante backend seguro optativo.

## Learning Portal — Sprint 1

La primera evolución mantiene `index.html` como composición del módulo JOINs y añade una capa de portal sin reescribir sus laboratorios existentes:

- `content/module-catalog.js`: metadatos declarativos del catálogo de rutas. Los módulos futuros no apuntan a páginas inexistentes.
- `assets/portal.css`: tokens y componentes visuales del dashboard, breadcrumbs, workspace, pestañas y navegación responsive.
- `assets/portal.js`: navegación RunBook, progreso local aislado en `localStorage`, catálogo y resúmenes de vistas sincronizados con los controles existentes.
- `index.html`: shell semántico que conecta el dashboard con el módulo JOINs, sus secciones y los laboratorios de AI ya presentes.

El workspace no ejecuta otro plan ni introduce un motor HASH JOIN. Resume los controles del simulador de JOINs, la explicación de plan y el visualizador de internals ya existentes. La fuente de progreso es solo el navegador del estudiante; no se envían datos ni se requiere backend.

## HASH JOIN Engine — Sprint 2

La implementación incremental agrega un laboratorio independiente dentro del módulo JOINs, sin sustituir los simuladores originales:

```text
content/hash-join-scenarios.js
  └─ escenarios + SQL + datasets + resultados esperados
       │
simulation/hash-join-engine.js
  └─ timeline puro e inmutable de eventos tipados
       │
renderer/hash-join-renderer.js
  └─ tablas Developer + plan conceptual + SVG accesible
       │
ui/hash-join-visualizer.js
  └─ índice de timeline, controles y explicaciones locales
```

El motor siempre recibe un escenario declarativo y produce la misma secuencia de eventos. Cada evento conserva el contrato `{ step, type, source, target, rowIds, blockIds, label, illustrativeMetrics }`, más una explicación y, cuando aplica, IDs de coincidencia o de salida. El renderer no altera datos ni decide eventos; la UI solo mueve la posición del timeline.

### Event Inspector

El inspector mantiene una selección independiente de la posición del timeline: evento, fila, bloque, operador o componente. El evento activo continúa siendo la única fuente del estado sincronizado; seleccionar otro elemento no genera una nueva simulación ni modifica los resultados. El renderer expone selectores semánticos para filas, bloques, operadores y nodos SVG, y la UI muestra qué ocurre, dónde, cómo, para qué, datos y una advertencia DBA. Los elementos tienen foco o son botones cuando corresponde.

La opción **Ver SQL relacionado** enlaza los eventos lógicos de Build/Probe/Emit con la condición `ON` del escenario. Para cache, PGA, TEMP y acceso físico declara expresamente que no existe una cláusula SQL que los fuerce: son decisiones del optimizador o de la ejecución, no semántica SQL.

El escenario Data Warehouse usa una capacidad de workarea artificialmente baja para emitir `SPILL_TEMP`. Cache hits/misses, lectura física ilustrativa, hash buckets, PGA y TEMP son recursos de aprendizaje; no son una traza ni una métrica real de Oracle. El SVG mantiene una referencia visual Anatomy-style, pero no incorpora código, assets ni dependencias de Anatomy.

## SQL Execution Comparison Lab — Sprint 3

El laboratorio comparativo reutiliza el contrato de evento sin modificar el motor HASH JOIN de Sprint 2:

```text
content/execution-comparison-scenarios.js
  └─ misma consulta lógica, tres datasets y pares esperados
       │
simulation/join-comparison-engine.js
  ├─ HASH JOIN: HASH_BUILD / HASH_PROBE
  ├─ NESTED LOOPS: NESTED_OUTER_ROW / INDEX_LOOKUP
  └─ SORT MERGE JOIN: SORT_INPUT / MERGE_ADVANCE
       │
renderer + ui/join-comparison-*.js
  └─ dos timelines independientes o sincronizados + inspector
```

Cada timeline conserva eventos inmutables y métricas ilustrativas. La comparación usa pares canónicos `leftId:rightId` para comprobar equivalencia lógica sin afirmar orden físico de salida. Los métodos exponen costos y accesos como hipótesis educativas: el selector de algoritmos no es un optimizador ni sustituye estadísticas, plan real o ejecución observada.

## AI SQL Intelligence Lab — Sprint 4

```text
contenido SQL + texto DBMS_XPLAN no confiable
    │
simulation/oracle-plan-parser.js
    ├── nodos, jerarquía, métricas presentes, predicados, notas, advertencias
    │
simulation/oracle-plan-analyzer.js ── SQL Analyzer ── What If? local
    │
renderer/execution-plan-renderer.js ── renderer/sql-intelligence-renderer.js
    │
ui/sql-intelligence-lab.js
    ├── SQL Editor · Plan Importer · Plan Visualizer
    └── Performance Insights · What If? · AI Tutor
```

El parser no depende del DOM ni ejecuta SQL. Tiene un límite de 200.000 caracteres, requiere una tabla con `Id` y `Operation`, detecta delimitadores y columnas variables, usa la indentación de `Operation` para padres/hijos, asocia únicamente predicados con identificador reportado y mantiene notas y hash del plan cuando están disponibles. Si no puede asociar una sección con seguridad, añade una advertencia en lugar de inventar datos.

Se cubren tablas de `DBMS_XPLAN.DISPLAY` y tablas habituales de `DISPLAY_CURSOR`/`ALLSTATS LAST` con columnas como `Starts`, `E-Rows`, `A-Rows`, `Buffers`, `Reads`, `OMem`, `1Mem`, `Used-Mem` y `TempSpc`. Formatos gráficos, secciones no tabulares y encabezados que no incluyan `Id` y `Operation` quedan fuera de soporte.

Cada métrica conserva su texto original y solo obtiene valor numérico cuando la conversión no es ambigua. Una métrica ausente permanece ausente. El análisis de cardinalidad no compara ciegamente E-Rows y A-Rows: explica su alcance y, con `Starts > 1`, muestra `A-Rows / Starts` como cálculo derivado. Nunca divide entre cero ni declara que una diferencia aislada pruebe un problema de optimización.

El renderer escapa texto importado antes de insertarlo en DOM. La interfaz no usa `eval`, no acepta HTML importado, no persiste automáticamente consultas o planes y no hace solicitudes externas. El tutor se declara basado en reglas locales y What If? mantiene las estadísticas importadas separadas de sus hipótesis.

La tabla del visualizador no usa una lista fija de métricas: toma los encabezados presentes en el plan importado y muestra sus valores originales cuando existen. Así, `A-Time`, `Buffers`, `Reads`, `TempSpc` y columnas de workarea pueden permanecer visibles sin sustituir los valores ausentes por estimaciones.

## RunBook Navigation & UX Integration — Sprint 4.1

`content/runbook-chapters.js` define la única fuente de verdad de la navegación educativa. Cada capítulo contiene `id`, `order`, `label`, `title` y `route`; AI SQL Intelligence usa el identificador estable `intelligence`, orden 09 y ruta `#intelligence`. `assets/portal.js` genera los enlaces del RunBook desde ese contrato y deriva anterior/siguiente, `aria-current`, breadcrumbs, el título y el estado activo.

El controlador resuelve hashes iniciales y eventos `hashchange`/`popstate`. Si `#intelligence` se abre antes de terminar la carga local del laboratorio, conserva la ruta pendiente y la activa cuando la sección está disponible. Solo un enlace recibe `aria-current="location"` y la clase visual activa a la vez.

El progreso mantiene la clave local existente y añade `completed` y `activities` sin borrar `visited`. Entrar en un capítulo solo registra exploración. Para completar `intelligence`, la UI emite las actividades locales `plan-imported` y `operator-inspected`; no hay persistencia remota ni datos de estudiantes fuera del navegador.

Sprint 5 extiende el contrato sin renumerar capítulos existentes: `ai-internals` es el capítulo 12 y apunta al panel dinámico Oracle AI Database Internals Lab. El catálogo lo enlaza como módulo disponible. Sus rutas `#ai-vector-search`, `#hybrid-vector-search`, `#select-ai-flow`, `#rag-architecture` y `#agentic-workflows` mantienen seleccionado el laboratorio correspondiente y activan exclusivamente el capítulo 12. Las rutas directas se resuelven después de la carga dinámica mediante el mismo estado de navegación; `#ai` conserva el capítulo 10 original.

## Anatomy
Referencia: https://github.com/wheresryan22/anatomy
Acción pendiente: revisar código, licencia, dependencias y guía SKILL.md de upstream antes de incorporar assets o lógica. No copiar código de un repositorio no inspeccionado.

## Oracle AI Database Internals Lab — Sprint 5

```text
content/*-scenarios.js
  └─ casos sintéticos, SQL/API de referencia y restricciones de seguridad
       │
simulation/*-engine.js
  └─ eventos inmutables, ranking o flujos deterministas
       │
renderer/ai-data-flow-renderer.js + renderers específicos
  └─ SVG accesible, ranking, lanes y perspectivas sincronizadas
       │
ui/oracle-ai-internals-lab.js
  └─ tabs, timeline, Event Inspector, tutor, What If y progreso local
```

El evento extendido conserva el contrato básico y añade explicación, ubicación y representación:

```js
{ step, type, source, target, rowIds, blockIds, label, illustrativeMetrics,
  explanation, executionLocation, representation }
```

`executionLocation` solo puede describir `DATABASE_SIMULATED`, `APPLICATION_SIMULATED`, `EXTERNAL_AI_SIMULATED` o `EDUCATIONAL_ABSTRACTION`. No describe una ubicación observada ni internals físicos. El estado del motor nunca depende de temporizadores: la UI solo avanza un índice de eventos.

Vector Search realiza cálculos locales de distancia sobre arrays sintéticos. Su modo approximate reduce candidatos según un escenario fijo y calcula recall contra el Top-K exacto del mismo dataset; es una abstracción pedagógica, no HNSW, IVF, `DBMS_VECTOR` ni una estimación de rendimiento. Hybrid Search muestra una fusión normalizada definida por el laboratorio y no atribuye su fórmula a `DBMS_HYBRID_VECTOR`.

Select AI, RAG y Agentic separan las fronteras de procesamiento: el SQL está predefinido, las respuestas son educativas predefinidas, RAG excluye documentos no permitidos antes de segmentar y un workflow sin permiso termina rechazado. No hay LLM, perfil, credencial, ACL, MCP, herramienta, SQL ni conexión Oracle real en el runtime.

## Skills de apoyo (archivos entregados)
- `sql-query-reviewer`: revisión de semántica y cardinalidad.
- `sql-plsql-formatting`: estilo SQL.
- `freesql`: opción para enlaces a FreeSQL; verificar comportamiento en navegador.
- `oracle-sql-from-codex`: ejecución local opcional con SQLcl y conexión autorizada.
- `drawio-oci-arch`: diagramas OCI, no reemplaza visualización de ejecución.
- `senior-developer` y `code-reviewer`: calidad y revisión.

## Seguridad
No enviar SQL arbitrario a una BD desde un frontend público. Nunca exponer credenciales OCI, tokens ni claves de LLM. Cualquier servicio futuro debe usar autenticación, cuotas, límites y validación.

## Oracle AI Database Architecture Explorer — Sprint 6

```text
content/oci-architecture-*.js
  └─ catálogo de componentes, escenarios y preguntas
       │
simulation/architecture-*.js
  ├─ grafo y validación estructural
  ├─ timeline determinista del flujo
  ├─ hallazgos de seguridad educativos
  ├─ What If cualitativo y guía de despliegue
       │
renderer/architecture-*.js
  └─ canvas SVG, flujo, inspector y leyendas accesibles
       │
ui/architecture-explorer.js
  └─ galería, Builder local, controles, progreso y rutas
```

El Explorer conserva la separación entre modelo y presentación: el canvas no decide conexiones, los renderers no cambian el estado y la UI solo actualiza una variante local de los datos declarados. Todos los eventos incluyen la forma común `{ step, type, source, target, rowIds, blockIds, label, illustrativeMetrics }` y agregan `executionLocation` y una explicación educativa cuando corresponde.

Los resultados de Graph Validation, Security Inspector y AI What If tienen alcances distintos. La validación estructural detecta referencias, relaciones y desconexiones representadas; Security Inspector aplica reglas didácticas de identidad, secretos, herramientas y contexto RAG; What If compara consideraciones cualitativas. Ninguno valida una tenancy OCI, políticas IAM, VCN, endpoints, Vault, observabilidad, costos o disponibilidad real.

La navegación usa el capítulo 13 `architecture-explorer` y rutas internas `#architecture-retail`, `#architecture-finance` y `#architecture-operations`. Todas activan el capítulo 13 sin alterar los capítulos 01–12. Ver `docs/OCI_ARCHITECTURE_EXPLORER.md` para fuentes oficiales y límites de producto.

## Animated Data Flow Layer — Visual Design System 2.1

```text
simulation engine
  └─ immutable event timeline
       └─ UI active index
            └─ renderer/animated-data-flow-renderer.js
                 ├─ normalized 0..100 anchors
                 ├─ SVG route, anchors, particle and step marker
                 ├─ accessible component selector
                 └─ existing Event Inspector / timeline callback
                      └─ 3D PNG presentation layer
```

The layer is a presentation adapter, not a simulation engine. `mount(figure, { kind, events, index, onSelect })` consumes the existing event contract and never mutates the source timeline. `hash`, `comparison`, `intelligence`, `ai-internals` and `architecture` define separate semantic anchor maps; unresolved endpoints deliberately render no route instead of inventing a location.

The overlay uses a `0 0 100 100` SVG viewBox, `preserveAspectRatio="xMidYMid slice"` and a relative stage with the same aspect ratio as the PNG. This keeps the route aligned across responsive widths while acknowledging that the artwork is conceptual. Component buttons are the keyboard and reduced-motion alternative to moving particles. Animation is single-event feedback, not autoplay; reduced motion keeps the static route, marker and explanation while disabling dash and particle animation.

Architecture Explorer is an exception to the default 16:9 stage because its existing hero image uses a responsive fixed height with `object-fit: cover`. The CSS override makes the animated stage, image and overlay share that same `clamp(170px, 25vw, 300px)` height. Chrome geometry checks measured zero-pixel differences at 375, 768 and 1440 px.

AI SQL Intelligence uses `planTimeline(plan)`: imported plans produce one event per parser-identified operator and preserve absent statistics; an empty plan produces three explicitly illustrative context events. No operation, metric or physical relationship is inferred from artwork alone.

## Capa visual tecnológica 3D

Las ilustraciones narrativas se almacenan en `assets/illustrations/` como PNG locales generados específicamente para este proyecto. Usan una identidad oscura, azul eléctrico y cian, con componentes de base de datos en perspectiva 3D, circuitos luminosos y flujos de información diferenciados. Se utilizan como contexto visual en HASH JOIN, comparación de algoritmos, AI SQL Intelligence, Oracle AI Database Internals y Architecture Explorer. No sustituyen los SVG accesibles ni el modelo determinista: los diagramas SVG permanecen como la superficie interactiva para eventos, selección e inspector.

`assets/oci-runbook-design-system.css` centraliza los tokens observados del OCI PoC RunBook, sus estados de tema, foco, responsive y `prefers-reduced-motion`. `assets/tech-illustrations.css` mantiene únicamente el tratamiento estructural de las ilustraciones 3D. Los cinco PNG se redimensionan a 1280×720 para reducir peso y usan rutas relativas compatibles con GitHub Pages. Son recursos originales generados para el proyecto; no incorporan código, logos, fuentes, assets ni dependencias de terceros. No se añaden solicitudes externas ni credenciales. Ver `docs/OCI_RUNBOOK_DESIGN_SYSTEM.md` y `docs/VISUAL_ASSETS.md`.

## Sprint 7 — Presentation Mode y Architecture Challenges

Presentation Mode es un adaptador UI registrado por cada laboratorio. Consume los eventos y acciones existentes, monta la capa SVG animada sobre una ilustración local, muestra el paso y el Event Inspector, y conserva el escenario al entrar/salir. Sus atajos no interceptan formularios y reduced motion desactiva reproducción continua.

Architecture Challenges reutiliza `OracleArchitectureGraphEngine` y `OracleArchitectureCanvasRenderer`. Los desafíos se declaran en `content/architecture-challenges.js`; `OracleArchitectureChallengeEvaluator` calcula una puntuación educativa determinista y hallazgos con evidencia. La evaluación no muta la arquitectura ni los escenarios de referencia, no exige una topología única y no valida OCI real, IAM, costos, latencia o producción.

## Sprint 8.2 — Buffer Cache & I/O

```text
content/performance-scenarios.js
  └─ Retail, Finanzas y Data Warehouse inmutables
       │
simulation/buffer-cache-engine.js
  └─ READ_BLOCK → CACHE_HIT/CACHE_MISS → TABLE_ACCESS
       │        └─ estado FIFO educativo e instantáneas cacheState
renderer/buffer-cache-renderer.js
  └─ Developer · Flujo conceptual · Internals SVG accesibles
       │
ui/buffer-cache-lab.js
  └─ único timeline, Event Inspector, SQL relacionado, tutor y What If
```

`OracleBufferCacheEngine` es puro y determinista: los mismos escenario y parámetros normalizados producen los mismos eventos, resultados y snapshots. Cada solicitud genera una petición lógica de bloque, exactamente un hit o miss conceptual y el acceso que entrega filas sintéticas. Las métricas se llaman explícitamente ilustrativas; un miss solo puede incrementar una lectura física conceptual del modelo y nunca equivale a una lectura observada de Oracle.

La política FIFO, la capacidad y los estados frío/caliente son reglas declaradas para enseñar reutilización. No modelan la gestión real de Buffer Cache, prefetch, RAC, tamaños de bloque, concurrencia, latencia ni estadística de instancia. La UI reutiliza el Event Inspector y `OracleAnimatedDataFlow` con el `kind` `buffer-cache`; no crea una segunda reproducción. En esta etapa se presenta como preview local cargado por `assets/portal.js`: no añade todavía capítulo 15, rutas, progreso ni Presentation Mode.

## Sprint 8.3 — PGA, Work Areas & TEMP

```text
content/performance-scenarios.js
  └─ perfiles workareaModel para Retail, Finanzas y Data Warehouse
       │
simulation/workarea-temp-engine.js
  └─ WORKAREA_ALLOCATE → WORKAREA_PROCESS → [TEMP_WRITE → TEMP_READ → WORKAREA_PROCESS]* → WORKAREA_COMPLETE
       │        └─ clasificación local Optimal / One-Pass / Multi-Pass
renderer/workarea-temp-renderer.js
  └─ Developer · Execution Plan · PGA/Work Area/TEMP SVG · Results
       │
ui/workarea-temp-lab.js
  └─ único timeline, Event Inspector, SQL relacionado, tutor local y What If
```

`OracleWorkareaTempEngine` es puro y determinista. Con parámetros normalizados calcula `ceil(filas × unidades de fila × factor de operación × factor de distribución)` y aplica una regla visible: trabajo hasta el presupuesto es `Optimal`, hasta el doble es `One-Pass` y el resto es `Multi-Pass`, limitado a cuatro pasadas educativas. Cada `TEMP_READ` sigue a su `TEMP_WRITE` y los contadores de fases, workarea y TEMP son instantáneas ilustrativas inmutables.

El laboratorio separa SQL Operation, PGA / Work Area conceptual, TEMP conceptual y Results. No modela la administración real de PGA, workareas automáticas/manuales, particiones, segmentos, bytes, I/O, concurrencia ni diagnósticos de Oracle. `SPILL_TEMP` permanece inalterado en el motor HASH JOIN histórico; el nuevo motor usa `TEMP_WRITE`/`TEMP_READ` porque su secuencia didáctica requiere expresar fases separadas. Como preview local cargado por `assets/portal.js`, no registra capítulo 15, ruta oficial, progreso ni Presentation Mode.

## Sprint 8.4 — Optimizer & Cardinality

```text
content/performance-scenarios.js
  └─ optimizerModel inmutable por escenario
       │
simulation/optimizer-cardinality-engine.js
  └─ CARDINALITY_ESTIMATE → ACCESS_PATH_SELECTED → TABLE_ACCESS → EMIT_ROW*
       │        └─ fórmula, redondeo y decisionBasis educativos
renderer/optimizer-cardinality-renderer.js
  └─ Developer · alternativas educativas · SVG de entradas/estimador/resultados
       │
ui/optimizer-cardinality-lab.js
  └─ único timeline, Event Inspector, SQL relacionado, tutor y What If
```

`OracleOptimizerCardinalityEngine` es puro y determinista. Normaliza filas base, selectividad, estado de estadísticas, índice y distribución sin mutar `optimizerModel` ni los escenarios. La estimación usa `ceil(filas base × selectividad declarada)`; conserva cero cuando una entrada es cero y expone la regla de redondeo. La observación solo existe cuando el escenario la declara y permanece ausente en los demás casos: no se convierte en A-Rows, E-Rows ni dato de producción.

Las alternativas de acceso y JOIN se derivan de umbrales locales expuestos en `decisionBasis`: índice educativo con estadísticas no ausentes, índice declarado y selectividad `≤ 0.1`; Sort Merge educativo con estadísticas disponibles, distribución uniforme y selectividad `≥ 0.5`; Hash Join educativo en los demás casos con filas estimadas. No hay cálculo de coste, simulación del CBO, ejecución SQL ni inferencia de I/O/TEMP. La UI presenta las cuatro vistas desde el mismo índice, se carga de forma secuencial en `assets/portal.js` y no añade capítulo 15, rutas, progreso ni Presentation Mode.

## Sprint 8.5 — Execution Plan Diagnostics

```text
DBMS_XPLAN text → OraclePlanParser → OraclePlanAnalyzer
                                      │
simulation/plan-diagnostics-timeline.js
  └─ PLAN_OPERATOR_START → PLAN_OPERATOR_END por nodo parseado
       │
AI SQL Intelligence UI
  └─ tabla/árbol/SVG · Inspector · Results · Tutor · What If · Presentation existente
```

`OraclePlanDiagnosticsTimeline` no reinterpreta ni ejecuta el plan. Produce un recorrido diagnóstico en orden del texto importado y asocia cada evento con `operatorId`; `stateAt` recupera el nodo inmutable, sus métricas originales, cardinalidad derivada cuando procede y hallazgos locales. Los eventos solo usan metadatos ilustrativos sobre el recorrido; `E-Rows`, `A-Rows`, `Starts`, `Buffers`, `Reads`, `A-Time`, memoria y `TempSpc` permanecen en el nodo importado y ausentes cuando no existen.

El motor limita la reproducción a 160 nodos con advertencia explícita, pero mantiene el plan completo en tabla y estado. `PLAN_OPERATOR_START` y `PLAN_OPERATOR_END` representan inicio/cierre de una explicación educativa, no inicio/fin observados de un operador Oracle. La interfaz mantiene el mismo índice para controles, componentes seleccionables, overlay, inspector y Presentation Mode ya registrado; no añade una función de Presentation ni navegación RunBook.

## Sprint 8.6 — Performance What-If

```text
whatIfModel declarativo
  └─ snapshots A/B independientes
       │
OracleOptimizerCardinalityEngine + OracleBufferCacheEngine + OracleWorkareaTempEngine
       │
OraclePerformanceWhatIfEngine
  └─ tracks compuestos · comparación derivada · regla de comparabilidad
       │
Renderer/UI A-B
  └─ Developer · Plan educativo · Internals · Results · Inspector · Animated Flow
```

`OraclePerformanceWhatIfEngine` no reimplementa los modelos de rendimiento: normaliza entradas permitidas y llama a las APIs públicas de los tres motores. Cada track mantiene sus timelines y snapshots originales; el compositor solo rebasea pasos para presentar una secuencia de explicación y asocia la procedencia de cada métrica. No añade tipos al contrato de eventos, no combina contadores de distinto alcance como telemetría y no transforma el orden compuesto en una traza de Oracle.

La comparación se fundamenta en identidad declarada. Retail admite hipótesis de selectividad/índice y Finanzas de cache/workarea con la misma población lógica. Data Warehouse permite comparar alternativas sobre población y volumen iguales; al cambiar cualquiera de ellos expone `No comparable`, incluso si las cardinalidades coinciden. El preview integra dos overlays de Animated Data Flow, selección reversible y foco restaurado.

## Sprint 8.7 — Database Performance Integration & Final QA

```text
content/runbook-chapters.js + content/module-catalog.js
  └─ capítulo 15 · Database Internals & Performance
       │
assets/portal.js
  └─ resolvedor hash · carga secuencial e idempotente · academy:performance-ready
       │
Buffer Cache · PGA/TEMP · Optimizer · AI SQL Intelligence Diagnostics · What-If
  └─ timelines existentes · progreso local · Presentation Mode existente
```

El capítulo `database-performance` conserva la fuente declarativa de RunBook, los capítulos 01–14 y la clave `oracle-sql-academy.joins.progress.v1`. Sus rutas internas mantienen el capítulo 15 como único activo, restauran foco en el control de cada laboratorio y esperan la carga diferida antes de resolver el hash. El loader detecta una navegación obsoleta mientras espera y vuelve a resolver la ruta más reciente; sus scripts y hojas locales se insertan una sola vez y emiten `academy:performance-ready` una sola vez.

Cada laboratorio publica una actividad educativa de interfaz sin cambiar el contrato de eventos: `buffer-step-inspected`, `workarea-case-compared`, `cardinality-rule-reviewed`, `plan-diagnostic-inspected` y `performance-comparison-reviewed`. Diagnostics activa la pestaña de plan de AI SQL Intelligence y usa su parser, analyzer y timeline existentes. Buffer Cache añade una vista Results compuesta únicamente desde el estado ya expuesto por su motor; no inventa medidas nuevas.

Los adaptadores de Presentation Mode para Buffer Cache, PGA/TEMP, Optimizer y What-If exponen `getState`, `play`, `pause`, `previous`, `next`, `reset`, `setSpeed` y `select` sobre el mismo timeline local. El gestor común conserva Reduced Motion y no añade temporizadores; What-If presenta el track activo sin eliminar A/B. Esta integración no añade motores, eventos, backend, LLM, SQL ejecutable ni Oracle Database.
