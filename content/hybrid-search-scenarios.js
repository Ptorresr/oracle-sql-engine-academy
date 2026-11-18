(() => {
  "use strict";
  const scenarios = [
    {
      id: "retail-hybrid", title: "Retail · catálogo con intención y marca", query: "zapatillas running Aero", objective: "Combinar coincidencias textuales y semánticas sin asumir que sus scores nativos son comparables.",
      documents: [
        { id: "hy-retail-1", title: "Running Aero Pro", text: "zapatillas running Aero ligeras para entrenamiento", vectorScore: 0.95 },
        { id: "hy-retail-2", title: "Trail Aero", text: "calzado trail con suela de agarre", vectorScore: 0.82 },
        { id: "hy-retail-3", title: "Calcetines running", text: "accesorios para correr", vectorScore: 0.61 }
      ],
      sql: `SELECT *\nFROM DBMS_HYBRID_VECTOR.SEARCH(\n  JSON('{"search_text":"zapatillas running Aero"}')\n);`,
      note: "DBMS_HYBRID_VECTOR.SEARCH ofrece una API JSON. Este ejemplo es ilustrativo: valida la estructura JSON, el índice híbrido y la versión en la documentación oficial."
    },
    {
      id: "finance-hybrid", title: "Finanzas · políticas y discrepancias", query: "política de pago duplicado", objective: "Priorizar la política exacta y documentos semánticamente próximos.",
      documents: [
        { id: "hy-fin-1", title: "Política de pagos duplicados", text: "política pago duplicado conciliación", vectorScore: 0.9 },
        { id: "hy-fin-2", title: "Procedimiento de reversos", text: "reverso de transacciones bancarias", vectorScore: 0.86 },
        { id: "hy-fin-3", title: "Calendario contable", text: "cierre mensual", vectorScore: 0.28 }
      ],
      sql: `SELECT * FROM TABLE(DBMS_HYBRID_VECTOR.SEARCHPIPELINE(:search_request));`,
      note: "La fusión ponderada de este laboratorio es una estrategia educativa local, no una afirmación sobre el ranking interno de Oracle."
    },
    {
      id: "operations-hybrid", title: "Operaciones · runbooks de incidentes", query: "latencia de red procedimiento", objective: "Combinar términos operativos con intención semántica.",
      documents: [
        { id: "hy-ops-1", title: "Runbook de latencia", text: "latencia red procedimiento diagnóstico", vectorScore: 0.93 },
        { id: "hy-ops-2", title: "Guía DNS", text: "resolución de nombres y red", vectorScore: 0.74 },
        { id: "hy-ops-3", title: "Mantenimiento de discos", text: "almacenamiento preventivo", vectorScore: 0.22 }
      ],
      sql: `SELECT DBMS_HYBRID_VECTOR.GET_SQL(:search_request) FROM dual;`,
      note: "GET_SQL puede ayudar a inspeccionar SQL generado por una solicitud soportada; no ejecuta nada desde GitHub Pages."
    }
  ].map((scenario) => Object.freeze({ ...scenario, questions: Object.freeze(["¿Qué términos coinciden en la ruta textual?", "¿Qué señal representa el score vectorial?", "¿Por qué se normalizan las señales?", "¿Cómo cambia el ranking al variar los pesos?", "¿Qué estrategia de Oracle no puede deducirse de esta fusión?" ]), documents: Object.freeze(scenario.documents.map((document) => Object.freeze(document))) }));
  globalThis.oracleHybridSearchScenarios = Object.freeze(scenarios);
})();
