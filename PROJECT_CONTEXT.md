# Project Context — Oracle SQL & AI Database Engine Academy

**Estado:** Sprints 0–8, Visual Design System 2.0 y Animated 3D Data Flow están integrados en `main`. Sprint 8 se incorporó mediante el PR #10 (**MERGED**) y el squash commit `9926ba4`; el capítulo 15 y sus cinco actividades educativas están disponibles en GitHub Pages.
**Runtime objetivo:** GitHub Pages, totalmente estático y sin secretos.
**Audiencia:** desarrolladores Oracle SQL, DBAs, arquitectos y estudiantes técnicos.

## Propósito

La academia explica Oracle SQL intermedio-avanzado, optimización y funcionamiento interno de Oracle AI Database mediante módulos visuales, reproducibles y técnicamente prudentes. Debe servir tanto al desarrollador que busca entender los resultados y el SQL como al DBA que analiza operadores, memoria, I/O, cardinalidad y plan.

La implementación actual conserva la demo de JOINs, el recorrido conceptual del motor y los laboratorios locales de AI. Sprint 1 añadió un dashboard de aprendizaje, navegación RunBook, progreso local y un workspace sincronizado, sin sustituir los laboratorios ni introducir un nuevo motor de JOIN.

Sprint 2 añade un motor puro para un HASH JOIN didáctico. Sus escenarios, eventos, renderizado SVG y controles se mantienen en capas distintas y siguen funcionando sin backend en GitHub Pages.

Sprint 3 compara HASH JOIN, NESTED LOOPS y SORT MERGE JOIN sobre datasets equivalentes. Cada método conserva su timeline determinista, mientras una comprobación canónica confirma que los tres entregan el mismo resultado lógico del INNER JOIN educativo.

Sprint 4 incorpora un laboratorio local que recibe texto no confiable de planes Oracle, lo normaliza y lo presenta como datos importados. El análisis de cardinalidad, hallazgos, SQL Analyzer, What If? y tutor son reglas y cálculos locales; no son telemetría ni IA generativa.

Sprint 4.1 convierte AI SQL Intelligence en el capítulo 09 oficial del RunBook. La secuencia, rutas, breadcrumbs, estado activo y anterior/siguiente se derivan de un contrato único; el progreso distingue exploración de finalización educativa local.

Sprint 5 integra cinco laboratorios locales y deterministas bajo el capítulo AI existente: AI Vector Search, Hybrid Vector Search, Select AI, RAG Architecture y Agentic Workflows. Sus motores separan datos, eventos y renderizado; cada evento declara si representa Database, aplicación, servicio externo o abstracción educativa. Ningún vector, SQL, LLM, agente o herramienta se ejecuta fuera del navegador.

Sprint 6 añade Oracle AI Database Architecture Explorer como capítulo 13. Presenta arquitecturas declarativas de Retail, Finanzas y Operaciones, un Builder local y motores deterministas para grafo, flujo, hallazgos de seguridad, alternativas y guía de despliegue. Es una herramienta didáctica: no configura OCI, no valida una arquitectura real, no consulta servicios externos y no reemplaza una revisión de seguridad.

## Entrega Sprint 1

- El Learning Dashboard muestra el catálogo declarativo, diferencia módulos disponibles y futuros, y persiste el progreso del módulo JOINs en `localStorage`.
- La navegación incorpora breadcrumbs, índice lateral RunBook, enlaces anterior/siguiente y una ruta accesible hacia el contenido del módulo.
- El Simulation Workspace unifica las vistas Developer, Execution Plan e Internals como lecturas del estado de los controles existentes.
- Los AI Labs, el simulador de JOINs y los tres casos de uso originales permanecen locales, deterministas y claramente rotulados como demostraciones, reglas o corpus didáctico.
- La presentación mantiene tema oscuro, tokens CSS, SVG y JavaScript nativo para conservar la compatibilidad con GitHub Pages.

## Decisiones arquitectónicas

| Área | Decisión |
| --- | --- |
| Despliegue | HTML/CSS/JavaScript/SVG estáticos publicados en GitHub Pages. |
| Contenido | Declarativo, versionado y separado del motor cuando se creen módulos nuevos. |
| Simulación | Máquina de estados y timeline determinista: mismos parámetros producen mismos eventos y resultados. |
| Renderizado | SVG accesible como base; Canvas/WebGL es opcional y debe degradar con claridad. |
| Vistas | Developer, Execution Plan e Internals consumen el mismo estado de simulación. |
| Métricas | Las derivadas de la simulación se rotulan como ilustrativas; no son AWR, SQL Monitor ni estadísticas observadas. |
| IA v1 | Reglas y datasets locales etiquetados como simulación; una IA real exige backend seguro y aprobación posterior. |
| Planes importados | Texto no confiable, limitado a 200.000 caracteres, escapado antes de renderizar y nunca enviado, ejecutado ni almacenado automáticamente. |
| Dependencias | Preferir navegador nativo. Toda dependencia externa requiere revisión técnica, licencia y versión fijada. |

## Implementación Sprint 2

- `content/hash-join-scenarios.js` define los datasets, SQL, resultados esperados y contexto educativo de Retail, Finanzas y Data Warehouse.
- `simulation/hash-join-engine.js` produce eventos inmutables y reproducibles para accesos a bloque, Buffer Cache, Build/Probe, salida lógica y spill conceptual a TEMP.
- `renderer/hash-join-renderer.js` transforma el estado actual en tablas, plan conceptual y SVG accesible sin alterar el modelo.
- `ui/hash-join-visualizer.js` mantiene una única posición de timeline para las tres vistas, controles de reproducción, explicaciones de componentes, tutor local y What If? explícitamente hipotético.
- El Event Inspector separa la selección de evento, fila, bloque, operador o componente del estado determinista; contextualiza SQL, datos y advertencias DBA sin convertir métricas ilustrativas en telemetría.
- Los valores de lecturas, buckets, particiones y TEMP son ilustrativos. No representan contadores, PGA ni I/O de Oracle Database.

## Implementación Sprint 3

- `content/execution-comparison-scenarios.js` define tres escenarios equivalentes para Retail, Finanzas y Data Warehouse, con SQL Oracle, duplicados y `NULL` visibles.
- `simulation/join-comparison-engine.js` implementa timelines tipados de HASH JOIN, NESTED LOOPS y SORT MERGE JOIN bajo el mismo contrato de evento.
- `renderer/join-comparison-renderer.js` ofrece vistas Developer, Execution Plan e Internals por método, además de un SVG isométrico educativo sin dependencias externas.
- `ui/join-comparison-lab.js` permite comparar dos algoritmos en modo sincronizado o independiente, inspeccionar eventos y usar AI What If? basado en hipótesis locales.
- La igualdad de resultados se evalúa sobre pares canónicos de filas; no presupone orden físico de salida ni predice el plan de Oracle.

## Implementación Sprint 4

- `content/sql-intelligence-examples.js` entrega tres casos de Retail, Finanzas y Data Warehouse con SQL, planes ilustrativos, preguntas y relación con laboratorios previos.
- `simulation/oracle-plan-parser.js` es un parser sin DOM para tablas `DBMS_XPLAN.DISPLAY` y variantes con estadísticas de `DISPLAY_CURSOR`/`ALLSTATS LAST`; conserva columnas variables, jerarquía, predicados, notas y advertencias.
- `simulation/oracle-plan-analyzer.js` distingue E-Rows, A-Rows y Starts. Solo muestra A-Rows/Starts como cálculo derivado si Starts es mayor que uno, evita divisiones entre cero y separa evidencia, hipótesis y límites.
- `simulation/oracle-sql-analyzer.js` detecta patrones SQL frecuentes sin ejecutar ni declarar inválida una consulta compleja. `simulation/sql-what-if-engine.js` crea hipótesis deterministas sin modificar el plan importado ni calcular costos reales.
- `renderer/execution-plan-renderer.js` y `renderer/sql-intelligence-renderer.js` escapan texto importado antes de renderizar tabla, árbol, SVG e insights. `ui/sql-intelligence-lab.js` usa un estado de plan para sincronizar visualizador, inspector, SQL relacionado, insights, What If y tutor.
- El laboratorio se carga desde recursos locales relativos versionados, sin dependencias externas, backend, persistencia automática ni secretos.
- La auditoría técnica verificó formatos de tabla variables, valores abreviados, estadísticas ausentes, HTML hostil y planes incompletos. La tabla expone todas las columnas importadas, incluido `A-Time`, sin derivar tiempos o métricas faltantes.

## Implementación Sprint 4.1

- `content/runbook-chapters.js` es la fuente de verdad de los doce capítulos: identificador estable, orden, título, ruta, relación anterior/siguiente y criterios de finalización cuando corresponden. El capítulo 12 ofrece el acceso principal a Oracle AI Database Internals Lab.
- `assets/portal.js` genera la navegación activa desde ese contrato, resuelve `#intelligence` incluso si el laboratorio termina de cargar de forma local, sincroniza `aria-current`, breadcrumbs, título, historial Back/Forward y navegación secuencial.
- AI SQL Intelligence se completa localmente solo después de importar un plan y seleccionar un operador; abrir el capítulo únicamente lo registra como explorado. El formato existente de `localStorage` se amplía sin borrar el progreso anterior.

## Implementación Sprint 5

- Los escenarios de Retail, Finanzas y Operaciones residen en `content/` y usan exclusivamente datos sintéticos. Cada laboratorio conserva objetivo, SQL/API de referencia, resultados esperados, seguridad y límites.
- `simulation/vector-distance-engine.js` calcula coseno, euclidiana y producto punto con validación de dimensiones y vectores cero. `vector-search-engine.js` compara búsqueda exacta con una reducción de candidatos marcada como abstracción educativa; no implementa HNSW ni IVF.
- Hybrid Search normaliza y fusiona dos señales con pesos visibles solo para el laboratorio. Select AI usa SQL predefinido; RAG filtra por rol antes de crear chunks/contexto; Agentic Workflows rechaza acciones sin permiso/confirmación.
- `renderer/ai-data-flow-renderer.js` entrega SVG accesible y perspectivas Developer, Processing Flow e Internals. `ui/oracle-ai-internals-lab.js` sincroniza controles, timeline, Event Inspector, tutor de reglas, What If local, navegación por teclado y progreso local.
- Los ejemplos de `sql/oracle-ai-internals-examples.sql` son material de lectura para Oracle AI Database 26ai. No se ejecutan desde GitHub Pages y documentan configuración, privilegios, perfiles, credenciales y red como requisitos externos.

## Implementación Sprint 6

- `content/oci-architecture-components.js` y `content/oci-reference-architectures.js` separan componentes, capacidades y tres arquitecturas de referencia. AI Vector Search se identifica expresamente como capacidad de base de datos, no como recurso independiente.
- `simulation/architecture-*.js` y `simulation/architecture-deployment-guide.js` son funciones locales deterministas. Separan integridad de grafo, eventos de flujo, hallazgos de seguridad, hipótesis What If y guía educativa.
- `renderer/architecture-*.js`, `ui/architecture-explorer.js` y `assets/architecture-explorer.css` proveen SVG interactivo, selector de componente/conexión, Builder accesible, controles de timeline, Security Inspector y una vista responsive sin dependencias externas.
- `content/runbook-chapters.js` define el capítulo 13 con cinco actividades locales de completitud. `assets/portal.js` resuelve sus rutas internas sin permitir que la carga tardía de otros laboratorios reemplace el capítulo activo.
- `docs/OCI_ARCHITECTURE_EXPLORER.md` conserva fuentes oficiales y límites: Select AI, servicios Generative AI, IAM, red y seguridad dependen de producto, versión, región, proveedor, políticas y configuración.

## Arquitectura de referencia para módulos futuros

```text
content/ ── dataset, narrativa, SQL y casos de uso
    │
simulation/ ── modelo puro + eventos deterministas
    │                 │
    ├── Developer View│ Execution Plan View │ Internals View
    │                 │
renderer/ ── SVG/Canvas accesible, animación y leyendas
    │
ui/ ── navegación RunBook, controles, modo Developer/DBA e interacción
```

El contrato mínimo de evento es:

```js
{ step, type, source, target, rowIds, blockIds, label, illustrativeMetrics }
```

Los tipos iniciales previstos incluyen `READ_BLOCK`, `CACHE_HIT`, `CACHE_MISS`, `TABLE_ACCESS`, `HASH_BUILD`, `HASH_PROBE`, `EMIT_ROW` y `SPILL_TEMP`. Son conceptos de aprendizaje, no un trace literal de Oracle.

## Alcance funcional

### Motor de simulaciones

El diseño debe poder modelar SQL Execution Engine, operadores y planes, SGA/Database Buffer Cache, Shared Pool, PGA/workareas, datafiles/bloques, flujo conceptual de filas, accesos lógicos y físicos, uso de TEMP y métricas educativas. Los modos Developer y DBA cambian el énfasis de la explicación, no el resultado del modelo.

Sprint 8 incorpora una capa de rendimiento local e incremental. Buffer Cache & I/O separa solicitud lógica, hit/miss conceptual, entrega de filas y lectura física conceptual ilustrativa; PGA/Work Areas/TEMP modela clasificaciones educativas de trabajo; Optimizer & Cardinality aplica reglas visibles sobre filas base, selectividad declarada, estado de estadísticas, disponibilidad de índice y distribución; y Execution Plan Diagnostics recorre evidencia ya importada por `DBMS_XPLAN`. Este último usa eventos diagnósticos inmutables por operador, preserva métricas ausentes y distingue evidencia, cálculo derivado, interpretación, hipótesis y límites; no transforma el recorrido en una traza Oracle. Los cinco laboratorios reutilizan el contrato de eventos, el Event Inspector y Animated Data Flow; no modifican simuladores anteriores ni añaden Oracle Database, backend, LLM, credenciales o llamadas externas.

Performance What-If compone snapshots A/B de esos tres motores de rendimiento sin fusionar sus métricas como si tuvieran el mismo alcance. Cada track conserva sus parámetros y timeline inmutables; los resúmenes derivados explicitan su procedencia. La comparabilidad exige población e identidad lógica declaradas: cardinalidades iguales no bastan y Data Warehouse marca volumen o población distinta como no comparable. El orden del track es un recorrido explicativo de modelos locales, no ejecución física, temporal ni predicción del optimizador.

Sprint 8.7 integra esos cinco laboratorios dentro del capítulo 15 **Database Internals & Performance**. `assets/portal.js` centraliza las rutas de rendimiento, conserva los IDs de preview para compatibilidad y espera el evento idempotente `academy:performance-ready` antes de resolver un enlace que dependa de carga diferida. El capítulo registra visitas y cinco actividades educativas en la clave local de progreso existente; una visita aislada no completa el módulo. Presentation Mode reutiliza el gestor común y las acciones del timeline de Buffer Cache, PGA/TEMP, Optimizer y What-If; Diagnostics continúa delegado en AI SQL Intelligence. Esta capa no crea motores, tipos de evento, timers paralelos, backend ni conexiones externas.

El laboratorio PGA, Work Areas & TEMP aplica una fórmula local visible sobre filas, unidades de fila, operación y distribución. Su motor emite asignación, procesamiento, escritura/lectura temporal y finalización para clasificar escenarios como Optimal, One-Pass o Multi-Pass educativos. Esta clasificación no reproduce la administración de PGA, los criterios de workarea, el uso de TEMP ni las métricas de Oracle; `SPILL_TEMP` del simulador HASH JOIN histórico permanece con su semántica original. Está integrado como actividad del capítulo 15 y conserva un único timeline, Event Inspector, SQL relacionado, tutor de reglas, Animated Data Flow, rutas, progreso y Presentation Mode.

### Contrato educativo

Cada módulo responderá: ¿qué es?, ¿cómo funciona?, ¿para qué sirve?, ¿cómo procesa Oracle internamente la operación? y ¿cuáles son sus implicaciones de rendimiento? Incluirá tres casos de uso con entrada, SQL Oracle y salida esperada; infografías accesibles; timeline con Play/Pause/Step/Reset/velocidad; chequeo de comprensión; y advertencias DBA.

### IA futura

La arquitectura reserva componentes para AI Tutor contextual, SQL Analyzer, Execution Plan Explainer, AI What If?, AI Vector Search, Select AI, Hybrid Vector Search y RAG con Oracle Database. Mientras se ejecuten en el navegador, sus respuestas son reglas, corpus o cálculos locales y deben declararse así. No hay credenciales ni llamadas directas a bases de datos desde el cliente.

### Límites de SQL Intelligence Lab

- No ejecuta SQL Oracle ni se conecta a Oracle Database.
- No reproduce el optimizador, no calcula costos reales y no predice planes reales.
- Los planes sintéticos se declaran ilustrativos y no se presentan como ejecuciones observadas.
- No sustituye `DBMS_XPLAN`, SQL Monitor, AWR, ASH ni el diagnóstico de producción autorizado.
- El parser cubre tablas con `Id` y `Operation`; formatos gráficos, secciones propietarias y asociaciones ambiguas se conservan como advertencias o texto no interpretado.

## Experiencia visual

La información adopta navegación documental inspirada en OCI PoC RunBook: índice claro, recorrido secuencial, secciones y puntos de retorno. La presentación adopta tarjetas, indicadores, diagramas y microinteracciones de un dashboard OCI, con tema oscuro, contraste alto y diseño responsive. Las ilustraciones narrativas usan una identidad tecnológica azul eléctrico/cian, con profundidad 3D, perspectiva isométrica, circuitos y flujos de información específicos por módulo. No se copian contenidos, activos ni código de las referencias.

### Visual Design System 2.0

- `assets/oci-runbook-design-system.css` centraliza los tokens observados del OCI PoC RunBook para fondos, superficies, texto, bordes, estados y foco en claro y oscuro.
- El selector `Claro | Oscuro | Sistema` vive en `assets/portal.js`. `Sistema` sigue `prefers-color-scheme`; la selección explícita se guarda en `oracle-sql-academy.theme.v2` y migra valores antiguos de `theme.v1` sin eliminarlos.
- Los tokens SQL, planes, flujos y nodos seleccionados mantienen semántica independiente del acento Redwood. Las ilustraciones 3D azul/cian son presentación y no sustituyen SVG, Event Inspector ni simulaciones.
- Las imágenes son locales, 1280×720, lazy-loaded, con dimensiones explícitas, alt text y procedencia documentada en `docs/VISUAL_ASSETS.md`.
- La implementación no reinicia motores ni progreso al cambiar tema; sigue siendo estática y compatible con GitHub Pages.

### Visual Design System 2.1 — Animated Data Flow

**Estado:** implementado y validado en `feature/animated-3d-data-flow`; preparado para publicación mediante Pull Request hacia `main`.

- `renderer/animated-data-flow-renderer.js` implementa una capa reutilizable que recibe los eventos de los motores existentes, resuelve anclajes normalizados y dibuja una superposición SVG sobre la ilustración 3D.
- HASH JOIN, Comparison Lab, AI SQL Intelligence, AI Internals y Architecture Explorer montan la misma capa; no calculan una segunda secuencia ni reemplazan sus timelines.
- Las rutas solo se dibujan cuando el origen y destino tienen un anclaje semántico definido. Las coordenadas están normalizadas a `0..100` con `preserveAspectRatio="xMidYMid slice"`, por lo que el overlay escala con la imagen.
- Los botones de componentes conceptuales son la alternativa textual y accesible. Seleccionan el primer evento relacionado y actualizan el timeline, la explicación y el Event Inspector del laboratorio anfitrión.
- Las partículas y pulsos representan flujo lógico; no representan paquetes, bloques físicos, PGA permanente, tráfico OCI ni telemetría real. `SPILL_TEMP` solo se dibuja cuando aparece en el timeline del motor.
- `prefers-reduced-motion` conserva la ruta y el estado del evento, pero elimina el desplazamiento continuo y las animaciones CSS. No se reproduce ningún timeline automáticamente.

## Sprint 7 — Interactive Learning & Presentation Experience

`ui/presentation-mode.js` registra los cinco laboratorios compatibles y crea una capa ampliada que delega controles, selección, velocidad y estado en sus motores existentes. No inicia autoplay, no duplica el timeline y permite salir con Escape devolviendo el foco. `docs/PRESENTATION_MODE.md` documenta el contrato y sus límites.

`content/architecture-challenges.js`, `simulation/architecture-challenge-evaluator.js`, `renderer/challenge-feedback-renderer.js` y `ui/architecture-challenges.js` incorporan tres desafíos educativos. El Builder opera sobre clones locales, el evaluador produce hallazgos deterministas y el dashboard guarda únicamente progreso/puntuaciones sintéticas. `docs/ARCHITECTURE_CHALLENGES.md` documenta la ponderación 25/20/20/25/10 y la diferencia entre evaluación didáctica y validación real.

## Seguridad y exactitud

- No confundir `EXPLAIN PLAN` con la ejecución real. Explicar estimaciones frente a `DBMS_XPLAN.DISPLAY_CURSOR` y estadísticas reales.
- No representar el flujo de filas como un movimiento físico literal entre componentes de memoria.
- No afirmar que full scan, HASH JOIN, NESTED LOOPS o MERGE JOIN sean intrínsecamente buenos o malos.
- No enviar SQL arbitrario ni datos sensibles desde el frontend a una base de datos.

## Skills, Obsidian y gobernanza

La Skill de proyecto está en `skills/oracle-sql-academy-builder` y se expone para Codex a través de `.agents/skills/oracle-sql-academy-builder`. Skills auxiliares se usan solo tras confirmar que están disponibles. Anatomy se evalúa en `docs/ANATOMY_EVALUATION.md`; aún no es dependencia del producto.

La fuente de verdad de la documentación es este repositorio en `/Users/pedrotor/Documents/CODEX/oracle-sql-engine-academy`. Como usa Markdown estándar, es indexable desde el vault global `/Users/pedrotor/Documents/VAULT` sin copiar ni mover el proyecto.
