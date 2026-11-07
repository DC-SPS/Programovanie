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
  section.setAttribute("aria-label", "Ovládanie a synchronizácia prednášky");
  document.body.prepend(section);
  const panelStyle = document.createElement("style");
  panelStyle.textContent = `
    .lecture-sync-controls{display:grid;gap:.5rem;padding:.65rem;border:1px solid #2b5674;border-radius:.7rem;background:#0b1723;color:#edf6ff;font:13px/1.4 system-ui,"Segoe UI",sans-serif}
    .lecture-sync-controls__row{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
    .lecture-sync-controls button,.lecture-sync-controls select,.lecture-sync-controls a{min-height:44px;padding:.45rem .65rem;border:1px solid #32617e;border-radius:.5rem;background:#12334b;color:#edf6ff;font:600 .82rem system-ui,"Segoe UI",sans-serif}
    .lecture-sync-controls button,.lecture-sync-controls a{cursor:pointer;text-decoration:none}
    .lecture-sync-controls button:disabled{opacity:.55;cursor:not-allowed}
    .lecture-sync-controls__status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .lecture-sync-controls__pair{display:flex;justify-content:center;align-items:center}.lecture-sync-controls__pair[hidden]{display:none}
    .lecture-sync-controls__qr{display:block;width:110px;height:110px;background:#fff;border-radius:.4rem}
    @media(max-width:768px){.lesson-side-panel{position:sticky!important;top:0!important;right:auto!important;bottom:auto!important;left:auto!important;z-index:5000!important;width:100%!important;max-height:54vh!important;overflow-y:auto!important;margin:0!important;padding:.4rem!important;border-radius:0 0 .8rem .8rem!important}.lesson-side-panel .narration-controls button,.lesson-side-panel .lecture-sync-controls button,.lesson-side-panel .lecture-sync-controls select{min-height:44px}main,.wrap,.w{min-width:0;max-width:100%;padding-bottom:16px!important;overflow-wrap:anywhere}body{overflow-x:hidden!important}}
    @media(max-width:420px){.lecture-sync-controls__qr{width:110px;height:110px}}
    @media print{.lecture-sync-controls{display:none!important}}
  `;
  document.head.append(panelStyle);

  const ui = document.createElement("section");
  ui.className = "lecture-sync-controls";
  ui.innerHTML = `
    <div class="lecture-sync-controls__row">
      <button type="button" data-action="connect">Prihlásiť a zdieľať</button>
      <span class="lecture-sync-controls__status" data-status data-state="offline" role="status" aria-live="polite"></span>
    </div>
    <div class="lecture-sync-controls__row">
      <button type="button" data-action="previous" aria-label="Predošlá sekcia">◀ Predošlá sekcia</button>
      <button type="button" data-action="play">▶ Prehrať</button>
      <button type="button" data-action="pause">⏸ Pauza</button>
      <button type="button" data-action="next" aria-label="Ďalšia sekcia">Ďalšia sekcia ▶</button>
    </div>
    <div class="lecture-sync-controls__row">
      <select data-action="target" aria-label="Prehrávať na"><option value="this">Toto zariadenie</option><option value="other">Druhé zariadenie</option></select>
      <button type="button" data-action="unlock" hidden>Klepni pre povolenie zvuku</button>
    </div>
    <div class="lecture-sync-controls__pair" data-pair hidden><img class="lecture-sync-controls__qr" data-qr alt="QR kód na pripojenie zariadenia"></div>
  `;
  section.prepend(ui);

  const $ = (selector) => ui.querySelector(selector);
  const status = $(`[data-status]`);
  const pairBox = $(`[data-pair]`);
  const qr = $(`[data-qr]`);
  const unlockButton = $(`[data-action="unlock"]`);
  const urlParams = new URLSearchParams(location.search);
  let pendingUid = urlParams.get("lectureSyncUid") || "";
  let navigationIntent = urlParams.get("lectureSyncNavigate") === "1";
  let activeUid = "";
  let dbApi;
  let db;
  let user = null;
  let localState = { page: decodeURI(location.pathname), section: 0, playing: false, mode: "student", rate: readRate(), voice: readVoice() };
  let currentRemote = null;
  let deviceList = [];
  let applyRemote = false;
  let speechReady = false;

  const setStatus = (message, state = "offline") => {
    status.textContent = message;
    status.dataset.state = state;
  };
  const changeState = (values) => {
    if (applyRemote) return;
    Object.assign(localState, values);
    publish();
  };
  const sectionIndex = () => {
    const active = document.querySelector(".speech-bubble");
    if (!active) return localState.section;
    const activeHeading = headings.indexOf(active);
    if (activeHeading >= 0) return activeHeading;
    let preceding = -1;
    headings.forEach((heading, index) => {
      if (heading.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING) preceding = index;
    });
    return preceding >= 0 ? preceding : localState.section;
  };
  const selectSection = (index, shouldPlay = true) => {
    const bounded = Math.max(0, Math.min(headings.length - 1, index));
    if (!headings.length) return;
    localState.section = bounded;
    headings[bounded].scrollIntoView({ behavior: "smooth", block: "start" });
    if (shouldPlay && window.lessonSpeechRemote?.playSection) window.lessonSpeechRemote.playSection(bounded);
    const other = deviceList.find((device) => device.deviceId !== deviceId);
    changeState({
      section: bounded,
      playing: shouldPlay,
      playOnDevice: $(`[data-action="target"]`).value === "this" ? deviceId : (other?.deviceId || ""),
    });
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
  $(`[data-action="previous"]`).addEventListener("click", () => selectSection(sectionIndex() - 1));
  $(`[data-action="next"]`).addEventListener("click", () => selectSection(sectionIndex() + 1));
  $(`[data-action="play"]`).addEventListener("click", () => {
    speechReady = true;
    unlockButton.hidden = true;
    selectSection(sectionIndex(), true);
  });
  $(`[data-action="pause"]`).addEventListener("click", () => {
    window.lessonSpeechRemote?.pauseResume?.();
    changeState({ section: sectionIndex(), playing: false });
  });
  unlockButton.addEventListener("click", () => {
    speechReady = true;
    unlockButton.hidden = true;
    if (currentRemote?.playing) selectSection(currentRemote.section, true);
  });
  $(`[data-action="target"]`).addEventListener("change", (event) => {
    const other = deviceList.find((device) => device.deviceId !== deviceId);
    changeState({ playOnDevice: event.target.value === "this" ? deviceId : (other?.deviceId || "") });
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
    const playing = Boolean(event.detail?.isReading && !event.detail?.isPaused);
    const other = deviceList.find((device) => device.deviceId !== deviceId);
    changeState({
      section: sectionIndex(),
      playing,
      playOnDevice: $(`[data-action="target"]`).value === "this" ? deviceId : (other?.deviceId || ""),
    });
  });
  window.addEventListener("pagehide", () => dbApi?.remove?.(dbApi.ref(db, `presence/${activeUid}/${deviceId}`)));

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
    import("https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm").then((module) => {
      const QRCode = module.default;
      QRCode.toDataURL(pairUrl.toString(), { width: 220, margin: 1 }).then((image) => { qr.src = image; }).catch(() => {});
    }).catch(() => {});
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
    dbApi.onDisconnect(presenceRef).remove().catch(() => {});
    dbApi.set(presenceRef, { deviceId, page: localState.page, onlineAt: dbApi.serverTimestamp() }).catch(() => {});
    dbApi.onValue(devicesRef, (snapshot) => {
      deviceList = Object.entries(snapshot.val() || {}).map(([id, value]) => ({ deviceId: id, ...value }));
    }, () => {});
    dbApi.onValue(stateRef, (snapshot) => {
      const remote = snapshot.val();
      if (!remote) {
        publish();
        return;
      }
      currentRemote = remote;
      if (remote.updatedBy === deviceId) return;
      if (navigationIntent) {
        navigationIntent = false;
        localState = { ...remote, page: decodeURI(location.pathname), section: 0, playing: false };
        publish();
        return;
      }
      applyState(remote);
    }, (error) => setStatus(`Synchronizácia odmietnutá (${error?.code || "chyba"})`, "offline"));
    setStatus("Synchronizácia je pripojená", "online");
    if (pendingUid || urlParams.has("lectureSyncUid")) applyState({ ...localState, page: localState.page });
    else publish();
  }

  function publish() {
    if (!db || !activeUid || !user) return;
    const payload = { ...localState, page: decodeURI(location.pathname), updatedAt: Date.now(), updatedBy: deviceId };
    dbApi.runTransaction(dbApi.ref(db, `sessions/${activeUid}`), (current) => {
      if (current && Number(current.updatedAt) > payload.updatedAt) return;
      return payload;
    }).catch((error) => setStatus(`Zápis stavu zlyhal (${error?.code || "chyba"})`, "offline"));
    dbApi.update(dbApi.ref(db, `presence/${activeUid}/${deviceId}`), { page: payload.page, onlineAt: dbApi.serverTimestamp() }).catch(() => {});
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
    document.querySelector("#teacher, #teacher-mode, #bt")?.classList.toggle("on", remote.mode === "teacher");
    document.querySelector("#student, #student-mode, #bs")?.classList.toggle("on", remote.mode !== "teacher");
    document.querySelector("#narration-speed") && (document.querySelector("#narration-speed").value = String(remote.rate || 1));
    document.querySelector("#narration-voice") && (document.querySelector("#narration-voice").value = remote.voice || "");
    $(`[data-action="target"]`).value = remote.playOnDevice === deviceId ? "this" : "other";
    if (remote.playing && Number.isInteger(remote.section) && remote.playOnDevice === deviceId) {
      if (speechReady) selectSection(remote.section, true);
      else unlockButton.hidden = false;
    } else if (!remote.playing || remote.playOnDevice !== deviceId) {
      window.lessonSpeechRemote?.pause?.();
      headings[remote.section]?.scrollIntoView({ block: "start" });
    }
    window.setTimeout(() => { applyRemote = false; }, 0);
  }

  function getDeviceId() {
    const key = "lecture-sync.device-id";
    try {
      let id = localStorage.getItem(key);
      if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
      return id;
    } catch (_) { return crypto.randomUUID(); }
  }
  function readRate() { return Number(document.querySelector("#narration-speed")?.value || 1); }
  function readVoice() { return document.querySelector("#narration-voice")?.value || ""; }
  function authMessage(error) { return error?.code === "auth/unauthorized-domain" ? "Doména stránky nie je povolená v Firebase Authentication." : `Prihlásenie zlyhalo (${error?.code || "chyba"})`; }

  loadAuth().then((auth) => auth.onAuthStateChanged(auth.auth, onSignedIn, () => setStatus("Google prihlásenie sa nepodarilo načítať", "offline")))
    .catch(() => setStatus("Synchronizácia bude dostupná po prihlásení", "offline"));
  window.addEventListener("online", () => setStatus("Synchronizácia je pripojená", "online"));
  window.addEventListener("offline", () => setStatus("Synchronizácia je offline", "offline"));
})();
