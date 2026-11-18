(() => { "use strict";
  const component = (id, label, category, zone, details = {}) => Object.freeze({ id, label, category, zone, deployable: details.deployable !== false, description: details.description || label, responsibility: details.responsibility || "Componente educativo", capabilities: Object.freeze(details.capabilities || []), inputs: Object.freeze(details.inputs || []), outputs: Object.freeze(details.outputs || []), security: details.security || "Requiere validación de identidad, red y autorización.", requirements: Object.freeze(details.requirements || []), related: Object.freeze(details.related || []), limitations: details.limitations || "Representación conceptual; revisar la documentación y configuración reales." });
  const components = [
    component("user", "Usuario", "APPLICATION", "EXTERNAL", { deployable: false, responsibility: "Inicia una solicitud autenticada." }),
    component("web-app", "Aplicación web", "APPLICATION", "APPLICATION", { responsibility: "Presenta la experiencia y llama APIs.", related: ["api", "auth"] }),
    component("mobile-app", "Aplicación móvil", "APPLICATION", "EXTERNAL", { responsibility: "Cliente móvil educativo." }),
    component("api", "API backend", "APPLICATION", "APPLICATION", { responsibility: "Aplica contratos y orquesta solicitudes.", related: ["auth", "ai-database"] }),
    component("auth", "Servicio de autenticación", "APPLICATION", "SECURITY", { responsibility: "Autentica identidad; no sustituye autorización." }),
    component("orchestrator", "Motor de orquestación", "APPLICATION", "APPLICATION", { responsibility: "Coordina pasos conceptuales.", related: ["rag-orchestrator", "agent"] }),
    component("ai-database", "Oracle AI Database", "DATABASE", "PRIVATE_DATA", { responsibility: "Procesa SQL y almacena datos/vectoriales.", capabilities: ["SQL", "AI Vector Search", "Select AI según versión/configuración"], security: "Usar identidad, privilegios, red y controles de datos; una subnet privada por sí sola no basta." }),
    component("autonomous-ai-database", "Autonomous AI Database", "DATABASE", "PRIVATE_DATA", { responsibility: "Servicio administrado de base de datos con capacidades AI según servicio/configuración.", related: ["select-ai", "vector-search"] }),
    component("vector-search", "AI Vector Search", "DATABASE_CAPABILITY", "PRIVATE_DATA", { deployable: false, responsibility: "Capacidad de consulta vectorial, no servicio separado.", related: ["ai-database", "vector-index"] }),
    component("vector-index", "Vector Index", "DATABASE_CAPABILITY", "PRIVATE_DATA", { deployable: false, responsibility: "Índice conceptual para recuperación vectorial; parámetros/versiones importan." }),
    component("relational-data", "Datos relacionales", "DATABASE_CAPABILITY", "PRIVATE_DATA", { deployable: false, responsibility: "Tablas y metadatos relacionales." }),
    component("documents", "Documentos y metadatos", "DATABASE_CAPABILITY", "PRIVATE_DATA", { deployable: false, responsibility: "Contenido y metadatos con controles de acceso." }),
    component("select-ai", "Select AI", "DATABASE_CAPABILITY", "PRIVATE_DATA", { deployable: false, responsibility: "Capacidad configurada mediante perfiles, proveedores y privilegios." }),
    component("object-storage", "OCI Object Storage", "STORAGE", "PRIVATE_DATA", { responsibility: "Almacena objetos/documentos; buckets no sustituyen autorización." }),
    component("embeddings", "Servicio de embeddings", "AI", "EXTERNAL_AI", { responsibility: "Representa generación de embeddings; proveedor/configuración dependen del despliegue." }),
    component("genai", "OCI Generative AI", "AI", "EXTERNAL_AI", { responsibility: "Servicio gestionado de IA generativa según región, modelo y política." }),
    component("rag-orchestrator", "RAG Orchestrator", "AI", "APPLICATION", { responsibility: "Coordina preparación y recuperación; no es un recurso OCI obligatorio." }),
    component("agent", "AI Agent", "AI", "APPLICATION", { responsibility: "Selecciona herramientas bajo políticas; no actúa autónomamente en esta simulación." }),
    component("tool", "Tool Calling", "AI", "APPLICATION", { deployable: false, responsibility: "Contrato de herramienta que requiere validación y autorización." }),
    component("iam", "OCI IAM", "SECURITY", "SECURITY", { responsibility: "Gestiona identidades y políticas; no equivale a red." }),
    component("vcn", "VCN", "SECURITY", "NETWORK", { responsibility: "Límite de red virtual; no sustituye IAM." }),
    component("private-endpoint", "Private Endpoint", "SECURITY", "NETWORK", { responsibility: "Conectividad privada según el servicio y configuración." }),
    component("vault", "OCI Vault", "SECURITY", "SECURITY", { responsibility: "Gestiona secretos; no exponerlos en aplicaciones." }),
    component("logging", "OCI Logging", "OBSERVABILITY", "OPERATIONS", { responsibility: "Centraliza logs configurados; la simulación no genera telemetría real." }),
    component("monitoring", "OCI Monitoring", "OBSERVABILITY", "OPERATIONS", { responsibility: "Observabilidad configurada; no métricas reales." }),
    component("audit", "OCI Audit", "OBSERVABILITY", "OPERATIONS", { responsibility: "Registra eventos de control según servicio y política." })
  ];
  globalThis.oracleArchitectureComponents = Object.freeze(components);
})();
