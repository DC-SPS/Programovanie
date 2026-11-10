(() => {
  "use strict";

  if (document.documentElement.dataset.lessonPomodoroReady === "true") return;
  document.documentElement.dataset.lessonPomodoroReady = "true";
  const title = document.querySelector("h1")?.textContent.trim() || "Prednáška";
  const panel = document.querySelector(".lesson-side-panel") || document.createElement("aside");
  panel.classList.add("lesson-side-panel");
  panel.setAttribute("aria-label", "Ovládanie prednášky");
  if (!panel.isConnected) document.body.append(panel);

  const style = document.createElement("style");
  style.textContent = `
    .lesson-side-panel{display:flex;flex-direction:column;gap:.55rem}
    .lesson-pomodoro{order:-1;padding:.65rem;border:1px solid var(--line,var(--border,#2b5674));border-radius:.7rem;background:var(--card,var(--surface,#0b1b2a));color:var(--fg,var(--text,#e6f6ff));font:600 .8rem/1.35 system-ui,"Segoe UI",sans-serif}
    .lesson-pomodoro__head,.lesson-pomodoro__controls,.lesson-pomodoro__ranges{display:flex;align-items:center;justify-content:space-between;gap:.35rem}
    .lesson-pomodoro__head{margin-bottom:.4rem;color:#bae6fd;font-weight:800}
    .lesson-pomodoro__time{font:800 1.25rem/1.2 Consolas,monospace;font-variant-numeric:tabular-nums;color:#fff}
    .lesson-pomodoro__controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:.5rem}
    .lesson-pomodoro button{min-width:0;min-height:42px;padding:.3rem;border:1px solid var(--line,var(--border,#32617e));border-radius:.45rem;background:var(--bg,var(--surface,#12334b));color:inherit;font-family:inherit;font-size:.72rem;font-weight:700;line-height:1.2;cursor:pointer}
    .lesson-pomodoro button:focus-visible,.lesson-pomodoro input:focus-visible{outline:3px solid #fde047;outline-offset:2px}
    .lesson-pomodoro__ranges{align-items:flex-start}
    .lesson-pomodoro label{display:grid;gap:.2rem;flex:1;min-width:0;font-size:.68rem}
    .lesson-pomodoro input{width:100%;accent-color:#38bdf8}
    .lesson-pomodoro__status{margin:.35rem 0 0;color:#a8bdcf;font-size:.68rem}
    @media(max-width:768px){.lesson-pomodoro{padding:.4rem}.lesson-pomodoro__controls{gap:.25rem}.lesson-pomodoro button{min-height:40px}}
    @media print{.lesson-pomodoro{display:none!important}}
  `;
  document.head.append(style);

  const card = document.createElement("section");
  card.className = "lesson-pomodoro";
  card.setAttribute("aria-label", "Časovač Pomodoro");
  card.innerHTML = `
    <div class="lesson-pomodoro__head"><span>Pomodoro · PRÁCA</span><strong class="lesson-pomodoro__time" data-time>25:00</strong></div>
    <div class="lesson-pomodoro__controls">
      <button type="button" data-start>Spustiť</button><button type="button" data-pause disabled>Pozastaviť</button><button type="button" data-reset>Vynulovať</button>
    </div>
    <div class="lesson-pomodoro__ranges">
      <label>Práca <output data-work-value>25 min</output><input data-work type="range" min="5" max="60" step="5" value="25" aria-label="Dĺžka práce v minútach"></label>
      <label>Oddych <output data-rest-value>5 min</output><input data-rest type="range" min="1" max="15" step="1" value="5" aria-label="Dĺžka oddychu v minútach"></label>
    </div><p class="lesson-pomodoro__status" data-status role="status" aria-live="polite"></p>`;
  panel.prepend(card);

  const $ = (selector) => card.querySelector(selector);
  const time = $(`[data-time]`);
  const startButton = $(`[data-start]`);
  const pauseButton = $(`[data-pause]`);
  const resetButton = $(`[data-reset]`);
  const work = $(`[data-work]`);
  const rest = $(`[data-rest]`);
  const status = $(`[data-status]`);
  try {
    const savedWork = Number(localStorage.getItem("lesson-pomodoro.work"));
    const savedRest = Number(localStorage.getItem("lesson-pomodoro.rest"));
    if (savedWork >= 5 && savedWork <= 60 && savedWork % 5 === 0) work.value = String(savedWork);
    if (savedRest >= 1 && savedRest <= 15) rest.value = String(savedRest);
  } catch (_) { /* Predvolené časy fungujú aj bez úložiska. */ }
  let phase = "work";
  let remaining = Number(work.value) * 60;
  let deadline = 0;
  let interval = 0;
  let isPaused = false;
  const label = () => phase === "work" ? "PRÁCA" : "ODDYCH";
  const render = () => {
    time.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    card.querySelector(".lesson-pomodoro__head span").textContent = `Pomodoro · ${label()}`;
    startButton.disabled = Boolean(interval);
    startButton.textContent = isPaused ? "Pokračovať" : "Spustiť";
    pauseButton.disabled = !interval;
    work.disabled = rest.disabled = Boolean(interval);
  };
  const finishPhase = () => {
    phase = phase === "work" ? "rest" : "work";
    remaining = Number((phase === "work" ? work : rest).value) * 60;
    status.textContent = phase === "rest" ? `Práca skončila: ${title}. Začína oddych.` : "Oddych sa skončil. Začína ďalší pracovný blok.";
  };
  const tick = () => {
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (!remaining) finishPhase();
    deadline = Date.now() + remaining * 1000;
    render();
  };
  const updateSetting = () => {
    remaining = Number((phase === "work" ? work : rest).value) * 60;
    $(`[data-work-value]`).textContent = `${work.value} min`;
    $(`[data-rest-value]`).textContent = `${rest.value} min`;
    try {
      localStorage.setItem("lesson-pomodoro.work", work.value);
      localStorage.setItem("lesson-pomodoro.rest", rest.value);
    } catch (_) { /* Zmena platí pre aktuálnu stránku aj bez úložiska. */ }
    status.textContent = "Nastavenie časovača bolo aktualizované.";
    render();
  };
  startButton.addEventListener("click", () => {
    deadline = Date.now() + remaining * 1000;
    isPaused = false;
    interval = window.setInterval(tick, 250);
    status.textContent = `${label()}: časovač je spustený.`;
    render();
  });
  pauseButton.addEventListener("click", () => {
    window.clearInterval(interval); interval = 0; isPaused = true;
    status.textContent = "Časovač je pozastavený.";
    render();
  });
  resetButton.addEventListener("click", () => {
    window.clearInterval(interval); interval = 0; isPaused = false; phase = "work"; remaining = Number(work.value) * 60;
    status.textContent = "Časovač bol vynulovaný.";
    render();
  });
  work.addEventListener("input", updateSetting);
  rest.addEventListener("input", updateSetting);
  $(`[data-work-value]`).textContent = `${work.value} min`;
  $(`[data-rest-value]`).textContent = `${rest.value} min`;
  window.addEventListener("pagehide", () => window.clearInterval(interval), { once: true });
  render();
})();
