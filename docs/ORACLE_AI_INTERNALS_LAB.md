# Oracle AI Database Internals Lab

## Alcance

Sprint 5 es una academia estática. Sus vectores, rankings, respuestas y flujos son sintéticos, reproducibles y locales. La interfaz no ejecuta SQL, no almacena credenciales, no usa APIs ni transmite contenido a Oracle, un proveedor de IA o una herramienta externa.

## Contrato de simulación

Todos los motores devuelven eventos ordenados con `step`, tipo, origen, destino, filas lógicas, métricas ilustrativas, explicación, ubicación de ejecución y representación. Las ubicaciones son etiquetas pedagógicas:

- `DATABASE_SIMULATED`: operación que representa una capacidad de base de datos, no una observación.
- `APPLICATION_SIMULATED`: preparación, política o UI local.
- `EXTERNAL_AI_SIMULATED`: paso que normalmente requeriría un proveedor/modelo, deliberadamente no invocado.
- `EDUCATIONAL_ABSTRACTION`: comparación o regla creada para enseñar un concepto sin atribuirla a Oracle.

## Laboratorios y límites

| Laboratorio | Modelo | Límite explícito |
| --- | --- | --- |
| AI Vector Search | Distancias coseno, euclidiana y producto punto; Top-K exacto o reducción fija de candidatos | No implementa HNSW, IVF, `DBMS_VECTOR`, memoria vectorial ni rendimiento real. |
| Hybrid Vector Search | Ruta textual + vectorial y fusión local normalizada | La fórmula de fusión no se atribuye a Oracle. |
| Select AI | Pregunta, contexto de esquema, SQL y resultado predefinidos | No llama `DBMS_CLOUD_AI`, proveedor, AI Profile ni ejecuta SQL. |
| RAG | Documentos, chunks, permisos, contexto y respuesta predefinida | No genera embeddings ni respuestas abiertas; excluye documentos restringidos antes del contexto. |
| Agentic Workflows | Selección, autorización y resultado sintético de herramienta | No usa `DBMS_CLOUD_AI_AGENT`, MCP, herramientas ni acciones autónomas. |

Cada laboratorio dispone de tres escenarios: Retail, Finanzas y Operaciones. Los datasets no contienen datos de clientes, secretos ni información de producción.

## Referencias oficiales verificadas

- [VECTOR data type](https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/create-tables-using-vector-data-type.html) — definición, dimensiones, formatos y restricciones.
- [Vector index guidelines](https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/guidelines-using-vector-indexes.html) — condiciones de métrica, HNSW, IVF, precisión y optimizador.
- [Vector Search PL/SQL packages](https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/vector-search-pl-sql-packages-node.html) — `DBMS_VECTOR`, `DBMS_VECTOR_CHAIN` y `DBMS_HYBRID_VECTOR`.
- [DBMS_HYBRID_VECTOR](https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/dbms_hybrid_vector-vecse.html) — `SEARCH`, `GET_SQL` y `SEARCHPIPELINE`.
- [Select AI prerequisites](https://docs.oracle.com/en/database/oracle/oracle-database/26/selai/manage-ai-profiles.html) — perfiles, privilegios, credenciales y ACL.
- [DBMS_CLOUD_AI_AGENT](https://docs.oracle.com/en/cloud/paas/autonomous-database/dedicated/adbaa/dbmscloudaiagent-package.html) — disponibilidad y administración de agentes/tareas/herramientas.

La sintaxis de `sql/oracle-ai-internals-examples.sql` es material de estudio para Oracle AI Database 26ai. Antes de ejecutarla se deben verificar release update, privilegios, tipos de vector, índice, métrica, proveedor, credenciales, AI Profile y requisitos de red en la documentación y en el entorno autorizado.

## Seguridad

- No se incluyen API keys, tokens ni credenciales.
- Los controles de What If y Tutor usan reglas locales y resultados predefinidos.
- Los datos de UI se generan desde datasets versionados; no se interpreta contenido importado como HTML.
- Un escenario RAG restringido no se segmenta ni aparece en contexto; una operación agéntica no autorizada no se invoca.
