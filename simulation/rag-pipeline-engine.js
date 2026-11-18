(() => {
  "use strict";
  const EVENT_TYPES = Object.freeze(["DOCUMENT_LOADED", "CHUNK_CREATED", "EMBEDDING_GENERATED", "VECTOR_STORED", "CONTEXT_RETRIEVED", "LLM_RESPONSE_PREDEFINED"]);
  const chunk = (text, size, overlap) => {
    const words = String(text).split(/\s+/).filter(Boolean);
    const chunks = [];
    const stride = Math.max(1, size - overlap);
    for (let start = 0; start < words.length; start += stride) chunks.push(words.slice(start, start + size).join(" "));
    return chunks.filter(Boolean);
  };
  const run = (scenario, options = {}) => {
    const chunkSize = Math.max(3, Math.min(24, Number(options.chunkSize) || 8));
    const overlap = Math.max(0, Math.min(chunkSize - 1, Number(options.overlap) || 1));
    const topK = Math.max(1, Number(options.topK) || 2);
    const permitted = scenario.documents.filter((document) => document.roles.includes(scenario.userRole));
    const chunks = permitted.flatMap((document) => chunk(document.text, chunkSize, overlap).map((text, index) => ({ id: `${document.id}-${index + 1}`, documentId: document.id, title: document.title, text })));
    const selected = chunks.slice(0, topK);
    let step = 0;
    const make = (type, source, target, label, rowIds, executionLocation, dba) => Object.freeze({ step: ++step, type, source, target, rowIds: Object.freeze(rowIds), blockIds: Object.freeze([]), label, illustrativeMetrics: Object.freeze({ chunkSize, overlap, topK, illustrative: true }), explanation: Object.freeze({ what: label, where: executionLocation, why: "Representa un paso de RAG educativo.", dba }), executionLocation, representation: "rag-pipeline" });
    const events = [];
    scenario.documents.forEach((document) => events.push(make("DOCUMENT_LOADED", "Fuente sintética", "Preparación", document.roles.includes(scenario.userRole) ? `${document.title} es accesible.` : `${document.title} queda excluido por permisos.`, [document.id], "APPLICATION_SIMULATED", "El filtro de permiso ocurre antes de recuperar contexto; ningún texto restringido pasa al resultado.")));
    chunks.forEach((item) => events.push(make("CHUNK_CREATED", item.documentId, "Chunks", `Se crea ${item.id}.`, [item.id], "APPLICATION_SIMULATED", "La segmentación es local y conceptual; no usa DBMS_VECTOR_CHAIN.")));
    events.push(make("EMBEDDING_GENERATED", "Chunks permitidos", "Embeddings conceptuales", "Se representa generación de embeddings sin proveedor real.", chunks.map((item) => item.id), "EXTERNAL_AI_SIMULATED", "Las llamadas, credenciales, modelos y red no existen en GitHub Pages."));
    events.push(make("VECTOR_STORED", "Embeddings conceptuales", "Almacenamiento vectorial", "Se representa almacenamiento lógico de chunks permitidos.", chunks.map((item) => item.id), "DATABASE_SIMULATED", "No se afirma estructura física, índice ni métrica de Oracle."));
    events.push(make("CONTEXT_RETRIEVED", "Consulta y permisos", "Contexto", `Se recuperan ${selected.length} chunk(s) permitidos.`, selected.map((item) => item.id), "DATABASE_SIMULATED", "Los resultados se limitan a contenido autorizado del dataset."));
    events.push(make("LLM_RESPONSE_PREDEFINED", "Contexto permitido", "Respuesta educativa", scenario.response, selected.map((item) => item.id), "EXTERNAL_AI_SIMULATED", "La respuesta es predefinida; no se genera texto abierto ni se invoca un LLM."));
    return Object.freeze({ scenarioId: scenario.id, chunks: Object.freeze(chunks), selected: Object.freeze(selected), events: Object.freeze(events) });
  };
  globalThis.OracleRagPipelineEngine = Object.freeze({ EVENT_TYPES, chunk, run });
})();
