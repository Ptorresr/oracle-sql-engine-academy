# Oracle AI Database Architecture Explorer

## Propósito y alcance

El Explorer del capítulo 13 representa tres arquitecturas educativas: recomendaciones Retail, RAG financiero y asistencia de operaciones con herramientas. Sus modelos viven en `content/`, sus reglas puras en `simulation/`, los SVG y paneles en `renderer/` y los controles locales en `ui/`.

No es una topología desplegada, una plantilla Terraform, una recomendación de arquitectura, una calculadora de costos ni una revisión de seguridad de OCI. Los flujos, hallazgos, complejidad y métricas se etiquetan como ilustrativos y no representan telemetría, políticas o tráfico observados.

## Contratos locales

- `oci-architecture-components.js` distingue recursos a evaluar de capacidades internas. Por ejemplo, **AI Vector Search** es una capacidad de base de datos en el diagrama, no un servicio OCI independiente que se despliega.
- `oci-reference-architectures.js` declara nodos, conexiones, datos conceptuales, contexto de seguridad, preguntas y laboratorio relacionado.
- `architecture-graph-engine.js` valida referencias, relaciones del contrato y componentes desconectados; no valida redes, IAM, cuotas ni configuraciones reales.
- `architecture-flow-engine.js` deriva siempre el mismo timeline desde las conexiones declaradas. Las ubicaciones `DATABASE_SIMULATED`, `APPLICATION_SIMULATED` y `EXTERNAL_AI_SIMULATED` son etiquetas pedagógicas.
- `architecture-security-engine.js` separa hallazgos educativos de la validación del grafo. Una ausencia de hallazgos nunca certifica la seguridad de OCI.
- `architecture-what-if-engine.js` compara alternativas cualitativas. No predice costos, latencia, escalado, selección de modelos ni comportamiento de un optimizador.
- `architecture-deployment-guide.js` clasifica los componentes de referencia y lista prerrequisitos. No genera recursos, políticas, redes, secretos ni configuraciones operables.

## Límites técnicos y seguridad

- La aplicación no se conecta a Oracle AI Database, OCI, proveedores de embeddings, LLMs, MCP, herramientas ni servicios de identidad.
- No incluye credenciales, API keys, secretos, SQL ejecutable, perfiles Select AI ni datos de clientes.
- Select AI depende de perfiles, privilegios, proveedor y configuración; el Explorer solo lo representa como capacidad contextual.
- Los escenarios RAG y Agentic muestran autorización, permisos y denegación de forma conceptual. No sustituyen IAM, políticas, controles de aplicación, guardrails, auditoría ni pruebas de seguridad.
- VCN, endpoints privados, IAM, Vault, Logging, Monitoring y Audit tienen responsabilidades distintas. Ningún elemento del diagrama sustituye a otro.

## Fuentes oficiales consultadas

- [Oracle AI Database Select AI: descripción y requisitos](https://docs.oracle.com/en/database/oracle/oracle-database/26/selai/select-ai-about.html)
- [Oracle AI profiles](https://docs.oracle.com/en/database/oracle/oracle-database/26/selai/manage-ai-profiles.html)
- [OCI Generative AI Agents](https://docs.oracle.com/en-us/iaas/Content/generative-ai/agents.htm)
- [OCI Generative AI tool support](https://docs.oracle.com/en-us/iaas/Content/generative-ai/tool-support.htm)
- [OCI networking security reference](https://docs.oracle.com/en-us/iaas/Content/Security/Reference/networking_security.htm)

Las fuentes orientan la terminología y los límites del contenido. La disponibilidad real cambia por región, servicio, versión, proveedor, políticas y configuración; se debe verificar en la documentación vigente antes de un despliegue.

## Auditoría funcional Sprint 6

| Componente | Comportamiento verificado | Evidencia | Estado |
| --- | --- | --- | --- |
| Architecture Builder | Añade, mueve, conecta, desconecta, elimina y restaura; las conexiones inválidas no entran al grafo. | Prueba Chrome/CDP de nodos, edges, posiciones, eventos y reset; `architecture-graph-engine.test.js`. | Pasó |
| Data Flow Simulator | Usa el modelo actual, excluye conexiones inválidas/eliminadas, produce eventos deterministas y muestra advertencias educativas. | `architecture-flow-engine.test.js`; selección de evento, Previous/Next/Pause/Reset en Chrome. | Pasó |
| Security Inspector | Distingue ausencia de hallazgos de una certificación; detecta autorización ausente, RAG sin contexto autorizado y controles de herramientas. | `architecture-security-engine.test.js`, casos seguro/no autorizado/RAG/agente. | Pasó |
| Architecture What If | Separa hechos del baseline, hipótesis y métrica ilustrativa; no inventa precios ni latencias y no muta el escenario original. | `architecture-what-if-engine.test.js`; comparación de variables en Chrome. | Pasó |
| Deployment Guide | Se recalcula desde los componentes actuales y separa recursos desplegables de capacidades internas. | `architecture-deployment-guide.test.js`; prueba de componente añadido/eliminado. | Pasó |
| Navegación | Capítulo 13, rutas internas, estado activo único, historial y progreso local conservan capítulos anteriores. | Chrome/CDP con `#architecture-explorer`, Finanzas, Back/Forward; `runbook-chapters.test.js`. | Pasó |
| Accesibilidad y responsive | Canvas/nodos/conexiones tienen etiquetas y foco; teclado sustituye drag-and-drop; 375/768/1440 no desbordan el documento; reduced motion desactiva Play. | Chrome headless/CDP y `architecture-renderer.test.js`. | Pasó |

No quedan pruebas funcionales obligatorias sin ejecutar en este entorno. La auditoría no convierte el modelo en una validación OCI real: no comprueba tenancy, IAM, VCN, cuotas, costos, políticas, endpoints ni telemetría.
