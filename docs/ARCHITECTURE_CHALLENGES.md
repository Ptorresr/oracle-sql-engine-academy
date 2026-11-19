# Architecture Challenges

## Modelo

`content/architecture-challenges.js` define tres desafíos: Retail con AI Vector Search, Finanzas con RAG seguro y Operaciones con un agente y herramientas autorizadas. Cada desafío declara objetivo, contexto, requisitos, restricciones, componentes disponibles, dificultad y laboratorio relacionado.

`ui/architecture-challenges.js` usa el mismo `OracleArchitectureGraphEngine` y el renderer SVG del Architecture Explorer. El estudiante puede añadir/eliminar componentes y conexiones, seleccionar elementos con teclado, cargar una referencia educativa y reiniciar sin modificar los datos originales.

## Evaluación

`simulation/architecture-challenge-evaluator.js` es una función determinista. Evalúa componentes, conexiones, tipos de flujo, contexto autorizado, estados de denegación y controles de seguridad. Los requisitos funcionales y de seguridad se evalúan por separado: la ausencia de un control no borra un flujo representado ni recibe una segunda penalización por el mismo defecto. La ponderación educativa es:

| Área | Puntos |
| --- | ---: |
| Requisitos funcionales | 25 |
| Componentes | 20 |
| Conexiones y flujo | 20 |
| Seguridad | 25 |
| Decisiones arquitectónicas | 10 |

Cada hallazgo incluye identificador, estado, evidencia, explicación, recomendación, severidad y componentes/conexiones afectados. Seleccionarlo resalta el elemento correspondiente sin mutar el diseño. En Finanzas, el flujo funcional se mantiene separado de la evidencia `AUTHORIZED_CONTEXT`; en Operaciones, una operación sensible sin `DENIED` produce un hallazgo de severidad `error`.

Una solución alternativa puede satisfacer los requisitos sin copiar una arquitectura de referencia. La puntuación no es una certificación Oracle, validación IAM, revisión de seguridad, estimación de costos ni prueba de producción.

La ruta directa `#architecture-challenges` se reancla después de la carga diferida del módulo para no quedar oculta bajo la barra sticky. Chrome/CDP validó Finanzas con `100/100` inicial y `88/100` al retirar los controles `auth` e `iam`; el feedback muestra el criterio de filtrado por permisos como pendiente.

## Persistencia y seguridad

El dashboard guarda únicamente progreso y puntuaciones sintéticas en `localStorage`. No se envían resultados, credenciales, documentos ni datos sensibles a servicios externos. El flujo RAG sin `AUTHORIZED_CONTEXT` y una herramienta Agentic sin `DENIED` generan advertencias educativas de severidad alta.
