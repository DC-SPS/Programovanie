(() => {
    const studentButton = document.getElementById("student-mode");
    const teacherButton = document.getElementById("teacher-mode");
    const setTeacherMode = (enabled) => {
      document.body.classList.toggle("teacher", enabled);
      studentButton.classList.toggle("on", !enabled);
      teacherButton.classList.toggle("on", enabled);
      studentButton.setAttribute("aria-pressed", String(!enabled));
      teacherButton.setAttribute("aria-pressed", String(enabled));
    };
    studentButton.addEventListener("click", () => setTeacherMode(false));
    teacherButton.addEventListener("click", () => setTeacherMode(true));

    const readingStatus = document.getElementById("reading-status");
    const playButton = document.getElementById("play-reading");
    const stopButton = document.getElementById("stop-reading");
    const pauseButton = document.getElementById("pause-reading");
    const replayButton = document.getElementById("replay-reading");
    const speedSelect = document.getElementById("narration-speed");
    const voiceSelect = document.getElementById("narration-voice");
    const volumeSelect = document.getElementById("narration-volume");
    const volumeValue = document.getElementById("narration-volume-value");
    const narrationSpeedKey = "lesson-narration.playback-rate.v2";
    const narrationVoiceKey = "lesson-narration.voice";
    const narrationVolumeKey = "lesson-narration.volume";
    const speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    let availableVoices = [];
    const availableRates = new Set([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
    try {
      const savedRate = Number(window.localStorage.getItem(narrationSpeedKey));
      if (availableRates.has(savedRate)) speedSelect.value = String(savedRate);
    } catch (_) {
      // Keep the default rate when browser storage is unavailable.
    }
    try {
      const savedVolume = Number(window.localStorage.getItem(narrationVolumeKey));
      if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 100) volumeSelect.value = String(savedVolume);
    } catch (_) {
      // Keep the default speech volume if browser storage is unavailable.
    }
    volumeValue.value = volumeSelect.value + " %";
    volumeValue.textContent = volumeSelect.value + " %";
    const populateVoices = () => {
      if (!speechSupported) return;
      let savedVoice = "";
      try { savedVoice = window.localStorage.getItem(narrationVoiceKey) || ""; } catch (_) { /* Voice selection remains available for this page. */ }
      availableVoices = window.speechSynthesis.getVoices();
      const sortedVoices = [...availableVoices].sort((a, b) => {
        const aSk = a.lang.toLowerCase().startsWith("sk") ? 0 : 1;
        const bSk = b.lang.toLowerCase().startsWith("sk") ? 0 : 1;
        return aSk - bSk || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
      });
      voiceSelect.replaceChildren(new Option("Automaticky – slovenský hlas", ""));
      sortedVoices.forEach((voice) => voiceSelect.add(new Option(`${voice.name} (${voice.lang})`, voice.voiceURI)));
      voiceSelect.value = sortedVoices.some((voice) => voice.voiceURI === savedVoice) ? savedVoice : "";
    };
    if (speechSupported) {
      populateVoices();
      window.speechSynthesis.addEventListener("voiceschanged", populateVoices);
    }
    const main = document.querySelector("main");
    const readSelectors = ["main h2", "main h3", "main p", "main ul", "main ol", "main .card", "main .teacher-note", "main .safety-notice", "main table"];
    main?.querySelectorAll(readSelectors.join(",")).forEach((block) => {
      if (block.closest(".sources, footer") || block.matches(".copy-status")) return;
      if (block.closest(".card, .teacher-note, .safety-notice") && !block.matches(".card, .teacher-note, .safety-notice")) return;
      block.dataset.readAloud = "selected";
    });

    const narrationItems = [...document.querySelectorAll("[data-read-aloud]")].map((block, index) => {
      const blockId = block.id || `narration-block-${index + 1}`;
      const row = document.createElement("label");
      const checkbox = document.createElement("input");
      block.id = blockId;
      block.classList.add("narration-target");
      row.className = "narration-option";
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.setAttribute("aria-describedby", blockId);
      row.append(checkbox, document.createTextNode("Zahrnúť do čítania"));
      if (block.matches(".term")) {
        block.append(row);
      } else {
        block.after(row);
      }
      return { block, checkbox };
    });
    let activeBlock = null;
    let readingQueue = [];
    let previousSelection = [];
    let activeItem = null;
    let readingRun = 0;
    let isReading = false;
    let isPaused = false;
    let restartCurrentOnResume = false;
    let speechRestartTimeout = 0;
    let estimateInterval = 0;
    let currentStartedAt = 0;
    let currentPausedAt = 0;
    let currentEstimateMs = 0;

    const getBlockText = (block) => {
      const copy = block.cloneNode(true);
      copy.querySelectorAll(".narration-option").forEach((option) => option.remove());
      return copy.textContent
        .replace(/→/g, ", ")
        .replace(/[ \t]*\n[ \t]*/g, ". ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const getSelectedItems = (startIndex = 0) => narrationItems.slice(startIndex)
      .filter(({ checkbox, block }) => {
        const teacherOnly = block.closest(".teacher-note");
        return checkbox.checked && (!teacherOnly || document.body.classList.contains("teacher"));
      })
      .map(({ block }) => ({ block, text: getBlockText(block) }))
      .filter(({ text }) => text.length > 0);

    const estimateSpeechMs = (text) => {
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      return Math.max(1000, Math.ceil(words / (150 * Number(speedSelect.value)) * 60_000 * 1.3));
    };
    const formatEstimate = (milliseconds) => {
      const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
      return String(Math.floor(totalSeconds / 60)).padStart(2, "0") + ":" + String(totalSeconds % 60).padStart(2, "0");
    };
    const updateReadingEstimate = () => {
      if (!isReading || !activeItem) return;
      const elapsed = currentStartedAt ? (currentPausedAt || Date.now()) - currentStartedAt : 0;
      const currentRemaining = Math.max(0, currentEstimateMs - elapsed);
      const totalRemaining = currentRemaining + readingQueue.reduce((total, item) => total + estimateSpeechMs(item.text), 0);
      const currentIndex = previousSelection.length - readingQueue.length;
      const progress = document.createElement("span");
      progress.className = "reading-progress";
      progress.textContent = `Čítam časť ${currentIndex} z ${previousSelection.length}.`;
      const times = document.createElement("span");
      times.className = "reading-times";
      times.textContent = `Odsek ~${formatEstimate(currentRemaining)} · celé čítanie ~${formatEstimate(totalRemaining)}.`;
      readingStatus.replaceChildren(progress, times);
    };

    const setActiveBlock = (block) => {
      activeBlock?.classList.remove("speech-bubble");
      activeBlock = block;
      activeBlock?.classList.add("speech-bubble");
      activeBlock?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    };

    const updateControls = () => {
      playButton.disabled = !speechSupported || isReading;
      stopButton.disabled = !isReading;
      pauseButton.disabled = !isReading;
      pauseButton.textContent = isPaused ? "▶ Pokračovať" : "⏸ Pozastaviť";
      pauseButton.setAttribute(
        "aria-label",
        isPaused ? "Pokračovať v čítaní" : "Pozastaviť čítanie",
      );
      replayButton.disabled = !speechSupported || previousSelection.length === 0;
    };

    const stopReading = (message = "Čítanie je zastavené.") => {
      readingRun += 1;
      window.clearTimeout(speechRestartTimeout);
      speechRestartTimeout = 0;
      readingQueue = [];
      activeItem = null;
      currentStartedAt = 0;
      currentPausedAt = 0;
      window.clearInterval(estimateInterval);
      estimateInterval = 0;
      restartCurrentOnResume = false;
      isReading = false;
      isPaused = false;
      if (speechSupported) window.speechSynthesis.cancel();
      setActiveBlock(null);
      updateControls();
      readingStatus.textContent = message;
    };

    const speakNextBlock = (run) => {
      if (run !== readingRun) return;
      const item = readingQueue.shift();
      if (!item) {
        activeItem = null;
        isReading = false;
        isPaused = false;
        window.clearInterval(estimateInterval);
        estimateInterval = 0;
        setActiveBlock(null);
        updateControls();
        readingStatus.textContent = "Vybrané časti boli prečítané.";
        return;
      }

      activeItem = item;
      currentStartedAt = 0;
      currentPausedAt = 0;
      currentEstimateMs = estimateSpeechMs(item.text);
      setActiveBlock(item.block);
      const utterance = new SpeechSynthesisUtterance(item.text);
      const selectedVoice = availableVoices.find((voice) => voice.voiceURI === voiceSelect.value);
      const slovakVoice = selectedVoice || availableVoices.find((voice) => voice.lang.toLowerCase().startsWith("sk"));
      utterance.lang = slovakVoice?.lang || "sk-SK";
      utterance.rate = Number(speedSelect.value);
      utterance.volume = Number(volumeSelect.value) / 100;
      if (slovakVoice) utterance.voice = slovakVoice;
      utterance.onstart = () => {
        if (run === readingRun) {
          currentStartedAt = Date.now();
          updateReadingEstimate();
          window.clearInterval(estimateInterval);
          estimateInterval = window.setInterval(updateReadingEstimate, 1000);
        }
      };
      utterance.onend = () => {
        if (run === readingRun) {
          activeItem = null;
          currentStartedAt = 0;
          currentPausedAt = 0;
          speakNextBlock(run);
        }
      };
      utterance.onerror = (event) => {
        if (run !== readingRun || event.error === "canceled" || event.error === "interrupted") return;
        isReading = false;
        isPaused = false;
        activeItem = null;
        currentStartedAt = 0;
        currentPausedAt = 0;
        window.clearInterval(estimateInterval);
        estimateInterval = 0;
        restartCurrentOnResume = false;
        readingQueue = [];
        setActiveBlock(null);
        updateControls();
        readingStatus.textContent = "Čítanie sa nepodarilo spustiť. Skontrolujte hlasové výstupy prehliadača.";
      };
      window.speechSynthesis.speak(utterance);
    };

    const scheduleNextBlock = (run) => {
      window.clearTimeout(speechRestartTimeout);
      speechRestartTimeout = window.setTimeout(() => {
        speechRestartTimeout = 0;
        if (run === readingRun && isReading && !isPaused) speakNextBlock(run);
      }, 100);
    };

    const startReading = (items) => {
      if (!speechSupported) {
        readingStatus.textContent = "Tento prehliadač nepodporuje hlasové čítanie textu.";
        return;
      }
      if (items.length === 0) {
        readingStatus.textContent = "Začiarknite aspoň jednu časť, ktorú má učiteľ prečítať.";
        return;
      }
      stopReading("");
      readingRun += 1;
      readingQueue = [...items];
      previousSelection = [...items];
      isReading = true;
      isPaused = false;
      updateControls();
      readingStatus.textContent = `Spúšťam čítanie ${items.length} vybraných častí.`;
      scheduleNextBlock(readingRun);
    };

    narrationItems.forEach(({ block, checkbox }, index) => {
      block.title = "Dvojklikom spustiť čítanie od tejto časti";
      block.addEventListener("dblclick", (event) => {
        if (event.target.closest("[data-read-aloud]") !== block) return;
        if (block.closest(".teacher-note") && !document.body.classList.contains("teacher")) return;
        event.preventDefault();
        event.stopPropagation();
        checkbox.checked = true;
        startReading(getSelectedItems(index));
      });
    });

    playButton.addEventListener("click", () => startReading(getSelectedItems()));
    stopButton.addEventListener("click", () => stopReading());
    pauseButton.addEventListener("click", () => {
      if (!isReading || !speechSupported) return;
      if (isPaused) {
        if (restartCurrentOnResume) {
          restartCurrentOnResume = false;
          isPaused = false;
          scheduleNextBlock(readingRun);
        } else {
          if (currentPausedAt && currentStartedAt) currentStartedAt += Date.now() - currentPausedAt;
          currentPausedAt = 0;
          window.speechSynthesis.resume();
          isPaused = false;
        }
        readingStatus.textContent = "Čítanie pokračuje.";
      } else {
        if (speechRestartTimeout) {
          window.clearTimeout(speechRestartTimeout);
          speechRestartTimeout = 0;
          restartCurrentOnResume = true;
        }
        window.speechSynthesis.pause();
        isPaused = true;
        currentPausedAt = Date.now();
        readingStatus.textContent = "Čítanie je pozastavené.";
      }
      updateControls();
    });
    replayButton.addEventListener("click", () => startReading(previousSelection));
    const restartSpeechForSetting = (message) => {
      if (!isReading) {
        readingStatus.textContent = message;
        return;
      }
      if (isPaused) {
        if (activeItem) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();
          readingQueue.unshift(activeItem);
          activeItem = null;
          currentStartedAt = 0;
          currentPausedAt = 0;
        }
        restartCurrentOnResume = true;
        readingStatus.textContent = message + " Po pokračovaní sa aktuálna časť začne znova.";
        return;
      }
      if (!activeItem) {
        if (speechRestartTimeout) scheduleNextBlock(readingRun);
        readingStatus.textContent = message;
        return;
      }
      readingRun += 1;
      window.clearTimeout(speechRestartTimeout);
      speechRestartTimeout = 0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      readingQueue.unshift(activeItem);
      activeItem = null;
      currentStartedAt = 0;
      currentPausedAt = 0;
      readingStatus.textContent = message + " Aktuálna časť sa začne znova.";
      scheduleNextBlock(readingRun);
    };
    voiceSelect.addEventListener("change", () => {
      try { window.localStorage.setItem(narrationVoiceKey, voiceSelect.value); } catch (_) { /* The voice still applies to this page. */ }
      restartSpeechForSetting("Hlas čítania bol zmenený.");
    });
    volumeSelect.addEventListener("input", () => {
      volumeValue.value = volumeSelect.value + " %";
      volumeValue.textContent = volumeSelect.value + " %";
    });
    volumeSelect.addEventListener("change", () => {
      try { window.localStorage.setItem(narrationVolumeKey, volumeSelect.value); } catch (_) { /* The volume still applies to this page. */ }
      restartSpeechForSetting("Hlasitosť čítania bola zmenená.");
    });
    speedSelect.addEventListener("change", () => {
      const rate = Number(speedSelect.value);
      try {
        window.localStorage.setItem(narrationSpeedKey, String(rate));
      } catch (_) {
        // The selected rate still applies to this page if storage is unavailable.
      }
      const label = speedSelect.selectedOptions[0]?.textContent || (rate + "×");
      restartSpeechForSetting("Rýchlosť " + label + " je nastavená.");
    });
    updateControls();

    document.addEventListener("DOMContentLoaded", () => {
      const lessonClock = document.querySelector(".lesson-clock");
      const sidePanel = document.querySelector(".lesson-side-panel");
      if (!lessonClock || !sidePanel) return;
      sidePanel.prepend(lessonClock);

      const clockBody = lessonClock.querySelector(".lesson-clock__body");
      lessonClock.querySelector(".lesson-clock__progress")?.remove();
      if (!clockBody) return;
      const lessonTitle = clockBody.querySelector(".lesson-clock__title")?.textContent.trim() || "4.1";
      clockBody.replaceChildren();

      const make = (tag, className, text) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
      };
      const lessonTimer = make("section", "lesson-duration");
      lessonTimer.setAttribute("aria-label", "45-min\u00fatov\u00fd \u010dasova\u010d vyu\u010dovacej hodiny");
      const lessonHeading = make("div", "lesson-duration-heading");
      lessonHeading.append(make("strong", "", "\u010cas celej hodiny"));
      const lessonTime = make("time", "lesson-duration-time", "45:00");
      lessonTime.setAttribute("aria-label", "Zost\u00e1vaj\u00faci \u010das celej vyu\u010dovacej hodiny");
      lessonHeading.append(lessonTime);
      const lessonControls = make("div", "lesson-duration-controls");
      const startButton = make("button", "", "Spusti\u0165 hodinu");
      startButton.type = "button";
      const pauseButton = make("button", "", "Pozastavi\u0165");
      pauseButton.type = "button";
      pauseButton.disabled = true;
      const resetButton = make("button", "", "Vynulova\u0165");
      resetButton.type = "button";
      lessonControls.append(startButton, pauseButton, resetButton);
      lessonTimer.append(lessonHeading, lessonControls);

      const pomodoro = make("section", "pomodoro-panel");
      pomodoro.setAttribute("aria-label", "Pomodoro \u010dasova\u010d pr\u00e1ce a oddychu");
      const heading = make("div", "pomodoro-heading");
      heading.append(make("strong", "", "Pomodoro"));
      const readout = make("div", "pomodoro-readout");
      const phaseLabel = make("span", "pomodoro-phase", "PR\u00c1CA");
      phaseLabel.dataset.phase = "work";
      const pomodoroTime = make("time", "pomodoro-time", "25:00");
      pomodoroTime.setAttribute("aria-label", "Zost\u00e1vaj\u00faci \u010das f\u00e1zy Pomodoro");
      readout.append(phaseLabel, pomodoroTime);
      heading.append(readout);
      const context = make("div", "pomodoro-context");
      context.append(make("strong", "pomodoro-context-title", lessonTitle));

      const sliders = make("div", "pomodoro-sliders");
      const addSlider = (label, min, max, step, initial) => {
        const field = make("label", "pomodoro-slider");
        const caption = make("span", "", label);
        const output = make("output", "", initial + " min");
        const range = make("input");
        range.type = "range";
        range.min = String(min);
        range.max = String(max);
        range.step = String(step);
        range.value = String(initial);
        range.setAttribute("aria-label", "D\u013a\u017eka f\u00e1zy " + label.toLowerCase() + " v min\u00fatach");
        field.append(caption, output, range);
        sliders.append(field);
        return { range, output };
      };
      const workSlider = addSlider("Pr\u00e1ca", 5, 60, 5, 25);
      const relaxSlider = addSlider("Relax", 1, 15, 1, 5);
      pomodoro.append(heading, context, sliders);
      clockBody.append(lessonTimer, pomodoro);

      const toast = make("div", "pomodoro-toast");
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.hidden = true;
      document.body.append(toast);

      let phase = "work";
      let lessonRemaining = 45 * 60 * 1000;
      let pomodoroRemaining = 25 * 60 * 1000;
      let lessonEndAt = 0;
      let pomodoroEndAt = 0;
      let intervalId = 0;
      let toastTimeout = 0;
      const durationFor = (currentPhase) => Number((currentPhase === "work" ? workSlider : relaxSlider).range.value) * 60 * 1000;
      const format = (milliseconds) => {
        const seconds = Math.ceil(milliseconds / 1000);
        return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
      };
      const phaseName = () => phase === "work" ? "PR\u00c1CA" : "RELAX";
      const render = () => {
        lessonTime.textContent = format(lessonRemaining);
        pomodoroTime.textContent = format(pomodoroRemaining);
        phaseLabel.textContent = phaseName();
        phaseLabel.dataset.phase = phase;
      };
      const notify = (message, currentPhase = phase) => {
        toast.textContent = message;
        toast.dataset.phase = currentPhase;
        toast.hidden = false;
        window.clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => { toast.hidden = true; }, 5000);
      };
      const stopAtLessonEnd = () => {
        window.clearInterval(intervalId);
        intervalId = 0;
        lessonRemaining = 0;
        render();
        startButton.disabled = false;
        startButton.textContent = "Spusti\u0165 znova";
        pauseButton.disabled = true;
        notify("Koniec 45-min\u00fatovej vyu\u010dovacej hodiny.", "relax");
      };
      const tick = () => {
        const now = Date.now();
        lessonRemaining = Math.max(0, lessonEndAt - now);
        pomodoroRemaining = Math.max(0, pomodoroEndAt - now);
        if (lessonRemaining === 0) {
          stopAtLessonEnd();
          return;
        }
        if (pomodoroRemaining === 0) {
          phase = phase === "work" ? "relax" : "work";
          pomodoroRemaining = durationFor(phase);
          pomodoroEndAt = now + pomodoroRemaining;
          notify("Pomodoro \u00b7 " + phaseName() + " \u00b7 " + format(pomodoroRemaining));
        }
        render();
      };
      startButton.addEventListener("click", () => {
        if (intervalId) return;
        const now = Date.now();
        lessonEndAt = now + lessonRemaining;
        pomodoroEndAt = now + pomodoroRemaining;
        intervalId = window.setInterval(tick, 200);
        startButton.disabled = true;
        startButton.textContent = "Hodina be\u017e\u00ed";
        pauseButton.disabled = false;
        notify("Spusten\u00e1 hodina \u00b7 Pomodoro PR\u00c1CA");
      });
      pauseButton.addEventListener("click", () => {
        if (!intervalId) return;
        tick();
        if (!intervalId) return;
        window.clearInterval(intervalId);
        intervalId = 0;
        startButton.disabled = false;
        startButton.textContent = "Pokra\u010dova\u0165";
        pauseButton.disabled = true;
      });
      resetButton.addEventListener("click", () => {
        window.clearInterval(intervalId);
        intervalId = 0;
        phase = "work";
        lessonRemaining = 45 * 60 * 1000;
        pomodoroRemaining = durationFor("work");
        render();
        startButton.disabled = false;
        startButton.textContent = "Spusti\u0165 hodinu";
        pauseButton.disabled = true;
        toast.hidden = true;
      });
      const bindSlider = (slider, sliderPhase) => {
        slider.range.addEventListener("input", () => {
          slider.output.textContent = slider.range.value + " min";
          if (phase === sliderPhase) {
            pomodoroRemaining = durationFor(phase);
            if (intervalId) pomodoroEndAt = Date.now() + pomodoroRemaining;
            render();
          }
        });
      };
      bindSlider(workSlider, "work");
      bindSlider(relaxSlider, "relax");
      render();
    });

    let printSheet = null;
    const printRestore = [];
    window.addEventListener("beforeprint", () => {
      if (printSheet) return;
      const footer = main?.querySelector("footer");
      if (!footer) return;
      printSheet = document.createElement("section");
      printSheet.className = "print-solution-sheet";
      printSheet.setAttribute("aria-label", "Riešenia úloh a odpovede");
      printSheet.innerHTML = "<h2>Riešenia úloh a odpovede</h2>";
      const list = document.createElement("ol");
      main.querySelectorAll(".quiz select[data-answer]").forEach((select) => {
        const option = [...select.options].find((item) => item.value === select.dataset.answer);
        const label = main.querySelector(`label[for=\"${select.id}\"]`);
        if (option) {
          const item = document.createElement("li");
          item.textContent = `${label?.textContent.trim() || "Otázka"} ${option.textContent.trim()}`;
          list.append(item);
        }
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
      if (!list.children.length && !detailsList.children.length) {
        printSheet = null;
        return;
      }
      footer.before(printSheet);
    });
    window.addEventListener("afterprint", () => {
      printRestore.forEach(({ node, placeholder, wasOpen }) => {
        placeholder.before(node);
        placeholder.remove();
        node.open = wasOpen;
      });
      printRestore.length = 0;
      printSheet?.remove();
      printSheet = null;
    });
})();
