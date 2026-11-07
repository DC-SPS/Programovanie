(() => {
  "use strict";

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
    .lesson-clock{position:sticky;top:0;z-index:1000;margin:0 0 1.25rem;border:1px solid #2b5674;border-radius:0 0 .9rem .9rem;overflow:visible;background:rgba(7,20,32,.97);box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(12px);color:#edf6ff;font:14px/1.4 system-ui,"Segoe UI",sans-serif}
    .lesson-clock__chrome{position:relative;display:flex;align-items:center;gap:.55rem;min-height:2.1rem;padding:.35rem .8rem;background:linear-gradient(90deg,#123b57,#0c263b);border-radius:0 0 0 0;border-bottom:1px solid #25415a}
    .lesson-clock__lights{display:flex;gap:.28rem;margin-right:.3rem}.lesson-clock__light{width:.55rem;height:.55rem;border-radius:50%;background:#38bdf8}.lesson-clock__light:nth-child(2){background:#60a5fa}.lesson-clock__light:nth-child(3){background:#86efac}
    .lesson-clock__tag{font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#bae6fd}
    .lesson-clock__chrome-spacer{flex:1}
    .lesson-clock__time-label{font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#a8bdcf}
    .lesson-clock__time{min-width:4.6rem;text-align:center;font:800 1.05rem/1.2 Consolas,"Cascadia Code",monospace;color:#fff}
    .lesson-clock__clock{display:flex;align-items:baseline;gap:.45rem;padding-left:.6rem;border-left:1px solid #38617c}.lesson-clock__clock-label,.lesson-clock__zone{font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#a8bdcf}.lesson-clock__now{min-width:4.6rem;text-align:center;font:800 1rem/1.2 Consolas,"Cascadia Code",monospace;color:#fff;font-variant-numeric:tabular-nums}.lesson-clock__date{font-size:.74rem;color:#d8ecff;font-variant-numeric:tabular-nums;white-space:nowrap}
    .lesson-clock__settings{position:relative;flex:none;margin-left:.2rem}.lesson-clock__settings summary{list-style:none;padding:.35rem .55rem;border:1px solid #32617e;border-radius:.5rem;color:#e6f6ff;font-size:.75rem;font-weight:700;cursor:pointer}.lesson-clock__settings summary::-webkit-details-marker{display:none}.lesson-clock__settings summary:focus-visible,.lesson-clock__zone-select:focus-visible{outline:3px solid #fde047;outline-offset:2px}.lesson-clock__settings summary:hover{background:#164766}.lesson-clock__settings-panel{position:absolute;right:0;top:calc(100% + .45rem);z-index:5;width:min(18rem,calc(100vw - 2rem));padding:.85rem;border:1px solid #32617e;border-radius:.7rem;background:#0a1928;box-shadow:0 12px 30px rgba(0,0,0,.45)}.lesson-clock__settings-panel label{display:block;margin-bottom:.4rem;color:#bae6fd;font-size:.8rem;font-weight:700}.lesson-clock__settings-panel p{margin:.45rem 0 0;color:#a8bdcf;font-size:.72rem}.lesson-clock__zone-select{width:100%;padding:.5rem;border:1px solid #32617e;border-radius:.45rem;background:#102234;color:#edf6ff;font:inherit}
    .lesson-clock__body{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:1rem;padding:.7rem .9rem .65rem}
    .lesson-clock__info{min-width:0}.lesson-clock__number{display:block;margin-bottom:.14rem;font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#7dd3fc}
    .lesson-clock__title{display:block;overflow:hidden;text-overflow:ellipsis;font-size:1.02rem;line-height:1.25;font-weight:800;color:#f1f8ff}
    .lesson-clock__description{margin:.2rem 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#b8cbd9;font-size:.84rem}
    .lesson-clock__controls{display:flex;align-items:center;gap:.4rem;flex:none}.lesson-clock__button{min-height:2.2rem;padding:.42rem .72rem;border:1px solid #32617e;border-radius:.55rem;background:#12334b;color:#e6f6ff;font:700 .82rem system-ui,"Segoe UI",sans-serif;cursor:pointer}.lesson-clock__button:hover:not(:disabled){background:#164766;border-color:#38bdf8}.lesson-clock__button:disabled{opacity:.5;cursor:not-allowed}.lesson-clock__button:focus-visible{outline:3px solid #fde047;outline-offset:2px}
    .lesson-clock__progress{height:4px;background:#142b3d}.lesson-clock__progress-value{height:100%;width:0;background:linear-gradient(90deg,#0ea5e9,#86efac);transition:width .2s linear}
    .lesson-clock__status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(max-width:800px){.lesson-clock__chrome{flex-wrap:wrap;gap:.35rem}.lesson-clock__clock{margin-left:auto}.lesson-clock__time-label{display:none}}
    @media(max-width:650px){.lesson-clock__body{grid-template-columns:1fr;gap:.55rem}.lesson-clock__controls{justify-content:flex-start}.lesson-clock__description{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.lesson-clock__chrome{gap:.4rem}.lesson-clock__clock{gap:.3rem;padding-left:.4rem}.lesson-clock__clock-label{display:none}.lesson-clock__now{min-width:4rem}.lesson-clock__zone{font-size:.58rem}.lesson-clock__date{font-size:.68rem}.lesson-clock__settings summary{padding:.25rem .35rem;font-size:.68rem;white-space:nowrap}.lesson-clock__settings-panel{right:0;max-width:calc(100vw - 2rem)}}
    @media(max-width:650px){.lesson-side-panel .lesson-clock__chrome{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.3rem;min-width:0;padding:.35rem .45rem}.lesson-side-panel .lesson-clock__lights{grid-column:1;gap:.16rem;margin:0}.lesson-side-panel .lesson-clock__clock{grid-column:2;justify-content:flex-end;gap:.2rem;min-width:0;margin:0;padding-left:.25rem}.lesson-side-panel .lesson-clock__now{min-width:3.5rem;font-size:.82rem}.lesson-side-panel .lesson-clock__zone{font-size:.5rem}.lesson-side-panel .lesson-clock__settings{grid-column:3;min-width:0;margin:0}.lesson-side-panel .lesson-clock__settings summary{padding:.22rem .28rem;font-size:.62rem;white-space:nowrap}}
    @media print{.lesson-clock{position:static;margin:0 0 .6rem;border-color:#888;background:#fff;color:#111;box-shadow:none;backdrop-filter:none}.lesson-clock__chrome{background:#eee;color:#111}.lesson-clock__tag,.lesson-clock__time-label,.lesson-clock__title,.lesson-clock__now{color:#111}.lesson-clock__number,.lesson-clock__description,.lesson-clock__zone{color:#333}.lesson-clock__controls,.lesson-clock__progress,.lesson-clock__settings{display:none}}
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
  const number = document.createElement("span");
  number.className = "lesson-clock__number";
  number.textContent = lessonLabel;
  const title = document.createElement("strong");
  title.className = "lesson-clock__title";
  title.textContent = headingText;
  const description = document.createElement("p");
  description.className = "lesson-clock__description";
  description.textContent = descriptionText || "Vyučovacia hodina · 45 minút";
  info.append(number, title, description);

  const controls = document.createElement("div");
  controls.className = "lesson-clock__controls";
  const start = document.createElement("button");
  start.className = "lesson-clock__button";
  start.type = "button";
  start.textContent = "Spustiť";
  start.setAttribute("aria-label", "Spustiť alebo pokračovať v odpočte 45 minút");
  const pause = document.createElement("button");
  pause.className = "lesson-clock__button";
  pause.type = "button";
  pause.textContent = "Pozastaviť";
  pause.disabled = true;
  pause.setAttribute("aria-label", "Pozastaviť odpočet hodiny");
  const reset = document.createElement("button");
  reset.className = "lesson-clock__button";
  reset.type = "button";
  reset.textContent = "Vynulovať";
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
      start.disabled = false;
      start.textContent = "Spustiť znova";
      pause.disabled = true;
      status.textContent = "Čas 45-minútovej hodiny uplynul.";
    }
  }

  start.addEventListener("click", () => {
    if (interval) return;
    if (remaining === 0) remaining = total;
    endAt = Date.now() + remaining;
    start.disabled = true;
    pause.disabled = false;
    start.textContent = "Prebieha";
    status.textContent = "Odpočet hodiny prebieha.";
    tick();
    interval = window.setInterval(tick, 250);
  });

  pause.addEventListener("click", () => {
    if (!interval) return;
    tick();
    if (remaining === 0) return;
    stop();
    start.disabled = false;
    start.textContent = "Pokračovať";
    pause.disabled = true;
    if (remaining > 0) status.textContent = "Odpočet hodiny je pozastavený.";
  });

  reset.addEventListener("click", () => {
    stop();
    remaining = total;
    start.disabled = false;
    start.textContent = "Spustiť";
    pause.disabled = true;
    status.textContent = "Časovač vynulovaný na 45 minút.";
    render();
  });

  render();
  renderCurrentTime();
  window.setInterval(renderCurrentTime, 1000);
})();
