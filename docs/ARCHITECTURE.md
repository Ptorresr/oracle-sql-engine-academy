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
