# Project Context — Oracle SQL & AI Database Engine Academy

**Estado:** Sprint 4 — AI SQL Intelligence Lab completado y publicado en `origin/feature/ai-sql-intelligence-lab`; pendiente de revisión mediante Pull Request hacia `main`.
**Runtime objetivo:** GitHub Pages, totalmente estático y sin secretos.
**Audiencia:** desarrolladores Oracle SQL, DBAs, arquitectos y estudiantes técnicos.

## Propósito

La academia explica Oracle SQL intermedio-avanzado, optimización y funcionamiento interno de Oracle AI Database mediante módulos visuales, reproducibles y técnicamente prudentes. Debe servir tanto al desarrollador que busca entender los resultados y el SQL como al DBA que analiza operadores, memoria, I/O, cardinalidad y plan.

La implementación actual conserva la demo de JOINs, el recorrido conceptual del motor y los laboratorios locales de AI. Sprint 1 añadió un dashboard de aprendizaje, navegación RunBook, progreso local y un workspace sincronizado, sin sustituir los laboratorios ni introducir un nuevo motor de JOIN.

Sprint 2 añade un motor puro para un HASH JOIN didáctico. Sus escenarios, eventos, renderizado SVG y controles se mantienen en capas distintas y siguen funcionando sin backend en GitHub Pages.

Sprint 3 compara HASH JOIN, NESTED LOOPS y SORT MERGE JOIN sobre datasets equivalentes. Cada método conserva su timeline determinista, mientras una comprobación canónica confirma que los tres entregan el mismo resultado lógico del INNER JOIN educativo.

Sprint 4 incorpora un laboratorio local que recibe texto no confiable de planes Oracle, lo normaliza y lo presenta como datos importados. El análisis de cardinalidad, hallazgos, SQL Analyzer, What If? y tutor son reglas y cálculos locales; no son telemetría ni IA generativa.

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

La información adopta navegación documental inspirada en OCI PoC RunBook: índice claro, recorrido secuencial, secciones y puntos de retorno. La presentación adopta tarjetas, indicadores, diagramas y microinteracciones de un dashboard OCI, con tema oscuro, contraste alto y diseño responsive. No se copian contenidos, activos ni código de las referencias.

## Seguridad y exactitud

- No confundir `EXPLAIN PLAN` con la ejecución real. Explicar estimaciones frente a `DBMS_XPLAN.DISPLAY_CURSOR` y estadísticas reales.
- No representar el flujo de filas como un movimiento físico literal entre componentes de memoria.
- No afirmar que full scan, HASH JOIN, NESTED LOOPS o MERGE JOIN sean intrínsecamente buenos o malos.
- No enviar SQL arbitrario ni datos sensibles desde el frontend a una base de datos.

## Skills, Obsidian y gobernanza

La Skill de proyecto está en `skills/oracle-sql-academy-builder` y se expone para Codex a través de `.agents/skills/oracle-sql-academy-builder`. Skills auxiliares se usan solo tras confirmar que están disponibles. Anatomy se evalúa en `docs/ANATOMY_EVALUATION.md`; aún no es dependencia del producto.

La fuente de verdad de la documentación es este repositorio en `/Users/pedrotor/Documents/CODEX/oracle-sql-engine-academy`. Como usa Markdown estándar, es indexable desde el vault global `/Users/pedrotor/Documents/VAULT` sin copiar ni mover el proyecto.
