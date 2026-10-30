import { firebaseConfig, teacherAuthEnabled } from "./firebase-config.js";

const signInButton = document.getElementById("google-sign-in");
const signOutButton = document.getElementById("google-sign-out");
const status = document.getElementById("auth-status");
const hasFirebaseConfig = Object.values(firebaseConfig).every(function (value) {
  return typeof value === "string" && value.trim().length > 0;
});

if (teacherAuthEnabled && hasFirebaseConfig) {
  startGoogleSignIn();
} else if (teacherAuthEnabled) {
  status.textContent = "Učiteľské Google prihlásenie je pripravené v aplikácii, ale čaká na konfiguráciu Firebase projektu.";
}

signInButton.addEventListener("click", async function () {
  if (!teacherAuthEnabled || !hasFirebaseConfig) {
    status.textContent = "Učiteľské prihlásenie čaká na konfiguráciu Firebase.";
    return;
  }

  signInButton.disabled = true;
  status.textContent = "Otvára sa prihlásenie cez Google…";

  try {
    const { auth, GoogleAuthProvider, signInWithPopup, signOut } = await loadFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);

    if (!(await hasTeacherClaim(result.user))) {
      await signOut(auth);
      throw new Error("Tento účet nemá povolenie učiteľa.");
    }

    status.textContent = "Prihlásenie učiteľa bolo overené. Zber žiackych údajov a výsledkov je vypnutý.";
    signInButton.hidden = true;
    signOutButton.hidden = false;
  } catch (error) {
    status.textContent = "Prihlásenie zlyhalo: " + error.message;
    signInButton.disabled = false;
  }
});

signOutButton.addEventListener("click", async function () {
  try {
    const { auth, signOut } = await loadFirebaseAuth();
    await signOut(auth);
    signOutButton.hidden = true;
    signInButton.hidden = false;
    signInButton.disabled = false;
    status.textContent = "Odhlásený. Účet možno znova prihlásiť cez Google.";
  } catch (error) {
    status.textContent = "Odhlásenie zlyhalo: " + error.message;
  }
});

async function startGoogleSignIn() {
  try {
    const { auth, onAuthStateChanged } = await loadFirebaseAuth();
    signInButton.disabled = false;
    status.textContent = "Prihlásenie cez Google je pripravené.";

    onAuthStateChanged(auth, async function (user) {
      if (!user) {
        return;
      }

      try {
        if (!(await hasTeacherClaim(user))) {
          await loadFirebaseAuth().then(function (modules) {
            return modules.signOut(auth);
          });
          status.textContent = "Tento účet nemá povolenie učiteľa. Boli ste odhlásený.";
          signInButton.hidden = false;
          signOutButton.hidden = true;
          return;
        }

        status.textContent = "Prihlásenie učiteľa bolo overené. Zber žiackych údajov a výsledkov je vypnutý.";
        signInButton.hidden = true;
        signOutButton.hidden = false;
      } catch (error) {
        status.textContent = "Nepodarilo sa overiť oprávnenie účtu: " + error.message;
      }
    }, function (error) {
      status.textContent = "Nepodarilo sa overiť stav prihlásenia: " + error.message;
    });
  } catch (error) {
    status.textContent = "Firebase sa nepodarilo inicializovať: " + error.message;
  }
}

let firebaseAuthPromise;

function loadFirebaseAuth() {
  if (!firebaseAuthPromise) {
    firebaseAuthPromise = Promise.all([
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js")
    ]).then(function (modules) {
      const appModule = modules[0];
      const authModule = modules[1];
      const app = appModule.initializeApp(firebaseConfig);
      return {
        auth: authModule.getAuth(app),
        GoogleAuthProvider: authModule.GoogleAuthProvider,
        getIdTokenResult: authModule.getIdTokenResult,
        onAuthStateChanged: authModule.onAuthStateChanged,
        signInWithPopup: authModule.signInWithPopup,
        signOut: authModule.signOut
      };
    });
  }

  return firebaseAuthPromise;
}

async function hasTeacherClaim(user) {
  if (!user.emailVerified) {
    return false;
  }

  const { getIdTokenResult } = await loadFirebaseAuth();
  const token = await getIdTokenResult(user, true);
  return token.claims.teacher === true;
}

