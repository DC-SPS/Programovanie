import { firebaseConfig } from "./firebase-config.js";

(() => {
  const control = window.lessonSpeechRemote;
  const main = document.querySelector("main");
  if (!control || !main) return;
  if (new URLSearchParams(location.search).get("remoteMirror") === "1") return;

  const version = "10.14.1";
  let sdkPromise;
  const loadFirebase = () => {
    if (!sdkPromise) {
      sdkPromise = Promise.all([
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
      ]).then(([appSdk, authSdk, dbSdk]) => {
        const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
        return { appSdk, authSdk, dbSdk, auth: authSdk.getAuth(app), db: dbSdk.getFirestore(app) };
      });
    }
    return sdkPromise;
  };

  const pageTitle = main.querySelector("h1")?.textContent.trim() || document.title;
  const pagePath = location.pathname.slice(0, 500);
  const modeGroup = document.querySelector(".mode");
  const studentMode = modeGroup?.querySelector("#student-mode, #student, #bs");
  const teacherMode = modeGroup?.querySelector("#teacher-mode, #teacher, #bt");
  let session = null;
  let stopCommands = null;
  let heartbeatTimer = 0;
  let closing = false;

  if (modeGroup && studentMode && teacherMode && !modeGroup.querySelector("[data-presenter-mode]")) {
    const style = document.createElement("style");
    style.textContent = `
      body.presenter-mode main{visibility:hidden}
      body.presenter-mode .lesson-side-panel{visibility:visible}
      body.presenter-mode .global-course-nav{visibility:hidden}
      body.presenter-mode .mode{position:fixed;top:.65rem;left:.65rem;right:auto;z-index:10001;visibility:visible;border:1px solid #42627a;border-radius:.7rem;background:#102234;box-shadow:0 5px 22px #0006}
      .mode [data-presenter-mode]{border:0;border-radius:0 .6rem .6rem 0;background:#17364d;color:#edf6ff;font:inherit;padding:.4rem .7rem;cursor:pointer}
      .mode [data-presenter-mode].on{background:#579bff;color:#fff}
      .mode [data-presenter-mode]:focus-visible{outline:3px solid #fde047;outline-offset:2px}
      @media print{.mode [data-presenter-mode]{display:none!important}}
    `;
    document.head.append(style);
    const presenterMode = document.createElement("button");
    presenterMode.type = "button";
    presenterMode.dataset.presenterMode = "";
    presenterMode.setAttribute("aria-pressed", "false");
    presenterMode.textContent = "Prednášajúci";
    modeGroup.append(presenterMode);
    const selectMode = (presenter) => {
      document.body.classList.toggle("presenter-mode", presenter);
      presenterMode.classList.toggle("on", presenter);
      presenterMode.setAttribute("aria-pressed", String(presenter));
      if (presenter) {
        document.body.classList.remove("teacher");
        studentMode.classList.add("on");
        teacherMode.classList.remove("on");
        studentMode.setAttribute("aria-pressed", "true");
        teacherMode.setAttribute("aria-pressed", "false");
      }
    };
    presenterMode.addEventListener("click", () => selectMode(true));
    studentMode.addEventListener("click", () => selectMode(false));
    teacherMode.addEventListener("click", () => selectMode(false));
  }

  // Keep the session discoverable while the lecture tab remains visible. Losing
  // window focus (for example, when testing the remote in another window) must
  // not make the lecture disappear from the mobile client's active-session query.
  const isActivePage = () => document.visibilityState === "visible";

  const publishPresence = async () => {
    if (!session || closing) return;
    const { dbSdk, db, ref } = session;
    try {
      await dbSdk.updateDoc(ref, {
        pageActive: isActivePage(),
        pageHeartbeatAt: dbSdk.serverTimestamp(),
        displayMode: document.body.classList.contains("teacher") ? "teacher" : "student",
      });
    } catch {
      // The mobile device treats a stale heartbeat as a disconnected page.
    }
  };

  const publishPlayback = async () => {
    if (!session || closing) return;
    const { dbSdk, ref } = session;
    const state = control.getState();
    try {
      await dbSdk.updateDoc(ref, {
        playbackState: state.isReading ? (state.isPaused ? "paused" : "playing") : "stopped",
        canReplay: Boolean(state.canReplay),
        canRestartCurrent: Boolean(state.canRestartCurrent),
        pageActive: isActivePage(),
        pageHeartbeatAt: dbSdk.serverTimestamp(),
        displayMode: document.body.classList.contains("teacher") ? "teacher" : "student",
      });
    } catch {
      // Presence expires automatically if Firestore is unavailable.
    }
  };

  const listenForCommands = (activeSession) => {
    stopCommands?.();
    const { dbSdk, db, ref } = activeSession;
    const commandRef = dbSdk.collection(ref, "commands");
    stopCommands = dbSdk.onSnapshot(commandRef, (snapshot) => {
      if (session?.id !== activeSession.id || !isActivePage()) return;
      for (const change of snapshot.docChanges()) {
        if (change.type !== "added") continue;
        const command = change.doc.data();
        if (command.targetSessionId !== activeSession.id) continue;
        if (!command.createdAt || Date.now() - command.createdAt.toMillis() > 30_000) continue;
        const actions = {
          play: control.play,
          pauseResume: control.pauseResume,
          stop: control.stop,
          restartLesson: control.restartLesson,
          restartCurrent: control.restartCurrent,
        };
        if (actions[command.type]) {
          actions[command.type]();
        } else if (command.type === "panelClick") {
          document.querySelector(".lesson-side-panel")?.querySelectorAll("button")[command.controlIndex]?.click();
        } else if (command.type === "panelChange") {
          const target = document.querySelector(".lesson-side-panel")?.querySelectorAll("input,select,textarea")[command.controlIndex];
          if (target) {
            target.value = command.value;
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }
      publishPlayback();
    });
  };

  const stopSession = async (markInactive = true) => {
    if (!session) return;
    const old = session;
    session = null;
    stopCommands?.();
    stopCommands = null;
    clearInterval(heartbeatTimer);
    heartbeatTimer = 0;
    window.removeEventListener("lesson-reading-state", publishPlayback);
    if (markInactive) {
      try {
        await old.dbSdk.updateDoc(old.ref, {
          pageActive: false,
          pageHeartbeatAt: old.dbSdk.serverTimestamp(),
        });
      } catch {
        // The mobile device will stop accepting commands when the heartbeat expires.
      }
    }
  };

  const startSession = async (user) => {
    const { db, dbSdk } = await loadFirebase();
    await stopSession(false);
    closing = false;
    const id = crypto.randomUUID();
    const ref = dbSdk.doc(db, "remoteSessions", id);
    const next = { id, ref, db, dbSdk };
    await dbSdk.setDoc(ref, {
      ownerUid: user.uid,
      pageTitle,
      pagePath,
      pageActive: true,
      pageHeartbeatAt: dbSdk.serverTimestamp(),
      playbackState: "stopped",
      canReplay: false,
      canRestartCurrent: false,
      displayMode: document.body.classList.contains("teacher") ? "teacher" : "student",
      createdAt: dbSdk.serverTimestamp(),
    });
    session = next;
    listenForCommands(next);
    window.addEventListener("lesson-reading-state", publishPlayback);
    await publishPresence();
    heartbeatTimer = window.setInterval(publishPresence, 10_000);
  };

  const refreshActiveState = () => {
    publishPresence();
  };

  window.addEventListener("focus", refreshActiveState);
  window.addEventListener("blur", refreshActiveState);
  document.addEventListener("visibilitychange", refreshActiveState);
  window.addEventListener("online", refreshActiveState);
  window.addEventListener("pagehide", () => {
    if (!session) return;
    closing = true;
    session.dbSdk.updateDoc(session.ref, {
      pageActive: false,
      pageHeartbeatAt: session.dbSdk.serverTimestamp(),
    }).catch(() => {});
  });

  loadFirebase().then(({ authSdk, auth }) => {
    authSdk.onAuthStateChanged(auth, (user) => {
      if (!user) {
        stopSession(false);
        return;
      }
      startSession(user).catch(() => stopSession(false));
    });
  }).catch(() => {});
})();
