# Roadmap — Oracle SQL & AI Database Engine Academy

## Principios de entrega

Cada sprint conserva la experiencia previa, entrega valor visible en GitHub Pages y no presenta métricas educativas como telemetría real. Las historias de simulación se aceptan solo si el modelo determinista, el contenido y las vistas sincronizadas están definidos antes del renderizado.

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

**Estado:** implementación local en `feature/interactive-learning-portal`, pendiente de revisión y publicación autorizada.

**Objetivo:** convertir la demo conservada en una experiencia RunBook navegable y preparar el primer módulo modular sin ampliar el alcance del motor.

**Criterios de aceptación**

- Navegación, breadcrumbs, índice, foco de teclado y diseño móvil siguen el patrón RunBook.
- Tokens de diseño y componentes reutilizables conservan la interfaz oscura actual.
- Un contrato de contenido separa narrativa, datasets, SQL y casos del renderizado.
- El primer módulo cumple las cinco preguntas educativas y documenta los límites técnicos.
- Validación manual en escritorio, móvil, teclado y movimiento reducido.

**Entrega implementada:** catálogo de módulos con estados disponible/futuro, progreso persistente local, breadcrumbs, índice lateral, navegación anterior/siguiente y Simulation Workspace con resúmenes Developer, Execution Plan e Internals. El catálogo y la capa visual se separan en archivos nuevos; el contenido y los simuladores JOIN existentes se conservan.

## Sprint 2 — Motor determinista y HASH JOIN

**Objetivo:** extraer un motor de eventos reutilizable y aplicarlo a HASH JOIN.

**Criterios de aceptación**

- Un modelo puro genera un timeline reproducible de eventos tipados.
- Developer, Execution Plan e Internals se sincronizan al avanzar, pausar, reiniciar y cambiar velocidad.
- Se distinguen cache hit/miss conceptuales, workarea PGA, posible spill a TEMP y resultado lógico.
- Tres casos de uso, SQL Oracle, `NULL`, cardinalidad y leyendas de métricas ilustrativas están validados.

## Sprint 3 — Comparación de operadores y modos

**Objetivo:** incorporar NESTED LOOPS, MERGE JOIN y comparativas de acceso sin reglas absolutas.

**Criterios de aceptación**

- Los tres métodos de JOIN comparten contrato de evento y pueden compararse sobre datasets definidos.
- Los modos Developer y DBA enfocan información distinta sin divergir en el estado.
- Se explican estimaciones, filas reales conceptuales, selectividad, índices, memoria y TEMP con advertencias.
- La accesibilidad y la reproducción determinista se prueban en todos los operadores.

## Sprint 4 — Planes y laboratorios AI locales

**Objetivo:** ampliar el aprendizaje con explicador de planes, SQL Analyzer y AI What If? locales.

**Criterios de aceptación**

- El importador de `DBMS_XPLAN` procesa texto sin ejecutar SQL ni enviar datos.
- Las explicaciones distinguen reglas locales de IA generativa real.
- What If? usa hipótesis explícitas y no afirma predicción de plan.
- Los flujos Vector Search, Select AI y RAG son reproducibles y etiquetados como demo.

## Sprint 5 — Integración visual avanzada y contenido AI Database

**Objetivo:** evaluar la adopción controlada de Anatomy y completar laboratorios de Oracle AI Database.

**Criterios de aceptación**

- Cualquier uso de Anatomy está fijado a una revisión, conserva atribución MIT y supera su revisión de scripts y accesibilidad.
- Las figuras degradan sin WebGL y respetan rendimiento móvil.
- Los módulos Vector Search, Hybrid Vector Search, Select AI y RAG incluyen los tres casos de uso y los límites de la simulación.

## Sprint 6 — Calidad, publicación y evolución

**Objetivo:** automatizar controles de calidad y preparar la evolución segura del sitio.

**Criterios de aceptación**

- CI valida entrada, marcadores de merge, enlaces, estructura y comprobaciones adecuadas al código incorporado.
- Pruebas visuales y de interacción cubren rutas críticas y movimiento reducido.
- Guía de contribución, versionado de contenido y checklist de publicación están completos.
- GitHub Pages publica una versión estática sin secretos ni dependencias de backend para el recorrido base.
