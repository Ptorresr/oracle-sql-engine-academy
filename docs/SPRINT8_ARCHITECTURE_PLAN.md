# Sprint 8 — Advanced Database Internals & Performance Lab

**Estado:** Sprint 8.1–8.7 implementados y validados localmente, sin commit, push, Pull Request ni merge. La publicación queda pendiente de aprobación.
**Rama de implementación:** `feature/database-performance-foundation`, creada desde la planificación basada en `origin/main` (`ec05173`).
**Alcance:** cinco laboratorios educativos locales para explicar conceptos de rendimiento. No habrá conexión a Oracle Database, backend, telemetría real, LLM ni mediciones de producción.

## Resumen ejecutivo

Sprint 8 ampliará la academia con un recorrido de rendimiento que conecte el SQL, el plan conceptual, las estructuras de memoria y las decisiones educativas del modelo. La implementación debe partir de los motores deterministas y los contratos existentes: cada motor generará eventos inmutables, la UI solo moverá el índice del timeline y todas las métricas no observadas se etiquetarán como ilustrativas.

La prioridad es reutilizar el Event Inspector, `OracleAnimatedDataFlow`, `OraclePresentationMode`, el parser `DBMS_XPLAN`, el comparador de JOINs y el estado local del RunBook. No se crearán un segundo inspector, otro controlador global de reproducción, otro parser de planes ni un comparador paralelo.

Los cinco laboratorios previstos son:

1. **Buffer Cache & I/O:** solicitudes lógicas, bloques, aciertos/fallos conceptuales y patrón de reutilización.
2. **PGA, Work Areas & TEMP:** workareas privadas, HASH JOIN/SORT y el posible desbordamiento educativo a TEMP.
3. **Optimizer & Cardinality:** estadísticas, selectividad, estimaciones y decisiones simuladas explicables.
4. **Execution Plan Diagnostics:** profundización de AI SQL Intelligence sobre evidencia importada, sin inventar estadísticas.
5. **Performance What-If:** comparación integrada de dos hipótesis educativas usando los mismos escenarios y contratos.

## Límites de veracidad educativa

| Categoría | Qué puede mostrar el laboratorio | Qué no puede afirmar |
| --- | --- | --- |
| Simulación educativa | Secuencias deterministas, datasets sintéticos, reglas y umbrales declarados. | Que representa una traza literal, algoritmo interno o decisión garantizada de Oracle Database. |
| Comportamiento documentado | Conceptos que se contrastarán con documentación oficial antes de implementar cada lección. | Que un detalle de versión, configuración o carga aplica universalmente. |
| Observación real | Texto importado por el estudiante mediante `DBMS_XPLAN`, conservando valores y ausencias. | Que un plan estimado contiene estadísticas observadas o que un campo importado explica causalidad por sí solo. |

No se presentarán contadores sintéticos como AWR, ASH, lecturas reales, memoria real, coste temporal ni predicción del CBO. Una operación `SORT`, `HASH JOIN` o `FULL TABLE SCAN` no será clasificada como problemática por su nombre. TEMP solo se mostrará cuando el escenario o el plan importado aporte evidencia explícita según el laboratorio.

## Inventario reutilizable

| Componente existente | Responsabilidad actual verificada | Reutilización en Sprint 8 | Extensión necesaria propuesta |
| --- | --- | --- | --- |
| `content/hash-join-scenarios.js` | Declara SQL, bloques, filas, capacidad didáctica y resultados esperados. | Referencia de estructura para escenarios con bloques y memoria. | Nuevo catálogo de escenarios de rendimiento; no mutar los escenarios HASH JOIN actuales. |
| `simulation/hash-join-engine.js` | Emite `READ_BLOCK`, cache hit/miss, acceso, build/probe, resultado y spill deterministas. | Reutilizar tipos base y semántica de `stateAt`. | Extraer solo patrones de contrato; no convertirlo en motor genérico ni cambiar su timeline. |
| `simulation/join-comparison-engine.js` | Compara HASH JOIN, NESTED LOOPS y SORT MERGE JOIN; comprueba resultados canónicos. | Reutilizar la equivalencia lógica y los tracks sincronizados para What-If. | Adaptador de comparación de escenarios, no otro comparador de algoritmos. |
| `renderer/hash-join-renderer.js` / `ui/hash-join-visualizer.js` | Vistas Developer/Plan/Internals, selección de filas/bloques/operadores, inspector, SQL relacionado, tutor y controles. | Patrón de una única selección sincronizada y perspectiva DBA. | Componentes de UI de rendimiento reutilizables, sin copiar el inspector. |
| `renderer/join-comparison-renderer.js` / `ui/join-comparison-lab.js` | Dos tracks independientes o sincronizados y presentación compartida. | Base de comparación A/B del laboratorio integrador. | Soporte para diferencias de escenario y explicación común de resultados. |
| `simulation/oracle-plan-parser.js` | Analiza texto `DISPLAY`/`DISPLAY_CURSOR`: nodos, jerarquía, columnas presentes, predicados, notas y advertencias. | Única entrada de planes importados para diagnósticos. | Pruebas adicionales de formatos reales soportados; no crear parser alternativo. |
| `simulation/oracle-plan-analyzer.js` | Analiza cardinalidad de forma prudente y separa evidencia, hipótesis y limitaciones. | Base para explicar E-Rows, A-Rows y `Starts`. | Hallazgos de diagnóstico solo cuando la evidencia importada los permita. |
| `simulation/sql-what-if-engine.js` | Produce hipótesis locales y mantiene estadísticas importadas separadas. | Base textual para las advertencias What-If. | Motor de hipótesis de rendimiento determinista que conserve esta limitación. |
| `renderer/execution-plan-renderer.js` / `renderer/sql-intelligence-renderer.js` / `ui/sql-intelligence-lab.js` | Visualizan plan importado, operador seleccionado, SQL relacionado, insights y tutor local. | Laboratorio 4 y enlaces hacia los laboratorios 1–3. | Paneles de vínculo a visualización conceptual, sin sustituir evidencia del plan. |
| Event Inspector de los laboratorios | Muestra evento o selección, qué ocurre, dónde, cómo, datos, relación SQL y perspectiva DBA. | Único modelo de explicación contextual para los cinco laboratorios. | Definir un adaptador de detalles de rendimiento; no una segunda UI de inspector. |
| `renderer/animated-data-flow-renderer.js` | Recibe timeline existente y superpone anchors, ruta, partícula, paso y contexto. | Animaciones de pasos basadas exclusivamente en eventos de rendimiento. | Añadir un `kind` de rendimiento y sus aliases después de fijar el contrato. |
| `ui/presentation-mode.js` | Registra laboratorios y delega Play/Pause/Step/Reset/velocidad al controlador existente. | Modo presentación de cada laboratorio Sprint 8. | Registrar cada laboratorio cuando sus controles estén completos; no añadir timers propios. |
| `content/runbook-chapters.js` / `assets/portal.js` | Fuente única de capítulos, hash routing, historial, progreso, catálogo y carga de módulos. | Integración del capítulo 15 y enlaces internos. | Un capítulo y rutas explícitas, sin renumerar 01–14 ni reemplazar la clave local existente. |
| `assets/oci-runbook-design-system.css` y CSS de laboratorio | Tokens Redwood, temas Claro/Oscuro/Sistema, foco y reduced motion. | Superficies, estados semánticos y responsive de Sprint 8. | Tokens de rendimiento si faltan, centralizados y con contraste revisado. |

## Arquitectura de cinco capas

```text
Scenario Model (declarativo e inmutable)
        │
Performance Simulation Engine (puro y determinista)
        │
Performance Event Adapter (contrato común)
        │
Visualization Layer (Developer · Plan · Internals · comparación)
        │
Learning & Explanation (Inspector · SQL relacionado · Tutor local · What-If)
```

### Capa 1 — Scenario Model

Los escenarios futuros residirán en `content/` y declararán, sin funciones de UI:

- Identificador y versión del escenario, objetivo educativo y tres casos de uso.
- SQL de referencia que **no se ejecuta** desde el navegador.
- Tablas sintéticas, columnas, relaciones, filas y distribución conceptual de bloques.
- Cardinalidades, selectividad, índices y estadísticas disponibles como entradas educativas.
- Parámetros explícitos: capacidad de caché, límite de workarea, tamaño estimado de fila, patrón de acceso y algoritmo elegido.
- Valores observados únicamente cuando un escenario de ejecución simulada los declare; los planes importados conservarán sus valores originales.
- Supuestos, límites y una semilla fija si alguna generación determinista fuera necesaria.

El modelo no contendrá nodos DOM, temporizadores ni decisiones ocultas. El escenario original será congelado o clonado de forma segura antes de cada variante What-If.

### Capa 2 — Performance Simulation Engine

Los motores nuevos serán funciones puras en `simulation/` con un API consistente: `createTimeline(scenario, parameters)` y `stateAt(timeline, index)`. Devolverán eventos inmutables y un estado derivado. Las reglas didácticas estarán declaradas junto al escenario o documentadas por el motor para poder explicarlas y probarlas.

Responsabilidades propuestas:

- **Buffer engine:** procesa una secuencia explícita de solicitudes de bloques y un estado de caché conceptual; no pretende recrear algoritmos de reemplazo de Oracle.
- **Workarea engine:** calcula unidades educativas de trabajo, reserva conceptual, presión y spill solo cuando la regla declarada lo determine; no modela memoria PGA real.
- **Optimizer engine:** deriva estimaciones y una alternativa de acceso/método a partir de reglas visibles; no ejecuta el CBO ni devuelve costes Oracle.
- **Diagnostics adapter:** transforma el plan ya parseado y sus valores presentes en eventos navegables; nunca completa estadísticas ausentes.
- **Performance comparison composer:** combina estados A/B sin mezclar timelines ni inventar tiempos.

Los motores existentes de HASH JOIN y Comparison se consumen tal como están. Si un laboratorio necesita correlacionar eventos, un compositor externo relacionará IDs sin editar los motores previos.

### Capa 3 — Performance Event Adapter

El adaptador será el único lugar autorizado para convertir resultados de un motor nuevo al contrato de eventos común. Conservará los ocho campos base existentes y añadirá campos opcionales solo después de la aceptación del contrato de `docs/SPRINT8_EVENT_CONTRACT.md`.

El adaptador debe:

- Mantener `rowIds` y `blockIds` como listas, también vacías.
- Copiar métricas como una instantánea inmutable y marcarlas como ilustrativas cuando no procedan de un plan importado.
- Asociar explicación, ubicación conceptual y representación sin que el renderer tenga que inferir significado desde una etiqueta.
- Rechazar o advertir ante un evento de tipo desconocido para el laboratorio, sin romper el timeline.
- Garantizar la misma secuencia para escenario, parámetros y semilla iguales.

### Capa 4 — Visualization Layer

Cada laboratorio tendrá las vistas sincronizadas Developer, Execution Plan e Internals. El estado activo será siempre `timeline + index + selección`; los renderers no modificarán escenarios, no calcularán decisiones y no iniciarán animaciones autónomas.

- **Developer:** SQL de referencia, tablas/datos, predicados, cardinalidades de entrada y resultado lógico si aplica.
- **Execution Plan:** operadores conceptuales o importados, estimación/observación con su procedencia y flujo de filas lógico.
- **Internals:** bloques, Buffer Cache, workarea, PGA, TEMP y almacenamiento con leyendas claras de abstracción.
- **Comparison:** dos columnas o tracks A/B que reutilicen el comportamiento del Comparison Lab y expresen diferencias, no una carrera basada en tiempos falsos.

La representación primaria seguirá siendo SVG accesible. Las ilustraciones 3D locales podrán recibir el overlay de `OracleAnimatedDataFlow`, pero serán apoyo visual: la selección, el foco, la leyenda y el inspector seguirán disponibles sin depender de la imagen.

### Capa 5 — Learning & Explanation

La capa educativa reutilizará el inspector y preparará adaptadores de contenido que respondan siempre:

1. **¿Qué es?** Definición delimitada.
2. **¿Cómo funciona?** Secuencia conceptual del escenario.
3. **¿Para qué sirve?** Decisión o diagnóstico que ayuda a comprender.
4. **¿Qué sucede internamente?** Componentes educativos implicados, sin atribuir una traza literal.
5. **¿Qué observa un desarrollador?** SQL, predicados, datos y resultado lógico.
6. **¿Qué observa un DBA?** Evidencia, alcance de estadísticas, memoria/caché conceptual y siguiente comprobación.

El AI Tutor seguirá siendo un conjunto de reglas locales y lo declarará explícitamente. Las recomendaciones separarán evidencia, interpretación, hipótesis, comprobaciones sugeridas y limitaciones.

## Diseño de los cinco laboratorios

### 1. Buffer Cache & I/O

**Objetivo.** Explicar que la solicitud lógica de un bloque, la búsqueda en Buffer Cache y una posible lectura física conceptual son conceptos relacionados pero no equivalentes uno a uno.

**Entradas modificables.** Número y secuencia de bloques solicitados, capacidad conceptual de caché, patrón secuencial/aleatorio/repetido, reutilización y estado frío/caliente.

**Timeline previsto.** `READ_BLOCK` → `CACHE_HIT` o `CACHE_MISS` → `TABLE_ACCESS` → actualización de estado visible. Una lectura física ilustrativa solo se asociará al camino de miss del modelo y se marcará como tal.

**Vistas.** Developer muestra la consulta y bloques solicitados; Plan muestra el acceso lógico; Internals muestra datafiles, la caché conceptual y el conjunto de bloques residentes. El inspector puede seleccionar evento, bloque y fila cuando estén representados.

**Límite.** No modela la política real de Buffer Cache, concurrencia, prefetched reads, tamaños de bloque, RAC ni estadísticas del sistema.

### 2. PGA, Work Areas & TEMP

**Objetivo.** Diferenciar una workarea privada de una caché compartida y explicar que HASH JOIN y SORT pueden necesitar memoria y, bajo condiciones educativas explícitas, usar TEMP.

**Entradas modificables.** Filas procesadas, tamaño estimado de fila, límite educativo de memoria, HASH JOIN/SORT y distribución de datos.

**Implementación 8.3.** `OracleWorkareaTempEngine` normaliza HASH JOIN/SORT, filas, unidades de fila, presupuesto y distribución; calcula `ceil(filas × unidades de fila × factor de operación × factor de distribución)`. Clasifica `Optimal` si el trabajo no supera el presupuesto, `One-Pass` si no supera el doble y `Multi-Pass` en los demás casos, con un máximo educativo de cuatro pasadas temporales. El timeline es `WORKAREA_ALLOCATE` → `WORKAREA_PROCESS` → pares `TEMP_WRITE`/`TEMP_READ` y fases adicionales solo si hay pasadas → `WORKAREA_COMPLETE`. Esta regla es visible, local y determinista; no reproduce el algoritmo interno de Oracle.

**Vistas.** Developer describe entradas; Plan muestra el operador conceptual; Internals resalta PGA/workarea/TEMP y explica que los contadores son unidades del modelo, no bytes de `V$`.

**Límite.** No intenta reproducir la administración automática/manual de memoria, particiones, multipass, segmentación, bytes, I/O, concurrencia ni criterios internos de Oracle. `SPILL_TEMP` se conserva sin cambio en el motor HASH JOIN histórico; el preview 8.3 usa los eventos explícitos `TEMP_WRITE` y `TEMP_READ` para sus fases educativas.

### 3. Optimizer & Cardinality

**Objetivo.** Mostrar cómo estadísticas, selectividad, relaciones e índices pueden influir en una decisión educativa de acceso y JOIN, y separar estimación de observación.

**Entradas modificables.** Filas, selectividad, calidad/actualidad conceptual de estadísticas, índices, relaciones y distribución.

**Implementación 8.4.** `OracleOptimizerCardinalityEngine` normaliza filas base de `0` a `10,000,000`, selectividad de `0` a `1`, estado de estadísticas (`available`, `stale`, `absent`), índice y distribución. Calcula `ceil(filas base × selectividad declarada)`, conservando cero, y expone la fórmula y el redondeo en cada estado. El timeline único es `CARDINALITY_ESTIMATE` → `ACCESS_PATH_SELECTED` → `TABLE_ACCESS` → `EMIT_ROW` por cada fila lógica declarada. La regla selecciona una alternativa de índice solo con estadísticas no ausentes, índice declarado y selectividad `≤ 0.1`; selecciona Sort Merge solo con estadísticas disponibles, distribución uniforme y selectividad `≥ 0.5`; en los demás casos muestra Hash Join educativo, sin prometer una decisión del CBO.

**Vistas.** Developer muestra predicados y datos; Plan compara valores estimados y, solo si existen, valores observados; Internals presenta estadísticas como entrada lógica del modelo, no como archivos internos.

**Límite.** No predice el plan real ni simula cálculo de coste Oracle. Coste importado se muestra como valor del plan, nunca como milisegundos.

### 4. Execution Plan Diagnostics

**Objetivo.** Profundizar AI SQL Intelligence usando el parser existente y relacionar operadores importados con explicaciones y visualizaciones conceptuales.

**Entradas modificables.** Plan de texto y SQL de contexto ya soportados por el lab existente. No habrá ejecución de SQL.

**Implementación 8.5.** `OraclePlanDiagnosticsTimeline` crea `PLAN_OPERATOR_START` y `PLAN_OPERATOR_END` por los nodos reconocidos en el plan importado. El adaptador conserva `operatorId`, explicación, `decisionBasis` y las métricas ilustrativas mínimas del recorrido; el timeline conserva el nodo importado, predicado, notas, métricas originales y ausencias. `A-Rows/Starts` solo procede del analyzer si ambos valores están disponibles y `Starts > 0`. El recorrido sigue el orden diagnóstico del texto, no una ejecución física o temporal.

**Vistas.** Se reutilizan importador, árbol/SVG y Event Inspector de Intelligence. Una visualización de Buffer Cache/PGA/TEMP solo se activará por evidencia explícita del plan o como explicación general claramente separada.

**Límite.** Formatos gráficos o secciones no tabulares no soportadas seguirán mostrando advertencia. No se inventarán filas observadas para `DISPLAY` ni se inferirá TEMP desde el nombre de un operador.

### 5. Performance What-If Lab

**Objetivo.** Comparar dos hipótesis educativas sobre la misma consulta/dataset, manteniendo el escenario original intacto.

**Entradas modificables.** Volumen, selectividad, distribución, índice, estado de caché conceptual, límite de workarea y método/alternativa educativa.

**Diseño.** A y B tendrán snapshots de parámetros y timelines independientes. El Comparison Lab proveerá el patrón de tracks sincronizados/independientes y la comparación de resultados lógicos cuando se aplique. El resultado resaltará cambio de operadores, estimaciones, accesos, eventos de caché, memoria ilustrativa y TEMP potencial, no tiempos fabricados.

**Límite.** Es un laboratorio de hipótesis locales: no modifica estadísticas importadas, no calcula costes reales ni anticipa una elección de Oracle.

**Implementación 8.6.** `OraclePerformanceWhatIfEngine` normaliza una variante permitida y compone los timelines inmutables de Optimizer, Buffer Cache y Workarea en un track A o B. Rebasea únicamente el número de paso del recorrido explicativo; conserva cada métrica en el evento del motor que la produjo y expone la procedencia. No crea eventos ni campos obligatorios nuevos. Retail compara selectividad/índice, Finanzas cache/presupuesto y Data Warehouse alternativas sobre la misma población. La comparabilidad requiere `populationId` e `logicalResultId` declarados; en Data Warehouse, un cambio de volumen o población es explícitamente no comparable. La UI soporta reproducción sincronizada o independiente, dos overlays de Animated Data Flow y un Event Inspector con identidad de track. El orden compuesto no representa una ejecución Oracle.

## Estrategia visual y de accesibilidad

- Conservar tokens Redwood, selector Claro/Oscuro/Sistema y las capas de estilos actuales; incorporar tokens semánticos en el sistema central, no colores arbitrarios por renderer.
- Usar bloques isométricos, Buffer Cache, workareas y TEMP como nodos SVG etiquetados y navegables; las rutas luminosas solo se dibujan para el evento activo.
- Hacer que la explicación por paso proceda del mismo objeto de Event Inspector que alimenta texto alternativo, `title`/`desc` SVG y Presentation Mode.
- Ofrecer botones y foco visible para toda acción disponible por drag/selección visual. Los estados no dependerán exclusivamente del color: usar etiqueta, icono/patrón y texto.
- Con `prefers-reduced-motion`, desactivar Play/autoplay y `animateMotion`; Previous/Next/Reset y el cambio de escenario conservarán la navegación por estados.
- Validar 375, 768 y 1440 px, evitando que tablas, códigos SQL, leyendas o paneles de métricas queden inaccesibles u ocultos.

## Integración RunBook implementada en 8.7

La integración materializada añade al contrato de capítulos:

| Elemento | Implementación |
| --- | --- |
| Capítulo | `15 · Database Internals & Performance` |
| ID / ruta principal | `database-performance` / `#database-performance` |
| Rutas internas | `#buffer-cache-io`, `#pga-workareas-temp`, `#optimizer-cardinality`, `#execution-plan-diagnostics`, `#performance-what-if` |
| Progreso | Mantener la clave local actual y registrar actividades por laboratorio; abrir una ruta solo marca exploración, no finalización. |
| Actividades de finalización | `buffer-step-inspected`, `workarea-case-compared`, `cardinality-rule-reviewed`, `plan-diagnostic-inspected`, `performance-comparison-reviewed`. |
| Navegación | Catálogo, sidebar, breadcrumb, anterior/siguiente, hash inicial y Back/Forward se derivan de `content/runbook-chapters.js`; el resolvedor central de `assets/portal.js` mantiene el capítulo 15 como único activo para todas sus rutas. |
| Carga diferida | `assets/portal.js` carga de forma secuencial e idempotente los módulos locales, espera `academy:performance-ready` y evita resolver rutas obsoletas durante esa espera. |
| Presentation Mode | Buffer Cache, PGA/TEMP, Optimizer y What-If exponen el mismo estado y acciones de su timeline a `OraclePresentationMode`; Diagnostics conserva el registro existente de Intelligence. |

La implementación no renumera ni modifica los capítulos 01–14. Diagnostics conserva `#intelligence` y se abre desde el puente `#execution-plan-diagnostics`, sin duplicar `OraclePlanParser`, `OraclePlanAnalyzer` ni `OraclePlanDiagnosticsTimeline`.

## Incrementos revisables

| Incremento | Objetivo y dependencias | Archivos esperados (propuestos) | Contratos y pruebas | Riesgo / aceptación |
| --- | --- | --- | --- | --- |
| 8.1 Foundation & Event Model | Fijar escenarios comunes, taxonomía y adaptador. Depende del contrato actual verificado. | `content/performance-scenarios.js`, `simulation/performance-event-adapter.js`, `tests/performance-event-contract.test.js`, documentos. | Compatibilidad con los ocho campos base, inmutabilidad, determinismo y eventos desconocidos. | Riesgo de duplicar contratos; se acepta solo si Event Inspector/Animated Flow consumen el timeline sin cambios incompatibles. |
| 8.2 Buffer Cache & I/O | Implementar primer motor y una vista accesible. Depende de 8.1. | `simulation/buffer-cache-engine.js`, renderer/UI/CSS y tests específicos. | Frío/caliente, hit/miss, capacidad, repetición, reset y métricas etiquetadas. | Riesgo de confundir lógico/físico; se acepta solo con leyendas y ausencia de equivalencias absolutas. |
| 8.3 PGA & TEMP | Modelar workareas y TEMP educativo. Depende de eventos 8.1 y patrón HASH JOIN. | `simulation/workarea-engine.js`, contenido/render/UI/tests. | HASH/SORT, límite igual/superado, TEMP solo ante evento, estado original inmutable. | Riesgo de presentar PGA como caché; se acepta con explicación explícita y sin bytes reales. |
| 8.4 Optimizer & Cardinality | Implementado localmente: reglas didácticas visibles de estimación y alternativas. | `simulation/optimizer-cardinality-engine.js`, contenido/render/UI/tests. | Selectividad, índices, estadísticas ausentes, NULL/duplicados y determinismo. | Mitigado con `decisionBasis`, métricas ilustrativas y limitación persistente sobre CBO/costes. |
| 8.5 Plan Diagnostics | Implementado localmente: conectar explicaciones a parser/analyzer existentes. | Timeline puro, extensiones mínimas a render/UI de Intelligence y pruebas. | `DISPLAY` vs `DISPLAY_CURSOR`, `Starts`, campos ausentes, HTML hostil, plan incompleto y límite explícito. | Mitigado: ausencias preservadas, evidencia/hipótesis separadas y recorrido no presentado como ejecución Oracle. |
| 8.6 Performance What-If | Implementado localmente: comparación A/B integradora. Depende de 8.2–8.4 y patrones de Comparison Lab. | composer, UI/CSS, contenido, SVG y pruebas A/B. | Snapshots aislados, comparabilidad declarada, reset, sincronización e hipótesis etiquetadas. | Mitigado: reutiliza contratos públicos, no añade tipos y separa alcance/procedencia de métricas. |
| 8.7 RunBook, Presentation & QA | Implementado localmente: capítulo 15, catálogo, rutas, progreso, Presentation Mode y regresión. | Cambios declarativos de capítulos, loader, CSS, docs y `tests/database-performance-integration.test.js`. | Hash/back-forward, progreso, temas, reduced motion, foco, responsive y GitHub Pages. | Validado con estado activo único; publicación pendiente de aprobación. |

Salvo los archivos materializados en 8.1 y 8.2, los nombres de archivos siguen siendo propuestas de organización. Cada incremento requerirá revisión funcional antes de continuar al siguiente.

### Estado de Sprint 8.1

La fundación ya materializa tres de los archivos propuestos, sin cargarlos todavía desde `index.html` ni `assets/portal.js`:

- `content/performance-scenarios.js`: catálogo inmutable de Retail, Finanzas y Data Warehouse con SQL de referencia, datos sintéticos, bloques, parámetros, supuestos y límites.
- `simulation/performance-event-adapter.js`: validador y adaptador puro que conserva el contrato base, reconoce eventos candidatos y congela los resultados.
- `tests/performance-event-contract.test.js`: pruebas de esquema, NULL visible, inmutabilidad, retrocompatibilidad, determinismo, tipos desconocidos y validación de timeline.

El adaptador no sustituye ningún motor existente y no crea UI, timers, rutas ni una segunda línea de tiempo. Los eventos candidatos continúan pendientes de la implementación específica de cada laboratorio.

### Estado de Sprint 8.2

El primer laboratorio materializa el modelo sin alterar los motores históricos:

- `simulation/buffer-cache-engine.js` genera de forma pura e inmutable `READ_BLOCK`, seguido de `CACHE_HIT` o `CACHE_MISS`, y `TABLE_ACCESS` para cada solicitud. La caché evoluciona por una regla FIFO declarada exclusivamente para esta lección.
- `renderer/buffer-cache-renderer.js` y `ui/buffer-cache-lab.js` sincronizan Developer, Flujo conceptual e Internals con el mismo índice, selección de fila/bloque/operador/componente, Event Inspector, SQL relacionado, tutor local y What If educativo.
- `renderer/animated-data-flow-renderer.js` recibe el nuevo `kind` `buffer-cache`; no genera ni modifica eventos.
- El loader local de `assets/portal.js` carga de forma secuencial los módulos del preview. La sección no se incorpora aún al catálogo, a capítulos, a progreso, a rutas directas ni a Presentation Mode; estas decisiones permanecen en 8.7.
- Las pruebas de motor y renderer cubren determinismo, capacidad normalizada, cache fría/caliente, reutilización, hit/miss, datos/selección e integración con la capa de flujo. No se presenta FIFO como política real de Oracle, ni un miss como métrica física observada.
- La auditoría visual usa Chrome CDP y captura de superficie. Revisa 1440, 768 y 375 px en temas claro/oscuro, los estados miss/hit/reemplazo, controles, inspector, SQL, tutor, foco y reduced motion. La ruta del flujo animado se mantiene alineada con la tubería Datafiles → Buffer Cache → SQL Engine de la ilustración y del SVG técnico; no introduce una ruta alternativa ni decide el recorrido del motor.
- En macOS, `--headless --screenshot` devuelve un PNG negro por un fallo de compositor `CVDisplayLink`; no se trata como defecto de la UI. `Page.captureScreenshot({ fromSurface: true })` proporciona la evidencia válida. La inyección CDP no cambia un `<select>` nativo con flecha en este entorno, aunque Enter/Espacio, Tab/Shift+Tab, timeline y componentes SVG sí se verificaron mediante entrada de teclado de navegador.

## Estrategia de pruebas

### Unitarias y de contrato

- Repetir cada motor con el mismo escenario/parámetros y comparar eventos, estado final y métricas ilustrativas.
- Verificar campos base, arrays vacíos, congelamiento/inmutabilidad y que eventos opcionales no rompan consumidores existentes.
- Probar límites: caché con capacidad mínima, accesos repetidos, umbral exacto de workarea, filas cero, tamaño de fila inválido, selectividad 0/1, `NULL`, duplicados y parámetros fuera de rango.
- Validar que TEMP aparece solo después de la regla/evento permitido y que `A-Rows`, `Buffers`, `Reads`, `A-Time` o `Starts` ausentes permanecen ausentes.
- Probar parser con cabeceras variables, asteriscos, operaciones desconocidas, predicados/notas, valores abreviados, input incompleto, texto largo y HTML no ejecutable.

### Integración

- Sincronización entre Developer, Plan, Internals, Event Inspector, SQL relacionado, tutor local, What-If, Animated Data Flow y Presentation Mode.
- Comparación A/B independiente y sincronizada, reset de escenario, persistencia local de progreso y no mutación de inputs.
- Rutas directas, Back/Forward, un único capítulo activo, anterior/siguiente y compatibilidad con los 14 capítulos existentes.
- Regresión de JOINs, HASH JOIN, Comparison, SQL Intelligence, AI Internals, Architecture Explorer, Challenges y temas.

### Navegador y accesibilidad

- Chrome/Chromium disponible localmente: escritorio 1440 px, tablet 768 px y móvil 375 px en Claro/Oscuro/Sistema.
- Teclado, foco visible, nombres accesibles, botones deshabilitados honestamente, tablas desplazables y SVG con `title`/`desc` o equivalentes.
- `prefers-reduced-motion`: sin autoplay ni animación continua, conservando navegación por pasos.
- Revisar errores de consola, recursos exclusivamente locales, rutas relativas y ausencia de solicitudes externas para GitHub Pages.

## Riesgos y controles

| Riesgo | Control de diseño |
| --- | --- |
| Simplificación presentada como internals reales | Leyenda persistente por vista, reglas visibles, separación de evidencia/hipótesis/limitaciones y revisión contra fuentes oficiales antes de implementar contenido. |
| Duplicación de estado o controles | Reutilizar `OraclePresentationMode`, tracks del Comparison Lab y Event Inspector; prohibir timers en motores. |
| Contrato incompatible | Adaptador central, pruebas de retrocompatibilidad y campos base obligatorios. |
| Métricas engañosas | Etiqueta `ilustrativa`, ausencia preservada, sin tiempos inventados ni conversiones de Cost a duración. |
| Regresión visual o de temas | Tokens centralizados, screenshots por breakpoint/tema y pruebas de focus/reduced motion. |
| Carga o rutas GitHub Pages rotas | Loader secuencial local, rutas relativas, pruebas de hash y recursos sin CDN/runtime externo. |
| Inflación de alcance | Entregas 8.1–8.7 con gates de aceptación; no se inicia el siguiente incremento sin validar el anterior. |

## Estado de cierre local

Sprint 8.7 integra el capítulo 15 sin alterar 01–14 y valida los controles completos antes de registrarlos en Presentation Mode. Las capturas CDP usan `Page.captureScreenshot({ fromSurface: true })` por el defecto conocido del binario headless de macOS. La comprobación física de flechas en un `<select>` nativo requiere un navegador de escritorio disponible; no se confunde con una cobertura automatizada de controles personalizados.
