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
    .lesson-voice-controls{order:3;display:grid;gap:.75rem;padding:1rem 0;border-top:1px solid var(--line,var(--border,#d9dee7));color:var(--fg,var(--text,#182230));font:400 .9rem/1.4 system-ui,"Segoe UI",sans-serif}
    .lesson-voice-controls__heading{margin:0;font-size:1rem;line-height:1.3}
    .lesson-voice-controls__actions{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
    .lesson-voice-controls button,.lesson-voice-controls select{width:100%;min-width:0;min-height:44px;padding:.55rem .75rem;border:1px solid var(--line,var(--border,#cbd4df));border-radius:.5rem;background:var(--surface,var(--bg,#fff));color:inherit;font:650 .9rem/1.2 system-ui,"Segoe UI",sans-serif;cursor:pointer}
    .lesson-voice-controls [data-voice-action="play"]{grid-column:1/-1;border-color:#1d70c9;background:#1d70c9;color:#fff}
    .lesson-voice-controls button:disabled{opacity:.55;cursor:not-allowed}
    .lesson-voice-controls button:focus-visible,.lesson-voice-controls select:focus-visible,.lesson-voice-controls summary:focus-visible{outline:3px solid #1d70c9;outline-offset:2px}
    .lesson-voice-settings{border-top:1px solid var(--line,var(--border,#d9dee7));padding-top:.5rem}
    .lesson-voice-settings summary{min-height:44px;display:flex;align-items:center;color:var(--mut,var(--muted,#536176));font-size:.875rem;font-weight:600;cursor:pointer}
    .lesson-voice-settings[open]{display:grid;gap:.65rem}
    .lesson-voice-settings label{display:grid;gap:.3rem;font-size:.875rem}
    .lesson-voice-settings input{min-height:44px;accent-color:#1d70c9}
    .lesson-voice-status{margin:0;color:var(--mut,var(--muted,#536176));font-size:.875rem}
    .lesson-voice-status:empty{display:none}
    @media print{.lesson-voice-controls{display:none!important}}
  `;
  document.head.append(style);
  panel.classList.add("lesson-voice-panel");

  const controls = document.createElement("section");
  controls.className = "lesson-voice-controls";
  controls.setAttribute("aria-label", "Čítanie nahlas");
  controls.innerHTML = `
    <h2 class="lesson-voice-controls__heading">Čítanie nahlas</h2>
    <div class="lesson-voice-controls__actions">
      <button type="button" data-voice-action="play" aria-label="Prehrať prednášku" aria-pressed="false">Prehrať</button>
      <button type="button" data-voice-action="stop" aria-label="Zastaviť čítanie" disabled>Zastaviť</button>
      <button type="button" data-voice-action="replay" aria-label="Prehrať prednášku od začiatku" disabled>Prehrať od začiatku</button>
    </div>
    <details class="lesson-voice-settings"><summary>Nastavenia hlasu</summary>
      <label>Rýchlosť čítania<select data-voice-rate aria-label="Rýchlosť hlasového čítania"><option value="0.75">0,75×</option><option value="1" selected>1× – normálna</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label>
      <label>Hlas<select data-voice-select aria-label="Vyberte hlas na čítanie"><option value="">Automaticky – slovenský hlas</option></select></label>
      <label>Hlasitosť čítania <output data-voice-volume-value>100 %</output><input data-voice-volume type="range" min="0" max="100" step="5" value="100" aria-label="Hlasitosť hlasového čítania"></label>
    </details>
    <p class="lesson-voice-status" role="status" aria-live="polite">Čítanie je pripravené.</p>`;
  panel.prepend(controls);

  const $ = (selector) => controls.querySelector(selector);
  const playButton = $('[data-voice-action="play"]');
  const stopButton = $('[data-voice-action="stop"]');
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
  let activeBlock = 0;
  let activeStart = 0;
  let highlightedBlock = -1;
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

  const narrationNodes = [...main.querySelectorAll("h2,h3,p,li,td,th,pre")]
    .filter((node) => !node.closest("header,footer,nav,.lesson-clock,.lesson-side-panel,.lesson-export-sections,.sources,.teacher-note,.note,.safety-notice,[aria-hidden='true']"))
    .filter((node) => node.innerText.trim().length > 0);
  const textBlocks = () => narrationNodes.map((node) => node.innerText.trim());
  const emitReadingState = (isReading, isPaused = false) => {
    const currentNode = narrationNodes[activeBlock];
    const headings = [...main.querySelectorAll("h2")].filter((heading) => !heading.closest(".sources,footer"));
    let section = 0;
    headings.forEach((heading, index) => { if (heading.compareDocumentPosition(currentNode) & Node.DOCUMENT_POSITION_FOLLOWING) section = index; });
    window.dispatchEvent(new CustomEvent("lesson-reading-state", { detail: { isReading, isPaused, section, block: activeBlock, chunk: 0 } }));
  };

  const render = () => {
    const reading = supported && speech.speaking;
    playButton.disabled = !supported;
    stopButton.disabled = !reading && !paused;
    playButton.textContent = paused ? "Pokračovať" : reading ? "Pozastaviť" : "Prehrať";
    playButton.setAttribute("aria-label", paused ? "Pokračovať v čítaní prednášky" : reading ? "Pozastaviť čítanie prednášky" : "Prehrať prednášku nahlas");
    playButton.setAttribute("aria-pressed", String(Boolean(reading && !paused)));
    replayButton.disabled = !supported || lastQueue.length === 0;
  };

  const speakNext = (run) => {
    if (run !== token) return;
    const text = queue.shift();
    if (!text) {
      paused = false;
      render();
      status.textContent = "Prednáška bola prečítaná.";
      emitReadingState(false);
      return;
    }
    activeBlock = activeStart + Math.max(0, lastQueue.length - queue.length - 1);
    const utterance = new SpeechSynthesisUtterance(text);
    const selected = voices.find((voice) => voice.voiceURI === voiceSelect.value) || voices.find((voice) => voice.lang.toLowerCase().startsWith("sk"));
    utterance.lang = selected?.lang || "sk-SK";
    utterance.voice = selected || null;
    utterance.rate = Number(rateSelect.value);
    utterance.volume = Number(volumeInput.value) / 100;
    utterance.onstart = () => { if (run === token) { render(); emitReadingState(true, paused); } };
    utterance.onend = () => { if (run === token) speakNext(run); };
    utterance.onerror = (event) => {
      if (run !== token || ["canceled", "interrupted"].includes(event.error)) return;
      paused = false;
      render();
      status.textContent = "Čítanie sa nepodarilo spustiť. Skontrolujte hlasové výstupy prehliadača.";
    };
    speech.speak(utterance);
  };
  const start = (items, startIndex = 0) => {
    if (!supported) { status.textContent = "Tento prehliadač nepodporuje hlasové čítanie."; return; }
    token += 1;
    speech.cancel();
    queue = [...items];
    lastQueue = [...items];
    activeStart = Math.max(0, Number(startIndex) || 0);
    activeBlock = activeStart;
    paused = false;
    status.textContent = "Čítanie sa spúšťa.";
    render();
    speakNext(token);
  };

  playButton.addEventListener("click", () => {
    if (paused) { speech.resume(); paused = false; status.textContent = "Čítanie pokračuje."; emitReadingState(true, false); }
    else if (speech?.speaking) { speech.pause(); paused = true; status.textContent = "Čítanie je pozastavené."; emitReadingState(true, true); }
    else start(textBlocks());
    render();
  });
  stopButton.addEventListener("click", () => {
    token += 1;
    queue = [];
    paused = false;
    speech.cancel();
    status.textContent = "Čítanie je zastavené.";
    render();
    emitReadingState(false);
  });
  replayButton.addEventListener("click", () => start(textBlocks()));
  rateSelect.addEventListener("change", () => { try { localStorage.setItem(rateKey, rateSelect.value); } catch (_) {} });
  voiceSelect.addEventListener("change", () => { try { localStorage.setItem(voiceKey, voiceSelect.value); } catch (_) {} });
  volumeInput.addEventListener("input", () => { $('[data-voice-volume-value]').textContent = `${volumeInput.value} %`; });
  volumeInput.addEventListener("change", () => { try { localStorage.setItem(volumeKey, volumeInput.value); } catch (_) {} });
  window.addEventListener("beforeunload", () => { token += 1; speech?.cancel(); }, { once: true });
  window.lessonSpeechRemote = Object.freeze({
    play: () => playButton.click(),
    pauseResume: () => playButton.click(),
    pause: () => { if (speech?.speaking && !paused) playButton.click(); },
    resume: () => { if (paused) playButton.click(); },
    stop: () => stopButton.click(),
    replay: () => replayButton.click(),
    restartLesson: () => start(textBlocks()),
    playFrom: (block = 0) => {
      const startIndex = Math.max(0, Number(block) || 0);
      start(textBlocks().slice(startIndex), startIndex);
    },
    getBlockCount: () => narrationNodes.length,
    getSectionStart: (sectionIndex) => {
      const headings = [...main.querySelectorAll("h2")].filter((heading) => !heading.closest(".sources,footer"));
      const heading = headings[sectionIndex];
      return Math.max(0, narrationNodes.indexOf(heading));
    },
    highlightBlock: (blockIndex) => {
      if (highlightedBlock >= 0) narrationNodes[highlightedBlock]?.removeAttribute("data-reading-target");
      highlightedBlock = Math.max(0, Math.min(narrationNodes.length - 1, Number(blockIndex) || 0));
      narrationNodes[highlightedBlock]?.setAttribute("data-reading-target", "true");
    },
    getState: () => ({ isReading: Boolean(speech?.speaking || paused), isPaused: paused, block: activeBlock, chunk: 0 }),
  });
  render();
})();
