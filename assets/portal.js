(() => {
  "use strict";
  const runtimeAssetVersion = "12";

  if (!document.querySelector('link[data-tech-illustrations]')) {
    const techStylesheet = document.createElement("link");
    techStylesheet.rel = "stylesheet";
    techStylesheet.href = "assets/tech-illustrations.css?v=7";
    techStylesheet.dataset.techIllustrations = "true";
    document.head.append(techStylesheet);
  }

  if (!document.querySelector('link[data-oci-runbook-design-system]')) {
    const designSystemStylesheet = document.createElement("link");
    designSystemStylesheet.rel = "stylesheet";
    designSystemStylesheet.href = "assets/oci-runbook-design-system.css";
    designSystemStylesheet.dataset.ociRunbookDesignSystem = "true";
    document.head.append(designSystemStylesheet);
  }

  if (!document.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = "assets/favicon.svg";
    favicon.type = "image/svg+xml";
    document.head.append(favicon);
  }

  function setupThemeToggle() {
    const themeKey = "oracle-sql-academy.theme.v2";
    const legacyThemeKey = "oracle-sql-academy.theme.v1";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const validModes = new Set(["light", "dark", "system"]);
    let mode = "system";
    let theme = systemTheme.matches ? "dark" : "light";

    try {
      const saved = window.localStorage.getItem(themeKey);
      const legacy = window.localStorage.getItem(legacyThemeKey);
      if (validModes.has(saved)) mode = saved;
      else if (legacy === "light" || legacy === "dark") {
        mode = legacy;
        window.localStorage.setItem(themeKey, legacy);
      }
    } catch {
      // The portal remains usable when localStorage is unavailable.
    }

    const applyTheme = (nextMode, persist = false) => {
      mode = validModes.has(nextMode) ? nextMode : "system";
      theme = mode === "system" ? (systemTheme.matches ? "dark" : "light") : mode;
      document.body.dataset.theme = theme;
      document.body.dataset.themeMode = mode;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.themeMode = mode;
      document.documentElement.style.colorScheme = theme;
      const selector = document.getElementById("themeSelect");
      if (selector) {
        selector.value = mode;
        selector.setAttribute("aria-label", `Tema visual: ${selector.selectedOptions[0]?.textContent || mode}`);
      }
      if (persist) {
        try {
          window.localStorage.setItem(themeKey, mode);
        } catch {
          // Theme selection is intentionally best effort.
        }
      }
    };

    applyTheme(mode);
    const handleSystemThemeChange = () => {
      if (mode === "system") applyTheme("system");
    };
    if (typeof systemTheme.addEventListener === "function") systemTheme.addEventListener("change", handleSystemThemeChange);
    else systemTheme.addListener(handleSystemThemeChange);
    const top = document.querySelector(".top");
    if (!top || document.getElementById("themeSelect")) return;
    const picker = document.createElement("label");
    picker.className = "theme-picker";
    picker.htmlFor = "themeSelect";
    picker.innerHTML = '<span>Tema</span><select id="themeSelect"><option value="light">Claro</option><option value="dark">Oscuro</option><option value="system">Sistema</option></select>';
    const selector = picker.querySelector("select");
    selector.addEventListener("change", () => applyTheme(selector.value, true));
    top.insertBefore(picker, document.getElementById("resetProgress"));
    applyTheme(mode);
  }

  setupThemeToggle();

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${source}${source.includes("?") ? "&" : "?"}v=${runtimeAssetVersion}`;
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
  const stickyHeader = () => document.querySelector(".top");
  const stickyHeaderClearance = 8;
  const progress = readProgress();
  let activeChapter = 0;
  let pendingChapterId = null;
  let pendingRouteId = null;
  let performanceReady = false;
  let chapterObserver = null;
  let stickyHeaderObserver = null;
  const performanceRouteTargets = Object.freeze({
    "buffer-cache-io": Object.freeze({ targetId: "buffer-cache-preview", requiresPerformance: true }),
    "pga-workareas-temp": Object.freeze({ targetId: "workarea-temp-preview", requiresPerformance: true }),
    "optimizer-cardinality": Object.freeze({ targetId: "optimizer-cardinality-preview", requiresPerformance: true }),
    "execution-plan-diagnostics": Object.freeze({ targetId: "execution-plan-diagnostics", requiresPerformance: false }),
    "performance-what-if": Object.freeze({ targetId: "performance-what-if-preview", requiresPerformance: true })
  });

  function resolveRoute(routeId) {
    const chapter = runbook.getChapter(routeId);
    if (chapter) return Object.freeze({ id: routeId, chapterId: chapter.id, targetId: chapter.id, internal: false, requiresPerformance: false });
    const target = performanceRouteTargets[routeId];
    if (!target) return null;
    return Object.freeze({ id: routeId, chapterId: "database-performance", targetId: target.targetId, internal: true, requiresPerformance: target.requiresPerformance });
  }

  function getStickyHeaderOffset() {
    return Math.ceil(stickyHeader()?.getBoundingClientRect().height || 0) + stickyHeaderClearance;
  }

  function syncStickyHeaderOffset() {
    document.documentElement.style.setProperty("--portal-sticky-offset", `${getStickyHeaderOffset()}px`);
  }

  function keepTargetBelowStickyHeader(target) {
    const overlap = getStickyHeaderOffset() - target.getBoundingClientRect().top;
    if (overlap > 0) window.scrollBy({ top: -overlap, behavior: "auto" });
  }

  function settleTargetPosition(target) {
    window.requestAnimationFrame(() => {
      syncStickyHeaderOffset();
      window.requestAnimationFrame(() => keepTargetBelowStickyHeader(target));
    });
  }

  function ensurePerformanceChapter() {
    const chapter = byId("database-performance");
    const bufferLab = byId("buffer-cache-preview");
    if (!chapter || !bufferLab || chapter.dataset.performanceChapterReady === "true") return;
    chapter.dataset.performanceChapterReady = "true";
    chapter.innerHTML = `<header class="performance-chapter-header"><div class="eyebrow">Capítulo 15 · Database Internals &amp; Performance</div><h2 id="databasePerformanceTitle">Database Internals &amp; Performance</h2><p>Relaciona bloques, memoria de trabajo, cardinalidad, evidencia de planes y comparaciones A/B mediante simulaciones locales y deterministas. Ninguna vista ejecuta SQL ni representa una traza física de Oracle Database.</p><nav class="performance-lab-nav" aria-label="Laboratorios de rendimiento"><a href="#buffer-cache-io">1 · Buffer Cache &amp; I/O</a><a href="#pga-workareas-temp">2 · PGA / Workareas / TEMP</a><a href="#optimizer-cardinality">3 · Optimizer &amp; Cardinality</a><a href="#execution-plan-diagnostics">4 · Execution Plan Diagnostics</a><a href="#performance-what-if">5 · Performance What-If A/B</a></nav></header><section id="execution-plan-diagnostics" class="panel performance-diagnostics-bridge" aria-labelledby="performanceDiagnosticsTitle"><div class="kicker">Laboratorio 4 · Evidencia importada</div><h3 id="performanceDiagnosticsTitle">Execution Plan Diagnostics</h3><p>El importador seguro, parser y recorrido diagnóstico viven en AI SQL Intelligence para conservar un único plan, timeline y Event Inspector. Abre un ejemplo o un plan sanitizado y selecciona un operador para completar esta actividad.</p><a class="btn primary" href="#intelligence" data-performance-diagnostics-launch>Abrir AI SQL Intelligence</a></section>`;
    chapter.append(bufferLab);
    bufferLab.dataset.performanceLab = "buffer-cache-io";
    bufferLab.querySelector(".kicker").textContent = "Laboratorio 1 · Capítulo 15";
    const bufferLayout = bufferLab.querySelector(".buffer-layout");
    if (bufferLayout && !byId("bufferResultsView")) {
      const resultsView = document.createElement("section");
      resultsView.className = "buffer-view";
      resultsView.setAttribute("aria-labelledby", "bufferResultsTitle");
      resultsView.innerHTML = '<div class="kicker">Results · conceptual</div><h3 id="bufferResultsTitle">Estado y filas entregadas</h3><div id="bufferResultsView"></div>';
      bufferLayout.append(resultsView);
    }
    const bufferLegend = bufferLab.querySelector(".buffer-legend");
    if (bufferLegend) bufferLegend.textContent = "Las métricas con * son ilustrativas. La secuencia separa acceso lógico, caché conceptual y posible lectura física conceptual; no reproduce el algoritmo interno de Oracle.";
  }

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

  function scrollTo(targetId, historyMode = "push", restoreFocus = false) {
    const route = resolveRoute(targetId);
    if (route?.requiresPerformance && !performanceReady) {
      pendingRouteId = route.id;
      return;
    }
    const target = byId(route?.targetId || targetId);
    if (!target) {
      if (route) pendingRouteId = route.id;
      else if (runbook.getChapter(targetId)) pendingChapterId = targetId;
      return;
    }
    pendingChapterId = null;
    pendingRouteId = null;
    const chapter = route ? runbook.getChapter(route.chapterId) : runbook.getChapter(targetId);
    const routeHash = route ? `#${route.id}` : null;
    if (chapter && historyMode === "push" && routeHash && window.location.hash !== routeHash) window.history.pushState({ chapterId: chapter.id, routeId: route.id }, "", routeHash);
    syncStickyHeaderOffset();
    target.scrollIntoView({ block: "start", behavior: reduceMotion || historyMode === "none" ? "auto" : "smooth" });
    settleTargetPosition(target);
    if (chapter) {
      markVisited(chapter.id);
      setActiveChapter(runbook.getIndex(chapter.id));
    }
    if (restoreFocus) {
      const focusTarget = target.querySelector("[data-performance-focus], button, select, [tabindex='0']") || target;
      if (focusTarget === target && !target.hasAttribute("tabindex")) target.tabIndex = -1;
      window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
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
    syncStickyHeaderOffset();
    const header = stickyHeader();
    if (header && "ResizeObserver" in window) {
      stickyHeaderObserver = new ResizeObserver(syncStickyHeaderOffset);
      stickyHeaderObserver.observe(header);
    }
    window.addEventListener("resize", syncStickyHeaderOffset);
    window.addEventListener("load", syncStickyHeaderOffset, { once: true });
    const architectureRoutes = new Set(["architecture-explorer", "architecture-retail", "architecture-finance", "architecture-operations"]);
    document.querySelectorAll(".side a[data-chapter], .chapter-nav a").forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href").slice(1);
        if (!resolveRoute(targetId) && !byId(targetId)) return;
        event.preventDefault();
        scrollTo(targetId, "push", Boolean(resolveRoute(targetId)?.internal));
      });
    });
    chapterObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;
      const routeId = window.location.hash.replace(/^#/, "");
      if (architectureRoutes?.has(routeId) && visible.target.id !== "architecture-explorer") return;
      const resolvedRoute = resolveRoute(routeId);
      if (resolvedRoute?.chapterId === "database-performance" && visible.target.id !== "database-performance") return;
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
      const routeId = window.location.hash.replace(/^#/, "");
      if (resolveRoute(routeId)) scrollTo(routeId, "none", Boolean(resolveRoute(routeId)?.internal));
    };
    window.addEventListener("hashchange", routeFromHash);
    window.addEventListener("popstate", routeFromHash);
    window.addEventListener("academy:intelligence-ready", () => {
      const section = byId("intelligence");
      if (section) chapterObserver.observe(section);
      if (pendingChapterId === "intelligence" || window.location.hash === "#intelligence") scrollTo("intelligence", "none");
    });
    window.addEventListener("academy:performance-ready", () => {
      performanceReady = true;
      const section = byId("database-performance");
      if (section) chapterObserver.observe(section);
      const routeId = window.location.hash.replace(/^#/, "");
      if (pendingRouteId === routeId || resolveRoute(routeId)?.requiresPerformance) scrollTo(routeId, "none", true);
    });
    const aiInternalsLabIds = new Set(["ai-vector-search", "hybrid-vector-search", "select-ai-flow", "rag-architecture", "agentic-workflows"]);
    const activateAiChapter = (event) => {
      const routeId = window.location.hash.replace(/^#/, "");
      if (architectureRoutes.has(routeId) || pendingChapterId === "architecture-explorer") return;
      const activateInternals = event?.type === "academy:oracle-ai-active" || aiInternalsLabIds.has(routeId) || pendingChapterId === "ai-internals";
      const activateLearning = routeId === "ai" || routeId === "intelligence" || pendingChapterId === "ai" || pendingChapterId === "intelligence";
      if (!activateInternals && !activateLearning) return;
      const chapterId = activateInternals ? "ai-internals" : (routeId === "intelligence" || pendingChapterId === "intelligence" ? "intelligence" : "ai");
      window.setTimeout(() => {
        const section = document.getElementById(chapterId);
        if (section) {
          chapterObserver.observe(section);
          if (pendingChapterId === chapterId || window.location.hash === `#${chapterId}` || aiInternalsLabIds.has(routeId)) scrollTo(chapterId, "none");
          markVisited(chapterId);
          setActiveChapter(runbook.getIndex(chapterId));
        }
      }, 0);
    };
    window.addEventListener("academy:oracle-ai-ready", activateAiChapter);
    window.addEventListener("academy:oracle-ai-active", activateAiChapter);
    window.addEventListener("hashchange", () => {
      if (aiInternalsLabIds.has(window.location.hash.replace(/^#/, ""))) activateAiChapter({ type: "academy:oracle-ai-active" });
    });
    const activateArchitectureChapter = () => {
      const routeId = window.location.hash.replace(/^#/, "");
      if (routeId !== "architecture-explorer" && !architectureRoutes.has(routeId) && pendingChapterId !== "architecture-explorer") return;
      window.setTimeout(() => {
        const section = byId("architecture-explorer");
        if (!section) return;
        chapterObserver.observe(section);
        if (pendingChapterId === "architecture-explorer" || architectureRoutes.has(routeId)) scrollTo("architecture-explorer", "none");
        markVisited("architecture-explorer");
        setActiveChapter(runbook.getIndex("architecture-explorer"));
      }, 0);
    };
    window.addEventListener("academy:architecture-ready", activateArchitectureChapter);
    window.addEventListener("academy:architecture-active", activateArchitectureChapter);
    window.addEventListener("academy:architecture-challenges-ready", () => {
      const section = byId("architecture-challenges");
      if (!section) return;
      chapterObserver.observe(section);
      if (window.location.hash === "#architecture-challenges" || pendingChapterId === "architecture-challenges") window.setTimeout(() => scrollTo("architecture-challenges", "none"), 250);
    });
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

  ensurePerformanceChapter();
  renderCatalog();
  renderRunbookNavigation();
  updateProgress();
  setActiveChapter(activeChapter);
  bindChapterNavigation();
  bindWorkspace();
  bindProgressReset();
  updateWorkspace();
  const initialRouteId = window.location.hash.replace(/^#/, "");
  if (resolveRoute(initialRouteId)) window.setTimeout(() => scrollTo(initialRouteId, "none", Boolean(resolveRoute(initialRouteId)?.internal)), 250);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-performance-diagnostics-launch]")) window.dispatchEvent(new CustomEvent("academy:diagnostics-launch"));
  });
  window.addEventListener("academy:intelligence-activity", (event) => {
    const activity = event.detail?.activity;
    recordActivity("intelligence", activity);
    if (activity === "operator-inspected") recordActivity("database-performance", "plan-diagnostic-inspected");
  });
  window.addEventListener("academy:performance-activity", (event) => recordActivity("database-performance", event.detail?.activity));
  window.addEventListener("academy:architecture-activity", (event) => recordActivity("architecture-explorer", event.detail?.activity));
  window.addEventListener("academy:architecture-challenge-activity", (event) => recordActivity("architecture-challenges", event.detail?.activity));

  let performanceFoundationPromise = null;
  function loadPerformanceFoundation() {
    if (window.OraclePerformanceEventAdapter) return Promise.resolve();
    if (!performanceFoundationPromise) {
      const files = ["content/performance-scenarios.js", "simulation/performance-event-adapter.js"];
      performanceFoundationPromise = files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve());
    }
    return performanceFoundationPromise;
  }

  function ensureStylesheet(source, key) {
    const existing = document.querySelector(`link[data-runtime-style="${key}"]`);
    if (existing) return existing;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `${source}${source.includes("?") ? "&" : "?"}v=${runtimeAssetVersion}`;
    stylesheet.dataset.runtimeStyle = key;
    document.head.append(stylesheet);
    return stylesheet;
  }

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
      "simulation/plan-diagnostics-timeline.js",
      "simulation/oracle-sql-analyzer.js",
      "simulation/sql-what-if-engine.js",
      "renderer/execution-plan-renderer.js",
      "renderer/sql-intelligence-renderer.js",
      "ui/sql-intelligence-bootstrap.js",
      "ui/sql-intelligence-lab.js"
    ];
    return loadPerformanceFoundation().then(() => files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve())).then(() => {
      window.dispatchEvent(new CustomEvent("academy:intelligence-ready"));
    }).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar AI SQL Intelligence Lab localmente.";
    });
  }

  loadSqlIntelligenceLab();
  function loadBufferCacheLab() {
    if (window.OracleBufferCacheLab) return Promise.resolve();
    if (!byId("bufferCacheLab")) return Promise.reject(new Error("No se encontró el montaje de Buffer Cache & I/O."));
    ensureStylesheet("assets/buffer-cache-lab.css", "buffer-cache-lab");
    const files = [
      "simulation/buffer-cache-engine.js",
      "renderer/buffer-cache-renderer.js",
      "ui/buffer-cache-lab.js"
    ];
    return loadPerformanceFoundation().then(() => files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve())).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar Buffer Cache & I/O Lab localmente.";
      throw new Error("Buffer Cache & I/O Lab no se pudo cargar.");
    });
  }
  function loadWorkareaTempLab() {
    if (window.OracleWorkareaTempLab) return Promise.resolve();
    ensureStylesheet("assets/workarea-temp-lab.css", "workarea-temp-lab");
    const files = [
      "simulation/workarea-temp-engine.js",
      "renderer/workarea-temp-renderer.js",
      "ui/workarea-temp-lab.js"
    ];
    return files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve()).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar PGA, Work Areas & TEMP Lab localmente.";
      throw new Error("PGA, Work Areas & TEMP Lab no se pudo cargar.");
    });
  }
  function loadOptimizerCardinalityLab() {
    if (window.OracleOptimizerCardinalityLab) return Promise.resolve();
    ensureStylesheet("assets/optimizer-cardinality-lab.css", "optimizer-cardinality-lab");
    const files = [
      "simulation/optimizer-cardinality-engine.js",
      "renderer/optimizer-cardinality-renderer.js",
      "ui/optimizer-cardinality-lab.js"
    ];
    return files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve()).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar Optimizer & Cardinality Lab localmente.";
      throw new Error("Optimizer & Cardinality Lab no se pudo cargar.");
    });
  }
  function loadPerformanceWhatIfLab() {
    if (window.OraclePerformanceWhatIfLab) return Promise.resolve();
    ensureStylesheet("assets/performance-what-if-lab.css", "performance-what-if-lab");
    const files = [
      "simulation/performance-what-if-engine.js",
      "renderer/performance-what-if-renderer.js",
      "ui/performance-what-if-lab.js"
    ];
    return files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve()).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar Performance What-If Lab localmente.";
      throw new Error("Performance What-If Lab no se pudo cargar.");
    });
  }
  let performanceLabsPromise = null;
  function loadPerformanceLabs() {
    if (!performanceLabsPromise) {
      performanceLabsPromise = loadBufferCacheLab()
        .then(loadWorkareaTempLab)
        .then(loadOptimizerCardinalityLab)
        .then(loadPerformanceWhatIfLab)
        .then(() => {
          const labs = ["OracleBufferCacheLab", "OracleWorkareaTempLab", "OracleOptimizerCardinalityLab", "OraclePerformanceWhatIfLab"];
          if (!labs.every((name) => Boolean(window[name]))) throw new Error("La integración de rendimiento quedó incompleta.");
          window.dispatchEvent(new CustomEvent("academy:performance-ready", { detail: { labs: Object.freeze([...labs]) } }));
        })
        .catch(() => {
          byId("portalFeedback").textContent = "No se pudo completar la integración local de Database Performance.";
          throw new Error("Database Performance no se pudo inicializar.");
        });
    }
    return performanceLabsPromise;
  }
  loadPerformanceLabs().catch(() => {});
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
  function loadArchitectureExplorer() {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "assets/architecture-explorer.css";
    document.head.append(stylesheet);
    const files = [
      "content/oci-architecture-components.js",
      "content/oci-reference-architectures.js",
      "content/architecture-learning-content.js",
      "simulation/architecture-graph-engine.js",
      "simulation/architecture-flow-engine.js",
      "simulation/architecture-security-engine.js",
      "simulation/architecture-what-if-engine.js",
      "simulation/architecture-deployment-guide.js",
      "renderer/architecture-canvas-renderer.js",
      "renderer/architecture-flow-renderer.js",
      "renderer/architecture-inspector-renderer.js",
      "ui/architecture-explorer.js",
      "content/architecture-challenges.js",
      "simulation/architecture-challenge-evaluator.js",
      "renderer/challenge-feedback-renderer.js",
      "ui/architecture-challenges.js"
    ];
    files.reduce((chain, source) => chain.then(() => loadScript(source)), Promise.resolve()).catch(() => {
      byId("portalFeedback").textContent = "No se pudo cargar Oracle AI Database Architecture Explorer localmente.";
    });
  }
  loadArchitectureExplorer();
  globalThis.OracleRunbookNavigation = Object.freeze({ chapters, navigate: (chapterId) => scrollTo(chapterId), getActiveChapter: () => chapters[activeChapter]?.id, getProgress: () => JSON.parse(JSON.stringify(progress)), recordActivity });
  }

  if (globalThis.oracleAcademyRunbook) startPortal(globalThis.oracleAcademyRunbook);
  else loadScript("content/runbook-chapters.js").then(() => startPortal(globalThis.oracleAcademyRunbook)).catch(() => {
    const feedback = document.getElementById("portalFeedback");
    if (feedback) feedback.textContent = "No se pudo cargar la navegación RunBook localmente.";
  });
})();
