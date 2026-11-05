import { firebaseConfig } from "./firebase-config.js";

const signInButton = document.getElementById("google-sign-in");
const signOutButton = document.getElementById("google-sign-out");
const status = document.getElementById("auth-status");
const originalSiteLink = document.getElementById("auth-original-site");

const isGoogleTranslateHost = /translate\.google\./i.test(window.location.hostname);
if (isGoogleTranslateHost) {
  const originalLoginUrl = new URL("https://programovanie-sps.web.app/login.html");
  const requestedNext = new URLSearchParams(window.location.search).get("next");
  if (isLocalPath(requestedNext)) originalLoginUrl.searchParams.set("next", requestedNext);
  originalSiteLink.href = originalLoginUrl.toString();
  originalSiteLink.hidden = false;
  signInButton.disabled = true;
  status.textContent = "Google Translate otvoril prihlasovaciu stránku cez svoju doménu. Firebase tu prihlásenie nepovoľuje; pokračujte na pôvodnej doméne kurzu.";
}

signInButton.disabled = isGoogleTranslateHost;

signInButton.addEventListener("click", async () => {
  signInButton.disabled = true;
  status.textContent = "Otvára sa prihlásenie cez Google…";

  try {
    const { auth, GoogleAuthProvider, signInWithPopup, signOut } = await loadFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);

    if (result.user.email !== "dusan.cabala.sps@gmail.com" || !result.user.emailVerified) {
      await signOut(auth);
      throw new Error("Prístup je povolený iba účtu dusan.cabala.sps@gmail.com.");
    }

    const idToken = await result.user.getIdToken(true);
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      await signOut(auth);
      throw new Error("Server neprijal prihlásenie. Skontroluj povolený Google účet.");
    }

    status.textContent = "Prihlásenie potvrdené. Otvára sa stránka…";
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.replace(isLocalPath(next) ? next : "/");
  } catch (error) {
    status.textContent = "Prihlásenie zlyhalo: " + (error.message || "Neznáma chyba.");
    signInButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async () => {
  try {
    const { auth, signOut } = await loadFirebaseAuth();
    await signOut(auth);
    await fetch("/api/logout", { method: "POST" });
    signInButton.hidden = false;
    signInButton.disabled = false;
    status.textContent = "Odhlásenie bolo úspešné.";
  } catch (error) {
    status.textContent = "Odhlásenie zlyhalo: " + (error.message || "Neznáma chyba.");
  }
});

let authPromise;
function loadFirebaseAuth() {
  if (!authPromise) {
    authPromise = Promise.all([
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js")
    ]).then(([appModule, authModule]) => {
      const app = appModule.initializeApp(firebaseConfig);
      return {
        auth: authModule.getAuth(app),
        GoogleAuthProvider: authModule.GoogleAuthProvider,
        signInWithPopup: authModule.signInWithPopup,
        signOut: authModule.signOut
      };
    });
  }
  return authPromise;
}

function isLocalPath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/login");
}
