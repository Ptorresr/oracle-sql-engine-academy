(() => {
  "use strict";

  const registry = new Map();
  let active = null;
  let returnFocus = null;
  const renderer = () => globalThis.OraclePresentationRenderer;
  const byId = (id) => document.getElementById(id);
  const isFormField = (target) => target?.matches?.("input, textarea, select, [contenteditable=true]");
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stateFor = (entry) => {
    const state = entry.config.getState?.() || {};
    return { ...state, events: Array.isArray(state.events) ? state.events : [], index: Math.max(0, Number(state.index) || 0) };
  };
  const eventFor = (state) => state.events[Math.min(state.index, Math.max(0, state.events.length - 1))] || null;
  const control = (label, action, disabled = false) => `<button type="button" class="btn presentation-control" data-presentation-action="${action}"${disabled ? " disabled" : ""}>${label}</button>`;

  function ensureButton(config) {
    if (config.root.querySelector("[data-presentation-open]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn presentation-open";
    button.dataset.presentationOpen = config.id;
    button.textContent = "🎬 Modo presentación";
    button.addEventListener("click", () => open(config.id));
    const target = config.root.querySelector(config.buttonTarget || ".hash-toolbar, .comparison-toolbar, .ai-toolbar, .architecture-flow-panel .architecture-panel-heading") || config.root;
    target.append(button);
  }

  function render(entry) {
    const state = stateFor(entry);
    const event = eventFor(state);
    const root = byId("presentationMode");
    if (!root) return;
    const step = renderer().renderStep(event, state);
    root.querySelector(".presentation-title").textContent = entry.config.title;
    root.querySelector(".presentation-subtitle").textContent = state.subtitle || "Flujo educativo determinista · sin ejecución real";
    root.querySelector(".presentation-step").innerHTML = step;
    root.querySelector(".presentation-count").textContent = state.events.length ? `Paso ${state.index + 1} de ${state.events.length}` : "Sin pasos";
    root.querySelector("[data-presentation-action=previous]").disabled = state.index <= 0;
    root.querySelector("[data-presentation-action=next]").disabled = !state.events.length || state.index >= state.events.length - 1;
    root.querySelector("[data-presentation-action=pause]").disabled = !state.playing;
    root.querySelector("[data-presentation-action=play]").disabled = Boolean(state.playing) || reducedMotion() || !state.events.length || state.supportsPlayback === false;
    const speed = root.querySelector("#presentationSpeed");
    speed.value = String(state.speed || 1);
    const detail = root.querySelector(".presentation-detail");
    detail.hidden = detail.dataset.hidden === "true";
    const inspector = root.querySelector(".presentation-inspector");
    inspector.hidden = inspector.dataset.hidden === "true";
    inspector.innerHTML = `<h3 id="presentationInspectorHeading">Event Inspector contextual</h3><p>${renderer().escape(event?.explanation?.where || "El inspector usa el mismo evento del motor.")}</p><p><strong>Representación:</strong> ${renderer().escape(event?.illustrativeMetrics ? "Métrica ilustrativa y flujo conceptual." : "Datos del evento existente.")}</p>`;
    const figure = root.querySelector(".presentation-figure");
    if (figure && globalThis.OracleAnimatedDataFlow) globalThis.OracleAnimatedDataFlow.mount(figure, { kind: entry.config.kind, events: state.events, index: state.index, label: `${entry.config.title} · flujo conceptual`, onSelect: (index) => entry.config.actions?.select?.(index) });
  }

  function overlay(entry) {
    const image = entry.config.image || "assets/illustrations/hash-join-tech.png";
    const root = document.createElement("section");
    root.id = "presentationMode";
    root.className = "presentation-mode";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "presentationTitle");
    root.innerHTML = `<div class="presentation-shell"><header class="presentation-header"><div><p class="eyebrow">Oracle SQL & AI Database Engine Academy · Presentation Mode</p><h2 id="presentationTitle" class="presentation-title"></h2><p class="presentation-subtitle"></p></div><button type="button" class="btn presentation-close" data-presentation-action="close">Salir del modo presentación <span aria-hidden="true">×</span></button></header><div class="presentation-stage"><figure class="presentation-figure"><img src="${renderer().escape(image)}" width="1280" height="720" alt="Ilustración conceptual del flujo del laboratorio" loading="eager"><figcaption>La ilustración es una capa visual; el timeline y el Event Inspector son la fuente educativa.</figcaption></figure></div><section class="presentation-step presentation-detail" aria-labelledby="presentationStepHeading"><h3 id="presentationStepHeading" class="sr-only">Explicación del paso actual</h3></section><p class="presentation-count" aria-live="polite"></p><div class="presentation-toolbar" aria-label="Controles de presentación">${control("← Anterior", "previous")} ${control("▶ Play", "play")} ${control("Ⅱ Pause", "pause")} ${control("Siguiente →", "next")} ${control("↺ Reset", "reset")}<label for="presentationSpeed">Velocidad <select id="presentationSpeed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label><button type="button" class="btn" data-presentation-action="toggle-detail" aria-expanded="true">Ocultar explicación</button><button type="button" class="btn" data-presentation-action="toggle-inspector" aria-expanded="true">Ocultar Event Inspector</button></div><section class="presentation-inspector" aria-labelledby="presentationInspectorHeading"><h3 id="presentationInspectorHeading">Event Inspector contextual</h3><p>El inspector se alimenta del mismo evento seleccionado por el laboratorio. Las métricas permanecen ilustrativas.</p></section><p class="presentation-hint" role="note">Teclado opcional: ←/→ paso anterior/siguiente, Espacio Play/Pause, Escape salir. No se intercepta el teclado dentro de formularios.</p></div>`;
    document.body.append(root);
    root.addEventListener("click", (event) => {
      const action = event.target.closest("[data-presentation-action]")?.dataset.presentationAction;
      if (!action || !active) return;
      const actions = active.config.actions || {};
      if (action === "close") return close();
      if (action === "toggle-detail" || action === "toggle-inspector") {
        const selector = action === "toggle-detail" ? ".presentation-detail" : ".presentation-inspector";
        const target = root.querySelector(selector);
        target.dataset.hidden = target.dataset.hidden !== "true" ? "true" : "false";
        event.target.setAttribute("aria-expanded", String(target.dataset.hidden !== "true"));
        event.target.textContent = `${target.dataset.hidden === "true" ? "Mostrar" : "Ocultar"} ${action === "toggle-detail" ? "explicación" : "Event Inspector"}`;
        return;
      }
      if (action === "play") actions.play?.();
      if (action === "pause") actions.pause?.();
      if (action === "previous") actions.previous?.();
      if (action === "next") actions.next?.();
      if (action === "reset") actions.reset?.();
      render(active);
    });
    root.querySelector("#presentationSpeed").addEventListener("change", (event) => { active.config.actions?.setSpeed?.(Number(event.target.value)); render(active); });
    root.addEventListener("keydown", (event) => {
      if (!active || isFormField(event.target)) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key === "ArrowLeft") { event.preventDefault(); active.config.actions?.previous?.(); }
      if (event.key === "ArrowRight") { event.preventDefault(); active.config.actions?.next?.(); }
      if (event.key === " ") { event.preventDefault(); const state = stateFor(active); (state.playing ? active.config.actions?.pause : active.config.actions?.play)?.(); }
      render(active);
    });
    return root;
  }

  function open(id) {
    const entry = registry.get(id);
    if (!entry) return;
    if (active) close();
    active = entry;
    returnFocus = document.activeElement;
    const root = overlay(entry);
    document.body.classList.add("presentation-open");
    root.hidden = false;
    render(entry);
    root.querySelector(".presentation-close").focus();
    entry.config.onOpen?.();
  }
  function close() {
    if (!active) return;
    active.config.actions?.pause?.();
    byId("presentationMode")?.remove();
    document.body.classList.remove("presentation-open");
    const focus = returnFocus;
    active.config.onClose?.();
    active = null;
    returnFocus = null;
    focus?.focus?.();
  }
  function register(config) {
    if (!config?.id || !config.root || !config.kind) return;
    registry.set(config.id, { config });
    ensureButton(config);
  }
  function refresh(id) { if (active && active.config.id === id) render(active); }
  globalThis.OraclePresentationMode = Object.freeze({ register, refresh, open, close, isOpen: () => Boolean(active), getRegistered: () => [...registry.keys()] });
})();
