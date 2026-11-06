import { firebaseConfig } from "./firebase-config.js";
import { renderQrCode } from "./remote-qr.js";

const qr = document.querySelector("#home-remote-qr");
if (qr) {
  const target = new URL("remote/", document.baseURI).href;
  renderQrCode(qr, target, 172).catch(() => {
    qr.textContent = "QR kód sa nepodarilo načítať. Použite odkaz na otvorenie ovládača.";
    qr.setAttribute("role", "status");
    qr.setAttribute("aria-label", "QR kód nie je dostupný; použite odkaz na otvorenie ovládača");
  });
}

const version = "10.14.1";
const [appSdk, authSdk, functionsSdk] = await Promise.all([
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-functions.js`),
]);
const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
const auth = authSdk.getAuth(app);
const functions = functionsSdk.getFunctions(app, "europe-west3");

const createButton = document.querySelector("#create-remote-pin");
const signInButton = document.querySelector("#pin-sign-in");
const settingsPanel = document.querySelector("#pin-settings-panel");
const pinOutput = document.querySelector("#remote-pin");
const status = document.querySelector("#pin-settings-status");
let currentUser = null;
let hidePinTimer = 0;

function clearDisplayedPin(message = "") {
  clearTimeout(hidePinTimer);
  hidePinTimer = 0;
  pinOutput.value = "";
  pinOutput.textContent = "";
  pinOutput.hidden = true;
  status.textContent = message;
}

async function clearServerPin() {
  const clear = functionsSdk.httpsCallable(functions, "clearRemotePin");
  await clear();
}

authSdk.beforeAuthStateChanged(auth, async (nextUser) => {
  if (currentUser && (!nextUser || nextUser.uid !== currentUser.uid)) {
    clearDisplayedPin("Mažem jednorazový PIN a prístup spárovaných zariadení…");
    try {
      await clearServerPin();
    } catch {
      // The server-side PIN expires automatically if cleanup cannot reach Firebase.
    }
    clearDisplayedPin();
  }
});

authSdk.onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const authorizedSession = Boolean(user?.emailVerified);
  signInButton.hidden = authorizedSession;
  settingsPanel.hidden = !authorizedSession;
  if (!authorizedSession) clearDisplayedPin("Prihláste sa učiteľským účtom, aby ste vytvorili PIN.");
  else status.textContent = "PIN ešte nebol vytvorený.";
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

createButton.addEventListener("click", async () => {
  createButton.disabled = true;
  clearDisplayedPin("Vytváram jednorazový PIN…");
  try {
    const createPin = functionsSdk.httpsCallable(functions, "createRemotePin");
    const { data } = await createPin();
    pinOutput.value = data.pin;
    pinOutput.textContent = data.pin;
    pinOutput.hidden = false;
    status.textContent = "Zadajte tento PIN v mobile. Platí 10 minút a funguje iba raz.";
    hidePinTimer = window.setTimeout(() => clearDisplayedPin("PIN vymazaný. Vytvorte nový, ak ho ešte potrebujete."), data.expiresInSeconds * 1000);
  } catch (error) {
    status.textContent = error?.code === "functions/permission-denied"
      ? "Tento účet nemá oprávnenie vytvoriť PIN."
      : "PIN sa nepodarilo vytvoriť. Skontrolujte serverové nastavenie alebo skúste znova.";
  } finally {
    createButton.disabled = false;
  }
});
