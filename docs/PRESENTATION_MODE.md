# Presentation Mode

## Alcance

Presentation Mode consume el estado del timeline existente. No crea un motor, una línea de tiempo ni resultados alternativos. Está disponible para HASH JOIN, SQL Execution Comparison, AI SQL Intelligence, Oracle AI Database Internals y Architecture Explorer.

## Contrato

Cada laboratorio registra `{ id, root, kind, title, image, getState, actions }` en `OraclePresentationMode`. `getState()` devuelve los eventos existentes, el índice activo, velocidad, reproducción y componente seleccionado. Las acciones delegan en los botones del laboratorio.

La ilustración SVG animada se monta sobre una imagen local únicamente como capa narrativa. El evento, el Event Inspector y las métricas del laboratorio continúan siendo la fuente educativa.

## Interacción

- Play/Pause/Previous/Next/Reset delegan en el laboratorio registrado.
- La velocidad se mantiene en el control del motor.
- Escape cierra la capa y devuelve el foco al botón de entrada.
- Flecha izquierda/derecha y Espacio funcionan fuera de campos de formulario.
- No hay autoplay; `prefers-reduced-motion: reduce` deshabilita reproducción continua y conserva los pasos estáticos.
- No depende de Fullscreen API.
- AI SQL Intelligence recorre localmente el `planTimeline` importado y expone el mismo contrato de Play/Pause/Previous/Next/Reset; no se crea un timeline paralelo.
- Chrome/CDP validó HASH JOIN, SQL Comparison, AI SQL Intelligence, AI Internals y Architecture Explorer con entrada, avance, ilustración, Escape real y sin errores de consola.

## Limitaciones

Las rutas, partículas, métricas y explicaciones son conceptuales. No son una traza de Oracle Database, SQL Monitor, AWR ni una medición de latencia. La auditoría local confirmó Escape, foco de retorno, responsive en 375/768/1440 px y cambio de tema sin reiniciar el estado. No se ejecutó axe porque no está disponible como herramienta instalada.
