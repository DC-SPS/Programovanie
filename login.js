import { firebaseConfig } from "./firebase-config.js";

const signInButton = document.getElementById("google-sign-in");
const signOutButton = document.getElementById("google-sign-out");
const status = document.getElementById("auth-status");

const translatedProxyHost = window.location.hostname.endsWith(".translate.goog");
if (translatedProxyHost) {
  const originalLoginUrl = new URL("https://programovanie-gules.vercel.app/login.html");
  const requestedNext = new URLSearchParams(window.location.search).get("next");
  if (isLocalPath(requestedNext)) originalLoginUrl.searchParams.set("next", normalizeLocalPath(requestedNext));
  status.textContent = "Prihlasovanie sa presúva na pôvodnú doménu kurzu, kde ho Firebase povoľuje.";
  window.location.replace(originalLoginUrl.toString());
} else {
  signInButton.disabled = false;
}

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
    window.location.replace(isLocalPath(next) ? normalizeLocalPath(next) : "/");
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
  if (typeof path !== "string" || !path || path.includes("\\")) return false;
  const normalized = normalizeLocalPath(path);
  if (normalized.startsWith("//") || /^\/login(?:\.html|\/|$)/i.test(normalized)) return false;
  try {
    return new URL(normalized, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

function normalizeLocalPath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}
