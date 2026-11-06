import { firebaseConfig } from "../firebase-config.js";

const version = "10.14.1";
const [appSdk, authSdk, firestore, functionsSdk] = await Promise.all([
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-functions.js`),
]);
const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
const auth = authSdk.getAuth(app);
const db = firestore.getFirestore(app);
const functions = functionsSdk.getFunctions(app, "europe-west3");

const $ = (selector) => document.querySelector(selector);
const connection = $("#connection");
const authView = $("#auth-view");
const pairView = $("#pair-view");
const controlView = $("#control-view");
const notice = $("#notice");
const pinInput = $("#pair-code");
const authButton = $("#sign-in");
const commands = {
  play: $("#play"),
  pauseResume: $("#pause-resume"),
  stop: $("#stop"),
  restartLesson: $("#restart-lesson"),
  restartCurrent: $("#restart-current"),
};

let currentUser = null;
let currentSession = null;
let stopActiveLessons = null;
let stopSession = null;
let pageFreshTimer = 0;
let deviceId;
let connected = false;

try {
  deviceId = localStorage.getItem("lecture-remote.device") || crypto.randomUUID();
  localStorage.setItem("lecture-remote.device", deviceId);
} catch {
  deviceId = crypto.randomUUID();
}

function showNotice(text) {
  notice.textContent = text;
  notice.hidden = !text;
}

function setConnection(text, state = "connecting") {
  connection.textContent = text;
  connection.dataset.state = state;
  connected = state === "connected";
  updateButtons();
}

function showView(view) {
  authView.hidden = view !== "auth";
  pairView.hidden = view !== "pair";
  controlView.hidden = view !== "control";
}

function updateButtons(data = currentSession?.data) {
  const live = connected && data?.pageActive === true && !isStale(data.pageHeartbeatAt);
  commands.play.disabled = !live || data.playbackState === "playing";
  commands.pauseResume.disabled = !live || data.playbackState === "stopped";
  commands.pauseResume.querySelector("span").textContent = data?.playbackState === "paused" ? "Pokračovať" : "Pozastaviť";
  commands.pauseResume.firstChild.textContent = data?.playbackState === "paused" ? "▶ " : "Ⅱ ";
  commands.stop.disabled = !live || data.playbackState === "stopped";
  commands.restartLesson.disabled = !live;
  commands.restartCurrent.disabled = !live || data.canRestartCurrent !== true;
}

function showWaitingForLesson() {
  stopSession?.();
  stopSession = null;
  currentSession = null;
  clearInterval(pageFreshTimer);
  $("#page-title").textContent = "Čaká sa na aktívnu prednášku";
  $("#playback-state").textContent = "Otvorte prednášku na počítači";
  showView("control");
  setConnection("Pripojené k účtu · čakám na prednášku", "connected");
  updateButtons(null);
}

function isStale(timestamp) {
  return !timestamp || Date.now() - timestamp.toMillis() > 35_000;
}

function listenToSession(sessionId, initialData) {
  if (currentSession?.id === sessionId && stopSession) {
    currentSession.data = initialData;
    updateButtons(initialData);
    return;
  }
  stopSession?.();
  const ref = firestore.doc(db, "remoteSessions", sessionId);
  currentSession = { id: sessionId, ref, data: initialData };
  showView("control");
  stopSession = firestore.onSnapshot(ref, { includeMetadataChanges: true }, (snapshot) => {
    if (snapshot.metadata.fromCache) {
      setConnection("Offline · čakám na obnovenie siete", "offline");
      showNotice("Ovládanie sa obnoví po návrate spojenia.");
      return;
    }
    if (!snapshot.exists()) {
      currentSession = null;
      setConnection("Prednáška už nie je dostupná", "offline");
      showNotice("Otvorte prednášku na počítači. Ovládač sa pripojí automaticky.");
      updateButtons(null);
      return;
    }
    const data = snapshot.data();
    currentSession = { id: sessionId, ref, data };
    if (data.ownerUid !== currentUser.uid) {
      showWaitingForLesson();
      return;
    }
    $("#page-title").textContent = data.pageTitle || "Prednáška";
    $("#playback-state").textContent = ({ playing: "Prehráva sa", paused: "Pozastavené", stopped: "Zastavené" })[data.playbackState] || "Zastavené";
    if (!data.pageActive || isStale(data.pageHeartbeatAt)) {
      setConnection("Prednáška sa odpojila · čakám", "offline");
      showNotice("Keď otvoríte prednášku alebo prepnete na jej kartu, ovládanie sa pripojí automaticky.");
      updateButtons(null);
      return;
    }
    showNotice("");
    setConnection("Pripojené k aktívnej prednáške", "connected");
    updateButtons(data);
  }, (error) => {
    setConnection("Spojenie prerušené", "offline");
    showNotice(firebaseError(error));
  });
  clearInterval(pageFreshTimer);
  pageFreshTimer = window.setInterval(() => {
    if (currentSession?.data && isStale(currentSession.data.pageHeartbeatAt)) {
      setConnection("Prednáška nereaguje · čakám na obnovenie", "offline");
      updateButtons(null);
    }
  }, 5_000);
}

function watchActiveLessons() {
  stopActiveLessons?.();
  showView("control");
  setConnection("Hľadám aktívnu prednášku…");
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
  }, (error) => {
    setConnection("Prednášku sa nepodarilo nájsť", "error");
    showNotice(firebaseError(error));
  });
}

async function submitPin(event) {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  showNotice("");
  setConnection("Overujem prístup…");
  try {
    const verify = functionsSdk.httpsCallable(functions, "verifyRemotePin");
    await verify({ pin: pinInput.value, deviceId });
    pinInput.value = "";
    sessionStorage.setItem(`lecture-remote.verified.${currentUser.uid}`, "yes");
    watchActiveLessons();
  } catch (error) {
    setConnection("Pripojenie sa nepodarilo", "error");
    showNotice(firebaseError(error));
  } finally {
    button.disabled = false;
  }
}

async function sendCommand(type) {
  const session = currentSession;
  if (!connected || !session || !session.data?.pageActive || isStale(session.data.pageHeartbeatAt)) {
    setConnection("Nie je pripojené k aktívnej prednáške", "offline");
    updateButtons(null);
    return;
  }
  try {
    await firestore.addDoc(firestore.collection(session.ref, "commands"), {
      type,
      targetSessionId: session.id,
      deviceId,
      createdAt: firestore.serverTimestamp(),
    });
  } catch (error) {
    if (error?.code === "permission-denied" && currentUser) {
      sessionStorage.removeItem(`lecture-remote.verified.${currentUser.uid}`);
      stopActiveLessons?.();
      stopActiveLessons = null;
      stopSession?.();
      stopSession = null;
      currentSession = null;
      showView("pair");
      setConnection("PIN sa zmenil · pripojte sa znova", "error");
      showNotice("Zadajte aktuálny PIN ovládača.");
      return;
    }
    setConnection("Príkaz sa nepodarilo odoslať", "error");
    showNotice(firebaseError(error));
  }
}

function firebaseError(error) {
  if (!navigator.onLine || error?.code === "functions/unavailable" || error?.code === "unavailable") {
    return "Služba je nedostupná alebo telefón nemá internetové spojenie. Skúste to znova po obnovení siete.";
  }
  if (error?.code === "functions/permission-denied") return "PIN alebo oprávnenie účtu nie je správne.";
  if (error?.code === "functions/failed-precondition") return "Jednorazový PIN chýba alebo vypršal. Požiadajte učiteľa o nový.";
  if (error?.code === "functions/resource-exhausted") return "Príliš veľa pokusov. Učiteľ musí vytvoriť nový PIN.";
  if (error?.code === "permission-denied") return "Firebase odmietol prístup. Skontrolujte prihlásenie a nasadené pravidlá.";
  return error?.message || "Operáciu sa nepodarilo dokončiť.";
}

authSdk.beforeAuthStateChanged(auth, async (nextUser) => {
  if (currentUser && (!nextUser || nextUser.uid !== currentUser.uid)) {
    const oldUid = currentUser.uid;
    try {
      const clear = functionsSdk.httpsCallable(functions, "clearRemotePin");
      await clear();
    } catch {
      // The challenge has a short server-side expiry if cleanup cannot reach Firebase.
    }
    sessionStorage.removeItem(`lecture-remote.verified.${oldUid}`);
  }
});

authButton.addEventListener("click", async () => {
  authButton.disabled = true;
  try {
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    if (matchMedia("(pointer: coarse)").matches) await authSdk.signInWithRedirect(auth, provider);
    else await authSdk.signInWithPopup(auth, provider);
  } catch (error) {
    showNotice(firebaseError(error));
  } finally {
    authButton.disabled = false;
  }
});

$("#pair-form").addEventListener("submit", submitPin);
for (const [type, button] of Object.entries(commands)) button.addEventListener("click", () => sendCommand(type));

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
  if (sessionStorage.getItem(`lecture-remote.verified.${user.uid}`) === "yes") watchActiveLessons();
  else {
    showView("pair");
    setConnection("Prihlásené · zadajte PIN", "connected");
  }
});

window.addEventListener("online", () => {
  if (currentUser && sessionStorage.getItem(`lecture-remote.verified.${currentUser.uid}`) === "yes") watchActiveLessons();
});
window.addEventListener("offline", () => {
  setConnection("Sieťové spojenie prerušené", "offline");
  updateButtons(null);
});
