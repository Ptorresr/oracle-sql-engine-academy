# Session Handoff — Oracle SQL & AI Database Engine Academy

## Sprint 8.7 — Database Performance Integration & Final QA

- **Fecha:** 2026-11-20
- **Rama:** `feature/database-performance-foundation`.
- **Estado:** cerrado e integrado en `main` mediante el PR #10 (**MERGED**) y el squash commit `9926ba4`. La regresión posterior confirmó 36/36 suites Node correctas.
- **Alcance:** integra capítulo 15, catálogo, rutas, progreso y Presentation Mode sobre los laboratorios existentes. No crea motores, tipos de eventos, dependencias, backend, LLM, ejecución SQL ni conexiones Oracle.

> **Nota de cierre:** las secciones 8.1–8.6 que siguen registran los estados de cada incremento antes de la integración final. Su estado histórico no sustituye el cierre consolidado de Sprint 8 en `main`.

### Trabajo realizado

- `content/runbook-chapters.js` declara el capítulo 15 `database-performance` con sus cinco rutas y actividades; `content/module-catalog.js` incorpora su tarjeta y `index.html` incorpora el contenedor semántico sin alterar capítulos 01–14.
- `assets/portal.js` centraliza la resolución de rutas, mueve una sola vez los previews nativos al capítulo, conserva sus IDs, espera la carga secuencial/idempotente y emite `academy:performance-ready`. La ruta de Diagnostics abre el puente hacia AI SQL Intelligence sin duplicar parser, analyzer ni timeline.
- Buffer Cache añade Results desde datos existentes. Buffer Cache, PGA/TEMP, Optimizer y What-If registran adaptadores completos de Presentation Mode y actividades de progreso; Diagnostics reutiliza el adaptador de Intelligence. El cambio de tema conserva el índice y reduced motion impide Play, manteniendo avance manual.
- Se corrigieron etiquetas heredadas de los previews en sus plantillas de origen: PGA/TEMP, Optimizer y What-If se presentan como laboratorios 2, 3 y 5 del capítulo 15. No se modificaron sus motores ni escenarios.
- `tests/database-performance-integration.test.js` cubre de forma estática los contratos de capítulo, rutas, señal de disponibilidad, progreso, Results, APIs de adaptadores y ausencia de nuevos tipos de eventos.

### Validación local

- Seguimiento posterior a la auditoría: `assets/portal.js` mide la barra sticky mediante `ResizeObserver`, sincroniza `--portal-sticky-offset` y corrige solo solapamientos tras el layout; `assets/portal.css` consume ese token con `scroll-margin-top`. CDP comprobó hashes directos con carga diferida, Back/Forward, encabezados visibles y ausencia de overflow a 375/768/1440 px en claro/oscuro. Reduced motion mantiene avance manual con Play deshabilitado. Evidencia temporal: `/private/tmp/oracle-sprint8-close-buffer-375-light.png`, `/private/tmp/oracle-sprint8-close-workarea-768-dark.png`, `/private/tmp/oracle-sprint8-close-optimizer-1440-light.png`, `/private/tmp/oracle-sprint8-close-whatif-1440-dark.png` y `/private/tmp/oracle-sprint8-close-buffer-375-reduced.png`.
- Preparación de cierre: 36/36 suites Node, sintaxis, recursos locales, secretos y `git diff --check` siguen correctos; la regresión de rutas 01–15 pasó a 375 px. CDP confirmó Tab/Shift+Tab y foco visible, Espacio en los cinco laboratorios, Presentation Mode mediante Espacio/flechas/Escape y reduced motion. El entorno no activa Enter ni flechas de `<select>` nativo mediante inyección CDP, por lo que ambas comprobaciones físicas de escritorio siguen pendientes y no se atribuyen a un defecto de la aplicación.
- 36/36 suites Node correctas, incluido contrato de eventos, RunBook, Presentation Mode y regresiones previas; `node --check` para módulos, `git diff --check` y sintaxis completados sin error.
- Chrome/CDP local con caché deshabilitada confirmó capítulo 15 único y cinco roots sin duplicación; rutas directas restauran foco en Buffer, Workarea, Optimizer, Diagnostics y What-If. Las cuatro interacciones y la selección de operador diagnóstico completaron las cinco actividades sin borrar el progreso anterior. Back/Forward conservó el capítulo 15 activo y restauró el foco; Espacio sobre el control Buffer Next avanzó el índice de 0 a 1 con foco visible.
- Presentation Mode registró y abrió Buffer Cache, PGA/TEMP, Optimizer, What-If e Intelligence; Play/Pause de Buffer usó su mismo estado y Escape cerró/restauró foco. Una carga nueva con reduced motion dejó Play de Presentation deshabilitado. 375/768/1440 px no mostraron overflow del documento ni errores de consola; el cambio de tema conservó el índice. Tras la carga, una interacción What-If sigue funcionando offline; el arranque frío offline no es una capacidad PWA verificada.
- Evidencia temporal no versionada: `/private/tmp/oracle-sprint87-chapter15-1440-dark-final.png`, `/private/tmp/oracle-sprint87-buffer-cache-io-375-light-final.png`, `/private/tmp/oracle-sprint87-optimizer-cardinality-768-dark-final.png`, `/private/tmp/oracle-sprint87-performance-what-if-1440-light-final.png` y `/private/tmp/oracle-sprint87-buffer-presentation-1440-final.png`.

### Límites y siguiente actividad

- CDP en macOS no modifica la opción de un `<select>` nativo con flechas y su inyección de Enter no activa el botón nativo aunque Espacio sí lo hace; las comprobaciones físicas de esas teclas siguen pendientes de un navegador de escritorio disponible. No se declara conformidad WCAG completa. El binario `--headless --screenshot` mantiene el defecto de PNG negro; las capturas válidas usan CDP `fromSurface: true`.
- Las rutas de la aplicación y recursos se validaron con un servidor estático local. No hubo solicitudes de runtime de la aplicación fuera de `127.0.0.1`; extensiones propias de Chrome no se consideran recursos de la aplicación. Sprint 8 queda cerrado; las nuevas actividades requieren una autorización de alcance independiente.

## Sprint 8.6 — Performance What-If

- **Fecha:** 2026-11-20
- **Rama:** `feature/database-performance-foundation`.
- **Estado:** implementado y validado localmente; sin commit, push, Pull Request ni merge.
- **Alcance:** preview técnico A/B fuera del RunBook. No añade capítulo 15, rutas, progreso ni registro nuevo en Presentation Mode; esas integraciones siguen reservadas para 8.7.

### Trabajo realizado

- `content/performance-scenarios.js` incorpora `whatIfModel` inmutable por escenario, con parámetros permitidos, valores iniciales, restricciones, identidad de población/resultado y reglas de comparabilidad. Retail separa selectividad/índice, Finanzas cache/workarea y Data Warehouse detecta volumen/población distinta.
- `simulation/performance-what-if-engine.js` expone `normalizeVariant`, `createTrack`, `createComparison` y `stateAt`. Compone mediante las APIs públicas de Optimizer, Buffer Cache y Workarea; cada track conserva timeline, snapshots, procedencia de métricas e identidad lógica. No agrega eventos ni campos al contrato base.
- `renderer/performance-what-if-renderer.js`, `ui/performance-what-if-lab.js`, `assets/performance-what-if-lab.css` y `assets/illustrations/performance-what-if-tech.svg` ofrecen tracks A/B, modo sincronizado/independiente, controles, cuatro vistas, Event Inspector, SQL relacionado, Tutor local, dos overlays Animated Data Flow y leyendas de limitación.
- `assets/portal.js` carga el preview local después de Buffer Cache, Workarea y Optimizer. `renderer/animated-data-flow-renderer.js` añade solo anchors/aliases para el nuevo `kind`; no altera rutas anteriores.
- Se corrigieron dos defectos confirmados durante CDP: el contenedor de tracks tenía overflow móvil por `min-width` heredado y `stateAt` no aceptaba las claves `A/B` de UI. La selección de eventos por teclado ahora restaura el foco después del re-render.

### Validación

- `tests/performance-what-if-engine.test.js` y `tests/performance-what-if-renderer.test.js` cubren determinismo, inmutabilidad, contrato de evento, independencia A/B, Reset, métricas con procedencia, NULL/duplicados declarados, cero, comparabilidad y entradas no permitidas. La regresión final pasó 35/35 suites Node; sintaxis JavaScript, recursos de raíz, `git diff --check`, marcadores de merge, firmas de secretos y llamadas externas en rutas 8.6 también pasaron.
- Chrome CDP confirmó dos tracks visibles, sincronización con ambos eventos activos resaltados, independencia, selección reversible, foco en el evento re-renderizado, SQL relacionado, Tutor, temas, 375/768/1440 sin overflow propio y `prefers-reduced-motion` con Play deshabilitado y Next manual disponible.
- Evidencia temporal no versionada: `/private/tmp/oracle-sprint86-whatif-1440.png`, `/private/tmp/oracle-sprint86-whatif-1440-dark-or-light.png`, `/private/tmp/oracle-sprint86-whatif-768.png` y `/private/tmp/oracle-sprint86-whatif-375.png`.

### Límites y siguiente actividad

- El orden del track es un recorrido de explicación entre modelos independientes, no una ejecución física/temporal de Oracle. No hay costes, tiempos, I/O real, CBO, Oracle Database, backend, LLM, servicios externos ni credenciales. Cardinalidad igual no implica equivalencia lógica.
- No iniciar Sprint 8.7 sin autorización explícita. Mantener intactos los cambios locales 8.1–8.6 y repetir la regresión completa si se alteran los contratos, cargadores, tokens o navegación.

## Sprint 8.5 — Execution Plan Diagnostics

- **Fecha:** 2026-11-20
- **Rama:** `feature/database-performance-foundation`.
- **Estado:** implementado y validado localmente; sin commit, push, Pull Request ni merge.
- **Alcance:** preview técnico local dentro de AI SQL Intelligence. No añade capítulo 15, rutas, progreso, navegación RunBook ni Presentation Mode nuevo; esos cambios siguen reservados para 8.7.

### Trabajo realizado

- Se creó `simulation/plan-diagnostics-timeline.js` con `createTimeline(plan, analysis)` y `stateAt(timeline, index)`. Usa `OraclePerformanceEventAdapter` para emitir pares inmutables `PLAN_OPERATOR_START`/`PLAN_OPERATOR_END` por cada operador ya parseado, con `operatorId`, explicación y `decisionBasis`.
- El timeline retiene el plan y analyzer originales; `stateAt` devuelve el nodo importado, evidencia disponible, cálculo de cardinalidad ya derivado y hallazgos relacionados. Las estadísticas originales no se copian como métricas ilustrativas ni se completan si faltan.
- Se estableció `MAX_PLAYBACK_NODES = 160`: un plan grande conserva todos sus nodos importados para tabla/árbol, pero limita de forma explícita la reproducción y muestra una advertencia honesta.
- Retail se corrigió a fixture `DISPLAY` estimado sin A-Rows/Starts. Finanzas sigue siendo `DISPLAY_CURSOR` con Starts > 1; Data Warehouse conserva Buffers, memoria y `TempSpc` solo en los operadores cuyo texto los contiene.
- `ui/sql-intelligence-lab.js` usa un único índice diagnóstico para tabla, árbol, SVG, Event Inspector, Results, overlay Animated Data Flow y el registro existente de Presentation Mode. Añade controles Play/Pause/Previous/Next/Reset/velocidad, sin crear una segunda reproducción ni una nueva función de Presentation.
- `renderer/sql-intelligence-renderer.js` presenta Results como evidencia importada, cálculo derivado, interpretación educativa, hallazgos y límites. `assets/portal.js` carga la fundación de rendimiento una vez antes de Intelligence para garantizar que el adaptador está disponible.

### Validación

- 33 suites Node correctas después de añadir `tests/plan-diagnostics-timeline.test.js`; sintaxis JavaScript y `git diff --check` correctos.
- El motor prueba determinismo, inmutabilidad, pasos secuenciales, eventos reversibles, DISPLAY sin observación, DISPLAY_CURSOR, Starts > 1 y = 0, E-Rows cero, valores abreviados, NULL/ausencia de métricas, operador desconocido, raíces múltiples, fila completa de plan incompleto, contenido hostil y reproducción limitada sin pérdida de nodos.
- Chrome CDP validó Retail como `DISPLAY` (4 operadores, 8 eventos, sin A-Rows), Finanzas como `DISPLAY_CURSOR` con cálculo `A-Rows/Starts`, Data Warehouse con `TempSpc` explícito al seleccionar SORT, y un plan de 163 nodos que conserva 163 filas mientras limita el recorrido. HTML/script importado no creó nodos ejecutables ni modificó `window`.
- Enter selecciona una fila del plan y sincroniza Inspector/Results/timeline; Play/Pause/Reset y 4× recorren el mismo índice. No hubo errores de consola. Las capturas `fromSurface: true` confirmaron 1440 claro/oscuro y 375/768 oscuro sin overflow; reduced motion deshabilita Play y conserva Next manual.
- Evidencia temporal no versionada: `/private/tmp/oracle-sprint85-retail-1440-light.png`, `/private/tmp/oracle-sprint85-warehouse-plan-1440-dark.png`, `/private/tmp/oracle-sprint85-warehouse-768-dark.png` y `/private/tmp/oracle-sprint85-warehouse-375-dark.png`.

### Límites y siguiente actividad

- El recorrido es una lectura diagnóstica del texto importado, no una traza temporal/física ni un diagnóstico Oracle. DISPLAY no implica estadísticas observadas; DISPLAY_CURSOR depende de sus opciones y columnas presentes. SORT/HASH no infieren TEMP y A-Time/Cost no se convierten en duración.
- No hay Oracle Database, ejecución SQL, backend, LLM, servicios externos, credenciales ni dependencia nueva. Los hallazgos, Tutor y What If son reglas locales y no recomendaciones del CBO.
- Esta condición fue superada con autorización al iniciar Sprint 8.6. Mantener los cambios locales 8.1–8.6 intactos y repetir la regresión completa si se altera el contrato de eventos, el parser o los cargadores.

## Sprint 8.4 — Optimizer & Cardinality

- **Fecha:** 2026-11-20
- **Rama:** `feature/database-performance-foundation`.
- **Estado:** implementado y validado localmente; sin commit, push, Pull Request ni merge.
- **Alcance:** preview técnico local de cardinalidad, selectividad, estadísticas declaradas, índices, distribución y alternativas educativas de acceso/JOIN. No añade capítulo 15, navegación RunBook oficial, rutas directas, progreso ni Presentation Mode; esas integraciones siguen reservadas para 8.7.

### Trabajo realizado

- `content/performance-scenarios.js` declara `optimizerModel` inmutable para Retail, Finanzas y Data Warehouse. Cada perfil define filas base, selectividad, estado de estadísticas, índice, distribución, resultado lógico, tratamiento de NULL y observación declarada opcional; los SQL, filas y bloques de origen no cambian.
- `simulation/optimizer-cardinality-engine.js` normaliza parámetros, usa `ceil(filas base × selectividad declarada)`, conserva cero, expone el redondeo y crea un timeline inmutable `CARDINALITY_ESTIMATE` → `ACCESS_PATH_SELECTED` → `TABLE_ACCESS` → `EMIT_ROW`. El estado separa estimación, observación declarada y ausencia de observación.
- Las reglas son visibles mediante `decisionBasis`: índice educativo con estadísticas no ausentes, índice disponible y selectividad `≤ 0.1`; Sort Merge educativo con estadísticas disponibles, distribución uniforme y selectividad `≥ 0.5`; Hash Join educativo en los demás casos con filas estimadas. Son hipótesis del laboratorio, no costes ni decisiones del CBO.
- `renderer/optimizer-cardinality-renderer.js`, `ui/optimizer-cardinality-lab.js`, `assets/optimizer-cardinality-lab.css` y `assets/illustrations/optimizer-cardinality-tech.svg` ofrecen Developer, Execution Plan educativo, Internals, Results, Event Inspector, SQL relacionado, tutor local, What If y Animated Data Flow sincronizados con el mismo timeline. `assets/portal.js` los carga secuencialmente después de Buffer Cache y PGA/TEMP.
- Se corrigió un defecto visual confirmado: `--oci-accent-strong` no tenía un valor de alto contraste para tema oscuro. El token central ahora usa `#f4b8ad` en oscuro, lo que corrige también los consumidores existentes sin cambiar sus motores.
- Se reconciliaron referencias desactualizadas: `origin/main` ya contiene Sprint 7 mediante `ec05173`; no queda un PR #9 pendiente en el contexto de Sprint 8.

### Validación

- 32 suites Node correctas: incluye las nuevas `tests/optimizer-cardinality-engine.test.js` y `tests/optimizer-cardinality-renderer.test.js`, además de regresión completa de HASH JOIN, Comparison, Intelligence, AI Internals, Architecture, Presentation, Buffer Cache y PGA/TEMP.
- Sintaxis correcta en los nuevos archivos y puntos de integración; `git diff --check` sin salida. Las suites cubren determinismo, inmutabilidad, redondeo, selectividad 0/1, cardinalidad cero, estadísticas disponibles/desactualizadas/ausentes, índice, distribución sesgada/uniforme, NULL, duplicados, observación ausente/declarada y compatibilidad de eventos/Animated Data Flow.
- Chrome CDP local validó selección por teclado de fila, bloque, operador, componente SVG y evento del timeline; el Inspector mantiene un único evento activo, resalta el elemento seleccionado y abre SQL relacionado con `aria-expanded`. El tutor responde con reglas locales. Play/Pause/Previous/Next/Reset y 1×/2×/4× usan el mismo timeline; el cambio de tema conserva el paso activo y no reinicia los seis eventos de Data Warehouse.
- `Page.captureScreenshot({ fromSurface: true, captureBeyondViewport: true })` produjo evidencia válida en 1440 px claro/oscuro y 375/768 px oscuro. No se detectó overflow horizontal; la grilla pasa a una columna en tablet/móvil y los controles permanecen visibles. Evidencia temporal no versionada: `/private/tmp/oracle-sprint84-optimizer-clip-1440-light.png`, `/private/tmp/oracle-sprint84-optimizer-contrast-1440-dark.png`, `/private/tmp/oracle-sprint84-optimizer-contrast-768-dark.png` y `/private/tmp/oracle-sprint84-optimizer-contrast-375-dark.png`.
- Una instancia independiente con `--force-prefers-reduced-motion=reduce` confirmó `matchMedia` activo, Play deshabilitado, navegación Next manual disponible y animación continua eliminada. Chrome no reportó errores de consola durante las interacciones verificadas.

### Límites y siguiente actividad

- El laboratorio no ejecuta SQL, no consulta Oracle, no incorpora backend, LLM, credenciales ni dependencias externas. No diagnostica planes, estadísticas, índices, costes, TEMP o rendimiento reales. La observación declarada es una fila lógica de escenario y no A-Rows.
- No se inicia Sprint 8.5 sin autorización explícita. Antes de ese incremento, mantener todos los cambios locales 8.1–8.4 y repetir la regresión completa si se modifica el contrato de eventos o los tokens centrales.

## Sprint 8.3 — PGA, Work Areas & TEMP

- **Fecha:** 2026-11-19
- **Rama:** `feature/database-performance-foundation`.
- **Estado:** implementado y validado localmente; sin commit, push, Pull Request ni merge.
- **Alcance:** preview técnico local de PGA, Work Areas & TEMP. No añade capítulo 15, navegación RunBook oficial, rutas directas, progreso ni Presentation Mode; esas integraciones siguen reservadas para 8.7.

### Trabajo realizado

- `content/performance-scenarios.js` declara un `workareaModel` inmutable por escenario: Retail inicia Optimal, Finanzas One-Pass y Data Warehouse Multi-Pass con parámetros visibles de operación, filas, unidades de fila, presupuesto y distribución.
- `simulation/workarea-temp-engine.js` normaliza HASH JOIN/SORT y aplica una fórmula local reproducible: `ceil(filas × unidades de fila × factor de operación × factor de distribución)`. La clasificación es Optimal hasta el presupuesto, One-Pass hasta el doble y Multi-Pass a partir de ahí, con cuatro pasadas temporales educativas como máximo.
- El timeline emite `WORKAREA_ALLOCATE`, `WORKAREA_PROCESS`, pares ordenados de `TEMP_WRITE`/`TEMP_READ` cuando corresponden y `WORKAREA_COMPLETE`. `workareaState` e `illustrativeMetrics` son snapshots congelados y el adaptador valida presupuesto, trabajo, pasadas y clasificación.
- `renderer/workarea-temp-renderer.js`, `ui/workarea-temp-lab.js`, `assets/workarea-temp-lab.css` y `assets/illustrations/workarea-temp-tech.svg` implementan las cuatro zonas SQL Operation, PGA / Work Area, TEMP y Results. Reutilizan el único timeline, Event Inspector, SQL relacionado, tutor local, What If y Animated Data Flow con el `kind` `workarea-temp`.
- `assets/portal.js` carga el preview y sus recursos de forma local y secuencial después de Buffer Cache. `tests/workarea-temp-engine.test.js` y `tests/workarea-temp-renderer.test.js` cubren el motor, renderer e integración estática; las suites de contrato y flujo animado cubren las extensiones compartidas.
- Se corrigió un defecto confirmado: al cambiar de escenario, los `<select>` conservaban sus primeras opciones en vez del perfil `workareaModel`. `applyScenarioDefaults()` ahora sincroniza los parámetros de escenario antes de crear el timeline y una prueba estática protege esa inicialización.

### Decisiones y límites

- Optimal, One-Pass y Multi-Pass son etiquetas de una regla educativa visible; no son políticas ni diagnósticos de Oracle. PGA/Work Area no se representa como Buffer Cache y TEMP no se infiere desde HASH JOIN ni SORT.
- Un cache hit no participa en este motor. `TEMP_WRITE` y `TEMP_READ` describen fases lógicas del modelo; no muestran bytes, segmentos, I/O, latencia, concurrencia, particiones ni administración automática/manual de workareas.
- `SPILL_TEMP` sigue intacto en `OracleHashJoinEngine`. El nuevo motor no lo emite: usa los dos eventos explícitos de lectura/escritura para no cambiar el significado del timeline histórico.
- No hay Oracle Database, SQL ejecutable, backend, LLM, credenciales, dependencias nuevas ni URLs externas de runtime. Los datos SQL, filas y bloques siguen siendo sintéticos e inmutables.

### Validación

- 30 suites Node correctas después de añadir las dos suites de Sprint 8.3; se cubren determinismo, inmutabilidad, límites, HASH JOIN/SORT, filas cero, pares TEMP balanceados, resultados, contrato y Animated Data Flow.
- Chrome CDP confirmó One-Pass (Finanzas) y Multi-Pass (Data Warehouse) con el mismo timeline para Previous/Next/Play/Pause/Reset y velocidad 4×. Una doble activación de Play no crea timers duplicados; Pause mantiene el paso y el cambio de tema conserva el estado.
- Teclado real mediante CDP: Enter/Espacio activan Previous/Next/Reset/Play/Pause y el timeline. Enter selecciona fila, bloque, operador y nodo PGA / Work Area; el inspector conserva el paso activo y actualiza sus datos. SQL relacionado se abre con `aria-expanded="true"`; el tutor responde con reglas locales del evento.
- Capturas `Page.captureScreenshot({ fromSurface: true })` válidas a 375 px Claro, 768 px Oscuro y 1440 px Claro/Oscuro; no hay overflow horizontal. Se verificaron controles, clasificación, SQL, Event Inspector y las cuatro zonas. Evidencia temporal no versionada: `/private/tmp/oracle-sprint83-workarea-verified-optimal-375-light-header-safe.png`, `/private/tmp/oracle-sprint83-workarea-verified-one-pass-768-dark.png`, `/private/tmp/oracle-sprint83-workarea-verified-one-pass-1440-light.png` y `/private/tmp/oracle-sprint83-workarea-verified-multi-pass-1440-dark.png`.
- Una instancia nueva de Chrome con `--force-prefers-reduced-motion=reduce` confirmó `matchMedia` activo, Play deshabilitado con explicación, `animation: none`, `transition: 0s` y Next manual disponible.
- `Google Chrome --headless --screenshot` sigue generando PNG negro por `CVDisplayLinkCreateWithCGDisplay` en este entorno macOS. No se modificó la aplicación por este defecto del capturador; CDP `fromSurface: true` es la evidencia visual válida.

### Siguiente actividad

Sprint 8.3 queda listo para aprobación definitiva como preview técnico. No iniciar Sprint 8.4 sin autorización explícita. Antes del gate 8.7, volver a validar la navegación RunBook, progreso y Presentation Mode al integrar el capítulo 15.

## Sprint 8.2 — Buffer Cache & I/O

- **Fecha:** 2026-11-19
- **Rama:** `feature/database-performance-foundation`.
- **Estado:** implementado y validado localmente; sin commit, push, Pull Request ni merge.
- **Alcance:** preview técnico local de Buffer Cache & I/O. No añade capítulo 15, navegación RunBook oficial, rutas directas, progreso ni Presentation Mode; esas integraciones siguen en 8.7.

### Trabajo realizado

- `simulation/buffer-cache-engine.js` crea eventos inmutables y reproducibles `READ_BLOCK`, `CACHE_HIT`/`CACHE_MISS` y `TABLE_ACCESS`. Usa una capacidad normalizada, estado frío/caliente y patrones declarados, secuenciales o reutilizados sobre los tres escenarios comunes.
- `simulation/performance-event-adapter.js` admite el snapshot opcional e inmutable `cacheState`; `renderer/animated-data-flow-renderer.js` incorpora anchors y aliases de `buffer-cache` sin modificar otros timelines.
- `renderer/buffer-cache-renderer.js`, `ui/buffer-cache-lab.js` y `assets/buffer-cache-lab.css` entregan Developer, Flujo conceptual e Internals sincronizados con un único índice, selección de eventos/filas/bloques/operadores/componentes, Event Inspector, SQL relacionado, tutor local y What If.
- `assets/portal.js` carga de forma secuencial y local el preview; `index.html` solo incorpora su contenedor. `assets/illustrations/buffer-cache-tech.svg` complementa el laboratorio y está registrado como SVG nativo en `docs/VISUAL_ASSETS.md`; los diagramas técnicos interactivos continúan siendo SVG funcional.
- Se añadieron `tests/buffer-cache-engine.test.js` y `tests/buffer-cache-renderer.test.js`; las pruebas de contrato y Animated Data Flow cubren las extensiones compatibles.

### Decisiones y límites

- FIFO es una regla explícita del modelo educativo, no una implementación ni una afirmación sobre la política de Buffer Cache de Oracle.
- Una solicitud lógica, un hit/miss conceptual, la entrega de filas y una lectura física conceptual se muestran separados. Todas las métricas son ilustrativas y no son AWR, ASH, telemetría, latencia, estadística de instancia ni I/O real.
- No hay Oracle Database, SQL ejecutable, backend, LLM, credenciales, URL de runtime externa ni dependencia nueva. Los escenarios y resultados base permanecen inmutables.
- El laboratorio reutiliza un único timeline e inspector. No se registra aún en Presentation Mode para no exponer controles incompletos.

### Validación

- 28 suites Node correctas, incluidas las nuevas de Buffer Cache, contrato y flujo animado; regresiones de JOINs, HASH JOIN, Comparison, SQL Intelligence, AI Internals, Architecture y Presentation también superadas.
- Sintaxis Node de los módulos añadidos, `test -s index.html`, detección de marcadores de merge y `git diff --check`: correctos.
- Chrome CDP con `Page.captureScreenshot({ fromSurface: true })` entregó evidencia visual válida en claro a 1440 px, oscuro a 1440 px, y oscuro a 768/375 px, sin overflow de página o del laboratorio. Se revisaron controles, SQL, tarjetas Developer/Plan/Internals, ilustración, SVG técnico, timeline e inspector; no se observan superposiciones ni texto cortado en esas capturas.
- Los estados visuales verifican `CACHE_MISS`, `CACHE_HIT` y reemplazo FIFO con capacidad uno. El hit conserva una lectura física conceptual de `1` tras dos solicitudes; el segundo miss sustituye el bloque residente y eleva solamente el contador conceptual declarado. Las leyendas visibles mantienen la separación entre solicitud lógica, I/O conceptual y métrica ilustrativa.
- Play, Pause, Previous, Next y Reset operan sobre el único timeline. A 750 ms, 1× conserva el paso inicial, 2× avanza un paso y 4× avanza dos; Pause conserva el índice. Enter y Espacio activan botones nativos, Tab/Shift+Tab avanzan/restauran foco visible, Enter selecciona un evento del timeline y Espacio selecciona un componente SVG. El selector de velocidad es un `<select>` nativo; Chrome headless no aplicó `ArrowDown` en la inyección CDP de macOS, por lo que esa única interacción de plataforma permanece como comprobación manual recomendada.
- Un proceso Chrome nuevo con `--force-prefers-reduced-motion=reduce` confirmó que Play se deshabilita con explicación, Next continúa disponible y la ruta animada usa `animation: none`.
- `Google Chrome --headless --screenshot`, incluso con SwiftShader, produce PNG negro por `CVDisplayLinkCreateWithCGDisplay` en este entorno macOS. No se modificó la aplicación para compensar un defecto del capturador. CDP `fromSurface: true` es la alternativa fiable utilizada; la variante `fromSurface: false` permanece negra.
- Evidencia temporal no versionada: `/private/tmp/oracle-sprint82-buffer-desktop-light.png`, `/private/tmp/oracle-sprint82-buffer-cache-miss-dark.png`, `/private/tmp/oracle-sprint82-buffer-cache-hit-dark.png`, `/private/tmp/oracle-sprint82-buffer-fifo-replacement-dark.png`, `/private/tmp/oracle-sprint82-buffer-mobile-dark.png` y `/private/tmp/oracle-sprint82-buffer-tablet-dark.png`.

### Siguiente actividad

Sprint 8.2 queda listo para aprobación definitiva como preview técnico. No iniciar Sprint 8.3 sin autorización explícita. Antes del gate 8.7, realizar una comprobación manual del selector nativo con flechas en un navegador de escritorio y volver a validar navegación RunBook, progreso y Presentation Mode cuando exista el capítulo 15.

## Sprint 8.1 — Foundation & Event Model

- **Fecha:** 2026-11-19
- **Rama:** `feature/database-performance-foundation`, creada desde la rama de planificación basada en `origin/main` (`ec05173`).
- **Estado:** implementado y validado localmente; sin commit, push, Pull Request ni merge.
- **Alcance:** modelo de escenarios y adaptador de contrato únicamente. No se carga código Sprint 8 en `index.html` ni se alteran RunBook, capítulos 01–14, CSS, UI o simuladores existentes.

### Trabajo realizado

- `content/performance-scenarios.js` declara escenarios inmutables de Retail, Finanzas y Data Warehouse con SQL de referencia, bloques/filas sintéticos, NULL visible, patrones de acceso, estadísticas/memoria educativas, supuestos y límites.
- `simulation/performance-event-adapter.js` conserva los ocho campos base, reconoce los eventos existentes y candidatos, valida extensiones opcionales, congela eventos/timelines y permite advertencias explícitas de tipos desconocidos durante una migración.
- `tests/performance-event-contract.test.js` cubre esquema, IDs, inmutabilidad, NULL, retrocompatibilidad con `READ_BLOCK`, explicación estructurada, determinismo, secuencia de pasos y entradas inválidas.
- La documentación de planificación, contrato, escenarios, criterios y roadmap refleja el estado real de 8.1.

### Decisiones y límites

- El adaptador no genera eventos y no modifica `OracleHashJoinEngine`, `OracleJoinComparisonEngine`, `OraclePlanParser`, `OraclePlanAnalyzer`, Event Inspector, Animated Data Flow ni Presentation Mode.
- Los eventos candidatos de workarea, TEMP, cardinalidad y plan se validan como nombres compatibles, pero todavía no describen una ejecución funcional ni aparecen en la interfaz.
- Todas las métricas del catálogo son parámetros o unidades educativas. No hay conexión Oracle, SQL ejecutable, plan importado nuevo, LLM, backend, cronómetro de rendimiento ni credencial.
- La fundación no se incorpora al loader para evitar exponer un laboratorio incompleto; la carga diferida y el capítulo 15 pertenecen a 8.7.

### Validación

- Sintaxis Node de los tres archivos nuevos: correcta.
- `tests/performance-event-contract.test.js`: correcta.
- Regresión completa: 26 suites Node correctas, incluidas HASH JOIN, Comparison, parser/analyzer, AI Internals, Architecture, Presentation, RunBook y temas.
- `test -s index.html`, detección de marcadores de merge y `git diff --check`: correctos.

### Siguiente actividad

Solicitar aprobación para **Sprint 8.2 — Buffer Cache & I/O**. Antes de comenzar, confirmar las reglas educativas de capacidad/reemplazo conceptual y el diseño de la vista sin representar un algoritmo de Buffer Cache real.

## Sprint 8 — Architecture & Implementation Planning

- **Fecha:** 2026-11-19
- **Rama:** `docs/sprint8-architecture-plan`, creada desde `origin/main` en `ec05173`.
- **Estado:** planificación documental completada; Sprint 8 no está implementado, no hay commit, push, Pull Request ni merge.
- **Base verificada:** `origin/main` incluye la integración de Sprint 7 mediante el merge de PR #9.

### Trabajo realizado

- Se verificaron los contratos reales de `OracleHashJoinEngine`, `OracleJoinComparisonEngine`, `OraclePlanParser`, `OraclePlanAnalyzer`, `OracleSqlWhatIfEngine`, `OracleAnimatedDataFlow`, `OraclePresentationMode`, el RunBook y sus cargadores locales.
- Se creó `docs/SPRINT8_ARCHITECTURE_PLAN.md` con inventario reutilizable, cinco capas, diseño de los cinco laboratorios, estrategia visual, propuesta de capítulo 15, siete incrementos, riesgos y límites de veracidad educativa.
- Se creó `docs/SPRINT8_EVENT_CONTRACT.md` con el contrato implementado, reglas de retrocompatibilidad, taxonomía existente, eventos candidatos, determinismo y tratamiento de métricas.
- Se creó `docs/SPRINT8_SCENARIOS.md` con tres casos sintéticos de Retail, Finanzas y Data Warehouse para cada laboratorio, SQL de referencia y límites.
- Se creó `docs/SPRINT8_ACCEPTANCE_CRITERIA.md` con gates por incremento, casos negativos, regresión, accesibilidad, responsive, seguridad y definición de terminado.
- Se actualizó `ROADMAP.md` exclusivamente para registrar Sprint 8 como planificado.

### Decisiones y límites

- No se modificaron simuladores, renderers, UI, navegación, `index.html`, motores, estilos, recursos, dependencias ni `main`.
- Los ocho campos base del contrato de eventos permanecen obligatorios; `WORKAREA_ALLOCATE`, `WORKAREA_GROW`, `SORT_RUN`, `TEMP_WRITE`, `TEMP_READ`, `CARDINALITY_ESTIMATE`, `ACCESS_PATH_SELECTED`, `PLAN_OPERATOR_START` y `PLAN_OPERATOR_END` son candidatos, no implementaciones ni decisiones finales.
- La futura integración reutilizará el único Event Inspector, el parser de `DBMS_XPLAN`, los tracks de Comparison y `OraclePresentationMode`; no se crearán controladores ni comparadores paralelos.
- Todo valor de rendimiento sintético será ilustrativo. Los valores importados de `DBMS_XPLAN` conservarán su alcance y ausencia; no se inventarán estadísticas de ejecución ni se presentará Cost como tiempo.
- La propuesta de capítulo 15 y sus rutas está documentada, pero la navegación real de capítulos 01–14 permanece intacta.

### Validación de esta sesión

- `git status` inicial limpio y `git fetch origin --prune` ejecutado antes de crear la rama de planificación.
- Se inspeccionaron exports y contratos reales de los módulos existentes antes de proponer nombres, campos o reutilización.
- No se ejecutaron suites Node nuevas: esta rama contiene solo documentación y no implementa código de Sprint 8. Las 25 suites de Sprint 7 permanecen como regresión obligatoria planificada para 8.7.

### Siguiente actividad

Solicitar aprobación explícita para iniciar **Sprint 8.1 — Foundation & Event Model**. Antes de implementar, revisar y aprobar los eventos candidatos, el schema declarativo de escenarios, los IDs/rutas definitivos del capítulo 15 y la matriz de pruebas. Mantener la rama de planificación sin commit, push, Pull Request ni merge hasta nueva autorización.

## Sprint 7 — Interactive Learning & Presentation Experience

- **Fecha:** 2026-11-18
- **Rama:** `feature/interactive-learning-presentation`, creada desde `origin/main` con PR #8 integrado.
- **Estado histórico reconciliado:** implementado y validado; commit `79e40c2` fue integrado en `origin/main` mediante PR #9 (merge `ec05173`).
- **Alcance:** Presentation Mode para cinco laboratorios y capítulo 14 Architecture Challenges.

### Trabajo realizado

- `ui/presentation-mode.js` y `renderer/presentation-renderer.js` crean una capa ampliada que reutiliza el timeline, acciones, Event Inspector y selección de HASH JOIN, Comparison, AI SQL Intelligence, AI Internals y Architecture Explorer.
- `content/architecture-challenges.js` declara Retail, Finanzas y Operaciones; `simulation/architecture-challenge-evaluator.js` evalúa criterios con ponderación 25/20/20/25/10.
- `ui/architecture-challenges.js` reutiliza el grafo y canvas SVG del Explorer, permite construir, cargar referencias, evaluar, seleccionar hallazgos y reiniciar sin mutar datos originales.
- `assets/presentation-mode.css` mantiene Redwood, responsive, foco y reduced motion. El progreso de desafíos usa una clave local separada y no borra progreso previo.

### Decisiones y límites

- No existe un segundo motor ni una segunda línea de tiempo; Presentation Mode delega en los controles de cada laboratorio.
- AI SQL Intelligence usa `planTimeline` para que Play/Pause/Previous/Next/Reset recorran los operadores importados; no inventa estadísticas ni relaciones físicas.
- Las puntuaciones son educativas y deterministas. No son certificación Oracle, validación de seguridad, medición de OCI ni predicción de producción.
- No hay backend, Oracle Database real, ejecución SQL, LLM, agente autónomo, credenciales ni servicios externos.

### Validación final de esta sesión

- JavaScript syntax, `index.html` y `git diff --check`: superados.
- 25 suites Node: superadas, incluidas Presentation Mode, Architecture Challenges, navegación y regresiones históricas.
- Evaluador: las tres arquitecturas de referencia alcanzan `100/100`; una variante vacía queda incompleta y una herramienta Agentic no denegada produce hallazgo de severidad `error`.
- Corrección de auditoría: la evaluación separa criterios funcionales, de flujo y de seguridad; retirar `AUTHORIZED_CONTEXT` conserva el flujo funcional y solo reduce seguridad, sin doble penalización.
- Chrome local: cinco botones de Presentation Mode, entrada/salida, paso siguiente, Escape, foco, capítulo 14, carga de referencia y evaluación `100/100` verificados sin errores de consola.
- Responsive: 375, 768 y 1440 px sin overflow tras corregir el ancho del dashboard guide en `assets/tech-illustrations.css` y versionar la carga local en `assets/portal.js`.
- Reduced motion: `prefers-reduced-motion` detectado y Play deshabilitado; los estados siguen siendo navegables por pasos.
- Seguridad: escaneo de firmas de secretos, URLs externas de runtime y temporales limpio.
- Defecto corregido en esta auditoría: la regresión financiera modelaba la eliminación del enlace completo en lugar de retirar únicamente la evidencia de autorización; la prueba ahora conserva el enlace y cambia su tipo de contexto.
- Chrome Headless/CDP `157.0.8103.79`: los cinco Presentation Labs abren, avanzan y cierran con Escape real sin errores de consola; Finanzas pasa de `100/100` a `88/100` al retirar `auth` e `iam`, mostrando el hallazgo de filtrado por permisos.
- Defectos visuales corregidos: sincronización de `data-theme` en `html` y `body`, cache-bust de `portal.js`, y reanclaje diferido de `#architecture-challenges` después de la carga diferida para respetar la barra sticky.
- Capturas verificadas: `/tmp/oracle-sprint7-presentation-1440-final.png`, `/tmp/oracle-sprint7-challenges-1440-dark-final.png`, `/tmp/oracle-sprint7-challenges-result-final.png`, `/tmp/oracle-sprint7-challenges-1440-light-final.png`, `/tmp/oracle-sprint7-challenges-375-dark-final.png` y `/tmp/oracle-sprint7-challenges-768-dark-final.png`.

### Siguiente actividad

La implementación está publicada para revisión en PR #9. No realizar merge automáticamente. `axe` no está disponible en el entorno; la revisión de accesibilidad fue manual y mediante pruebas locales de teclado, foco, Escape, reduced motion y responsive.

## Estado actual

- **Fecha:** 2026-11-18
- **Rama:** `feature/animated-3d-data-flow`.
- **Sprint:** Cierre y publicación de Animated 3D Data Flow.
- **Estado de entrega:** auditoría visual y funcional aprobada; commit y Pull Request preparados en esta sesión. No se hará merge.

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

## Publicación Sprint 6

- **Rama:** `feature/oracle-ai-architecture-explorer`, sincronizada con `origin`.
- **Commit de implementación:** `e1e950b` — `feat: add Oracle AI Database Architecture Explorer`.
- **Pull Request:** https://github.com/Ptorresr/oracle-sql-engine-academy/pull/6
- **Checks:** los dos checks de GitHub finalizaron correctamente.
- **Conflictos:** no reportados; el PR permanece abierto para revisión y sin merge.
- **Main:** la rama local `main` no fue modificada por este trabajo.

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
- Corregido: se integraron ilustraciones 3D tecnológicas en `assets/illustrations/` para Comparison Lab, HASH JOIN, AI SQL Intelligence, Oracle AI Database Internals y Architecture Explorer. Los SVG interactivos permanecen debajo de las imágenes cuando son necesarios para selección, eventos e inspector.
- Corregido: `assets/tech-illustrations.css` centraliza tokens azul/cian, foco visible, ajuste responsive y `prefers-reduced-motion`; se carga localmente desde `assets/portal.js`.
- Correcto: Chrome local headless cargó las cinco ilustraciones y recursos asociados con respuestas HTTP 200 en las rutas `#comparison`, `#hashjoin`, `#intelligence`, `#ai-internals` y `#architecture-explorer`; se revisaron capturas a 375 px y 768 px.
- Correcto: las 20 suites Node, la sintaxis JavaScript y `git diff --check` pasan después de la corrección visual. El servicio de navegador integrado de Codex continúa indisponible, por lo que la evidencia usa la instalación local existente de Chrome sin instalar dependencias.
- Cambio visual aprobado localmente: se sustituyeron las ilustraciones cálidas por cinco escenas 3D tecnológicas en `assets/illustrations/*-tech.png`, con azul eléctrico, cian, profundidad isométrica y flujos específicos para cada laboratorio. Los archivos se redimensionaron a 1280×720 y los recursos anteriores quedaron retirados por estar sin uso.
- Cambio visual aprobado localmente: `assets/tech-illustrations.css` reemplaza los overrides cálidos por tokens azul/cian y mantiene los SVG interactivos, foco visible, responsive y `prefers-reduced-motion`. La generación no añade texto incrustado, logos, dependencias ni solicitudes externas.
- Documentación de licencias: las imágenes son recursos originales generados para este proyecto; no se reutilizan assets ni código de Anatomy, OCI PoC RunBook o OCI Pipeline Dashboard. No se ejecutaron scripts de terceros.
- Rediseño OCI RunBook: se inspeccionó el `workbook.css` público de la referencia y se documentaron sus tokens reales en `docs/OCI_RUNBOOK_DESIGN_SYSTEM.md`; la academia ahora carga `assets/oci-runbook-design-system.css` y ofrece tema claro/oscuro persistente sin alterar los motores.
- Corregido en la auditoría visual: las tarjetas y paneles cargados por AI SQL Intelligence, AI Internals y Architecture Explorer usan ahora superficies y texto de los tokens OCI también en modo claro; se eliminó el contraste heredado azul/oscuro.
- Corregido en la auditoría de navegación: la inicialización tardía de los laboratorios AI ya no reemplaza el capítulo activo cuando la ruta es `#dashboard`, `#comparison` u otro capítulo no AI; `#intelligence`, `#ai`, `#ai-internals` y `#architecture-explorer` conservan su capítulo correcto.
- Correcto: Chrome local validó las rutas de los 13 capítulos con exactamente un `aria-current`, sin errores DOM y sin solicitudes fuera del origen local. También verificó el cambio de tema sin recarga, persistencia explícita, fallback claro/oscuro de `prefers-color-scheme` y `prefers-reduced-motion`.
- Evidencia visual OCI RunBook: `/tmp/oracle-oci-audit-light/dashboard-panel.png`, `/tmp/oracle-oci-audit-light/comparison-panel.png`, `/tmp/oracle-oci-audit-light/intelligence-panel.png`, `/tmp/oracle-oci-audit-light/ai-internals-panel.png`, `/tmp/oracle-oci-audit-light/architecture-explorer-panel.png` y equivalentes bajo `/tmp/oracle-oci-audit-dark/`; capturas responsive en `home-375x1000.png`, `home-768x1000.png` y `home-1440x1100.png` para ambos temas.
- Correcto: tras estos ajustes pasan nuevamente las 21 suites Node, la sintaxis JavaScript, `test -s index.html`, `git diff --check` y la comprobación de contraste de los tokens principales. No se modificaron motores de simulación ni se añadieron dependencias.
- Limitación de auditoría: el servicio de navegador integrado de Codex no estuvo disponible; la evidencia se obtuvo con Chrome local headless existente. No se instaló un escáner automatizado como axe; el contraste se calculó para los tokens y se revisó visualmente foco, navegación, formularios, código y SVG.
- Visual Design System 2.0: el selector `Claro | Oscuro | Sistema` persiste en `theme.v2`, migra `theme.v1` sin borrarlo, sigue cambios de `prefers-color-scheme` y no recarga ni reinicia el progreso. Chrome confirmó los tres estados y la conservación de una simulación/progreso local.
- Corregido en responsive: a 375 px el mapa de aprendizaje se apiló y el grid RunBook usa `minmax(0, 1fr)`; el panel dejó de recortar texto y los controles siguen visibles. Captura final: `/tmp/oracle-oci-theme-v2/mobile-fixed-final.png`.
- Correcto: la prueba de contrato `tests/theme-selection.test.js` y las 21 suites Node pasan junto con sintaxis, HTML y `git diff --check`. Capturas 2.0: `/tmp/oracle-oci-theme-v2/light-375.png`, `light-768.png`, `light-1440.png`, `dark-375.png`, `dark-768.png` y `dark-1440.png`.
- Estado Git del rediseño: se creó `feature/oci-runbook-visual-system` preservando los cambios locales; `main` local está 19 commits detrás de `origin/main` y no se actualizó para respetar la restricción de no modificar `main`.

## Visual Design System 2.1 — Animated Data Flow

- **Rama:** `feature/animated-3d-data-flow`, creada desde `origin/main` después de integrar Visual Design System 2.0.
- **Arquitectura:** `renderer/animated-data-flow-renderer.js` recibe eventos existentes, resuelve mapas de anclaje por laboratorio y monta SVG relativo sobre las cinco ilustraciones PNG; `assets/animated-data-flow.css` concentra rutas, partículas, marcadores, botones y reduced motion.
- **Integraciones:** HASH JOIN, Comparison Lab, AI SQL Intelligence, Oracle AI Database Internals y Architecture Explorer conservan sus motores, timelines, controles e inspectors; el overlay usa un único índice activo por vista.
- **SQL Intelligence:** el plan importado genera eventos únicamente desde operadores reconocidos por el parser; sin plan se muestra una secuencia contextual explícitamente ilustrativa, sin estadísticas inventadas.
- **Accesibilidad:** cada ilustración conserva alt/caption, el SVG expone nombre y descripción, los componentes tienen botones de teclado, el estado se anuncia en `aria-live` y reduced motion elimina partículas/pulsos sin ocultar el estado.
- **Pruebas:** `tests/animated-data-flow.test.js`, sintaxis de módulos integrados y `git diff --check` pasan. Chrome local montó overlays en las cinco rutas y produjo capturas 375/768/1440 en ambos temas; capturas enfocadas en `/tmp/animated-3d-audit/`.
- **Limitaciones:** las rutas son conceptuales, los anclajes no describen coordenadas físicas de Oracle, no se usa Three.js/WebGL, no existe autoplay y no se ejecuta Oracle Database, LLM ni tráfico externo. El servicio de navegador integrado no se utilizó; la evidencia usa Chrome local.

## Auditoría funcional final — Animated 3D Data Flow

- **Reproducción:** Chrome confirmó estado inicial sin autoplay, Next/Previous/Reset, Play/Pause, 1×/2×/4×, marcador `data-animated-flow-step` y estabilidad del índice después de Pause en HASH JOIN, Comparison, AI Internals y Architecture Explorer.
- **Sincronización:** el paso seleccionado actualiza la ruta, partícula, marcador, explicación textual y Event Inspector. Los botones de componentes usan el mismo callback del timeline y exponen `aria-pressed`/estado activo.
- **Defecto corregido:** Architecture Explorer heredaba una altura fija distinta del stage 16:9; el overlay podía separarse de la imagen con `object-fit: cover`. `assets/animated-data-flow.css` ahora iguala stage, imagen y SVG a `clamp(170px, 25vw, 300px)`.
- **Alineación medida:** Chrome obtuvo `0 px` de diferencia entre imagen, stage y SVG en HASH JOIN, Comparison, Intelligence, AI Internals y Architecture Explorer a 375/768/1440 px; Architecture Explorer fue repetido después de la corrección.
- **Reduced motion:** `prefers-reduced-motion` desactiva Play, dash y `animateMotion`, pero permite Next/Previous/Reset y mantiene la explicación estática. AI Play ahora expone `aria-pressed="false|true"` durante el ciclo.
- **Evidencia:** `/tmp/animated-3d-geometry-fixed.json`, `/tmp/animated-3d-audit/fixed-light-architecture-375.png`, `/tmp/animated-3d-audit/fixed-dark-architecture-1440.png` y las capturas enfocadas anteriores.
- **Resultado:** auditoría funcional superada después de una corrección visual confirmada; no se modificaron motores de simulación ni se crearon timelines adicionales.

## Siguiente actividad

1. Revisar el Pull Request de Animated 3D Data Flow; no hacer merge automáticamente.
2. Mantener `main` local sin modificar.
3. No iniciar nuevas funcionalidades hasta cerrar el Pull Request.

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

1. Revisar el Pull Request del rediseño visual; no hacer merge automáticamente.
2. Mantener `main` local sin actualizar; su atraso frente a `origin/main` está documentado.
3. No iniciar Sprint 7 hasta cerrar formalmente el Pull Request.
