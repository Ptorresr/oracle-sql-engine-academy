(() => {
  "use strict";

  if (!document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = "assets/favicon.svg";
    favicon.type = "image/svg+xml";
    document.head.append(favicon);
  }

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.async = false;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  function startPortal(runbook) {
    const chapters = runbook.chapters;
  const progressKey = "oracle-sql-academy.joins.progress.v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = (id) => document.getElementById(id);
  const progress = readProgress();
  let activeChapter = 0;
  let pendingChapterId = null;
  let chapterObserver = null;

  function readProgress() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(progressKey) || "{}");
      const validIds = (ids) => Array.isArray(ids) ? ids.filter((id) => runbook.getChapter(id)) : [];
      const activities = saved.activities && typeof saved.activities === "object" ? Object.fromEntries(Object.entries(saved.activities).map(([id, values]) => [id, Array.isArray(values) ? [...new Set(values.filter(Boolean))] : []]).filter(([id]) => runbook.getChapter(id))) : {};
      return { visited: validIds(saved.visited), completed: validIds(saved.completed), activities };
    } catch {
      return { visited: [], completed: [], activities: {} };
    }
  }

  function saveProgress() {
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch {
      byId("portalFeedback").textContent = "Tu navegador bloqueó el guardado local; el portal sigue disponible.";
    }
  }

  function updateProgress() {
    const explored = progress.visited.length;
    const completed = progress.completed.length;
    const percent = Math.round((explored / chapters.length) * 100);
    byId("progressPercent").textContent = `${percent}%`;
    byId("progressSummary").textContent = `${explored} de ${chapters.length} capítulos explorados · ${completed} completado(s) en este navegador.`;
    const progressBar = byId("progressBar");
    progressBar.setAttribute("aria-valuenow", String(percent));
    progressBar.firstElementChild.style.width = `${percent}%`;
    document.querySelectorAll(".side a[data-chapter]").forEach((link) => link.toggleAttribute("data-completed", progress.completed.includes(link.dataset.chapter)));
  }

  function markVisited(chapterId) {
    if (!progress.visited.includes(chapterId)) {
      progress.visited.push(chapterId);
      saveProgress();
      updateProgress();
    }
  }

  function recordActivity(chapterId, activity) {
    const chapter = runbook.getChapter(chapterId);
    if (!chapter || !activity) return;
    markVisited(chapterId);
    const activities = progress.activities[chapterId] || [];
    if (!activities.includes(activity)) {
      activities.push(activity);
      progress.activities[chapterId] = activities;
    }
    const requirements = chapter.completionActivities || [];
    if (requirements.length && requirements.every((required) => activities.includes(required)) && !progress.completed.includes(chapterId)) {
      progress.completed.push(chapterId);
      byId("portalFeedback").textContent = `${chapter.title} se registró como completado en este navegador.`;
    }
    saveProgress();
    updateProgress();
  }

  function renderRunbookNavigation() {
    const side = document.querySelector(".side");
    side.querySelectorAll("a[data-chapter]").forEach((link) => link.remove());
    chapters.forEach((chapter) => {
      const link = document.createElement("a");
      link.href = chapter.route;
      link.dataset.chapter = chapter.id;
      link.textContent = `${String(chapter.order).padStart(2, "0")} · ${chapter.label}`;
      side.append(link);
    });
  }

  function renderCatalog() {
    const catalog = byId("moduleCatalog");
    const modules = window.oracleAcademyModules || [];
    modules.forEach((module) => {
      const card = document.createElement(module.target ? "a" : "button");
      card.className = "module-card";
      card.dataset.status = module.status;
      if (module.target) {
        card.href = `#${module.target}`;
      } else {
        card.type = "button";
        card.addEventListener("click", () => {
          byId("portalFeedback").textContent = `${module.title} está planificado. El catálogo no abre un módulo inexistente.`;
        });
      }
      card.innerHTML = `<span class="module-status">${module.track}</span><h2>${module.title}</h2><p>${module.description}</p><span class="module-action">${module.action} ${module.target ? "→" : ""}</span>`;
      catalog.append(card);
    });
  }

  function scrollTo(targetId, historyMode = "push") {
    const target = byId(targetId);
    if (!target) {
      if (runbook.getChapter(targetId)) pendingChapterId = targetId;
      return;
    }
    pendingChapterId = null;
    const chapter = runbook.getChapter(targetId);
    if (chapter && historyMode === "push" && window.location.hash !== chapter.route) window.history.pushState({ chapterId: targetId }, "", chapter.route);
    target.scrollIntoView({ behavior: reduceMotion || historyMode === "none" ? "auto" : "smooth", block: "start" });
    if (chapter) {
      markVisited(targetId);
      setActiveChapter(runbook.getIndex(targetId));
    }
  }

  function setActiveChapter(index) {
    activeChapter = Math.max(0, Math.min(index, chapters.length - 1));
    const chapter = chapters[activeChapter];
    document.querySelectorAll(".side a[data-chapter]").forEach((link) => {
      const active = link.dataset.chapter === chapter.id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    document.documentElement.dataset.activeChapter = chapter.id;
    byId("breadcrumbChapter").textContent = chapter.title;
    byId("chapterPosition").textContent = `Capítulo ${chapter.order} de ${chapters.length}`;
    const previous = byId("previousChapter");
    const next = byId("nextChapter");
    const previousChapter = chapters[activeChapter - 1];
    const nextChapter = chapters[activeChapter + 1];
    previous.href = previousChapter ? `#${previousChapter.id}` : "#dashboard";
    previous.textContent = previousChapter ? `← ${previousChapter.label}` : "← Volver al catálogo";
    next.href = nextChapter ? `#${nextChapter.id}` : `#${chapters.at(-1).id}`;
    next.textContent = nextChapter ? `${nextChapter.label} →` : "Finalizar recorrido ✓";
    document.title = `${chapter.title} · Oracle SQL Academy`;
  }

  function bindChapterNavigation() {
    document.querySelectorAll(".side a[data-chapter], .chapter-nav a").forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href").slice(1);
        if (!byId(targetId)) return;
        event.preventDefault();
        scrollTo(targetId);
      });
    });
    chapterObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;
      const index = chapters.findIndex((chapter) => chapter.id === visible.target.id);
      if (index >= 0) {
        markVisited(visible.target.id);
        setActiveChapter(index);
      }
    }, { threshold: .36, rootMargin: "-15% 0px -55% 0px" });
    chapters.forEach((chapter) => {
      const section = byId(chapter.id);
      if (section) chapterObserver.observe(section);
    });
    const routeFromHash = () => {
      const chapterId = window.location.hash.replace(/^#/, "");
      if (runbook.getChapter(chapterId)) scrollTo(chapterId, "none");
    };
    window.addEventListener("hashchange", routeFromHash);
    window.addEventListener("popstate", routeFromHash);
    window.addEventListener("academy:intelligence-ready", () => {
      const section = byId("intelligence");
      if (section) chapterObserver.observe(section);
      if (pendingChapterId === "intelligence" || window.location.hash === "#intelligence") scrollTo("intelligence", "none");
    });
    const aiInternalsLabIds = new Set(["ai-vector-search", "hybrid-vector-search", "select-ai-flow", "rag-architecture", "agentic-workflows"]);
    const activateAiChapter = (event) => {
      const routeId = window.location.hash.replace(/^#/, "");
      const activateInternals = event?.type === "academy:oracle-ai-active" || aiInternalsLabIds.has(routeId) || pendingChapterId === "ai-internals";
      const chapterId = activateInternals ? "ai-internals" : "ai";
      window.setTimeout(() => {
        const section = document.getElementById(chapterId);
        if (section) {
          chapterObserver.observe(section);
          if (pendingChapterId === chapterId || window.location.hash === `#${chapterId}`) scrollTo(chapterId, "none");
          markVisited(chapterId);
          setActiveChapter(runbook.getIndex(chapterId));
        }
      }, 0);
    };
    window.addEventListener("academy:oracle-ai-ready", activateAiChapter);
    window.addEventListener("academy:oracle-ai-active", activateAiChapter);
  }

  function updateWorkspace() {
    const developerLabel = byId("joinSelect").selectedOptions[0].textContent;
    const developerStep = byId("stepText").textContent.match(/Paso (\d)\/4/)?.[1] || "1";
    byId("developerSummary").textContent = `${developerLabel} · Paso ${developerStep} de 4`;
    const planOperator = byId("planSelect").value;
    byId("planSummary").textContent = `Operador seleccionado: ${planOperator}. Revisa estimaciones y ejecución observada por separado.`;
    const internalsStep = byId("engineExplain").textContent.match(/(\d)\/6/)?.[1] || "1";
    byId("internalsSummary").textContent = `Paso ${internalsStep} de 6 · Bloques, SGA, SQL Engine y PGA.`;
  }

  function selectWorkspaceTab(tab, tabs) {
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      byId(candidate.getAttribute("aria-controls")).hidden = !selected;
    });
    const label = tab.textContent;
    byId("workspaceStatus").textContent = `${label} · Estado sincronizado con los controles del laboratorio.`;
    updateWorkspace();
    scrollTo(tab.dataset.workspaceTarget);
  }

  function bindWorkspace() {
    const tabs = [...document.querySelectorAll(".workspace-tabs [role=tab]")];
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectWorkspaceTab(tab, tabs));
      tab.addEventListener("keydown", (event) => {
        const keyToOffset = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1, Home: -index, End: tabs.length - index - 1 };
        if (!(event.key in keyToOffset)) return;
        event.preventDefault();
        const nextIndex = (index + keyToOffset[event.key] + tabs.length) % tabs.length;
        const nextTab = tabs[nextIndex];
        nextTab.focus();
        selectWorkspaceTab(nextTab, tabs);
      });
    });
    ["joinSelect", "nextStep", "resetStep", "autoPlay", "planSelect", "explainPlan", "engineNext", "enginePlay", "engineReset", "engineSpeed"].forEach((id) => {
      byId(id).addEventListener("click", () => window.setTimeout(updateWorkspace, 0));
      byId(id).addEventListener("change", () => window.setTimeout(updateWorkspace, 0));
    });
  }

  function bindProgressReset() {
    byId("resetProgress").addEventListener("click", () => {
      progress.visited.splice(0, progress.visited.length);
      progress.completed.splice(0, progress.completed.length);
      progress.activities = {};
      saveProgress();
      updateProgress();
      byId("portalFeedback").textContent = "Se reinició el progreso local de JOINs en este navegador.";
    });
  }

  renderCatalog();
  renderRunbookNavigation();
  updateProgress();
  setActiveChapter(activeChapter);
  bindChapterNavigation();
  bindWorkspace();
  bindProgressReset();
  updateWorkspace();
  const initialChapterId = window.location.hash.replace(/^#/, "");
  if (runbook.getChapter(initialChapterId)) scrollTo(initialChapterId, "none");
  window.addEventListener("academy:intelligence-activity", (event) => recordActivity("intelligence", event.detail?.activity));

  function loadSqlIntelligenceLab() {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "assets/sql-intelligence.css";
    document.head.append(stylesheet);
    const files = [
      "content/oracle-plan-operator-catalog.js",
      "content/sql-intelligence-examples.js",
      "simulation/oracle-plan-parser.js",
      "simulation/oracle-plan-analyzer.js",
      "simulation/oracle-sql-analyzer.js",
      "simulation/sql-what-if-engine.js",
      "renderer/execution-plan-renderer.js",
      "renderer/sql-intelligence-renderer.js",
      "ui/sql-intelligence-bootstrap.js",
      "ui/sql-intelligence-lab.js"
    ];
    files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve()).then(() => {
      window.dispatchEvent(new CustomEvent("academy:intelligence-ready"));
    }).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar AI SQL Intelligence Lab localmente.";
    });
  }

  loadSqlIntelligenceLab();
  function loadOracleAiInternalsLab() {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "assets/oracle-ai-internals.css";
    document.head.append(stylesheet);
    const aiResponsiveOverride = document.createElement("style");
    aiResponsiveOverride.textContent = "@media (min-width: 769px) { .ai-data-flow { min-width: 0; } }";
    document.head.append(aiResponsiveOverride);
    const files = [
      "content/ai-vector-scenarios.js",
      "content/hybrid-search-scenarios.js",
      "content/select-ai-scenarios.js",
      "content/rag-scenarios.js",
      "content/agentic-scenarios.js",
      "simulation/vector-distance-engine.js",
      "simulation/vector-search-engine.js",
      "simulation/hybrid-search-engine.js",
      "simulation/select-ai-flow-engine.js",
      "simulation/rag-pipeline-engine.js",
      "simulation/agentic-workflow-engine.js",
      "renderer/ai-data-flow-renderer.js",
      "renderer/vector-search-renderer.js",
      "renderer/hybrid-search-renderer.js",
      "renderer/rag-renderer.js",
      "renderer/agentic-renderer.js",
      "ui/oracle-ai-internals-lab.js"
    ];
    files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve()).then(() => {
      window.dispatchEvent(new CustomEvent("academy:oracle-ai-ready"));
    }).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar Oracle AI Database Internals Lab localmente.";
    });
  }
  loadOracleAiInternalsLab();
  globalThis.OracleRunbookNavigation = Object.freeze({ chapters, navigate: (chapterId) => scrollTo(chapterId), getActiveChapter: () => chapters[activeChapter]?.id, getProgress: () => JSON.parse(JSON.stringify(progress)), recordActivity });
  }

  if (globalThis.oracleAcademyRunbook) startPortal(globalThis.oracleAcademyRunbook);
  else loadScript("content/runbook-chapters.js").then(() => startPortal(globalThis.oracleAcademyRunbook)).catch(() => {
    const feedback = document.getElementById("portalFeedback");
    if (feedback) feedback.textContent = "No se pudo cargar la navegación RunBook localmente.";
  });
})();
