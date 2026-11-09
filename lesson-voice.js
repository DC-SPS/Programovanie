(() => {
  "use strict";

  if (document.documentElement.dataset.lessonVoiceReady === "true") return;
  document.documentElement.dataset.lessonVoiceReady = "true";

  const main = document.querySelector("main, .wrap, .w");
  const title = main?.querySelector("h1");
  const lessonPath = decodeURIComponent(location.pathname).toLowerCase();
  const numberedLesson = /^\s*(?:\d+(?:\.\d+)*(?:\s|[.:–-])|hodina\s+\d+)/i.test(title?.textContent || "");
  if (!main || !title || !numberedLesson || /(?:^|\/)(?:index|struktura)\.html$/.test(lessonPath)) return;
  if (document.querySelector(".narration-controls")) return;

  const speech = window.speechSynthesis;
  const supported = Boolean(speech && window.SpeechSynthesisUtterance);
  const panel = document.querySelector(".lesson-side-panel") || document.createElement("aside");
  panel.classList.add("lesson-side-panel");
  panel.setAttribute("aria-label", "Ovládanie hlasového čítania prednášky");
  if (!panel.isConnected) document.body.append(panel);
  document.body.classList.add("lesson-voice-page");

  const style = document.createElement("style");
  style.textContent = `
    .lesson-side-panel.lesson-voice-panel{position:fixed;top:1rem;right:1rem;z-index:1100;width:min(19rem,calc(100vw - 2rem));max-height:calc(100vh - 2rem);overflow:auto;padding:.55rem;border:1px solid var(--line,var(--border,#2d4058));border-radius:.8rem;background:var(--bg,var(--surface,#172235));color:var(--fg,var(--text,#edf4ff));box-shadow:0 12px 38px #0005}
    body.lesson-voice-page main,body.lesson-voice-page .wrap,body.lesson-voice-page .w{margin-right:21rem}
    .lesson-voice-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem;padding:.65rem;border:1px solid var(--line,var(--border,#2d4058));border-radius:.7rem;background:var(--card,var(--surface,#1a2638));font:600 .84rem/1.35 system-ui,"Segoe UI",sans-serif}
    .lesson-voice-controls button,.lesson-voice-controls select{width:100%;min-width:0;min-height:44px;padding:.45rem .55rem;border:1px solid var(--line,var(--border,#34475b));border-radius:.5rem;background:var(--card,var(--surface,#202c3e));color:inherit;font:inherit;cursor:pointer}
    .lesson-voice-controls [data-voice-action="play"]{background:#559cf5;border-color:#559cf5;color:#fff}
    .lesson-voice-controls button:disabled{opacity:.55;cursor:not-allowed}
    .lesson-voice-controls button:focus-visible,.lesson-voice-controls select:focus-visible,.lesson-voice-controls summary:focus-visible{outline:3px solid #7dc4ff;outline-offset:2px}
    .lesson-voice-settings{grid-column:1/-1;border-top:1px solid var(--line,var(--border,#34475b));padding-top:.35rem}
    .lesson-voice-settings summary{padding:.3rem .1rem;color:var(--mut,var(--muted,#a8b8ca));font-size:.78rem;cursor:pointer}
    .lesson-voice-settings[open]{display:grid;gap:.45rem}
    .lesson-voice-settings label{display:grid;gap:.25rem;font-size:.78rem}
    .lesson-voice-status{grid-column:1/-1;margin:0;color:var(--mut,var(--muted,#a8b8ca));font-size:.76rem}
    .lesson-voice-status:empty{display:none}
    @media(max-width:768px){.lesson-side-panel.lesson-voice-panel{position:sticky;top:0;right:auto;width:auto;max-height:32vh;margin:0;border-radius:0 0 .75rem .75rem}body.lesson-voice-page main,body.lesson-voice-page .wrap,body.lesson-voice-page .w{margin-right:auto}}
    @media print{.lesson-side-panel.lesson-voice-panel{display:none!important}}
  `;
  document.head.append(style);
  panel.classList.add("lesson-voice-panel");

  const controls = document.createElement("section");
  controls.className = "lesson-voice-controls";
  controls.setAttribute("aria-label", "Čítanie prednášky");
  controls.innerHTML = `
    <button type="button" data-voice-action="play" aria-label="Prehrať prednášku">▶ Prehrať</button>
    <button type="button" data-voice-action="stop" aria-label="Zastaviť čítanie" disabled>■ Zastaviť</button>
    <button type="button" data-voice-action="pause" aria-label="Pozastaviť čítanie" disabled>⏸ Pozastaviť</button>
    <button type="button" data-voice-action="replay" aria-label="Prehrať prednášku znova" disabled>↻ Prehrať znova</button>
    <details class="lesson-voice-settings"><summary>Nastavenia hlasu</summary>
      <label>Rýchlosť čítania<select data-voice-rate aria-label="Rýchlosť hlasového čítania"><option value="0.75">0,75×</option><option value="1" selected>1× – normálna</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label>
      <label>Hlas<select data-voice-select aria-label="Vyberte hlas na čítanie"><option value="">Automaticky – slovenský hlas</option></select></label>
      <label>Hlasitosť čítania <output data-voice-volume-value>100 %</output><input data-voice-volume type="range" min="0" max="100" step="5" value="100" aria-label="Hlasitosť hlasového čítania"></label>
    </details>
    <p class="lesson-voice-status" role="status" aria-live="polite"></p>`;
  panel.prepend(controls);

  const $ = (selector) => controls.querySelector(selector);
  const playButton = $('[data-voice-action="play"]');
  const stopButton = $('[data-voice-action="stop"]');
  const pauseButton = $('[data-voice-action="pause"]');
  const replayButton = $('[data-voice-action="replay"]');
  const rateSelect = $(`[data-voice-rate]`);
  const voiceSelect = $(`[data-voice-select]`);
  const volumeInput = $(`[data-voice-volume]`);
  const status = $(`.lesson-voice-status`);
  const rateKey = "lesson-narration.playback-rate.v2";
  const voiceKey = "lesson-narration.voice";
  const volumeKey = "lesson-narration.volume";
  let voices = [];
  let queue = [];
  let lastQueue = [];
  let paused = false;
  let token = 0;
  if (!supported) status.textContent = "Tento prehliadač nepodporuje hlasové čítanie.";

  try {
    const rate = localStorage.getItem(rateKey);
    if ([...rateSelect.options].some((option) => option.value === rate)) rateSelect.value = rate;
    volumeInput.value = String(Math.max(0, Math.min(100, Number(localStorage.getItem(volumeKey) ?? 100))));
  } catch (_) { /* Predvolené hodnoty fungujú aj bez úložiska. */ }
  $('[data-voice-volume-value]').textContent = `${volumeInput.value} %`;

  const populateVoices = () => {
    if (!supported) return;
    const saved = (() => { try { return localStorage.getItem(voiceKey) || ""; } catch (_) { return ""; } })();
    voices = speech.getVoices().sort((left, right) => Number(!left.lang.toLowerCase().startsWith("sk")) - Number(!right.lang.toLowerCase().startsWith("sk")) || left.lang.localeCompare(right.lang) || left.name.localeCompare(right.name));
    voiceSelect.replaceChildren(new Option("Automaticky – slovenský hlas", ""));
    voices.forEach((voice) => voiceSelect.add(new Option(`${voice.name} (${voice.lang})`, voice.voiceURI)));
    voiceSelect.value = voices.some((voice) => voice.voiceURI === saved) ? saved : "";
  };
  populateVoices();
  speech?.addEventListener("voiceschanged", populateVoices);

  const textBlocks = () => [...main.querySelectorAll("h2,h3,p,li,td,th,pre")]
    .filter((node) => !node.closest("header,footer,nav,.lesson-clock,.lesson-side-panel,.lesson-export-sections,.sources,.teacher-note,.note,.safety-notice,[aria-hidden='true']"))
    .map((node) => node.innerText.trim())
    .filter((text) => text.length > 0);

  const render = () => {
    const reading = supported && speech.speaking;
    playButton.disabled = !supported || reading;
    stopButton.disabled = !reading && !paused;
    pauseButton.disabled = !reading && !paused;
    pauseButton.textContent = paused ? "▶ Pokračovať" : "⏸ Pozastaviť";
    pauseButton.setAttribute("aria-label", paused ? "Pokračovať v čítaní" : "Pozastaviť čítanie");
    replayButton.disabled = !supported || lastQueue.length === 0;
  };

  const speakNext = (run) => {
    if (run !== token) return;
    const text = queue.shift();
    if (!text) {
      paused = false;
      render();
      status.textContent = "Prednáška bola prečítaná.";
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const selected = voices.find((voice) => voice.voiceURI === voiceSelect.value) || voices.find((voice) => voice.lang.toLowerCase().startsWith("sk"));
    utterance.lang = selected?.lang || "sk-SK";
    utterance.voice = selected || null;
    utterance.rate = Number(rateSelect.value);
    utterance.volume = Number(volumeInput.value) / 100;
    utterance.onstart = () => { if (run === token) render(); };
    utterance.onend = () => { if (run === token) speakNext(run); };
    utterance.onerror = (event) => {
      if (run !== token || ["canceled", "interrupted"].includes(event.error)) return;
      paused = false;
      render();
      status.textContent = "Čítanie sa nepodarilo spustiť. Skontrolujte hlasové výstupy prehliadača.";
    };
    speech.speak(utterance);
  };
  const start = (items) => {
    if (!supported) { status.textContent = "Tento prehliadač nepodporuje hlasové čítanie."; return; }
    token += 1;
    speech.cancel();
    queue = [...items];
    lastQueue = [...items];
    paused = false;
    status.textContent = "Čítanie sa spúšťa.";
    render();
    speakNext(token);
  };

  playButton.addEventListener("click", () => start(textBlocks()));
  stopButton.addEventListener("click", () => {
    token += 1;
    queue = [];
    paused = false;
    speech.cancel();
    status.textContent = "Čítanie je zastavené.";
    render();
  });
  pauseButton.addEventListener("click", () => {
    if (paused) { speech.resume(); paused = false; status.textContent = "Čítanie pokračuje."; }
    else if (speech.speaking) { speech.pause(); paused = true; status.textContent = "Čítanie je pozastavené."; }
    render();
  });
  replayButton.addEventListener("click", () => start(lastQueue));
  rateSelect.addEventListener("change", () => { try { localStorage.setItem(rateKey, rateSelect.value); } catch (_) {} });
  voiceSelect.addEventListener("change", () => { try { localStorage.setItem(voiceKey, voiceSelect.value); } catch (_) {} });
  volumeInput.addEventListener("input", () => { $('[data-voice-volume-value]').textContent = `${volumeInput.value} %`; });
  volumeInput.addEventListener("change", () => { try { localStorage.setItem(volumeKey, volumeInput.value); } catch (_) {} });
  window.addEventListener("beforeunload", () => { token += 1; speech?.cancel(); }, { once: true });
  render();
})();
