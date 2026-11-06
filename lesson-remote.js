import { firebaseConfig } from "./firebase-config.js";
import { renderQrCode } from "./remote-qr.js";

(() => {
  const control = window.lessonSpeechRemote;
  if (!control || !document.querySelector("main")) return;

  const firebaseVersion = "10.14.1";
  let remoteModulePromise;
  const loadFirebase = () => {
    if (!remoteModulePromise) {
      remoteModulePromise = Promise.all([
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-firestore.js`),
      ]).then(([appSdk, authSdk, dbSdk]) => {
        const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
        return { auth: authSdk.getAuth(app), authSdk, db: dbSdk.getFirestore(app), dbSdk };
      });
    }
    return remoteModulePromise;
  };

  const lessonTitle = document.querySelector("main h1")?.textContent.trim() || document.title;
  const pagePath = window.location.pathname.slice(0, 500);
  let currentSession = null;
  let stopSessionListener = null;
  let stopCommandsListener = null;
  let listeningCommandSessionId = null;
  let heartbeatTimer = 0;
  let closing = false;

  const style = document.createElement("style");
  style.textContent = `
    .lesson-remote-launch{position:fixed;right:1rem;bottom:1rem;z-index:9998;border:1px solid #39718f;border-radius:999px;background:#102234;color:#eaf6ff;padding:.65rem 1rem;font:700 14px/1.2 system-ui,sans-serif;box-shadow:0 5px 22px #0006;cursor:pointer}
    .lesson-remote-dialog{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:1rem;background:#020817bb;font:16px/1.5 system-ui,sans-serif;color:#edf6ff}
    .lesson-remote-dialog[hidden]{display:none}
    .lesson-remote-card{width:min(100%,28rem);border:1px solid #39718f;border-radius:1rem;background:#102234;padding:1.25rem;box-shadow:0 18px 55px #0008}
    .lesson-remote-card h2{margin:.1rem 0 .4rem;font-size:1.25rem}.lesson-remote-card p{margin:.55rem 0;color:#bfd3e3}
    .lesson-remote-code{margin:1rem 0;text-align:center;font:800 2.7rem/1.2 ui-monospace,Consolas,monospace;letter-spacing:.22em;color:#38bdf8}
    .lesson-remote-qr{width:240px;height:240px;margin:1rem auto;padding:10px;border-radius:.65rem;background:#fff;display:grid;place-items:center}
    .lesson-remote-qr canvas,.lesson-remote-qr img{display:block;max-width:100%;height:auto}
    .lesson-remote-link{display:block;padding:.7rem;border-radius:.5rem;background:#091a29;color:#bae6fd;overflow-wrap:anywhere;text-align:center}
    .lesson-remote-actions{display:flex;gap:.65rem;margin-top:1rem}.lesson-remote-actions button{flex:1;min-height:44px;border:1px solid #41627a;border-radius:.6rem;background:#17364d;color:#fff;font:700 15px system-ui,sans-serif;cursor:pointer}
    .lesson-remote-actions button:focus-visible,.lesson-remote-launch:focus-visible{outline:3px solid #fde047;outline-offset:3px}
    .lesson-remote-state{font-weight:700;color:#86efac!important}.lesson-remote-state[data-state="offline"]{color:#fca5a5!important}
    @media print{.lesson-remote-launch,.lesson-remote-dialog{display:none!important}}
  `;
  document.head.append(style);

  const launch = document.createElement("button");
  launch.className = "lesson-remote-launch";
  launch.type = "button";
  launch.textContent = "📱 Ovládač";
  launch.setAttribute("aria-label", "Spárovať telefón ako diaľkový ovládač čítania");
  document.body.append(launch);

  const modal = document.createElement("div");
  modal.className = "lesson-remote-dialog";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "lesson-remote-title");
  modal.innerHTML = `<section class="lesson-remote-card"><h2 id="lesson-remote-title">Diaľkový ovládač</h2><p class="lesson-remote-state" role="status" aria-live="polite">Kontrolujem učiteľské prihlásenie…</p><div class="lesson-remote-pairing" hidden><p>Na telefóne naskenuj QR kód alebo zadaj zobrazený jednorazový kód a stlač Spárovať. Kód sa vytvorí iba pre túto otvorenú prednášku, platí dve minúty a po použití prestane platiť.</p><div class="lesson-remote-qr" aria-label="QR kód na spárovanie tejto prednášky"></div><div class="lesson-remote-code"></div><a class="lesson-remote-link" target="_blank" rel="noopener">Otvoriť ovládač v telefóne</a></div><div class="lesson-remote-actions"><button type="button" data-action="pair">Vytvoriť párovací kód</button><button type="button" data-action="close">Zavrieť</button></div></section>`;
  document.body.append(modal);

  const message = modal.querySelector(".lesson-remote-state");
  const pairingBox = modal.querySelector(".lesson-remote-pairing");
  const pairingCode = modal.querySelector(".lesson-remote-code");
  const remoteLink = modal.querySelector(".lesson-remote-link");
  const pairingQr = modal.querySelector(".lesson-remote-qr");
  const pairButton = modal.querySelector('[data-action="pair"]');
  const setMessage = (text, offline = false) => {
    message.textContent = text;
    message.dataset.state = offline ? "offline" : "online";
  };

  const newPairingCode = () => {
    const range = 1_000_000;
    const ceiling = 0x1_0000_0000 - (0x1_0000_0000 % range);
    let value;
    do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= ceiling);
    return String(value % range).padStart(6, "0");
  };
  const createPairing = async () => {
    pairButton.disabled = true;
    pairingBox.hidden = true;
    setMessage("Overujem Firebase účet…");
    try {
      const { auth, db, dbSdk } = await loadFirebase();
      const user = auth.currentUser;
      if (!user) {
        const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
        location.assign(`/login.html?next=${next}`);
        return;
      }
      await closeSession(dbSdk, false);
      const id = crypto.randomUUID();
      const code = newPairingCode();
      const now = Date.now();
      const ref = dbSdk.doc(db, "remoteSessions", id);
      currentSession = { id, ref, db, dbSdk, deviceId: null };
      await dbSdk.setDoc(ref, {
        ownerUid: user.uid,
        pageTitle: lessonTitle,
        pagePath,
        pairingCode: code,
        pairExpiresAt: dbSdk.Timestamp.fromMillis(now + 120_000),
        pairedDeviceId: null,
        pairedAt: null,
        pageActive: true,
        pageHeartbeatAt: dbSdk.serverTimestamp(),
        playbackState: "stopped",
        canReplay: false,
        createdAt: dbSdk.serverTimestamp(),
      });
      pairingCode.textContent = code;
      remoteLink.href = `/remote/?code=${encodeURIComponent(code)}`;
      pairingBox.hidden = false;
      try {
        await renderQrCode(pairingQr, new URL(remoteLink.href, location.href).href, 220);
      } catch {
        pairingQr.textContent = "QR kód sa nepodarilo načítať. Použite odkaz alebo šesťmiestny kód.";
        pairingQr.setAttribute("role", "status");
      }
      setMessage("Čakám na telefón…");
      stopSessionListener = dbSdk.onSnapshot(ref, (snapshot) => {
        if (!snapshot.exists()) {
          setMessage("Spojenie so stránkou sa skončilo. Vytvorte nový kód.", true);
          return;
        }
        const data = snapshot.data();
        if (!data.pageActive) {
          setMessage("Táto prednáška už nie je aktívna. Príkazy sú zablokované.", true);
          return;
        }
        if (data.pairedDeviceId) {
          currentSession.deviceId = data.pairedDeviceId;
          pairingBox.hidden = true;
          setMessage(`Telefón pripojený · ${playbackLabel(data.playbackState)}`);
          listenForCommands(currentSession);
        }
      }, () => setMessage("Spojenie s Firebase sa prerušilo. Obnovte stránku alebo vytvorte nový kód.", true));
      heartbeatTimer = window.setInterval(() => {
        if (currentSession && !closing) {
          dbSdk.updateDoc(ref, { pageActive: true, pageHeartbeatAt: dbSdk.serverTimestamp() }).catch(() => {});
        }
      }, 15_000);
      window.addEventListener("lesson-reading-state", updateRemotePlayback);
      window.addEventListener("online", () => setMessage("Sieť obnovená · synchronizujem stav…"));
    } catch (error) {
      setMessage(firebaseErrorText(error), true);
    } finally {
      pairButton.disabled = false;
    }
  };

  const playbackLabel = (state) => ({ playing: "Prehráva sa", paused: "Pozastavené", stopped: "Zastavené" }[state] || "Zastavené");
  const updateRemotePlayback = () => {
    if (!currentSession) return;
    const state = control.getState();
    const playbackState = state.isReading ? (state.isPaused ? "paused" : "playing") : "stopped";
    currentSession.dbSdk.updateDoc(currentSession.ref, {
      playbackState,
      canReplay: state.canReplay,
      pageActive: true,
      pageHeartbeatAt: currentSession.dbSdk.serverTimestamp(),
    }).then(() => setMessage(`Telefón pripojený · ${playbackLabel(playbackState)}`)).catch(() => setMessage("Spojenie vypadlo. Čakám na obnovenie…", true));
  };

  const listenForCommands = (session) => {
    if (listeningCommandSessionId === session.id && stopCommandsListener) return;
    stopCommandsListener?.();
    listeningCommandSessionId = session.id;
    const commandQuery = session.dbSdk.collection(session.ref, "commands");
    stopCommandsListener = session.dbSdk.onSnapshot(commandQuery, (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type !== "added") continue;
        const command = change.doc.data();
        if (command.targetSessionId !== session.id || command.deviceId !== session.deviceId) continue;
        if (!command.createdAt || Date.now() - command.createdAt.toMillis() > 30_000) continue;
        const methods = { play: control.play, pauseResume: control.pauseResume, stop: control.stop, replay: control.replay };
        const execute = methods[command.type];
        if (typeof execute === "function") execute();
      }
      updateRemotePlayback();
    }, () => setMessage("Spojenie vypadlo. Príkazy zostávajú vypnuté, kým sa stránka nepripojí.", true));
  };

  const closeSession = async (dbSdk, markInactive = true) => {
    if (!currentSession) return;
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = 0;
    stopCommandsListener?.();
    stopCommandsListener = null;
    listeningCommandSessionId = null;
    stopSessionListener?.();
    stopSessionListener = null;
    const old = currentSession;
    currentSession = null;
    if (markInactive) {
      try { await dbSdk.updateDoc(old.ref, { pageActive: false, pageHeartbeatAt: dbSdk.serverTimestamp() }); } catch { /* The phone also detects a stale heartbeat. */ }
    }
    window.removeEventListener("lesson-reading-state", updateRemotePlayback);
  };

  pairButton.addEventListener("click", createPairing);
  modal.querySelector('[data-action="close"]').addEventListener("click", () => { modal.hidden = true; });
  launch.addEventListener("click", async () => {
    modal.hidden = false;
    pairButton.focus();
    if (!currentSession) {
      try {
        const { auth } = await loadFirebase();
        if (!auth.currentUser) setMessage("Prihláste sa učiteľským účtom a potom vytvorte párovací kód.", true);
        else setMessage("Vytvorte kód pre túto otvorenú prednášku.");
      } catch (error) { setMessage(firebaseErrorText(error), true); }
    }
  });

  window.addEventListener("pagehide", () => {
    if (!currentSession) return;
    closing = true;
    currentSession.dbSdk.updateDoc(currentSession.ref, { pageActive: false, pageHeartbeatAt: currentSession.dbSdk.serverTimestamp() }).catch(() => {});
  });
})();

function firebaseErrorText(error) {
  if (error?.code === "permission-denied") return "Firebase odmietol prístup. Prihláste sa overeným učiteľským Google účtom a skontrolujte nasadené Firestore pravidlá.";
  if (!navigator.onLine) return "Zariadenie je offline. Po obnovení siete skúste znova.";
  return "Spojenie s Firebase sa nepodarilo. Skontrolujte konfiguráciu a skúste znova.";
}
