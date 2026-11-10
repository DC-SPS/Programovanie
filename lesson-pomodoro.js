(() => {
  "use strict";

  if (document.documentElement.dataset.lessonPomodoroReady === "true") return;
  document.documentElement.dataset.lessonPomodoroReady = "true";
  const panel = document.querySelector(".lesson-side-panel") || document.createElement("aside");
  panel.classList.add("lesson-side-panel");
  panel.setAttribute("aria-label", "Ovládanie prednášky");
  if (!panel.isConnected) document.body.append(panel);

  const style = document.createElement("style");
  style.textContent = `
    .lesson-pomodoro{order:1;display:grid;gap:.75rem;padding:1rem 0;border-block:1px solid var(--line,var(--border,#d9dee7));color:var(--fg,var(--text,#182230));font:400 .9rem/1.4 system-ui,"Segoe UI",sans-serif}
    .lesson-pomodoro__heading{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin:0}
    .lesson-pomodoro__heading h2{margin:0;font-size:1rem;line-height:1.3}
    .lesson-pomodoro__phase{display:inline-flex;align-items:center;min-height:28px;padding:.15rem .55rem;border:1px solid var(--line,var(--border,#d9dee7));border-radius:999px;font-size:.875rem;font-weight:700}
    .lesson-pomodoro[data-phase="work"] .lesson-pomodoro__phase{border-color:#177b58}
    .lesson-pomodoro[data-phase="break"] .lesson-pomodoro__phase{border-color:#a96b00}
    .lesson-pomodoro__time{font:800 2rem/1.1 Consolas,"Cascadia Code",monospace;font-variant-numeric:tabular-nums;letter-spacing:.02em}
    .lesson-pomodoro__actions{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.5rem}
    .lesson-pomodoro button{min-width:0;min-height:44px;padding:.55rem .75rem;border:1px solid var(--line,var(--border,#cbd4df));border-radius:.5rem;background:var(--surface,var(--bg,#fff));color:var(--fg,var(--text,#182230));font:650 .9rem/1.2 system-ui,"Segoe UI",sans-serif;cursor:pointer}
    .lesson-pomodoro [data-toggle]{border-color:#1d70c9;background:#1d70c9;color:#fff}
    .lesson-pomodoro button:hover:not(:disabled){filter:brightness(.95)}
    .lesson-pomodoro button:focus-visible,.lesson-pomodoro input:focus-visible,.lesson-pomodoro summary:focus-visible{outline:3px solid #1d70c9;outline-offset:2px}
    .lesson-pomodoro button:disabled{opacity:.55;cursor:not-allowed}
    .lesson-pomodoro__settings{border-top:1px solid var(--line,var(--border,#d9dee7));padding-top:.55rem}
    .lesson-pomodoro__settings summary{min-height:44px;display:flex;align-items:center;color:var(--mut,var(--muted,#536176));font-size:.875rem;font-weight:600;cursor:pointer}
    .lesson-pomodoro__ranges{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;padding:.5rem 0}
    .lesson-pomodoro label{display:grid;gap:.3rem;min-width:0;font-size:.875rem;font-weight:600}
    .lesson-pomodoro output{font-variant-numeric:tabular-nums;color:var(--mut,var(--muted,#536176))}
    .lesson-pomodoro input{width:100%;min-height:44px;accent-color:#1d70c9}
    .lesson-pomodoro__status{margin:0;color:var(--mut,var(--muted,#536176));font-size:.875rem}
    @media(max-width:768px){.lesson-pomodoro{padding:.75rem 0}.lesson-pomodoro__time{font-size:1.8rem}}
    @media print{.lesson-pomodoro{display:none!important}}
  `;
  document.head.append(style);

  const card = document.createElement("section");
  card.className = "lesson-pomodoro";
  card.dataset.phase = "work";
  card.setAttribute("aria-labelledby", "lesson-pomodoro-title");
  card.innerHTML = `
    <div class="lesson-pomodoro__heading"><h2 id="lesson-pomodoro-title">Pomodoro</h2><span class="lesson-pomodoro__phase" data-phase-label>Práca</span></div>
    <strong class="lesson-pomodoro__time" data-time aria-label="Zostávajúci čas Pomodoro">25:00</strong>
    <div class="lesson-pomodoro__actions"><button type="button" data-toggle aria-pressed="false">Spustiť</button><button type="button" data-reset>Vynulovať</button></div>
    <details class="lesson-pomodoro__settings"><summary>Nastaviť dĺžku práce a prestávky</summary>
      <div class="lesson-pomodoro__ranges">
        <label>Práca <output data-work-value>25 min</output><input data-work type="range" min="5" max="60" step="5" value="25" aria-label="Dĺžka práce v minútach"></label>
        <label>Prestávka <output data-break-value>5 min</output><input data-break type="range" min="1" max="15" step="1" value="5" aria-label="Dĺžka prestávky v minútach"></label>
      </div>
    </details>
    <p class="lesson-pomodoro__status" data-status role="status" aria-live="polite">Časovač je pripravený.</p>`;
  panel.append(card);

  const $ = (selector) => card.querySelector(selector);
  const time = $(`[data-time]`);
  const toggleButton = $(`[data-toggle]`);
  const resetButton = $(`[data-reset]`);
  const work = $(`[data-work]`);
  const pauseDuration = $(`[data-break]`);
  const status = $(`[data-status]`);
  try {
    const savedWork = Number(localStorage.getItem("lesson-pomodoro.work"));
    const savedBreak = Number(localStorage.getItem("lesson-pomodoro.rest"));
    if (savedWork >= 5 && savedWork <= 60 && savedWork % 5 === 0) work.value = String(savedWork);
    if (savedBreak >= 1 && savedBreak <= 15) pauseDuration.value = String(savedBreak);
  } catch (_) { /* Predvolené časy fungujú aj bez úložiska. */ }

  let phase = "work";
  let remaining = Number(work.value) * 60;
  let deadline = 0;
  let interval = 0;
  let isPaused = false;
  const phaseName = () => phase === "work" ? "Práca" : "Prestávka";
  const durationForPhase = () => Number((phase === "work" ? work : pauseDuration).value) * 60;
  const render = () => {
    time.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    $(`[data-phase-label]`).textContent = phaseName();
    card.dataset.phase = phase === "work" ? "work" : "break";
    toggleButton.textContent = interval ? "Pozastaviť" : isPaused ? "Pokračovať" : "Spustiť";
    toggleButton.setAttribute("aria-label", `${toggleButton.textContent} časovač Pomodoro`);
    toggleButton.setAttribute("aria-pressed", String(Boolean(interval)));
    work.disabled = pauseDuration.disabled = Boolean(interval);
    $(`[data-work-value]`).textContent = `${work.value} min`;
    $(`[data-break-value]`).textContent = `${pauseDuration.value} min`;
  };
  const finishPhase = () => {
    phase = phase === "work" ? "break" : "work";
    remaining = durationForPhase();
    status.textContent = phase === "break" ? "Pracovný blok sa skončil. Začína prestávka." : "Prestávka sa skončila. Začína ďalší pracovný blok.";
  };
  const tick = () => {
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (!remaining) finishPhase();
    deadline = Date.now() + remaining * 1000;
    render();
  };
  const updateSetting = () => {
    if (!interval) remaining = durationForPhase();
    try {
      localStorage.setItem("lesson-pomodoro.work", work.value);
      localStorage.setItem("lesson-pomodoro.rest", pauseDuration.value);
    } catch (_) { /* Nové nastavenie platí aj bez úložiska. */ }
    status.textContent = "Dĺžka pracovného bloku a prestávky bola aktualizovaná.";
    render();
  };
  toggleButton.addEventListener("click", () => {
    if (interval) {
      clearInterval(interval);
      interval = 0;
      isPaused = true;
      status.textContent = `Časovač je pozastavený. Zostáva ${phaseName().toLowerCase()}.`;
    } else {
      deadline = Date.now() + remaining * 1000;
      isPaused = false;
      interval = window.setInterval(tick, 250);
      status.textContent = `${phaseName()}: časovač beží.`;
    }
    render();
  });
  resetButton.addEventListener("click", () => {
    clearInterval(interval);
    interval = 0;
    isPaused = false;
    phase = "work";
    remaining = durationForPhase();
    status.textContent = "Časovač bol vynulovaný. Režim: práca.";
    render();
  });
  work.addEventListener("input", updateSetting);
  pauseDuration.addEventListener("input", updateSetting);
  window.addEventListener("pagehide", () => clearInterval(interval), { once: true });
  render();
})();
