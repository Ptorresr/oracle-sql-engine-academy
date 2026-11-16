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

## Anatomy
Referencia: https://github.com/wheresryan22/anatomy
Acción pendiente: revisar código, licencia, dependencias y guía SKILL.md de upstream antes de incorporar assets o lógica. No copiar código de un repositorio no inspeccionado.

## Skills de apoyo (archivos entregados)
- `sql-query-reviewer`: revisión de semántica y cardinalidad.
- `sql-plsql-formatting`: estilo SQL.
- `freesql`: opción para enlaces a FreeSQL; verificar comportamiento en navegador.
- `oracle-sql-from-codex`: ejecución local opcional con SQLcl y conexión autorizada.
- `drawio-oci-arch`: diagramas OCI, no reemplaza visualización de ejecución.
- `senior-developer` y `code-reviewer`: calidad y revisión.

## Seguridad
No enviar SQL arbitrario a una BD desde un frontend público. Nunca exponer credenciales OCI, tokens ni claves de LLM. Cualquier servicio futuro debe usar autenticación, cuotas, límites y validación.
