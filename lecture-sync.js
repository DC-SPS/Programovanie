import { firebaseConfig } from "./firebase-config.js";

(() => {
  "use strict";

  const root = document.querySelector("main, .wrap, .w");
  if (!root) return;

  const sdkVersion = "10.14.1";
  const headings = [...root.querySelectorAll("h2")].filter((heading) => !heading.closest(".sources, footer"));
  const deviceId = getDeviceId();
  const section = document.querySelector(".lesson-side-panel") || document.createElement("aside");
  section.classList.add("lesson-side-panel");
  document.body.classList.add("lecture-sync-layout");
  section.setAttribute("aria-label", "Ovládanie a synchronizácia prednášky");
  document.body.prepend(section);
  const panelStyle = document.createElement("style");
  panelStyle.textContent = `
    body.lecture-sync-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,300px);align-items:start;column-gap:1rem}
    body.lecture-sync-layout>.global-course-nav{grid-column:1/-1}
    body.lecture-sync-layout>main,body.lecture-sync-layout>.wrap,body.lecture-sync-layout>.w{grid-column:1;grid-row:2;width:100%!important;max-width:none!important;min-width:0;margin:1rem 0 0!important;padding-bottom:1rem!important}
    .lesson-side-panel{position:sticky!important;grid-column:2;grid-row:2;top:1rem!important;right:auto!important;z-index:5000!important;width:300px!important;max-height:calc(100vh - 2rem)!important;margin:1rem 0 1rem!important;overflow-y:auto!important;overflow-x:hidden!important;padding:.5rem!important;border:1px solid var(--line)!important;border-radius:.8rem!important;background:var(--bg)!important;box-shadow:0 12px 38px #0003!important}
    .lecture-sync-controls{--ctl-play:#facc15;--ctl-nav:#2563eb;--ctl-session:#c2410c;container-type:inline-size;display:grid;gap:.5rem;padding:.6rem;border:1px solid var(--line);border-radius:.7rem;background:var(--card);color:var(--fg);font:13px/1.4 system-ui,"Segoe UI",sans-serif}
    .lecture-sync-controls__row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:9px;min-width:0}
    .lecture-sync-controls__course{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem}
    .lecture-sync-controls__course a{display:flex;align-items:center;justify-content:center;min-height:40px;padding:.35rem .4rem;border:1px solid var(--line);border-radius:.5rem;background:var(--bg);color:var(--fg);font-size:.72rem;font-weight:700;line-height:1.2;text-align:center;text-decoration:none}
    .lecture-sync-controls__course a:hover{text-decoration:underline}
    .lecture-sync-controls__course a:focus-visible{outline:3px solid var(--fg);outline-offset:2px}
    .lecture-sync-controls button,.lecture-sync-controls select{width:100%;min-width:0;min-height:48px;padding:.45rem .55rem;border:2px solid transparent;border-radius:.5rem;background:var(--ctl-session);color:#fff;font:700 .82rem/1.15 system-ui,"Segoe UI",sans-serif;text-align:center;white-space:nowrap;cursor:pointer}
    .lecture-sync-controls .ctl-play{min-height:56px;background:var(--ctl-play);color:#172033}
    .lecture-sync-controls .ctl-nav{background:var(--ctl-nav);color:#fff}
    .lecture-sync-controls .ctl-session{background:var(--ctl-session);color:#fff}
    .lecture-sync-controls button[aria-pressed="true"]{border-color:currentColor;box-shadow:inset 0 0 0 2px currentColor,0 0 0 2px var(--bg)}
    .lecture-sync-controls select{appearance:auto}
    .lecture-sync-controls button:focus-visible,.lecture-sync-controls select:focus-visible{outline:3px solid var(--fg);outline-offset:2px}
    .lecture-sync-controls button:disabled{opacity:.55;cursor:not-allowed}
    .lecture-sync-controls__status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .lecture-sync-controls__unlock{grid-column:1/-1}
    .lecture-sync-controls__progress{display:grid;gap:.22rem;padding:.1rem .15rem;color:var(--fg);font-size:.72rem;text-align:center}
    .lecture-sync-controls__track{height:3px;overflow:hidden;border-radius:99px;background:var(--line)}
    .lecture-sync-controls__fill{height:100%;width:0;background:var(--ctl-nav);transition:width .2s linear}
    .lecture-sync-controls__pair{margin:0;text-align:center}.lecture-sync-controls__pair[hidden]{display:none}
    .lecture-sync-controls__pair summary{padding:.35rem;color:var(--fg);font-size:.76rem;cursor:pointer}
    .lecture-sync-controls__qr-wrap{display:flex;justify-content:center;padding:.3rem}
    .lecture-sync-controls__qr{display:block;width:110px;height:110px;background:#fff;border-radius:.4rem}
    .lecture-sync-controls__device-status{margin:0;padding:0 .2rem;color:var(--fg);font-size:.72rem;line-height:1.35}
    .lecture-sync-controls__row--play button{min-height:56px}
    .lecture-sync-layout .lecture-sync-controls__row--play{display:none!important}
    @container (max-width:280px){.lecture-sync-controls button,.lecture-sync-controls select{padding-inline:.15rem;font-size:.64rem;letter-spacing:-.025em}.lecture-sync-controls .ctl-session[data-action="connect"]{font-size:.58rem}.lecture-sync-controls select{padding-right:.1rem}}
    @media(max-width:768px){body.lecture-sync-layout{display:block;overflow-x:hidden}body.lecture-sync-layout>main,body.lecture-sync-layout>.wrap,body.lecture-sync-layout>.w{width:100%!important;max-width:100%!important;margin:0!important}.lesson-side-panel{position:sticky!important;top:env(safe-area-inset-top,0px)!important;right:auto!important;bottom:auto!important;left:auto!important;z-index:5000!important;width:100%!important;max-height:30vh!important;overflow-y:auto!important;margin:0!important;padding:.3rem!important;border-radius:0 0 .65rem .65rem!important;background:var(--bg)!important;box-shadow:0 4px 12px #0003!important}.lesson-side-panel .narration-controls{padding:.3rem!important}.lecture-sync-controls{padding:.4rem;gap:.35rem}.lecture-sync-controls__row{gap:8px}.lecture-sync-controls button,.lecture-sync-controls select{min-height:48px;font-size:.78rem}.lecture-sync-controls__row--play button{min-height:56px}.lecture-sync-controls__pair[open] .lecture-sync-controls__qr{width:96px;height:96px}main,.wrap,.w{min-width:0;max-width:100%;overflow-wrap:anywhere}}
    @media print{.lecture-sync-controls{display:none!important}}
  `;
  document.head.append(panelStyle);

  const ui = document.createElement("section");
  ui.className = "lecture-sync-controls";
  const $ = (selector) => ui.querySelector(selector);
  ui.innerHTML = `
    <nav class="lecture-sync-controls__course" aria-label="Návrat na stránku kurzu">
      <a data-course-home>← Prehľad kurzu</a>
      <a data-all-courses>Všetky kurzy</a>
    </nav>
    <div class="lecture-sync-controls__row lecture-sync-controls__row--play">
      <button type="button" class="ctl-play" data-action="play" aria-pressed="false">▶ Prehrať</button>
      <button type="button" class="ctl-play" data-action="pause" aria-pressed="false">⏸ Pauza</button>
    </div>
    <div class="lecture-sync-controls__row">
      <button type="button" class="ctl-nav" data-action="previous" aria-label="Predošlá sekcia" title="Prejde na začiatok predchádzajúcej sekcie">◀ Predošlá</button>
      <button type="button" class="ctl-nav" data-action="next" aria-label="Ďalšia sekcia" title="Prejde na začiatok nasledujúcej sekcie">Ďalšia ▶</button>
    </div>
    <div class="lecture-sync-controls__row">
      <button type="button" class="ctl-session" data-action="connect" aria-label="Prihlásiť a zdieľať prednášku" title="Prihlási sa a zobrazí QR kód na pripojenie ďalšieho zariadenia">Prihlásiť / zdieľať</button>
      <select class="ctl-session" data-action="target" aria-label="Hlas hrá na" title="Vyber zariadenie, ktoré bude čítať nahlas. Druhé zariadenie je telefón alebo počítač pripojený cez QR kód."><option value="this">Toto zariadenie</option><option value="other" disabled>Druhé zariadenie</option></select>
    </div>
    <p class="lecture-sync-controls__device-status" data-target-status role="status" aria-live="polite">Prihlás sa a pripoj druhé zariadenie cez QR kód.</p>
    <div class="lecture-sync-controls__progress" data-progress hidden><span data-progress-label></span><div class="lecture-sync-controls__track" role="progressbar" aria-label="Priebeh prednášky" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="lecture-sync-controls__fill"></div></div></div>
    <button type="button" class="ctl-session lecture-sync-controls__unlock" data-action="unlock" hidden>Klepni pre povolenie zvuku</button>
    <span class="lecture-sync-controls__status" data-status data-state="offline" role="status" aria-live="polite"></span>
    <details class="lecture-sync-controls__pair" data-pair hidden><summary>Zobraziť QR kód na pripojenie</summary><div class="lecture-sync-controls__qr-wrap"><img class="lecture-sync-controls__qr" data-qr alt="QR kód na pripojenie zariadenia"></div></details>
  `;
  const pathParts = decodeURIComponent(location.pathname).split("/").filter(Boolean);
  const currentDirectory = pathParts.slice(0, -1);
  const courseDirectory = pathParts[0] || "";
  const relativeHref = (targetParts) => {
    let shared = 0;
    while (shared < currentDirectory.length && shared < targetParts.length && currentDirectory[shared] === targetParts[shared]) shared += 1;
    return [...Array(currentDirectory.length - shared).fill(".."), ...targetParts.slice(shared).map(encodeURIComponent)].join("/") || "./";
  };
  $(`[data-course-home]`).href = relativeHref(courseDirectory ? [courseDirectory, "index.html"] : ["index.html"]);
  $(`[data-all-courses]`).href = relativeHref(["index.html"]);
  section.prepend(ui);

  const status = $(`[data-status]`);
  const targetStatus = $(`[data-target-status]`);
  const pairBox = $(`[data-pair]`);
  const qr = $(`[data-qr]`);
  const unlockButton = $(`[data-action="unlock"]`);
  const progress = $(`[data-progress]`);
  const progressLabel = $(`[data-progress-label]`);
  const progressBar = $(`[role="progressbar"]`);
  const progressFill = $(`[data-progress] .lecture-sync-controls__fill`);
  const urlParams = new URLSearchParams(location.search);
  let pendingUid = urlParams.get("lectureSyncUid") || "";
  let navigationIntent = urlParams.get("lectureSyncNavigate") === "1";
  let activeUid = "";
  let dbApi;
  let db;
  let user = null;
  let localState = { page: decodeURI(location.pathname), section: 0, block: 0, chunk: 0, playing: false, paused: false, mode: document.body.classList.contains("teacher") ? "teacher" : "student", rate: readRate(), voice: readVoice(), playCommand: 0 };
  let currentRemote = null;
  let deviceList = [];
  let presenceAvailable = false;
  let presenceChecked = false;
  let selectedOtherDeviceId = "";
  let applyRemote = false;
  let speechReady = false;
  let appliedPlayCommand = null;

  const setStatus = (message, state = "offline") => {
    status.textContent = message;
    status.dataset.state = state;
  };
  const renderReadingState = (detail = {}) => {
    const playing = Boolean(detail.isReading && !detail.isPaused);
    const paused = Boolean(detail.isReading && detail.isPaused);
    $(`[data-action="play"]`).setAttribute("aria-pressed", String(playing));
    $(`[data-action="pause"]`).setAttribute("aria-pressed", String(paused));
    $(`[data-action="play"]`).disabled = playing;
    $(`[data-action="pause"]`).disabled = !playing;
    unlockButton.hidden = !detail.needsUnlock;
    if (Number.isInteger(detail.sectionCount) && detail.sectionCount > 0) {
      const sectionNumber = Math.min(detail.sectionCount, Math.max(1, Number(detail.section || 0) + 1));
      const percentage = Math.round((Number(detail.block || 0) / Math.max(1, Number(detail.blockCount || 1))) * 100);
      progress.hidden = false;
      progressLabel.textContent = `Sekcia ${sectionNumber} z ${detail.sectionCount}`;
      progressBar.setAttribute("aria-valuenow", String(percentage));
      progressFill.style.width = `${percentage}%`;
    }
  };
  renderReadingState();
  const changeState = (values) => {
    if (applyRemote) return;
    Object.assign(localState, values);
    publish();
  };
  const targetSelect = $(`[data-action="target"]`);
  const otherTargetOption = targetSelect.querySelector('option[value="other"]');
  const getOtherDevice = () => deviceList
    .filter((device) => device.deviceId !== deviceId)
    .sort((left, right) => left.deviceId.localeCompare(right.deviceId))[0];
  const isConnectedDevice = (id) => id === deviceId || deviceList.some((device) => device.deviceId === id);
  const setTargetSelection = (playOnDevice) => {
    if (playOnDevice === deviceId) {
      targetSelect.value = "this";
      return;
    }
    if (presenceAvailable && playOnDevice && isConnectedDevice(playOnDevice)) {
      selectedOtherDeviceId = playOnDevice;
      targetSelect.value = "other";
      return;
    }
    targetSelect.value = "this";
  };
  const updateTargetAvailability = () => {
    const otherDevice = presenceAvailable ? getOtherDevice() : null;
    otherTargetOption.disabled = !otherDevice;
    if (!deviceList.some((device) => device.deviceId === selectedOtherDeviceId)) {
      selectedOtherDeviceId = otherDevice?.deviceId || "";
    }
    if (!otherDevice) {
      selectedOtherDeviceId = "";
      targetSelect.value = "this";
      targetStatus.textContent = !presenceChecked
        ? (activeUid ? "Kontrolujem pripojené zariadenia…" : "Prihlás sa a pripoj druhé zariadenie cez QR kód.")
        : (presenceAvailable
          ? "Druhé zariadenie nie je pripojené. Naskenuj QR kód a otvor prednášku aj na druhom zariadení."
          : "Pripojenie druhého zariadenia sa nepodarilo overiť.");
    } else {
      targetStatus.textContent = "Druhé zariadenie je pripojené. Môžeš vybrať, kde sa bude prehrávať hlas.";
      if (currentRemote) setTargetSelection(currentRemote.playOnDevice);
    }
  };
  const getPlaybackDevice = () => {
    const otherDevice = getOtherDevice();
    if (targetSelect.value === "other" && presenceAvailable && otherDevice) {
      return deviceList.some((device) => device.deviceId === selectedOtherDeviceId)
        ? selectedOtherDeviceId
        : otherDevice.deviceId;
    }
    targetSelect.value = "this";
    return deviceId;
  };
  updateTargetAvailability();
  const selectSection = (index, shouldPlay = true) => {
    const bounded = Math.max(0, Math.min(headings.length - 1, index));
    if (!headings.length) return;
    speechReady = speechReady || shouldPlay;
    unlockButton.hidden = true;
    const blockIndex = window.lessonSpeechRemote?.getSectionStart?.(bounded) ?? 0;
    const playOnDevice = getPlaybackDevice();
    changeState({
      section: bounded,
      block: blockIndex,
      chunk: 0,
      playing: shouldPlay,
      paused: false,
      playOnDevice,
      playCommand: shouldPlay ? Number(localState.playCommand || 0) + 1 : Number(localState.playCommand || 0),
    });
    appliedPlayCommand = localState.playCommand;
    window.lessonSpeechRemote?.highlightBlock?.(blockIndex);
    if (shouldPlay && playOnDevice === deviceId && speechReady) window.lessonSpeechRemote?.playFrom?.(blockIndex, 0);
  };

  $(`[data-action="connect"]`).addEventListener("click", async () => {
    try {
      const authApi = await loadAuth();
      if (authApi.auth.currentUser) return;
      await authApi.signInWithPopup(authApi.auth, new authApi.GoogleAuthProvider());
    } catch (error) {
      setStatus(authMessage(error), "offline");
    }
  });
  $(`[data-action="previous"]`).addEventListener("click", () => selectSection(Number(localState.section || 0) - 1));
  $(`[data-action="next"]`).addEventListener("click", () => selectSection(Number(localState.section || 0) + 1));
  $(`[data-action="play"]`).addEventListener("click", () => {
    speechReady = true;
    unlockButton.hidden = true;
    const readerState = window.lessonSpeechRemote?.getState?.();
    const wasInProgress = Boolean(localState.playing || localState.paused || readerState?.isReading);
    const wasPaused = Boolean(localState.paused || readerState?.isPaused);
    const block = wasInProgress ? Number(localState.block || 0) : 0;
    const section = wasInProgress ? Number(localState.section || 0) : 0;
    const playOnDevice = getPlaybackDevice();
    changeState({
      section, block, chunk: wasInProgress ? Number(localState.chunk || 0) : 0,
      playing: true, paused: false, playOnDevice, playCommand: Number(localState.playCommand || 0) + 1,
    });
    appliedPlayCommand = localState.playCommand;
    if (playOnDevice === deviceId) {
      if (wasPaused) window.lessonSpeechRemote?.resume?.();
      else window.lessonSpeechRemote?.playFrom?.(block, wasInProgress ? Number(localState.chunk || 0) : 0);
    }
    else {
      applyRemote = true;
      window.lessonSpeechRemote?.pause?.();
      window.setTimeout(() => { applyRemote = false; }, 0);
    }
  });
  $(`[data-action="pause"]`).addEventListener("click", () => {
    window.lessonSpeechRemote?.pauseResume?.();
    changeState({ playing: false, paused: true });
  });
  unlockButton.addEventListener("click", () => {
    speechReady = true;
    unlockButton.hidden = true;
    const state = currentRemote || localState;
    if ((state.playing || state.paused) && (state.playOnDevice || deviceId) === deviceId) {
      changeState({ playing: true, paused: false, playOnDevice: deviceId });
      window.lessonSpeechRemote?.playFrom?.(Number(state.block || 0), Number(state.chunk || 0));
    }
  });
  $(`[data-action="target"]`).addEventListener("change", (event) => {
    const otherDevice = getOtherDevice();
    const playOnDevice = event.target.value === "this"
      ? deviceId
      : (presenceAvailable && otherDevice ? getPlaybackDevice() : "");
    if (!playOnDevice) {
      event.target.value = "this";
      updateTargetAvailability();
      return;
    }
    if (playOnDevice !== deviceId) selectedOtherDeviceId = playOnDevice;
    changeState({
      playOnDevice,
      paused: false,
      playing: Boolean(localState.playing || localState.paused),
      playCommand: (localState.playing || localState.paused) ? Number(localState.playCommand || 0) + 1 : Number(localState.playCommand || 0),
    });
    if ((localState.playing || localState.paused) && playOnDevice === deviceId && speechReady) {
      window.lessonSpeechRemote?.playFrom?.(Number(localState.block || 0), Number(localState.chunk || 0));
    } else if (playOnDevice !== deviceId) {
      applyRemote = true;
      window.lessonSpeechRemote?.pause?.();
      window.setTimeout(() => { applyRemote = false; }, 0);
    }
  });

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (anchor && (activeUid || pendingUid)) {
      try {
        const destination = new URL(anchor.href, location.href);
        if (destination.origin === location.origin && destination.pathname.endsWith(".html")) {
          destination.searchParams.set("lectureSyncUid", activeUid || pendingUid);
          destination.searchParams.set("lectureSyncNavigate", "1");
          anchor.href = destination.href;
        }
      } catch (_) { /* Leave unrelated links unchanged. */ }
    }
    const button = event.target.closest("#student, #teacher, #student-mode, #teacher-mode, #bs, #bt");
    if (!button) return;
    window.setTimeout(() => changeState({ mode: document.body.classList.contains("teacher") ? "teacher" : "student" }), 0);
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("#narration-speed")) changeState({ rate: Number(event.target.value) });
    if (event.target.matches("#narration-voice")) changeState({ voice: event.target.value });
  });
  window.addEventListener("lesson-reading-state", (event) => {
    if (applyRemote) return;
    const detail = event.detail || {};
    renderReadingState(detail);
    const playing = Boolean(detail.isReading && !detail.isPaused);
    const section = Number.isInteger(detail.section) ? detail.section : localState.section;
    changeState({
      section,
      block: Number.isInteger(detail.block) ? detail.block : localState.block,
      chunk: Number.isInteger(detail.chunk) ? detail.chunk : localState.chunk,
      playing,
      paused: Boolean(detail.isReading && detail.isPaused),
      playOnDevice: getPlaybackDevice(),
    });
  });
  window.addEventListener("pagehide", () => {
    dbApi?.remove?.(dbApi.ref(db, `presence/${activeUid}/${deviceId}`));
  });

  async function loadAuth() {
    const [appModule, authModule] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-auth.js`),
    ]);
    const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(firebaseConfig);
    const auth = authModule.getAuth(app);
    return { auth, onAuthStateChanged: authModule.onAuthStateChanged, signInWithPopup: authModule.signInWithPopup, GoogleAuthProvider: authModule.GoogleAuthProvider };
  }

  async function onSignedIn(signedInUser) {
    user = signedInUser;
    if (!user) {
      setStatus("Prihlás sa cez Google na synchronizáciu", "offline");
      pairBox.hidden = true;
      return;
    }
    try {
      const idToken = await user.getIdTokenResult();
      if (user.email !== "dusan.cabala.sps@gmail.com" || !user.emailVerified || idToken.claims.email_verified !== true) {
        setStatus("Tento účet nemá povolenie na synchronizáciu", "offline");
        return;
      }
      activeUid = user.uid;
      const [appModule, databaseModule] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${sdkVersion}/firebase-database.js`),
      ]);
      const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(firebaseConfig);
      dbApi = databaseModule;
      db = databaseModule.getDatabase(app, firebaseConfig.databaseURL);
      showPairLink(activeUid);
      attachSession();
    } catch (error) {
      setStatus(`Pripojenie zlyhalo (${error?.code || "konfigurácia Firebase"})`, "offline");
    }
  }

  function showPairLink(uid) {
    const pairUrl = new URL(location.href);
    pairUrl.searchParams.set("lectureSyncUid", uid);
    pairUrl.searchParams.delete("remoteMirror");
    pairUrl.searchParams.delete("session");
    pairBox.hidden = false;
    pairBox.open = !window.matchMedia("(max-width: 768px)").matches;
    import("https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm").then((module) => {
      const QRCode = module.default;
      QRCode.toDataURL(pairUrl.toString(), { width: 220, margin: 1 })
        .then((image) => { qr.src = image; })
        .catch(() => setStatus("QR kód sa nepodarilo vytvoriť.", "offline"));
    }).catch(() => setStatus("Knižnica QR kódu sa nepodarilo načítať.", "offline"));
  }

  function attachSession() {
    if (pendingUid && pendingUid !== activeUid) {
      setStatus("Prihlás sa účtom, ktorý vytvoril zdieľanie", "offline");
      return;
    }
    pendingUid = "";
    const stateRef = dbApi.ref(db, `sessions/${activeUid}`);
    const presenceRef = dbApi.ref(db, `presence/${activeUid}/${deviceId}`);
    const devicesRef = dbApi.ref(db, `presence/${activeUid}`);
    dbApi.onDisconnect(presenceRef).remove().catch((error) => setStatus(`Odpojenie zariadenia sa nepodarilo nastaviť (${error?.code || "chyba"})`, "offline"));
    dbApi.set(presenceRef, { deviceId, page: localState.page, onlineAt: dbApi.serverTimestamp() })
      .catch((error) => setStatus(`Zariadenie sa nepodarilo zaregistrovať (${error?.code || "chyba"})`, "offline"));
    presenceAvailable = false;
    presenceChecked = false;
    updateTargetAvailability();
    dbApi.onValue(devicesRef, (snapshot) => {
      deviceList = Object.entries(snapshot.val() || {})
        .filter(([id, value]) => id && value && typeof value === "object")
        .map(([id, value]) => ({ ...value, deviceId: id }))
        .filter((device) => device.deviceId !== deviceId);
      presenceAvailable = true;
      presenceChecked = true;
      updateTargetAvailability();
      reconcilePlaybackTarget();
    }, (error) => {
      presenceAvailable = false;
      presenceChecked = true;
      deviceList = [];
      updateTargetAvailability();
      setStatus(`Zoznam zariadení sa nepodarilo načítať (${error?.code || "chyba"})`, "offline");
    });
    dbApi.onValue(stateRef, (snapshot) => {
      const remote = snapshot.val();
      if (!remote) {
        publish();
        return;
      }
      const initialState = !currentRemote;
      currentRemote = remote;
      if (navigationIntent) {
        navigationIntent = false;
        localState = {
          ...remote,
          page: decodeURI(location.pathname),
          section: 0,
          block: 0,
          chunk: 0,
          playing: Boolean(remote.playing),
          playCommand: Number(remote.playCommand || 0) + (remote.playing ? 1 : 0),
        };
        appliedPlayCommand = null;
        publish();
        return;
      }
      if (remote.updatedBy === deviceId && !initialState) return;
      applyState(remote);
      reconcilePlaybackTarget();
    }, (error) => setStatus(`Synchronizácia odmietnutá (${error?.code || "chyba"})`, "offline"));
    setStatus("Synchronizácia je pripojená", "online");
  }

  function publish() {
    if (!db || !activeUid || !user) return;
    const payload = { ...localState, page: decodeURI(location.pathname), updatedAt: Date.now(), updatedBy: deviceId };
    dbApi.runTransaction(dbApi.ref(db, `sessions/${activeUid}`), (current) => {
      if (current && Number(current.updatedAt) > payload.updatedAt) return;
      return payload;
    }).catch((error) => setStatus(`Zápis stavu zlyhal (${error?.code || "chyba"})`, "offline"));
    dbApi.update(dbApi.ref(db, `presence/${activeUid}/${deviceId}`), { page: payload.page, onlineAt: dbApi.serverTimestamp() })
      .catch((error) => setStatus(`Aktualizácia zariadenia zlyhala (${error?.code || "chyba"})`, "offline"));
  }

  function applyState(remote) {
    if (!remote || !Number.isFinite(Number(remote.updatedAt))) return;
    if (currentRemote && Number(remote.updatedAt) < Number(currentRemote.updatedAt)) return;
    currentRemote = remote;
    const nextPath = String(remote.page || "");
    let destination;
    try { destination = new URL(nextPath, location.origin); } catch { return; }
    if (destination.origin !== location.origin || !destination.pathname.endsWith(".html")) return;
    if (decodeURI(destination.pathname) !== decodeURI(location.pathname)) {
      destination.searchParams.set("lectureSyncUid", activeUid);
      location.assign(destination.href);
      return;
    }
    applyRemote = true;
    localState = { ...localState, ...remote };
    document.body.classList.toggle("teacher", remote.mode === "teacher");
    const teacherButton = document.querySelector("#teacher, #teacher-mode, #bt");
    const studentButton = document.querySelector("#student, #student-mode, #bs");
    teacherButton?.classList.toggle("on", remote.mode === "teacher");
    studentButton?.classList.toggle("on", remote.mode !== "teacher");
    teacherButton?.setAttribute("aria-pressed", String(remote.mode === "teacher"));
    studentButton?.setAttribute("aria-pressed", String(remote.mode !== "teacher"));
    document.querySelector("#narration-speed") && (document.querySelector("#narration-speed").value = String(remote.rate || 1));
    document.querySelector("#narration-voice") && (document.querySelector("#narration-voice").value = remote.voice || "");
    setTargetSelection(remote.playOnDevice);
    renderReadingState({
      isReading: Boolean(remote.playing || remote.paused),
      isPaused: Boolean(remote.paused),
      section: Number(remote.section || 0),
      sectionCount: headings.length,
      block: Number(remote.block || 0),
      blockCount: window.lessonSpeechRemote?.getBlockCount?.() || 1,
    });
    const blockIndex = Number.isInteger(remote.block) ? remote.block : (window.lessonSpeechRemote?.getSectionStart?.(Number(remote.section || 0)) || 0);
    window.lessonSpeechRemote?.highlightBlock?.(blockIndex);
    const playbackDevice = remote.playOnDevice || "";
    if ((remote.playing || remote.paused) && playbackDevice === deviceId) {
      if (!speechReady) {
        unlockButton.hidden = false;
        setStatus("Klepni pre povolenie zvuku", "offline");
      } else if (remote.paused) {
        window.lessonSpeechRemote?.pause?.();
      } else if (appliedPlayCommand !== remote.playCommand) {
        appliedPlayCommand = remote.playCommand;
        if (window.lessonSpeechRemote?.getState?.().isPaused) window.lessonSpeechRemote?.resume?.();
        else window.lessonSpeechRemote?.playFrom?.(blockIndex, Number(remote.chunk || 0));
      }
    } else if (window.lessonSpeechRemote?.getState?.().isReading && !window.lessonSpeechRemote.getState().isPaused) {
      window.lessonSpeechRemote?.pause?.();
    }
    window.setTimeout(() => { applyRemote = false; }, 0);
  }

  function getDeviceId() {
    const key = "lecture-sync.device-id";
    const createId = () => {
      if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
      if (globalThis.crypto?.getRandomValues) {
        const bytes = new Uint8Array(16);
        globalThis.crypto.getRandomValues(bytes);
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      }
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    };
    try {
      let id = localStorage.getItem(key);
      if (!id) { id = createId(); localStorage.setItem(key, id); }
      return id;
    } catch (_) {
      try {
        let id = sessionStorage.getItem(key);
        if (!id) { id = createId(); sessionStorage.setItem(key, id); }
        return id;
      } catch (_) {
        return createId();
      }
    }
  }
  function getPreferredDeviceId() {
    return [deviceId, ...deviceList.map((device) => device.deviceId)]
      .sort((left, right) => left.localeCompare(right))[0] || "";
  }
  function reconcilePlaybackTarget() {
    if (!presenceAvailable || !currentRemote || !(currentRemote.playing || currentRemote.paused)) return;
    if (currentRemote.playOnDevice && isConnectedDevice(currentRemote.playOnDevice)) return;
    const preferredTarget = getPreferredDeviceId();
    if (!preferredTarget || preferredTarget !== deviceId) return;
    const next = {
      ...currentRemote,
      playOnDevice: preferredTarget,
      playCommand: Number(currentRemote.playCommand || 0) + (currentRemote.playing ? 1 : 0),
      updatedAt: Date.now(),
      updatedBy: deviceId,
    };
    currentRemote = next;
    localState = { ...localState, ...next };
    publish();
    applyState(next);
  }
  function readRate() { return Number(document.querySelector("#narration-speed")?.value || 1); }
  function readVoice() { return document.querySelector("#narration-voice")?.value || ""; }
  function authMessage(error) { return error?.code === "auth/unauthorized-domain" ? "Doména stránky nie je povolená v Firebase Authentication." : `Prihlásenie zlyhalo (${error?.code || "chyba"})`; }

  loadAuth().then((auth) => auth.onAuthStateChanged(auth.auth, onSignedIn, () => setStatus("Google prihlásenie sa nepodarilo načítať", "offline")))
    .catch(() => setStatus("Synchronizácia bude dostupná po prihlásení", "offline"));
  window.addEventListener("online", () => setStatus("Synchronizácia je pripojená", "online"));
  window.addEventListener("offline", () => setStatus("Synchronizácia je offline", "offline"));
})();
