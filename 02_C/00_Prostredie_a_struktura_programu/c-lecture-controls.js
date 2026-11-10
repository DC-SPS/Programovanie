(() => {
    const studentButton = document.getElementById("student-mode") || document.getElementById("student") || document.getElementById("bs");
    const teacherButton = document.getElementById("teacher-mode") || document.getElementById("teacher") || document.getElementById("bt");
    const setTeacherMode = (enabled) => {
      document.body.classList.toggle("teacher", enabled);
      studentButton.classList.toggle("on", !enabled);
      teacherButton.classList.toggle("on", enabled);
      studentButton.setAttribute("aria-pressed", String(!enabled));
      teacherButton.setAttribute("aria-pressed", String(enabled));
    };
    if (studentButton && teacherButton) {
      studentButton.addEventListener("click", () => setTeacherMode(false));
      teacherButton.addEventListener("click", () => setTeacherMode(true));
    }

    const readingStatus = document.getElementById("reading-status");
    const playButton = document.getElementById("play-reading");
    const stopButton = document.getElementById("stop-reading");
    const pauseButton = document.getElementById("pause-reading");
    const replayButton = document.getElementById("replay-reading");
    const speedSelect = document.getElementById("narration-speed");
    const voiceSelect = document.getElementById("narration-voice");
    const volumeSelect = document.getElementById("narration-volume");
    const volumeValue = document.getElementById("narration-volume-value");
    const narrationControls = playButton?.closest(".narration-controls");
    if (narrationControls && !narrationControls.querySelector(".narration-settings")) {
      const settings = document.createElement("details");
      settings.className = "narration-settings";
      const summary = document.createElement("summary");
      summary.textContent = "Nastavenia hlasu";
      settings.append(summary);
      [speedSelect?.closest("label"), narrationControls.querySelector(".page-language-help"), voiceSelect?.closest("label"), volumeSelect?.closest("label")]
        .filter((node) => node && node.parentElement === narrationControls)
        .forEach((node) => settings.append(node));
      const readingStatusNode = narrationControls.querySelector("#reading-status");
      narrationControls.insertBefore(settings, readingStatusNode || null);
    }
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
    const main = document.querySelector("main") || document.querySelector(".wrap") || document.querySelector(".w");
    const readSelectors = ["h2", "h3", "p", "ul", "ol", ".card", ".teacher-note", ".note", ".safety-notice", "table"];
    main?.querySelectorAll(readSelectors.join(",")).forEach((block) => {
      if (block.closest(".sources, footer") || block.matches(".copy-status")) return;
      if (block.closest(".card, .teacher-note, .note, .safety-notice") && !block.matches(".card, .teacher-note, .note, .safety-notice")) return;
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
        const teacherOnly = block.closest(".teacher-note, .note");
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
      window.dispatchEvent(new CustomEvent("lesson-reading-state", {
        detail: {
          isReading,
          isPaused,
          canReplay: previousSelection.length > 0,
        },
      }));
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
      updateControls();
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
        if (block.closest(".teacher-note, .note") && !document.body.classList.contains("teacher")) return;
        event.preventDefault();
        event.stopPropagation();
        checkbox.checked = true;
        startReading(getSelectedItems(index));
      });
    });

    const syncPlayButton = document.querySelector('.lecture-sync-controls [data-action="play"]');
    const syncPauseButton = document.querySelector('.lecture-sync-controls [data-action="pause"]');
    playButton.addEventListener("click", () => syncPlayButton ? syncPlayButton.click() : startReading(getSelectedItems()));
    stopButton.addEventListener("click", () => stopReading());
    pauseButton.addEventListener("click", () => {
      if (syncPauseButton) { syncPauseButton.click(); return; }
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
    replayButton.addEventListener("click", () => {
      if (syncPlayButton) window.lessonSpeechRemote?.restartLesson?.();
      else startReading(previousSelection);
    });
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
    const restartCurrent = () => {
      const current = activeItem || previousSelection.find(({ block }) => block === activeBlock);
      if (current) startReading([current]);
    };
    window.lessonSpeechRemote = Object.freeze({
      play: () => playButton.click(),
      pauseResume: () => pauseButton.click(),
      pause: () => { if (isReading && !isPaused) pauseButton.click(); },
      resume: () => { if (isReading && isPaused) pauseButton.click(); },
      stop: () => stopButton.click(),
      replay: () => replayButton.click(),
      restartLesson: () => startReading(getSelectedItems()),
      playSection: (sectionIndex) => {
        const sectionHeadings = [...main.querySelectorAll("h2")].filter((heading) => !heading.closest(".sources, footer"));
        const heading = sectionHeadings[sectionIndex];
        if (!heading) return;
        const start = narrationItems.findIndex(({ block }) => block === heading);
        if (start < 0) return;
        const nextHeading = sectionHeadings[sectionIndex + 1];
        const end = nextHeading ? narrationItems.findIndex(({ block }) => block === nextHeading) : narrationItems.length;
        const items = narrationItems.slice(start, end < 0 ? narrationItems.length : end)
          .filter(({ checkbox, block }) => {
            const teacherOnly = block.closest(".teacher-note, .note");
            return checkbox.checked && (!teacherOnly || document.body.classList.contains("teacher"));
          })
          .map(({ block }) => ({ block, text: getBlockText(block) }))
          .filter(({ text }) => text.length > 0);
        startReading(items);
      },
      restartCurrent,
      getState: () => ({
        isReading,
        isPaused,
        canReplay: previousSelection.length > 0,
        canRestartCurrent: Boolean(activeItem || previousSelection.some(({ block }) => block === activeBlock)),
      }),
    });

    const installContinuousReader = () => {
      const settings = document.createElement("details");
      settings.className = "narration-settings";
      const settingsSummary = document.createElement("summary");
      settingsSummary.textContent = "Nastavenia hlasu";
      settings.append(settingsSummary);
      [speedSelect.closest("label"), voiceSelect.closest("label"), volumeSelect.closest("label")].forEach((control) => {
        if (control) settings.append(control);
      });
      const controls = document.querySelector(".narration-controls");
      controls?.append(settings);
      controls?.querySelector(".page-language-help")?.setAttribute("hidden", "");
      document.querySelectorAll(".narration-option").forEach((option) => option.remove());
      document.querySelectorAll(".narration-target").forEach((block) => block.classList.remove("narration-target"));

      const addPreference = (key, labelText) => {
        const label = document.createElement("label");
        label.className = "narration-setting";
        const input = document.createElement("input");
        input.type = "checkbox";
        try { input.checked = window.localStorage.getItem(key) === "true"; } catch (_) { input.checked = false; }
        input.addEventListener("change", () => {
          try { window.localStorage.setItem(key, String(input.checked)); } catch (_) { /* The preference still applies on this page. */ }
          if (key === "lesson-narration.include-code") {
            if (isReading) startFrom(selectedBlock, selectedChunk);
            else rebuildBlocks();
          }
        });
        label.append(input, document.createTextNode(labelText));
        settings.append(label);
        return input;
      };
      const includeCode = addPreference("lesson-narration.include-code", "Čítať aj kód");
      const nextLecture = addPreference("lesson-narration.next-lecture", "Po konci prejsť na ďalšiu prednášku");
      const speechStatus = document.createElement("p");
      speechStatus.className = "narration-continuous-status";
      speechStatus.setAttribute("role", "status");
      speechStatus.setAttribute("aria-live", "polite");
      controls?.append(speechStatus);

      const root = document.querySelector("main") || document.querySelector(".wrap") || document.querySelector(".w");
      if (!root) return;
      const speechAvailable = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
      const excludedSelector = ".lesson-side-panel, .lecture-sync-controls, .narration-controls, .global-course-nav, nav, button, script, style, noscript, iframe, video, audio, input, select, textarea, footer, .sources, .mode, [aria-hidden='true'], [hidden]";
      const containerSelector = ".card, .teacher-note, .note, .teacher-only, [data-teacher-only], .safety-notice, .lesson-guidance, .callout, .notice, .panel, .tip, blockquote";
      let blocks = [];
      let selectedBlock = -1;
      let selectedChunk = 0;
      let activeBlock = null;
      let runId = 0;
      let isReading = false;
      let isPaused = false;
      let restartCurrent = false;
      let utteranceTimer = 0;
      let currentUtterance = null;
      let automaticScrollUntil = 0;
      let rememberedSelection = [];

      const teacherOnlySelector = ".teacher-note, .note, .teacher-only, [data-teacher-only]";
      const teacherOnly = (element) => Boolean(element.closest(teacherOnlySelector));
      const hiddenByStyle = (element) => {
        const hiddenTeacherNote = element.closest(teacherOnlySelector);
        for (let node = element; node && node !== root.parentElement; node = node.parentElement) {
          if (node.matches?.(excludedSelector)) return true;
          if (node === hiddenTeacherNote && !document.body.classList.contains("teacher")) continue;
          if (window.getComputedStyle(node).display === "none" || window.getComputedStyle(node).visibility === "hidden") return true;
        }
        return false;
      };
      const collectText = (element) => {
        const walk = (node, isRoot = false) => {
          if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || "";
          if (node.nodeType !== Node.ELEMENT_NODE) return "";
          const current = node;
          if ((!isRoot && hiddenByStyle(current)) || current.matches(excludedSelector)) return "";
          if (!isRoot && current.matches("li") && element.matches("li")) return "";
          if (current.matches("img")) return current.alt || "";
          if (current.matches("pre, code") && !includeCode.checked
            && (current.matches("pre") || window.getComputedStyle(current).display !== "inline")) {
            return " Nasleduje ukážka kódu. ";
          }
          if (current.matches("br")) return ". ";
          return [...current.childNodes].map((child) => walk(child)).join("");
        };
        return walk(element, true).replace(/→/g, ", ").replace(/[ \t]*\n[ \t]*/g, ". ").replace(/\s+/g, " ").trim();
      };
      const rebuildBlocks = () => {
        const candidates = [...root.querySelectorAll("h1,h2,h3,p,li,tr,figcaption,img,pre,code,.card,.teacher-note,.note,.teacher-only,[data-teacher-only],.safety-notice,.lesson-guidance,.callout,.notice,.panel,.tip,blockquote")];
        blocks = candidates.filter((element) => {
          if (element.matches("code") && (element.closest("pre") || window.getComputedStyle(element).display === "inline")) return false;
          if (element.matches("td,th")) return false;
          if (element.closest(containerSelector) && !element.matches(containerSelector)) return false;
          if (element.matches(containerSelector) && element.querySelector("tr")) return false;
          if (teacherOnly(element)) return true;
          return !hiddenByStyle(element);
        }).map((element) => {
          const isCode = element.matches("pre,code");
          const text = isCode && !includeCode.checked ? "Nasleduje ukážka kódu." : element.matches("tr")
            ? [...element.querySelectorAll("th,td")].map((cell) => collectText(cell)).filter(Boolean).join(". ")
            : collectText(element);
          return { block: element, text, isCode, isTeacherOnly: teacherOnly(element) };
        }).filter(({ text }) => text.length > 0);
      };
      const splitText = (text) => {
        const sentences = text.match(/[^.!?]+(?:[.!?]+|$)/g) || [text];
        const chunks = [];
        sentences.forEach((sentence) => {
          let rest = sentence.trim();
          while (rest.length > 190) {
            let splitAt = rest.lastIndexOf(" ", 190);
            if (splitAt < 80) splitAt = 190;
            chunks.push(rest.slice(0, splitAt).trim());
            rest = rest.slice(splitAt).trim();
          }
          if (rest) chunks.push(rest);
        });
        return chunks;
      };
      const visibleBlock = (item) => !item.isTeacherOnly || document.body.classList.contains("teacher");
      const sectionHeadings = () => [...root.querySelectorAll("h2")].filter((heading) => !heading.closest(".sources, footer"));
      const sectionFor = (index) => {
        let currentSection = 0;
        const headings = sectionHeadings();
        for (let i = 0; i < headings.length; i += 1) {
          const headingIndex = blocks.findIndex((item) => item.block === headings[i]);
          if (headingIndex > index) break;
          if (headingIndex >= 0) currentSection = i;
        }
        return currentSection;
      };
      const announce = (extra = {}) => {
        const detail = {
          isReading,
          isPaused,
          section: selectedBlock < 0 ? 0 : sectionFor(selectedBlock),
          sectionCount: sectionHeadings().length,
          block: selectedBlock < 0 ? 0 : selectedBlock,
          blockCount: blocks.length,
          chunk: selectedChunk,
          ...extra,
        };
        window.dispatchEvent(new CustomEvent("lesson-reading-state", { detail }));
      };
      const showActiveBlock = (index, shouldScroll = true) => {
        activeBlock?.classList.remove("speech-bubble");
        selectedBlock = index;
        activeBlock = index >= 0 ? blocks[index]?.block || null : null;
        activeBlock?.classList.add("speech-bubble");
        if (shouldScroll && activeBlock && Date.now() >= automaticScrollUntil) {
          activeBlock.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "center",
          });
        }
      };
      const getVoice = () => {
        const selected = availableVoices.find((voice) => voice.voiceURI === voiceSelect.value);
        if (selected) return selected;
        const slovak = availableVoices.find((voice) => voice.lang.toLowerCase() === "sk-sk")
          || availableVoices.find((voice) => voice.lang.toLowerCase().startsWith("sk"));
        if (slovak) return slovak;
        if (availableVoices.length) {
          speechStatus.textContent = "Slovenský hlas nie je dostupný; používa sa najbližší dostupný hlas.";
          const languagePrefix = (navigator.language || "").toLowerCase().split("-")[0];
          return availableVoices.find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix)) || availableVoices[0];
        }
        speechStatus.textContent = "Slovenský hlas nie je dostupný; používa sa hlas prehliadača.";
        return null;
      };
      const clearKeepAlive = () => {
        window.clearInterval(utteranceTimer);
        utteranceTimer = 0;
      };
      const keepAlive = () => {
        clearKeepAlive();
        if (!/Chrome|Chromium/i.test(navigator.userAgent) || /Edg/i.test(navigator.userAgent)) return;
        utteranceTimer = window.setInterval(() => {
          if (isReading && !isPaused && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10_000);
      };
      const findNextLecture = () => {
        const links = [...document.querySelectorAll("a[href]")].filter((link) => {
          const label = link.textContent.trim();
          return !link.closest("nav, .global-course-nav") && (link.rel === "next" || /^(ďalšia|nasledujúca|pokračovať)\b/i.test(label));
        });
        const link = links.find((candidate) => {
          const url = new URL(candidate.href, location.href);
          return url.origin === location.origin && url.pathname.endsWith(".html") && url.pathname !== location.pathname;
        });
        return link?.href || "";
      };
      const finish = (message) => {
        runId += 1;
        clearKeepAlive();
        currentUtterance = null;
        isReading = false;
        isPaused = false;
        restartCurrent = false;
        selectedChunk = 0;
        showActiveBlock(-1, false);
        speechStatus.textContent = message;
        announce({ block: 0, chunk: 0, completed: message === "Prednáška dočítaná" });
        if (message === "Prednáška dočítaná" && nextLecture.checked) {
          const destination = findNextLecture();
          if (destination) window.setTimeout(() => location.assign(destination), 500);
        }
      };
      const speakChunk = (currentRun) => {
        if (currentRun !== runId || !isReading || isPaused) return;
        let item = blocks[selectedBlock];
        while (item && (!visibleBlock(item) || !item.chunks?.length)) {
          selectedBlock += 1;
          selectedChunk = 0;
          item = blocks[selectedBlock];
        }
        if (!item) {
          finish("Prednáška dočítaná");
          return;
        }
        if (selectedChunk >= item.chunks.length) {
          selectedBlock += 1;
          selectedChunk = 0;
          speakChunk(currentRun);
          return;
        }
        showActiveBlock(selectedBlock);
        announce();
        const voice = getVoice();
        const utterance = new SpeechSynthesisUtterance(item.chunks[selectedChunk]);
        utterance.lang = voice?.lang || "sk-SK";
        utterance.rate = Number(speedSelect.value);
        utterance.volume = Number(volumeSelect.value) / 100;
        if (voice) utterance.voice = voice;
        currentUtterance = utterance;
        utterance.onstart = () => { if (currentRun === runId) keepAlive(); };
        utterance.onend = () => {
          if (currentRun !== runId) return;
          currentUtterance = null;
          selectedChunk += 1;
          speakChunk(currentRun);
        };
        utterance.onerror = (event) => {
          if (currentRun !== runId || event.error === "canceled" || event.error === "interrupted") return;
          currentUtterance = null;
          if (event.error === "not-allowed" || event.error === "audio-busy") {
            isPaused = true;
            speechStatus.textContent = "Klepni pre povolenie zvuku";
            announce({ needsUnlock: true });
            return;
          }
          speechStatus.textContent = "Úsek sa nepodarilo prečítať; pokračujem ďalej.";
          selectedChunk += 1;
          window.setTimeout(() => speakChunk(currentRun), 80);
        };
        window.speechSynthesis.speak(utterance);
      };
      const startFrom = (blockIndex, chunkIndex = 0) => {
        if (!speechAvailable) {
          speechStatus.textContent = "Tento prehliadač nepodporuje hlasové čítanie textu.";
          return;
        }
        rebuildBlocks();
        if (!blocks.length) {
          speechStatus.textContent = "Na tejto stránke nie je text na čítanie.";
          return;
        }
        blocks.forEach((item) => { item.chunks = splitText(item.text); });
        runId += 1;
        clearKeepAlive();
        window.speechSynthesis.cancel();
        isReading = true;
        isPaused = false;
        restartCurrent = false;
        rememberedSelection = blocks.map((_, index) => index);
        selectedBlock = Math.max(0, Math.min(blocks.length - 1, Number(blockIndex) || 0));
        selectedChunk = Math.max(0, Number(chunkIndex) || 0);
        showActiveBlock(selectedBlock);
        speechStatus.textContent = "Spúšťam čítanie prednášky.";
        announce();
        speakChunk(runId);
      };
      const pause = () => {
        if (!isReading || isPaused) return;
        clearKeepAlive();
        if (typeof window.speechSynthesis.pause === "function") {
          window.speechSynthesis.pause();
        } else {
          window.speechSynthesis.cancel();
          restartCurrent = true;
        }
        isPaused = true;
        speechStatus.textContent = "Čítanie je pozastavené.";
        announce();
      };
      const resume = () => {
        if (!isReading || !isPaused) return;
        isPaused = false;
        if (restartCurrent) {
          restartCurrent = false;
          speakChunk(runId);
        } else {
          window.speechSynthesis.resume();
          keepAlive();
        }
        speechStatus.textContent = "Čítanie pokračuje.";
        announce();
      };
      const stop = () => {
        runId += 1;
        clearKeepAlive();
        window.speechSynthesis.cancel();
        isReading = false;
        isPaused = false;
        currentUtterance = null;
        speechStatus.textContent = "Čítanie je zastavené.";
        announce();
      };
      const onScrollIntent = (event) => {
        if (event.type === "keydown" && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) return;
        if (event.type === "pointermove" && !event.buttons) return;
        automaticScrollUntil = Date.now() + 5000;
      };
      ["wheel", "touchmove", "pointermove", "keydown"].forEach((eventName) => window.addEventListener(eventName, onScrollIntent, { passive: true }));
      window.addEventListener("pagehide", () => {
        runId += 1;
        clearKeepAlive();
        window.speechSynthesis.cancel();
      }, { once: true });
      [playButton, stopButton, pauseButton, replayButton].filter(Boolean).forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (button === playButton) isPaused ? resume() : startFrom(isReading ? selectedBlock : 0, isReading ? selectedChunk : 0);
          if (button === pauseButton) isPaused ? resume() : pause();
          if (button === stopButton) stop();
          if (button === replayButton) startFrom(0, 0);
        }, true);
      });
      voiceSelect.addEventListener("change", () => {
        if (isReading && !isPaused) startFrom(selectedBlock, selectedChunk);
      }, true);
      speedSelect.addEventListener("change", () => {
        if (isReading && !isPaused) startFrom(selectedBlock, selectedChunk);
      }, true);
      volumeSelect.addEventListener("change", () => {
        if (isReading && !isPaused) startFrom(selectedBlock, selectedChunk);
      }, true);

      rebuildBlocks();
      window.lessonSpeechRemote = Object.freeze({
        play: () => startFrom(isPaused || isReading ? selectedBlock : 0, isPaused || isReading ? selectedChunk : 0),
        playFrom: (blockIndex, chunkIndex) => startFrom(blockIndex, chunkIndex),
        pauseResume: () => isPaused ? resume() : pause(),
        pause,
        resume,
        stop,
        replay: () => startFrom(0, 0),
        restartLesson: () => startFrom(0, 0),
        playSection: (sectionIndex) => {
          const heading = sectionHeadings()[sectionIndex];
          const startIndex = blocks.findIndex((item) => item.block === heading);
          if (startIndex >= 0) startFrom(startIndex, 0);
        },
        getSectionStart: (sectionIndex) => {
          const heading = sectionHeadings()[sectionIndex];
          return Math.max(0, blocks.findIndex((item) => item.block === heading));
        },
        getBlockCount: () => blocks.length,
        highlightBlock: (blockIndex) => showActiveBlock(Math.max(0, Math.min(blocks.length - 1, Number(blockIndex) || 0))),
        getState: () => ({ isReading, isPaused, canReplay: rememberedSelection.length > 0 }),
      });
      document.addEventListener("click", (event) => {
        const modeButton = event.target.closest("#student, #teacher, #student-mode, #teacher-mode, #bs, #bt");
        if (modeButton) window.setTimeout(rebuildBlocks, 0);
      });
    };
    installContinuousReader();

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
      const clockDisclosure = make("details", "lesson-clock-disclosure");
      const clockSummary = make("summary", "", "Časovače hodiny a Pomodoro");
      clockDisclosure.append(clockSummary, lessonClock);
      sidePanel.append(clockDisclosure);
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
