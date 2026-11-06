import { firebaseConfig } from "./firebase-config.js";
import { renderQrCode } from "./remote-qr.js";

const qrPanel = document.querySelector("#remote-qr-panel");
const qr = document.querySelector("#home-remote-qr");
const qrHeading = document.querySelector("#remote-heading");
const target = new URL("remote/", document.baseURI).href;

const version = "10.14.1";
const [appSdk, authSdk, functionsSdk] = await Promise.all([
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-functions.js`),
]);
const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
const auth = authSdk.getAuth(app);
const functions = functionsSdk.getFunctions(app, "europe-west3");

const pinForm = document.querySelector("#pin-settings-form");
const pinInput = document.querySelector("#remote-pin");
const saveButton = document.querySelector("#save-remote-pin");
const signInButton = document.querySelector("#pin-sign-in");
const settingsPanel = document.querySelector("#pin-settings-panel");
const status = document.querySelector("#pin-settings-status");
let currentUser = null;
let qrExpiresTimer = 0;

function hideQr() {
  clearTimeout(qrExpiresTimer);
  qrExpiresTimer = 0;
  qrPanel.hidden = true;
  qr.replaceChildren();
  qrHeading.textContent = "Nastavte PIN";
}

function showQr() {
  return renderQrCode(qr, target, 172).then(() => {
    qrPanel.hidden = false;
    qrHeading.textContent = "Naskenuj QR";
  });
}

async function clearServerPin() {
  const clear = functionsSdk.httpsCallable(functions, "clearRemotePin");
  await clear();
}

authSdk.beforeAuthStateChanged(auth, async (nextUser) => {
  if (currentUser && (!nextUser || nextUser.uid !== currentUser.uid)) {
    hideQr();
    pinInput.value = "";
    status.textContent = "Mažem PIN a prístup spárovaných zariadení…";
    try {
      await clearServerPin();
    } catch {
      // The challenge expires automatically if server cleanup is temporarily unavailable.
    }
    status.textContent = "";
  }
});

authSdk.onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const authorizedSession = Boolean(user?.emailVerified);
  signInButton.hidden = authorizedSession;
  settingsPanel.hidden = !authorizedSession;
  if (!authorizedSession) {
    hideQr();
    pinInput.value = "";
    status.textContent = "Prihláste sa učiteľským účtom, aby ste nastavili PIN.";
  } else if (!qrPanel.hidden) {
    status.textContent = "PIN je uložený. Naskenujte QR a zadajte ho v mobile.";
  } else {
    status.textContent = "Zadajte PIN a uložte ho; potom sa zobrazí QR kód.";
  }
});

signInButton.addEventListener("click", async () => {
  signInButton.disabled = true;
  try {
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await authSdk.signInWithPopup(auth, provider);
  } catch {
    status.textContent = "Prihlásenie sa nepodarilo. Skúste to znova.";
  } finally {
    signInButton.disabled = false;
  }
});

pinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pinForm.reportValidity()) return;
  saveButton.disabled = true;
  hideQr();
  status.textContent = "Ukladám PIN…";
  try {
    const savePin = functionsSdk.httpsCallable(functions, "saveRemotePin");
    const { data } = await savePin({ pin: pinInput.value });
    pinInput.value = "";
    await showQr();
    status.textContent = "PIN je uložený. Naskenujte QR a zadajte ho v mobile; PIN platí 10 minút a použije sa raz.";
    qrExpiresTimer = window.setTimeout(() => {
      hideQr();
      status.textContent = "Platnosť PIN-u skončila. Zadajte ho a uložte znova.";
    }, data.expiresInSeconds * 1000);
  } catch (error) {
    hideQr();
    status.textContent = error?.code === "functions/permission-denied"
      ? "Tento účet nemá oprávnenie ukladať PIN."
      : "PIN sa nepodarilo uložiť. Skontrolujte serverové nastavenie alebo skúste znova.";
  } finally {
    saveButton.disabled = false;
  }
});
