# Project Context — Oracle SQL & AI Database Engine Academy

**Estado:** Sprint 1 — portal educativo interactivo completado en `feature/interactive-learning-portal`; pendiente únicamente de revisión/merge hacia `main`.
**Runtime objetivo:** GitHub Pages, totalmente estático y sin secretos.
**Audiencia:** desarrolladores Oracle SQL, DBAs, arquitectos y estudiantes técnicos.

## Propósito

La academia explica Oracle SQL intermedio-avanzado, optimización y funcionamiento interno de Oracle AI Database mediante módulos visuales, reproducibles y técnicamente prudentes. Debe servir tanto al desarrollador que busca entender los resultados y el SQL como al DBA que analiza operadores, memoria, I/O, cardinalidad y plan.

La implementación actual conserva la demo de JOINs, el recorrido conceptual del motor y los laboratorios locales de AI. Sprint 1 añadió un dashboard de aprendizaje, navegación RunBook, progreso local y un workspace sincronizado, sin sustituir los laboratorios ni introducir un nuevo motor de JOIN.

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
| Dependencias | Preferir navegador nativo. Toda dependencia externa requiere revisión técnica, licencia y versión fijada. |

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
