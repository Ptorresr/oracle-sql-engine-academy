(() => {
  "use strict";

  const chapters = [
    { id: "que", label: "¿Qué es?" },
    { id: "como", label: "¿Cómo funciona?" },
    { id: "simulador", label: "Simulador" },
    { id: "hashjoin", label: "HASH JOIN Engine" },
    { id: "casos", label: "Casos reales" },
    { id: "dba", label: "Para DBAs" },
    { id: "internals", label: "Motor interno" },
    { id: "ai", label: "AI Learning Lab" },
    { id: "reto", label: "Comprueba" }
  ];
  const progressKey = "oracle-sql-academy.joins.progress.v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = (id) => document.getElementById(id);
  const progress = readProgress();
  let activeChapter = 0;

  function readProgress() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(progressKey) || "{}");
      return { visited: Array.isArray(saved.visited) ? saved.visited.filter((id) => chapters.some((chapter) => chapter.id === id)) : [] };
    } catch {
      return { visited: [] };
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
    const completed = progress.visited.length;
    const percent = Math.round((completed / chapters.length) * 100);
    byId("progressPercent").textContent = `${percent}%`;
    byId("progressSummary").textContent = `${completed} de ${chapters.length} capítulos explorados en este navegador.`;
    const progressBar = byId("progressBar");
    progressBar.setAttribute("aria-valuenow", String(percent));
    progressBar.firstElementChild.style.width = `${percent}%`;
  }

  function markVisited(chapterId) {
    if (!progress.visited.includes(chapterId)) {
      progress.visited.push(chapterId);
      saveProgress();
      updateProgress();
    }
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

  function scrollTo(targetId) {
    const target = byId(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (chapters.some((chapter) => chapter.id === targetId)) {
      markVisited(targetId);
      setActiveChapter(chapters.findIndex((chapter) => chapter.id === targetId));
    }
  }

  function setActiveChapter(index) {
    activeChapter = Math.max(0, Math.min(index, chapters.length - 1));
    const chapter = chapters[activeChapter];
    document.querySelectorAll(".side a[data-chapter]").forEach((link) => {
      link.toggleAttribute("aria-current", link.dataset.chapter === chapter.id);
    });
    byId("breadcrumbChapter").textContent = chapter.label;
    byId("chapterPosition").textContent = `Capítulo ${activeChapter + 1} de ${chapters.length}`;
    const previous = byId("previousChapter");
    const next = byId("nextChapter");
    const previousChapter = chapters[activeChapter - 1];
    const nextChapter = chapters[activeChapter + 1];
    previous.href = previousChapter ? `#${previousChapter.id}` : "#dashboard";
    previous.textContent = previousChapter ? `← ${previousChapter.label}` : "← Volver al catálogo";
    next.href = nextChapter ? `#${nextChapter.id}` : "#reto";
    next.textContent = nextChapter ? `${nextChapter.label} →` : "Finalizar recorrido ✓";
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
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;
      const index = chapters.findIndex((chapter) => chapter.id === visible.target.id);
      if (index >= 0) {
        markVisited(visible.target.id);
        setActiveChapter(index);
      }
    }, { threshold: .36, rootMargin: "-15% 0px -55% 0px" });
    chapters.forEach((chapter) => observer.observe(byId(chapter.id)));
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
      saveProgress();
      updateProgress();
      byId("portalFeedback").textContent = "Se reinició el progreso local de JOINs en este navegador.";
    });
  }

  renderCatalog();
  updateProgress();
  setActiveChapter(activeChapter);
  bindChapterNavigation();
  bindWorkspace();
  bindProgressReset();
  updateWorkspace();
})();
