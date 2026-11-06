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

const pinForm = document.querySelector("#pin-settings-form");
const pinInput = document.querySelector("#remote-pin");
const signInButton = document.querySelector("#pin-sign-in");
const status = document.querySelector("#pin-settings-status");

authSdk.onAuthStateChanged(auth, (user) => {
  const authorizedSession = Boolean(user?.emailVerified);
  signInButton.hidden = authorizedSession;
  pinForm.hidden = !authorizedSession;
  if (!user) status.textContent = "Prihláste sa učiteľským účtom, aby ste mohli meniť nastavenie.";
  else status.textContent = "";
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
  const button = pinForm.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Ukladám nastavenie…";
  try {
    const savePin = functionsSdk.httpsCallable(functions, "saveRemotePin");
    await savePin({ pin: pinInput.value });
    pinInput.value = "";
    status.textContent = "PIN bol uložený. Hodnota sa nezobrazuje.";
  } catch (error) {
    status.textContent = error?.code === "functions/permission-denied"
      ? "Tento účet nemá oprávnenie meniť PIN."
      : "PIN sa nepodarilo uložiť. Skontrolujte serverové nastavenie alebo skúste znova.";
  } finally {
    button.disabled = false;
  }
});
