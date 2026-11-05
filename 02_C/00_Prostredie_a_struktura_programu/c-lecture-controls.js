(() => {
  const panel = document.querySelector(".lesson-side-panel");
  const main = document.querySelector("main");
  if (!panel || !main) return;

  const selectors = ["main h2", "main h3", "main p", "main .card", "main .teacher-note", "main .safety-notice", "main table"];
  main.querySelectorAll(selectors.join(",")).forEach((block, index) => {
    if (block.closest(".sources, footer") || block.matches(".copy-status")) return;
    if (block.closest(".card, .teacher-note, .safety-notice") && !block.matches(".card, .teacher-note, .safety-notice")) return;
    block.dataset.readAloud = "selected";
    block.classList.add("narration-target");
    block.id ||= `narration-block-${index + 1}`;
    const row = document.createElement("label");
    const checkbox = document.createElement("input");
    row.className = "narration-option";
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.setAttribute("aria-label", "Zahrnúť túto časť do čítania");
    row.append(checkbox, document.createTextNode("Zahrnúť do čítania"));
    block.after(row);
  });

  const studentButton = document.getElementById("student-mode");
  const teacherButton = document.getElementById("teacher-mode");
  const setTeacherMode = (enabled) => {
    document.body.classList.toggle("teacher", enabled);
    studentButton?.classList.toggle("on", !enabled);
    teacherButton?.classList.toggle("on", enabled);
    studentButton?.setAttribute("aria-pressed", String(!enabled));
    teacherButton?.setAttribute("aria-pressed", String(enabled));
  };
  studentButton?.addEventListener("click", () => setTeacherMode(false));
  teacherButton?.addEventListener("click", () => setTeacherMode(true));

  const controls = panel.querySelector(".narration-controls");
  const play = controls.querySelector("#play-reading");
  const stop = controls.querySelector("#stop-reading");
  const pause = controls.querySelector("#pause-reading");
  const replay = controls.querySelector("#replay-reading");
  const speed = controls.querySelector("#narration-speed");
  const voiceSelect = controls.querySelector("#narration-voice");
  const volume = controls.querySelector("#narration-volume");
  const volumeValue = controls.querySelector("#narration-volume-value");
  const status = controls.querySelector("#reading-status");
  const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const rateKey = "lesson-narration.playback-rate.v2";
  try { speed.value = window.localStorage.getItem(rateKey) || "1"; } catch { speed.value = "1"; }
  const voicesKey = "lesson-narration.voice.v1";
  const volumeKey = "lesson-narration.volume.v1";
  let voices = [];
  try { volume.value = window.localStorage.getItem(volumeKey) || "100"; } catch { volume.value = "100"; }
  if (volumeValue) volumeValue.value = `${volume.value} %`;
  const populateVoices = () => {
    if (!voiceSelect || !supported) return;
    const savedVoice = (() => { try { return window.localStorage.getItem(voicesKey) || ""; } catch { return ""; } })();
    voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("sk"));
    voiceSelect.replaceChildren(new Option("Automatický hlas", ""));
    voices.forEach((voice) => voiceSelect.add(new Option(`${voice.name} (${voice.lang})`, voice.voiceURI)));
    if (voices.some((voice) => voice.voiceURI === savedVoice)) voiceSelect.value = savedVoice;
    else if (voices.length) voiceSelect.value = voices.find((voice) => voice.default)?.voiceURI || voices[0].voiceURI;
  };
  populateVoices();
  if (supported) window.speechSynthesis.addEventListener("voiceschanged", populateVoices);
  let queue = [];
  let previous = [];
  let current = null;
  let active = false;
  let paused = false;
  let run = 0;
  let highlighted = null;
  const selections = () => [...main.querySelectorAll(".narration-option input:checked")]
    .map((checkbox) => checkbox.closest(".narration-option").previousElementSibling)
    .filter((block) => !block.closest(".teacher-note") || document.body.classList.contains("teacher"))
    .map((block) => ({ block, text: block.innerText.replace(/\s+/g, " ").trim() }))
    .filter((item) => item.text);
  const render = () => {
    play.disabled = !supported || active;
    stop.disabled = !active;
    pause.disabled = !active;
    replay.disabled = !supported || !previous.length;
    pause.textContent = paused ? "▶ Pokračovať" : "⏸ Pozastaviť";
  };
  const highlight = (block) => {
    highlighted?.classList.remove("speech-bubble");
    highlighted = block;
    if (block) {
      block.classList.add("speech-bubble");
      block.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  const estimate = (items) => Math.ceil(items.reduce((sum, item) => sum + item.text.length, 0) / (14 * Number(speed.value)));
  const formatEstimate = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `~${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  };
  const speakNext = (token) => {
    if (token !== run) return;
    current = queue.shift();
    if (!current) {
      active = false; paused = false; highlight(null); status.textContent = "Vybrané časti boli prečítané."; render(); return;
    }
    highlight(current.block);
    const utterance = new SpeechSynthesisUtterance(current.text);
    utterance.lang = "sk-SK";
    utterance.rate = Number(speed.value);
    utterance.volume = Number(volume.value) / 100;
    utterance.voice = voices.find((voice) => voice.voiceURI === voiceSelect?.value) || null;
    utterance.onend = () => { if (token === run) speakNext(token); };
    utterance.onerror = (event) => {
      if (token !== run || ["canceled", "interrupted"].includes(event.error)) return;
      active = false; paused = false; highlight(null); status.textContent = "Hlasové čítanie sa nepodarilo spustiť."; render();
    };
    window.speechSynthesis.speak(utterance);
    const index = previous.findIndex((item) => item.block === current.block);
    status.textContent = `Čítam časť ${Math.max(1, index + 1)} z ${previous.length} · odsek ${formatEstimate(estimate([current]))} · celé čítanie ${formatEstimate(estimate([current, ...queue]))}`;
  };
  const start = (items) => {
    if (!supported) { status.textContent = "Tento prehliadač nepodporuje hlasové čítanie."; return; }
    if (!items.length) { status.textContent = "Začiarknite aspoň jednu časť na čítanie."; return; }
    window.speechSynthesis.cancel(); run++; queue = [...items]; previous = [...items]; active = true; paused = false; render(); speakNext(run);
  };
  play.addEventListener("click", () => start(selections()));
  replay.addEventListener("click", () => start(previous));
  stop.addEventListener("click", () => { run++; queue = []; current = null; active = false; paused = false; window.speechSynthesis.cancel(); highlight(null); status.textContent = "Čítanie je zastavené."; render(); });
  pause.addEventListener("click", () => {
    if (!active) return;
    if (paused) {
      paused = false;
      if (current) window.speechSynthesis.resume();
      else speakNext(run);
      status.textContent = "Čítanie pokračuje.";
    }
    else { window.speechSynthesis.pause(); paused = true; status.textContent = "Čítanie je pozastavené."; }
    render();
  });
  speed.addEventListener("change", () => {
    try { window.localStorage.setItem(rateKey, speed.value); } catch { /* Keep the current page setting. */ }
    if (active && !paused) start([...(current ? [current] : []), ...queue]);
    else if (active && paused && current) { window.speechSynthesis.cancel(); queue.unshift(current); current = null; }
  });
  voiceSelect?.addEventListener("change", () => {
    try { window.localStorage.setItem(voicesKey, voiceSelect.value); } catch { /* Keep the current page setting. */ }
    if (active && !paused) start([...(current ? [current] : []), ...queue]);
    else if (active && paused && current) { window.speechSynthesis.cancel(); queue.unshift(current); current = null; }
  });
  volume.addEventListener("input", () => {
    if (volumeValue) volumeValue.value = `${volume.value} %`;
  });
  volume.addEventListener("change", () => {
    try { window.localStorage.setItem(volumeKey, volume.value); } catch { /* Keep the current page setting. */ }
    if (active && !paused) start([...(current ? [current] : []), ...queue]);
    else if (active && paused && current) { window.speechSynthesis.cancel(); queue.unshift(current); current = null; }
  });
  main.querySelectorAll(".narration-option").forEach((row) => {
    const block = row.previousElementSibling;
    block?.addEventListener("dblclick", () => {
      const items = selections();
      const clickedIndex = items.findIndex((item) => item.block === block);
      if (clickedIndex >= 0) start(items.slice(clickedIndex));
    });
  });

  let printSheet = null;
  const printRestore = [];
  window.addEventListener("beforeprint", () => {
    if (printSheet) return;
    const footer = main.querySelector("footer");
    if (!footer) return;
    printSheet = document.createElement("section");
    printSheet.className = "print-solution-sheet";
    printSheet.setAttribute("aria-label", "Riešenia úloh a odpovede");
    printSheet.innerHTML = "<h2>Riešenia úloh a odpovede</h2>";
    const list = document.createElement("ol");
    main.querySelectorAll(".quiz select[data-answer]").forEach((select) => {
      const option = [...select.options].find((item) => item.value === select.dataset.answer);
      const label = main.querySelector(`label[for=\"${select.id}\"]`);
      if (option) { const item = document.createElement("li"); item.textContent = `${label?.textContent.trim() || "Otázka"} ${option.textContent.trim()}`; list.append(item); }
    });
    if (list.children.length) printSheet.append(list);
    const detailsList = document.createElement("div");
    detailsList.className = "print-solutions-details";
    main.querySelectorAll("details").forEach((details) => {
      const placeholder = document.createComment("miesto riešenia v online stránke");
      const wasOpen = details.open;
      details.before(placeholder);
      details.open = true;
      detailsList.append(details);
      printRestore.push({ node: details, placeholder, wasOpen });
    });
    if (detailsList.children.length) printSheet.append(detailsList);
    if (!list.children.length && !detailsList.children.length) { printSheet = null; return; }
    footer.before(printSheet);
  });
  window.addEventListener("afterprint", () => {
    printRestore.forEach(({ node, placeholder, wasOpen }) => { placeholder.before(node); placeholder.remove(); node.open = wasOpen; });
    printRestore.length = 0;
    printSheet?.remove();
    printSheet = null;
  });
  render();

  const clock = document.querySelector(".lesson-clock");
  const clockBody = clock?.querySelector(".lesson-clock__body");
  if (clock && clockBody) {
    panel.prepend(clock);
    const title = main.querySelector("h1")?.textContent.trim() || "Hodina";
    clockBody.replaceChildren();
    const lesson = document.createElement("section");
    lesson.className = "lesson-duration";
    lesson.innerHTML = '<div class="lesson-duration-heading"><strong>Čas celej hodiny</strong><time class="lesson-duration-time">45:00</time></div><div class="lesson-duration-controls"><button type="button" data-action="start">Spustiť hodinu</button><button type="button" data-action="pause" disabled>Pozastaviť</button><button type="button" data-action="reset">Vynulovať</button></div>';
    const pom = document.createElement("section");
    pom.className = "pomodoro-panel";
    pom.innerHTML = '<div class="pomodoro-heading"><strong>Pomodoro</strong><span class="pomodoro-phase">PRÁCA</span><time class="pomodoro-time">25:00</time></div>';
    const context = document.createElement("div"); context.className = "pomodoro-context"; context.textContent = title;
    const sliders = document.createElement("div"); sliders.className = "pomodoro-sliders";
    const makeSlider = (name, min, max, value) => {
      const label = document.createElement("label"); label.className = "pomodoro-slider";
      label.innerHTML = `<span>${name}</span><output>${value} min</output>`;
      const input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.step = name === "Práca" ? 5 : 1; input.value = value;
      label.append(input); sliders.append(label); return input;
    };
    const work = makeSlider("Práca", 5, 60, 25); const relax = makeSlider("Relax", 1, 15, 5);
    pom.append(context, sliders); clockBody.append(lesson, pom);
    const toast = document.createElement("div"); toast.className = "pomodoro-toast"; toast.setAttribute("role", "status"); toast.hidden = true; document.body.append(toast);
    const lessonTime = lesson.querySelector("time"); const phaseText = pom.querySelector(".pomodoro-phase"); const pomTime = pom.querySelector("time");
    const startButton = lesson.querySelector('[data-action="start"]'); const pauseButton = lesson.querySelector('[data-action="pause"]');
    let lessonLeft = 2700; let phase = "work"; let phaseLeft = 1500; let timer = 0; let ends = 0; let phaseEnds = 0;
    const format = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    const renderTimer = () => { lessonTime.textContent = format(lessonLeft); pomTime.textContent = format(phaseLeft); phaseText.textContent = phase === "work" ? "PRÁCA" : "RELAX"; };
    const notify = (message) => { toast.textContent = message; toast.hidden = false; setTimeout(() => { toast.hidden = true; }, 4500); };
    const tick = () => {
      const now = Date.now(); lessonLeft = Math.max(0, Math.ceil((ends - now) / 1000)); phaseLeft = Math.max(0, Math.ceil((phaseEnds - now) / 1000));
      if (!lessonLeft) { clearInterval(timer); timer = 0; startButton.disabled = false; pauseButton.disabled = true; notify("Vyučovacia hodina sa skončila."); }
      else if (!phaseLeft) { phase = phase === "work" ? "relax" : "work"; phaseLeft = Number((phase === "work" ? work : relax).value) * 60; phaseEnds = now + phaseLeft * 1000; notify(`Pomodoro: ${phase === "work" ? "PRÁCA" : "RELAX"}`); }
      renderTimer();
    };
    startButton.addEventListener("click", () => { ends = Date.now() + lessonLeft * 1000; phaseEnds = Date.now() + phaseLeft * 1000; timer = setInterval(tick, 250); startButton.disabled = true; pauseButton.disabled = false; notify("Spustená 45-minútová hodina · Pomodoro PRÁCA"); });
    pauseButton.addEventListener("click", () => { tick(); if (timer) { clearInterval(timer); timer = 0; startButton.disabled = false; pauseButton.disabled = true; } });
    lesson.querySelector('[data-action="reset"]').addEventListener("click", () => { clearInterval(timer); timer = 0; lessonLeft = 2700; phase = "work"; phaseLeft = Number(work.value) * 60; startButton.disabled = false; pauseButton.disabled = true; toast.hidden = true; renderTimer(); });
    [work, relax].forEach((input) => input.addEventListener("input", () => { input.previousElementSibling.textContent = `${input.value} min`; if (timer && ((input === work && phase === "work") || (input === relax && phase === "relax"))) { phaseLeft = Number(input.value) * 60; phaseEnds = Date.now() + phaseLeft * 1000; renderTimer(); } }));
    renderTimer();
  }
})();
