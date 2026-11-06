import { firebaseConfig } from "../firebase-config.js";

const version = "10.14.1";
let sdk = null;
try {
  sdk = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
  ]).then(([app, auth, firestore]) => ({ app, auth, firestore }));
} catch {}
const firebaseApp = sdk ? (sdk.app.getApps().length ? sdk.app.getApp() : sdk.app.initializeApp(firebaseConfig)) : null;
const auth = sdk ? sdk.auth.getAuth(firebaseApp) : null;
const db = sdk ? sdk.firestore.getFirestore(firebaseApp) : null;

const $ = (selector) => document.querySelector(selector);
const connection = $("#connection");
const authView = $("#auth-view");
const pairView = $("#pair-view");
const controlView = $("#control-view");
const notice = $("#notice");
const pairInput = $("#pair-code");
const authButton = $("#sign-in");
const commands = {
  play: $("#play"),
  pauseResume: $("#pause-resume"),
  stop: $("#stop"),
  replay: $("#replay"),
};
const stateLabels = { playing: "Prehráva sa", paused: "Pozastavené", stopped: "Zastavené" };
const parameters = new URLSearchParams(location.search);
if (/^\d{6}$/.test(parameters.get("code") || "")) pairInput.value = parameters.get("code");

let currentUser = null;
let currentSession = null;
let stopSession = null;
let pageFreshTimer = 0;
let deviceId = "";
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

function updateButtons(data = currentSession?.data) {
  const live = connected && data?.pageActive === true;
  commands.play.disabled = !live || data.playbackState === "playing";
  commands.pauseResume.disabled = !live || data.playbackState === "stopped";
  commands.pauseResume.querySelector("span").textContent = data?.playbackState === "paused" ? "Pokračovať" : "Pozastaviť";
  commands.pauseResume.firstChild.textContent = data?.playbackState === "paused" ? "▶ " : "Ⅱ ";
  commands.stop.disabled = !live || data.playbackState === "stopped";
  commands.replay.disabled = !live || data.canReplay !== true;
}

function showView(view) {
  authView.hidden = view !== "auth";
  pairView.hidden = view !== "pair";
  controlView.hidden = view !== "control";
}

async function pairPage(code) {
  const normalizedCode = String(code || "").trim();
  if (!/^\d{6}$/.test(normalizedCode)) throw new Error("Zadajte platný šesťmiestny kód.");
  const fs = sdk.firestore;
  const matches = await fs.getDocs(fs.query(
    fs.collection(db, "remoteSessions"),
    fs.where("ownerUid", "==", currentUser.uid),
    fs.where("pairingCode", "==", normalizedCode),
  ));
  const sessionDoc = matches.docs
    .filter((candidate) => {
      const data = candidate.data();
      return data.pageActive === true
        && data.pairedDeviceId == null
        && data.pairExpiresAt?.toMillis() > Date.now();
    })
    .sort((a, b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis())[0];
  if (!sessionDoc) throw new Error("Kód 134679 sa nenašiel alebo už vypršal. Vytvorte ho znova na otvorenej prednáške.");
  const ref = sessionDoc.ref;

  await fs.runTransaction(db, async (transaction) => {
    const fresh = await transaction.get(ref);
    if (!fresh.exists()) throw new Error("Prednášková stránka už nie je dostupná.");
    const data = fresh.data();
    if (data.ownerUid !== currentUser.uid || data.pairingCode !== normalizedCode) throw new Error("Kód už bol použitý alebo patrí inému účtu.");
    if (data.pageActive !== true || !data.pairExpiresAt || data.pairExpiresAt.toMillis() < Date.now()) throw new Error("Kód vypršal alebo stránka už nie je otvorená.");
    if (data.pairedDeviceId) throw new Error("Táto stránka už má pripojený telefón. Vytvorte nový kód na stránke.");
    transaction.update(ref, {
      pairingCode: null,
      pairExpiresAt: null,
      pairedDeviceId: deviceId,
      pairedAt: fs.serverTimestamp(),
    });
  });

  currentSession = { id: sessionDoc.id, ref, data: sessionDoc.data() };
  sessionStorage.setItem("lecture-remote.session", sessionDoc.id);
  parameters.delete("code");
  history.replaceState(null, "", `${location.pathname}${parameters.size ? `?${parameters}` : ""}`);
  await listenToSession(sessionDoc.id);
}

async function listenToSession(sessionId) {
  stopSession?.();
  showView("control");
  setConnection("Pripájam sa k stránke…");
  const fs = sdk.firestore;
  const ref = fs.doc(db, "remoteSessions", sessionId);
  stopSession = fs.onSnapshot(ref, { includeMetadataChanges: true }, (snapshot) => {
    if (snapshot.metadata.fromCache) {
      setConnection("Spojenie prerušené · čakám na sieť", "offline");
      showNotice("Telefón je offline. Ovládanie sa obnoví po návrate spojenia.");
      return;
    }
    if (!snapshot.exists()) {
      sessionStorage.removeItem("lecture-remote.session");
      currentSession = null;
      setConnection("Prednášková stránka sa odpojila", "offline");
      showNotice("Stránka už nie je dostupná. Po otvorení prednášky zadajte kód 134679 a spárujte telefón znova.");
      showView("pair");
      return;
    }
    const data = snapshot.data();
    currentSession = { id: sessionId, ref, data };
    if (data.ownerUid !== currentUser.uid || data.pairedDeviceId !== deviceId) {
      setConnection("Toto zariadenie už nie je spárované", "error");
      showNotice("Pre bezpečnosť sú príkazy vypnuté. Spárujte telefón s otvorenou stránkou znova.");
      return;
    }
    $("#page-title").textContent = data.pageTitle || "Prednáška";
    $("#playback-state").textContent = stateLabels[data.playbackState] || "Zastavené";
    showNotice("");
    if (data.pageActive !== true) {
      sessionStorage.removeItem("lecture-remote.session");
      currentSession = null;
      stopSession?.();
      stopSession = null;
      showView("pair");
      setConnection("Prednášková stránka je zavretá", "offline");
      showNotice("Keď otvoríš ďalšiu prednášku, zadaj kód 134679 a spáruj telefón znova.");
      return;
    }
    if (isStale(data.pageHeartbeatAt)) {
      setConnection("Stránka nereaguje · synchronizujem spojenie", "offline");
      showNotice("Po obnovení spojenia sa stav zosynchronizuje automaticky.");
      return;
    }
    setConnection("Pripojené k otvorenej stránke", "connected");
    updateButtons(data);
  }, (error) => {
    setConnection("Spojenie prerušené", "offline");
    showNotice(firebaseError(error));
  });
  window.clearInterval(pageFreshTimer);
  pageFreshTimer = window.setInterval(() => {
    if (currentSession?.data && isStale(currentSession.data.pageHeartbeatAt)) {
      setConnection("Stránka nereaguje · čakám na obnovenie", "offline");
      showNotice("Po obnovení spojenia sa stav zosynchronizuje automaticky.");
    }
  }, 5_000);
}

function isStale(timestamp) {
  return !timestamp || Date.now() - timestamp.toMillis() > 45_000;
}

async function sendCommand(type) {
  const session = currentSession;
  if (!connected || !session || session.data?.pageActive !== true || isStale(session.data.pageHeartbeatAt)) {
    setConnection("Stránka nie je pripojená", "offline");
    showNotice("Príkaz sa neposlal. Obnovte spojenie s otvorenou prednáškou.");
    return;
  }
  try {
    await sdk.firestore.addDoc(sdk.firestore.collection(session.ref, "commands"), {
      type,
      targetSessionId: session.id,
      deviceId,
      createdAt: sdk.firestore.serverTimestamp(),
    });
  } catch (error) {
    setConnection("Príkaz sa nepodarilo odoslať", "error");
    showNotice(firebaseError(error));
  }
}

async function restoreSession() {
  const sessionId = sessionStorage.getItem("lecture-remote.session");
  if (!sessionId) {
    showView("pair");
    setConnection("Prihlásené · čaká sa na spárovanie", "connected");
    return;
  }
  showView("control");
  await listenToSession(sessionId);
}

function firebaseError(error) {
  if (error?.code === "permission-denied") return "Firebase odmietol prístup. Prihláste sa učiteľským účtom a overte bezpečnostné pravidlá.";
  if (error?.code === "unavailable" || !navigator.onLine) return "Sieťové spojenie sa prerušilo. Po obnovení sa stav zosynchronizuje.";
  return error?.message || "Operáciu sa nepodarilo dokončiť.";
}

authButton.addEventListener("click", async () => {
  authButton.disabled = true;
  try {
    const provider = new sdk.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    if (matchMedia("(pointer: coarse)").matches) {
      await sdk.auth.signInWithRedirect(auth, provider);
    } else {
      await sdk.auth.signInWithPopup(auth, provider);
    }
  } catch (error) {
    showNotice(firebaseError(error));
  } finally {
    authButton.disabled = false;
  }
});

$("#pair-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = event.currentTarget.querySelector("button[type=submit]");
  submit.disabled = true;
  showNotice("");
  setConnection("Overujem kód stránky…");
  try {
    await pairPage(pairInput.value);
  } catch (error) {
    setConnection("Spárovanie sa nepodarilo", "error");
    showNotice(firebaseError(error));
    submit.disabled = false;
  }
});

for (const [type, button] of Object.entries(commands)) button.addEventListener("click", () => sendCommand(type));

if (!sdk) {
  showView("auth");
  setConnection("Firebase nie je dostupný", "offline");
  showNotice(!navigator.onLine
    ? "Telefón je offline. Po obnovení siete obnovte aplikáciu a stav sa zosynchronizuje."
    : "Nepodarilo sa načítať Firebase SDK. Skontrolujte sieť a obnovte aplikáciu.");
  authButton.disabled = true;
} else {
sdk.auth.onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) {
    stopSession?.();
    showView("auth");
    setConnection("Vyžaduje sa učiteľské prihlásenie", "error");
    return;
  }
  try {
    showNotice("");
    if (parameters.get("code")) {
      showView("pair");
      setConnection("Prihlásené · overte párovací kód", "connected");
      pairInput.focus();
    } else if (sessionStorage.getItem("lecture-remote.session")) await restoreSession();
    else {
      showView("pair");
      setConnection("Prihlásené · čaká sa na stránku", "connected");
    }
  } catch (error) {
    showView("auth");
    setConnection("Overenie účtu zlyhalo", "error");
    showNotice(firebaseError(error));
  }
});
}

window.addEventListener("online", () => {
  if (currentSession) listenToSession(currentSession.id);
});
window.addEventListener("offline", () => {
  setConnection("Sieťové spojenie prerušené", "offline");
  showNotice("Ovládanie je pozastavené. Obnoví sa po návrate spojenia.");
});
