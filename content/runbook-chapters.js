(() => {
  "use strict";

  const chapters = Object.freeze([
    { id: "que", order: 1, label: "¿Qué es?", title: "¿Qué es?", route: "#que" },
    { id: "como", order: 2, label: "¿Cómo funciona?", title: "¿Cómo funciona?", route: "#como" },
    { id: "simulador", order: 3, label: "Simulador", title: "Simulador de JOINs", route: "#simulador" },
    { id: "hashjoin", order: 4, label: "HASH JOIN Engine", title: "HASH JOIN Engine", route: "#hashjoin" },
    { id: "comparison", order: 5, label: "Comparar operadores", title: "Comparar operadores", route: "#comparison" },
    { id: "casos", order: 6, label: "Casos reales", title: "Casos reales", route: "#casos" },
    { id: "dba", order: 7, label: "Para DBAs", title: "Para DBAs", route: "#dba" },
    { id: "internals", order: 8, label: "Motor interno", title: "Motor interno", route: "#internals" },
    { id: "intelligence", order: 9, label: "AI SQL Intelligence", title: "AI SQL Intelligence", route: "#intelligence", completionActivities: Object.freeze(["plan-imported", "operator-inspected"]) },
    { id: "ai", order: 10, label: "AI Learning Lab", title: "AI Learning Lab", route: "#ai" },
    { id: "reto", order: 11, label: "Comprueba", title: "Comprueba tu comprensión", route: "#reto" },
    { id: "ai-internals", order: 12, label: "Oracle AI Database Internals", title: "Oracle AI Database Internals", route: "#ai-internals" },
    { id: "architecture-explorer", order: 13, label: "AI Architecture Explorer", title: "Oracle AI Database Architecture Explorer", route: "#architecture-explorer", completionActivities: Object.freeze(["architecture-explored", "component-selected", "flow-ran", "security-reviewed", "alternative-compared"]) },
    { id: "architecture-challenges", order: 14, label: "Architecture Challenges", title: "Architecture Challenges", route: "#architecture-challenges", completionActivities: Object.freeze(["challenge-started", "challenge-evaluated"]) }
  ].map((chapter) => Object.freeze(chapter)));

  const getChapter = (id) => chapters.find((chapter) => chapter.id === id) || null;
  const getIndex = (id) => chapters.findIndex((chapter) => chapter.id === id);
  const previous = (id) => chapters[getIndex(id) - 1] || null;
  const next = (id) => chapters[getIndex(id) + 1] || null;

  globalThis.oracleAcademyRunbook = Object.freeze({ chapters, getChapter, getIndex, previous, next });
})();
