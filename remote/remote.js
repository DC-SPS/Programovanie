import { firebaseConfig } from "../firebase-config.js";

const version = "10.14.1";
const [appSdk, authSdk, firestore] = await Promise.all([
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
]);
const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
const auth = authSdk.getAuth(app);
const db = firestore.getFirestore(app);
const $ = (selector) => document.querySelector(selector);
const connection = $("#connection");
const authView = $("#auth-view");
const controlView = $("#control-view");
const notice = $("#notice");
const mirror = $("#lesson-mirror");
const authButton = $("#sign-in");

let currentUser = null;
let currentSession = null;
let stopActiveLessons = null;
let stopSession = null;
let freshnessTimer = 0;
let connected = false;

function showNotice(message = "") {
  notice.textContent = message;
  notice.hidden = !message;
}

function setConnection(message, state = "connecting") {
  connection.textContent = message;
  connection.dataset.state = state;
  connected = state === "connected";
}

function showView(view) {
  authView.hidden = view !== "auth";
  controlView.hidden = view !== "control";
}

function isStale(timestamp) {
  return !timestamp || Date.now() - timestamp.toMillis() > 35_000;
}

function showWaitingForLesson(message = "Otvorte prednášku na počítači.") {
  stopSession?.();
  stopSession = null;
  currentSession = null;
  clearInterval(freshnessTimer);
  mirror.hidden = true;
  mirror.removeAttribute("src");
  delete mirror.dataset.pageUrl;
  showView("control");
  setConnection("Čakám na aktívnu prednášku", "offline");
  showNotice(message);
}

function setMirrorPage(data) {
  let pageUrl;
  try {
    pageUrl = new URL(data.pagePath, location.origin);
    if (pageUrl.pathname.endsWith("/")) pageUrl.pathname += "index.html";
  } catch {
    showNotice("Stránku prednášky sa nepodarilo otvoriť.");
    return;
  }
  if (pageUrl.origin !== location.origin || !pageUrl.pathname.endsWith(".html")) {
    showNotice("Táto prednáška sa nedá bezpečne zrkadliť.");
    return;
  }
  pageUrl.searchParams.set("remoteMirror", "1");
  if (mirror.dataset.pageUrl !== pageUrl.href) {
    mirror.dataset.pageUrl = pageUrl.href;
    mirror.src = pageUrl.href;
  }
  mirror.hidden = false;
}

function updateMirrorPlayback(data) {
  try {
    const doc = mirror.contentDocument;
    const panel = doc?.querySelector(".lesson-side-panel");
    if (!panel) return;
    doc.body.classList.toggle("teacher", data.displayMode === "teacher");
    const play = panel.querySelector("#play-reading");
    const pause = panel.querySelector("#pause-reading");
    const stop = panel.querySelector("#stop-reading");
    const replay = panel.querySelector("#replay-reading");
    if (play) play.disabled = data.playbackState === "playing";
    if (pause) pause.disabled = data.playbackState === "stopped";
    if (stop) stop.disabled = data.playbackState === "stopped";
    if (replay) replay.disabled = data.canReplay !== true;
    if (pause) {
      const paused = data.playbackState === "paused";
      pause.textContent = paused ? "▶ Pokračovať" : "⏸ Pozastaviť";
      pause.setAttribute("aria-label", paused ? "Pokračovať v čítaní" : "Pozastaviť čítanie");
    }
    const status = panel.querySelector(".narration-status");
    if (status) status.textContent = ({ playing: "Prehráva sa", paused: "Pozastavené", stopped: "Zastavené" })[data.playbackState] || "Zastavené";
  } catch {
    // The mirror is same-origin; it may not have loaded yet.
  }
}

async function sendCommand(command) {
  const session = currentSession;
  if (!connected || !session?.data?.pageActive || isStale(session.data.pageHeartbeatAt)) {
    setConnection("Prednáška je odpojená", "offline");
    showNotice("Počkajte, kým sa počítač znova pripojí.");
    return;
  }
  try {
    await firestore.addDoc(firestore.collection(session.ref, "commands"), {
      ...command,
      targetSessionId: session.id,
      createdAt: firestore.serverTimestamp(),
    });
  } catch (error) {
    setConnection("Príkaz sa nepodarilo odoslať", "error");
    showNotice(error?.code === "permission-denied"
      ? "Firebase odmietol prístup. Overte učiteľské prihlásenie a Firestore pravidlá."
      : "Skontrolujte internetové spojenie a skúste znova.");
  }
}

function installMirrorControls() {
  let doc;
  try {
    doc = mirror.contentDocument;
  } catch {
    showNotice("Prednášku nie je možné zobraziť v mobilnom zrkadle.");
    return;
  }
  if (!doc || doc.documentElement.dataset.remoteMirrorReady === "yes") return;
  doc.documentElement.dataset.remoteMirrorReady = "yes";

  const style = doc.createElement("style");
  style.textContent = `
    html,body{min-height:100%;height:auto;margin:0!important}
    .lesson-side-panel{position:sticky!important;top:0!important;right:auto!important;bottom:auto!important;left:auto!important;z-index:5000!important;width:100%!important;max-height:56vh!important;overflow:auto!important;margin:0!important;border-radius:0 0 14px 14px!important;backdrop-filter:blur(12px)}
    @media(max-width:620px){.lesson-side-panel{max-height:57vh!important}.lesson-side-panel .narration-controls{gap:.4rem!important}.lesson-side-panel .narration-controls button{min-height:42px!important}}
  `;
  doc.head.append(style);

  const panel = doc.querySelector(".lesson-side-panel");
  if (!panel) return;
  doc.body.prepend(panel);
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const index = Array.from(panel.querySelectorAll("button")).indexOf(button);
    if (index < 0) return;
    sendCommand({ type: "panelClick", controlIndex: index });
    if (["play-reading", "pause-reading", "stop-reading", "replay-reading"].includes(button.id)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  panel.addEventListener("change", (event) => {
    const field = event.target.closest("input,select,textarea");
    if (!field) return;
    const index = Array.from(panel.querySelectorAll("input,select,textarea")).indexOf(field);
    if (index < 0) return;
    sendCommand({ type: "panelChange", controlIndex: index, value: String(field.value).slice(0, 200) });
  }, true);
  if (currentSession?.data) updateMirrorPlayback(currentSession.data);
}

function listenToSession(sessionId, initialData) {
  if (currentSession?.id === sessionId && stopSession) {
    currentSession.data = initialData;
    updateMirrorPlayback(initialData);
    return;
  }
  stopSession?.();
  const ref = firestore.doc(db, "remoteSessions", sessionId);
  currentSession = { id: sessionId, ref, data: initialData };
  showView("control");
  stopSession = firestore.onSnapshot(ref, { includeMetadataChanges: true }, (snapshot) => {
    if (snapshot.metadata.fromCache) {
      setConnection("Bez spojenia · čakám na sieť", "offline");
      showNotice("Zrkadlo a ovládanie sa obnovia po návrate spojenia.");
      return;
    }
    if (!snapshot.exists()) {
      showWaitingForLesson("Prednáška už nie je dostupná.");
      return;
    }
    const data = snapshot.data();
    currentSession = { id: sessionId, ref, data };
    if (data.ownerUid !== currentUser.uid) {
      showWaitingForLesson("Táto prednáška patrí inému účtu.");
      return;
    }
    if (!data.pageActive || isStale(data.pageHeartbeatAt)) {
      setConnection("Prednáška sa odpojila · čakám", "offline");
      showNotice("Keď sa prednáška na počítači obnoví, zrkadlo sa pripojí automaticky.");
      return;
    }
    setMirrorPage(data);
    setConnection("Zrkadlené z počítača", "connected");
    showNotice("");
    updateMirrorPlayback(data);
  }, (error) => {
    setConnection("Spojenie prerušené", "offline");
    showNotice(error?.code === "permission-denied"
      ? "Prihláste sa učiteľským účtom a overte Firestore pravidlá."
      : "Skontrolujte sieťové spojenie.");
  });
  clearInterval(freshnessTimer);
  freshnessTimer = window.setInterval(() => {
    if (currentSession?.data && isStale(currentSession.data.pageHeartbeatAt)) {
      setConnection("Prednáška nereaguje · čakám", "offline");
      showNotice("Počkajte, kým sa počítač znova pripojí.");
    }
  }, 5_000);
}

function watchActiveLessons() {
  stopActiveLessons?.();
  showView("control");
  setConnection("Hľadám aktívnu prednášku…");
  showNotice("Otvorte prednášku na počítači.");
  const activeQuery = firestore.query(
    firestore.collection(db, "remoteSessions"),
    firestore.where("ownerUid", "==", currentUser.uid),
  );
  stopActiveLessons = firestore.onSnapshot(activeQuery, (snapshot) => {
    const active = snapshot.docs
      .map((doc) => ({ id: doc.id, data: doc.data() }))
      .filter(({ data }) => data.pageActive === true && !isStale(data.pageHeartbeatAt))
      .sort((a, b) => b.data.pageHeartbeatAt.toMillis() - a.data.pageHeartbeatAt.toMillis())[0];
    if (!active) {
      showWaitingForLesson();
      return;
    }
    listenToSession(active.id, active.data);
  }, () => {
    setConnection("Prednášku sa nepodarilo nájsť", "error");
    showNotice("Overte učiteľské prihlásenie a Firestore pravidlá.");
  });
}

mirror.addEventListener("load", installMirrorControls);
authButton.addEventListener("click", async () => {
  authButton.disabled = true;
  try {
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    if (matchMedia("(pointer: coarse)").matches) await authSdk.signInWithRedirect(auth, provider);
    else await authSdk.signInWithPopup(auth, provider);
  } catch {
    showNotice("Prihlásenie sa nepodarilo. Skúste to znova.");
  } finally {
    authButton.disabled = false;
  }
});

authSdk.onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    stopActiveLessons?.();
    stopActiveLessons = null;
    stopSession?.();
    stopSession = null;
    currentSession = null;
    showView("auth");
    setConnection("Vyžaduje sa učiteľské prihlásenie", "error");
    return;
  }
  showNotice("");
  watchActiveLessons();
});

window.addEventListener("online", () => {
  if (currentUser) watchActiveLessons();
});
window.addEventListener("offline", () => {
  setConnection("Sieťové spojenie prerušené", "offline");
  showNotice("Zrkadlo sa obnoví po návrate spojenia.");
});
