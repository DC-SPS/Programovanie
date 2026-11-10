(() => {
  "use strict";

  const currentScript = document.currentScript;
  if (currentScript && !document.querySelector('script[data-lesson-voice-loader]')) {
    const voiceLoader = document.createElement("script");
    voiceLoader.src = new URL("lesson-voice.js", currentScript.src).href;
    voiceLoader.dataset.lessonVoiceLoader = "true";
    voiceLoader.defer = true;
    document.head.append(voiceLoader);
  }

  const main = document.querySelector("main") || document.body;
  if (!main || document.querySelector(".lesson-clock")) return;

  const heading = document.querySelector("h1");
  const headingText = heading?.textContent.trim() || document.title;
  const subtitle = document.querySelector(".subtitle");
  const descriptionMeta = document.querySelector('meta[name="description"]')?.content;
  const descriptionNode = heading?.nextElementSibling;
  const descriptionText = subtitle?.textContent.trim() || descriptionMeta || descriptionNode?.textContent.trim();
  const count = document.querySelector(".count")?.textContent || document.title;
  const lessonMatch = count.match(/(?:hodina|lekcia)\s*(\d+)/i);
  const topicMatch = headingText.match(/^(\d+(?:\.\d+)+)\b/);
  const lessonLabel = lessonMatch
    ? `HODINA ${lessonMatch[1]} / 66`
    : topicMatch
      ? `TÉMA ${topicMatch[1]} · 45 MIN`
      : "PYTHON · 45 MINÚT";
  const utcOffsets = [-720,-660,-600,-570,-540,-480,-420,-360,-300,-240,-210,-180,-120,-60,0,60,120,180,210,240,270,300,330,345,360,390,420,480,525,540,570,600,630,660,720,765,780,840];
  const offsetStorageKey = "lesson-clock.utc-offset";
  const localOffset = -new Date().getTimezoneOffset();
  let utcOffset = utcOffsets.includes(localOffset) ? localOffset : 0;
  try {
    const savedOffset = Number(window.localStorage.getItem(offsetStorageKey));
    if (utcOffsets.includes(savedOffset)) utcOffset = savedOffset;
  } catch (_) {
    // The clock still works when browser storage is unavailable.
  }

  function formatOffset(minutes) {
    const sign = minutes < 0 ? "−" : "+";
    const absolute = Math.abs(minutes);
    return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
  }

  const style = document.createElement("style");
  style.textContent = `
    .lesson-clock{position:sticky;top:0;z-index:1000;margin:0 0 1rem;border:1px solid var(--line,var(--border,#2d4058));border-radius:0 0 .65rem .65rem;overflow:visible;background:var(--surface,var(--bg,#fff));box-shadow:0 4px 14px #00000012;color:var(--fg,var(--text,#182230));font:14px/1.4 system-ui,"Segoe UI",sans-serif}
    .lesson-clock__chrome{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .8rem;min-height:2.5rem;padding:.4rem 1rem;background:transparent;border-bottom:1px solid var(--line,var(--border,#d9dee7))}
    .lesson-clock__lights,.lesson-clock__chrome-spacer{display:none}
    .lesson-clock__tag{order:0;font-size:.8rem;font-weight:750;letter-spacing:.04em;color:var(--mut,var(--muted,#536176))}
    .lesson-clock__time-label{order:2;margin-left:auto;font-size:.875rem;font-weight:600;color:var(--mut,var(--muted,#536176))}
    .lesson-clock__time{order:3;min-width:5.5rem;text-align:right;font:800 1.7rem/1.1 Consolas,"Cascadia Code",monospace;color:var(--fg,var(--text,#182230));font-variant-numeric:tabular-nums}
    .lesson-clock__clock{order:1;display:flex;align-items:baseline;gap:.4rem;margin-left:auto;color:var(--mut,var(--muted,#536176))}.lesson-clock__clock-label,.lesson-clock__zone{font-size:.75rem;font-weight:600;color:inherit}.lesson-clock__now{min-width:4.3rem;text-align:center;font:700 .9rem/1.2 Consolas,"Cascadia Code",monospace;color:inherit;font-variant-numeric:tabular-nums}.lesson-clock__date{font-size:.8rem;color:inherit;font-variant-numeric:tabular-nums;white-space:nowrap}
    .lesson-clock__settings{order:4;position:relative;flex:none;margin-left:.2rem}.lesson-clock__settings summary{list-style:none;min-height:44px;display:flex;align-items:center;padding:.35rem .65rem;border:1px solid var(--line,var(--border,#d9dee7));border-radius:.5rem;color:inherit;font-size:.875rem;font-weight:650;cursor:pointer}.lesson-clock__settings summary::-webkit-details-marker{display:none}.lesson-clock__settings summary:focus-visible,.lesson-clock__zone-select:focus-visible{outline:3px solid #1d70c9;outline-offset:2px}.lesson-clock__settings summary:hover{background:var(--card,var(--surface,#f4f6fa))}.lesson-clock__settings-panel{position:absolute;right:0;top:calc(100% + .45rem);z-index:5;width:min(18rem,calc(100vw - 2rem));padding:1rem;border:1px solid var(--line,var(--border,#d9dee7));border-radius:.65rem;background:var(--surface,var(--bg,#fff));box-shadow:0 8px 24px #0002}.lesson-clock__settings-panel label{display:block;margin-bottom:.4rem;color:inherit;font-size:.875rem;font-weight:650}.lesson-clock__settings-panel p{margin:.5rem 0 0;color:var(--mut,var(--muted,#536176));font-size:.8rem}.lesson-clock__zone-select{width:100%;min-height:44px;padding:.5rem;border:1px solid var(--line,var(--border,#d9dee7));border-radius:.45rem;background:var(--bg,var(--surface,#fff));color:inherit;font:inherit}
    .lesson-clock__body{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:1rem;padding:.9rem 1rem}
    .lesson-clock__info{min-width:0}.lesson-clock__eyebrow{display:flex;align-items:center;gap:.6rem;margin-bottom:.25rem}.lesson-clock__number{display:block;font-size:.875rem;font-weight:700;letter-spacing:.025em;color:var(--mut,var(--muted,#536176))}.lesson-clock__state{display:inline-flex;align-items:center;min-height:24px;padding:.1rem .55rem;border:1px solid var(--line,var(--border,#d9dee7));border-radius:999px;font-size:.8rem;font-weight:700;color:var(--fg,var(--text,#182230))}.lesson-clock__state[data-state="running"]{border-color:#16845b}.lesson-clock__state[data-state="paused"]{border-color:#a96b00}.lesson-clock__state[data-state="finished"]{border-color:#9e3944}
    .lesson-clock__title{display:block;overflow:hidden;text-overflow:ellipsis;font-size:1.2rem;line-height:1.25;font-weight:750;color:var(--fg,var(--text,#182230))}
    .lesson-clock__description{margin:.25rem 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mut,var(--muted,#536176));font-size:.875rem}
    .lesson-clock__controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.5rem}.lesson-clock__button{min-height:44px;padding:.55rem .8rem;border:1px solid var(--line,var(--border,#cbd4df));border-radius:.5rem;background:var(--surface,var(--bg,#fff));color:var(--fg,var(--text,#182230));font:650 .9rem/1.2 system-ui,"Segoe UI",sans-serif;cursor:pointer}.lesson-clock__button:first-child{border-color:#1d70c9;background:#1d70c9;color:#fff}.lesson-clock__button:hover:not(:disabled){filter:brightness(.95)}.lesson-clock__button:disabled{opacity:.55;cursor:not-allowed}.lesson-clock__button:focus-visible{outline:3px solid #1d70c9;outline-offset:2px}
    .lesson-clock__progress{height:3px;background:var(--line,var(--border,#d9dee7))}.lesson-clock__progress-value{height:100%;width:0;background:#1d70c9;transition:width .2s linear}
    .lesson-clock__status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:1100px){.lesson-clock__body{grid-template-columns:minmax(0,1fr) auto}.lesson-clock__description{white-space:normal}.lesson-clock__chrome{gap:.4rem .55rem}.lesson-clock__clock{margin-left:auto}}
    @media(max-width:650px){.lesson-clock__body{grid-template-columns:1fr;gap:.7rem}.lesson-clock__controls{justify-content:flex-start}.lesson-clock__description{display:block}.lesson-clock__chrome{padding:.4rem .65rem}.lesson-clock__tag{flex:1 1 100%}.lesson-clock__clock{order:1;margin-left:0}.lesson-clock__time-label{margin-left:auto}.lesson-clock__time{min-width:4.5rem;font-size:1.5rem}.lesson-clock__clock-label{display:none}.lesson-clock__settings summary{padding:.3rem .45rem;font-size:.8rem;white-space:nowrap}.lesson-clock__settings-panel{right:0;max-width:calc(100vw - 2rem)}}
    @media print{.lesson-clock{position:static;margin:0 0 .6rem;border-color:#888;background:#fff;color:#111;box-shadow:none}.lesson-clock__tag,.lesson-clock__time-label,.lesson-clock__title,.lesson-clock__now{color:#111}.lesson-clock__number,.lesson-clock__description,.lesson-clock__zone{color:#333}.lesson-clock__controls,.lesson-clock__progress,.lesson-clock__settings{display:none}}
    @media(prefers-reduced-motion:reduce){.lesson-clock__progress-value{transition:none}}
  `;
  document.head.append(style);

  const bar = document.createElement("section");
  bar.className = "lesson-clock";
  bar.setAttribute("aria-label", "Časovač vyučovacej hodiny a názov prednášky");

  const chrome = document.createElement("div");
  chrome.className = "lesson-clock__chrome";
  const lights = document.createElement("span");
  lights.className = "lesson-clock__lights";
  lights.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 3; i += 1) {
    const light = document.createElement("span");
    light.className = "lesson-clock__light";
    lights.append(light);
  }
  const tag = document.createElement("span");
  tag.className = "lesson-clock__tag";
  tag.textContent = "Prednáška · čas hodiny";
  const spacer = document.createElement("span");
  spacer.className = "lesson-clock__chrome-spacer";
  const timeLabel = document.createElement("span");
  timeLabel.className = "lesson-clock__time-label";
  timeLabel.textContent = "Zostávajúci čas";
  const time = document.createElement("strong");
  time.className = "lesson-clock__time";
  time.setAttribute("aria-label", "Zostávajúci čas vyučovacej hodiny");
  const currentClock = document.createElement("div");
  currentClock.className = "lesson-clock__clock";
  const currentClockLabel = document.createElement("span");
  currentClockLabel.className = "lesson-clock__clock-label";
  currentClockLabel.textContent = "Aktuálny čas";
  const currentClockTime = document.createElement("strong");
  currentClockTime.className = "lesson-clock__now";
  currentClockTime.setAttribute("aria-label", "Aktuálny čas vo vybranom UTC pásme");
  const currentDate = document.createElement("span");
  currentDate.className = "lesson-clock__date";
  currentDate.setAttribute("aria-label", "Dnešný dátum vo vybranom UTC pásme");
  const zoneLabel = document.createElement("span");
  zoneLabel.className = "lesson-clock__zone";
  const settings = document.createElement("details");
  settings.className = "lesson-clock__settings";
  const settingsSummary = document.createElement("summary");
  settingsSummary.textContent = "Nastavenia";
  const settingsPanel = document.createElement("div");
  settingsPanel.className = "lesson-clock__settings-panel";
  const zoneLabelForSelect = document.createElement("label");
  zoneLabelForSelect.textContent = "Časové pásmo (UTC posun)";
  const zoneSelect = document.createElement("select");
  zoneSelect.className = "lesson-clock__zone-select";
  zoneSelect.setAttribute("aria-label", "Vyber UTC časové pásmo");
  utcOffsets.forEach((offset) => {
    const option = document.createElement("option");
    option.value = String(offset);
    option.textContent = formatOffset(offset);
    zoneSelect.append(option);
  });
  zoneSelect.value = String(utcOffset);
  zoneLabelForSelect.append(zoneSelect);
  const settingsHint = document.createElement("p");
  settingsHint.textContent = "Čas aj dátum sa zobrazia vo zvolenom UTC posune, ktorý sa uloží pre lekcie Pythonu a Win32 API.";
  settingsPanel.append(zoneLabelForSelect, settingsHint);
  settings.append(settingsSummary, settingsPanel);
  currentClock.append(currentClockLabel, currentClockTime, currentDate, zoneLabel);
  zoneLabel.textContent = formatOffset(utcOffset);
  chrome.append(lights, tag, spacer, currentClock, timeLabel, time, settings);

  const body = document.createElement("div");
  body.className = "lesson-clock__body";
  const info = document.createElement("div");
  info.className = "lesson-clock__info";
  const eyebrow = document.createElement("div");
  eyebrow.className = "lesson-clock__eyebrow";
  const number = document.createElement("span");
  number.className = "lesson-clock__number";
  number.textContent = lessonLabel;
  const stateBadge = document.createElement("span");
  stateBadge.className = "lesson-clock__state";
  stateBadge.textContent = "Pripravená";
  stateBadge.dataset.state = "ready";
  stateBadge.setAttribute("aria-live", "polite");
  eyebrow.append(number, stateBadge);
  const title = document.createElement("strong");
  title.className = "lesson-clock__title";
  title.textContent = headingText;
  const description = document.createElement("p");
  description.className = "lesson-clock__description";
  description.textContent = descriptionText || "Vyučovacia hodina · 45 minút";
  info.append(eyebrow, title, description);

  const controls = document.createElement("div");
  controls.className = "lesson-clock__controls";
  const start = document.createElement("button");
  start.className = "lesson-clock__button";
  start.type = "button";
  start.textContent = "Spustiť hodinu";
  start.setAttribute("aria-label", "Spustiť alebo pokračovať v odpočte 45 minút");
  const pause = document.createElement("button");
  pause.className = "lesson-clock__button";
  pause.type = "button";
  pause.textContent = "Pozastaviť hodinu";
  pause.disabled = true;
  pause.setAttribute("aria-label", "Pozastaviť hodinu");
  const reset = document.createElement("button");
  reset.className = "lesson-clock__button";
  reset.type = "button";
  reset.textContent = "Vynulovať čas";
  reset.setAttribute("aria-label", "Vynulovať odpočet na 45 minút");
  controls.append(start, pause, reset);
  body.append(info, controls);

  const progress = document.createElement("div");
  progress.className = "lesson-clock__progress";
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", "Priebeh vyučovacej hodiny");
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  const progressValue = document.createElement("div");
  progressValue.className = "lesson-clock__progress-value";
  progress.append(progressValue);
  const status = document.createElement("span");
  status.className = "lesson-clock__status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = "Časovač pripravený. Odpočet sa spustí po stlačení tlačidla.";
  bar.append(chrome, body, progress, status);
  main.insertBefore(bar, main.firstChild);

  const total = 45 * 60 * 1000;
  let remaining = total;
  let endAt = 0;
  let interval = 0;

  function setState(label, value) {
    stateBadge.textContent = label;
    stateBadge.dataset.state = value;
  }

  function renderControls() {
    start.disabled = Boolean(interval);
    pause.disabled = !interval;
    start.textContent = remaining === total ? "Spustiť hodinu" : remaining === 0 ? "Spustiť znova" : "Pokračovať";
  }

  function renderCurrentTime() {
    const shifted = new Date(Date.now() + utcOffset * 60 * 1000);
    const two = (value) => String(value).padStart(2, "0");
    currentClockTime.textContent = `${two(shifted.getUTCHours())}:${two(shifted.getUTCMinutes())}:${two(shifted.getUTCSeconds())}`;
    currentClockTime.setAttribute("aria-label", `Aktuálny čas ${formatOffset(utcOffset)} ${currentClockTime.textContent}`);
    currentDate.textContent = new Intl.DateTimeFormat("sk-SK", {day:"2-digit", month:"2-digit", year:"numeric", timeZone:"UTC"}).format(shifted);
    currentDate.setAttribute("aria-label", `Dnešný dátum ${formatOffset(utcOffset)} ${currentDate.textContent}`);
    zoneLabel.textContent = formatOffset(utcOffset);
  }

  zoneSelect.addEventListener("change", () => {
    utcOffset = Number(zoneSelect.value);
    try {
      window.localStorage.setItem(offsetStorageKey, String(utcOffset));
    } catch (_) {
      // Keep the selection for this page even if it cannot be persisted.
    }
    renderCurrentTime();
  });

  function render() {
    const seconds = Math.ceil(remaining / 1000);
    const minutesText = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secondsText = String(seconds % 60).padStart(2, "0");
    time.textContent = `${minutesText}:${secondsText}`;
    const percent = Math.min(100, Math.max(0, ((total - remaining) / total) * 100));
    progressValue.style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(Math.floor(percent)));
  }

  function stop() {
    window.clearInterval(interval);
    interval = 0;
  }

  function tick() {
    remaining = Math.max(0, endAt - Date.now());
    render();
    if (remaining === 0) {
      stop();
      renderControls();
      setState("Ukončená", "finished");
      status.textContent = "Čas 45-minútovej hodiny uplynul.";
    }
  }

  start.addEventListener("click", () => {
    if (interval) return;
    if (remaining === 0) remaining = total;
    endAt = Date.now() + remaining;
    interval = window.setInterval(tick, 250);
    renderControls();
    setState("Prebieha", "running");
    status.textContent = "Odpočet hodiny prebieha.";
    tick();
  });

  pause.addEventListener("click", () => {
    if (!interval) return;
    tick();
    if (remaining === 0) return;
    stop();
    renderControls();
    setState("Pozastavená", "paused");
    if (remaining > 0) status.textContent = "Odpočet hodiny je pozastavený.";
  });

  reset.addEventListener("click", () => {
    stop();
    remaining = total;
    renderControls();
    setState("Pripravená", "ready");
    status.textContent = "Časovač vynulovaný na 45 minút.";
    render();
  });

  render();
  renderCurrentTime();
  window.setInterval(renderCurrentTime, 1000);
})();
