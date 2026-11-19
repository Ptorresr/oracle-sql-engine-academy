(() => {
  "use strict";

  const freeze = (value) => Object.freeze(value);
  const criterion = (id, label, kind, details = {}) => freeze({ id, label, kind, ...details });

  const challenges = [
    {
      id: "retail-vector-recommendations",
      order: 1,
      title: "Retail · recomendaciones con AI Vector Search",
      industry: "Retail",
      level: "Intermedio",
      objective: "Diseñar una ruta de consulta que recupere productos relacionados y mantenga separadas aplicación, API y base de datos.",
      context: "Una tienda quiere mostrar recomendaciones semánticas sin convertir AI Vector Search en un servicio independiente.",
      requirements: [
        criterion("retail-client", "Aplicación cliente", "component", { componentIds: ["web-app", "mobile-app"] }),
        criterion("retail-api", "API de consulta", "component", { componentIds: ["api"] }),
        criterion("retail-database", "Oracle AI Database", "component", { componentIds: ["ai-database", "autonomous-ai-database"] }),
        criterion("retail-vector", "Capacidad de recuperación vectorial", "component", { componentIds: ["vector-search", "vector-index"] }),
        criterion("retail-embedding", "Generación de embeddings representada", "component", { componentIds: ["embeddings"] }),
        criterion("retail-access", "Control de acceso representado", "security", { componentIds: ["auth", "iam"] }),
        criterion("retail-functional", "Consulta de recomendación coherente", "functional", { relationships: ["API_CALL", "DATABASE_QUERY", "DATABASE_CAPABILITY"] }),
        criterion("retail-flow", "La consulta pasa por API hacia la base de datos", "flow", { from: ["api", "web-app"], to: ["ai-database", "autonomous-ai-database"] })
      ],
      restrictions: ["AI Vector Search es una capacidad de la base de datos, no un servicio OCI separado.", "La conexión no prueba autorización por sí sola.", "El evaluador no valida latencia ni disponibilidad reales."],
      availableComponents: ["web-app", "mobile-app", "api", "auth", "ai-database", "autonomous-ai-database", "vector-search", "vector-index", "embeddings", "iam", "logging", "audit"],
      scoring: { functional: 25, components: 20, flow: 20, security: 25, decisions: 10 },
      relatedLab: "#ai-vector-search"
    },
    {
      id: "finance-secure-rag",
      order: 2,
      title: "Finanzas · RAG con documentos protegidos",
      industry: "Finanzas",
      level: "Avanzado",
      objective: "Construir una arquitectura RAG que filtre permisos antes de formar el contexto y registre las decisiones.",
      context: "Un asistente financiero debe responder preguntas sobre documentos sintéticos sin filtrar información restringida al modelo.",
      requirements: [
        criterion("finance-app", "Aplicación autenticada", "component", { componentIds: ["web-app"] }),
        criterion("finance-storage", "Almacenamiento documental", "component", { componentIds: ["object-storage", "documents"] }),
        criterion("finance-rag", "Orquestación RAG", "component", { componentIds: ["rag-orchestrator", "orchestrator"] }),
        criterion("finance-embedding", "Embeddings", "component", { componentIds: ["embeddings"] }),
        criterion("finance-database", "Oracle AI Database", "component", { componentIds: ["ai-database", "autonomous-ai-database"] }),
        criterion("finance-permissions", "Filtrado por permisos", "security", { componentIds: ["auth", "iam"] }),
        criterion("finance-model", "Servicio LLM representado", "component", { componentIds: ["genai"] }),
        criterion("finance-audit", "Auditoría", "component", { componentIds: ["audit", "logging"] }),
        criterion("finance-functional", "La pregunta puede recorrer el flujo RAG", "functional", { relationships: ["DOCUMENT_INGESTION", "DATABASE_QUERY", "MODEL_REQUEST"] }),
        criterion("finance-flow", "El orquestador conecta recuperación y modelo", "flow", { from: ["rag-orchestrator", "orchestrator"], to: ["ai-database", "autonomous-ai-database", "genai"] }),
        criterion("finance-context", "El flujo entrega contexto autorizado al modelo", "security", { dataTypes: ["AUTHORIZED_CONTEXT"] })
      ],
      restrictions: ["El filtro de permisos debe ocurrir antes de construir el contexto.", "Vault protege secretos; no convierte una aplicación en autorizada.", "La respuesta es simulada y no usa un LLM real."],
      availableComponents: ["web-app", "auth", "object-storage", "rag-orchestrator", "embeddings", "ai-database", "autonomous-ai-database", "iam", "vault", "genai", "audit", "logging"],
      scoring: { functional: 25, components: 20, flow: 20, security: 25, decisions: 10 },
      relatedLab: "#rag-architecture"
    },
    {
      id: "operations-authorized-agent",
      order: 3,
      title: "Operaciones · agente con herramientas autorizadas",
      industry: "Operaciones",
      level: "Avanzado",
      objective: "Representar un agente que selecciona herramientas, valida permisos y registra operaciones denegadas.",
      context: "Un portal de operaciones recibe una solicitud de incidente; las acciones sensibles deben poder rechazarse.",
      requirements: [
        criterion("operations-app", "Aplicación", "component", { componentIds: ["web-app"] }),
        criterion("operations-agent", "Agente", "component", { componentIds: ["agent"] }),
        criterion("operations-tools", "Herramientas", "component", { componentIds: ["tool"] }),
        criterion("operations-database", "Oracle Database", "component", { componentIds: ["ai-database", "autonomous-ai-database"] }),
        criterion("operations-iam", "Validación de permisos", "component", { componentIds: ["iam", "auth"] }),
        criterion("operations-audit", "Registro conceptual", "component", { componentIds: ["audit", "logging"] }),
        criterion("operations-denied", "Operación sensible denegada", "security", { edgeSecurityContext: "DENIED" }),
        criterion("operations-functional", "La solicitud operacional tiene una ruta de herramientas", "functional", { relationships: ["AGENT_REQUEST", "TOOL_CALL", "DATABASE_QUERY"] }),
        criterion("operations-tool-flow", "El agente llama a la herramienta antes de consultar la base", "flow", { relationships: ["TOOL_CALL", "DATABASE_QUERY"] })
      ],
      restrictions: ["Una conexión entre nodos no equivale a autorización.", "La acción sensible debe conservar un estado DENIED o equivalente.", "El agente no ejecuta herramientas reales."],
      availableComponents: ["web-app", "agent", "tool", "ai-database", "iam", "vcn", "audit", "monitoring", "auth"],
      scoring: { functional: 25, components: 20, flow: 20, security: 25, decisions: 10 },
      relatedLab: "#agentic-workflows"
    }
  ].map((challenge) => freeze({ ...challenge, requirements: freeze(challenge.requirements), restrictions: freeze(challenge.restrictions), availableComponents: freeze(challenge.availableComponents), scoring: freeze(challenge.scoring) }));

  globalThis.oracleArchitectureChallenges = freeze(challenges);
})();
