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
let stopPage = null;
let currentPage = null;
let freshnessTimer = 0;

function showNotice(message = "") {
  notice.textContent = message;
  notice.hidden = !message;
}

function setConnection(message, state = "connecting") {
  connection.textContent = message;
  connection.dataset.state = state;
}

function showView(view) {
  authView.hidden = view !== "auth";
  controlView.hidden = view !== "control";
}

function isStale(timestamp) {
  return !timestamp || Date.now() - timestamp.toMillis() > 120_000;
}

function clearMirror() {
  clearInterval(freshnessTimer);
  currentPage = null;
  mirror.hidden = true;
  mirror.removeAttribute("src");
  delete mirror.dataset.pageUrl;
}

function showWaiting(message = "Otvorte prednášku na počítači.") {
  clearMirror();
  showView("control");
  setConnection("Čakám na otvorenú stránku", "offline");
  showNotice(message);
}

function setMirrorPage(data) {
  let pageUrl;
  try {
    pageUrl = new URL(data.pagePath, location.origin);
    if (pageUrl.pathname.endsWith("/")) pageUrl.pathname += "index.html";
  } catch {
    showNotice("Otvorenú stránku sa nepodarilo načítať.");
    return;
  }
  if (pageUrl.origin !== location.origin || !pageUrl.pathname.endsWith(".html")) {
    showNotice("Táto stránka sa nedá bezpečne zrkadliť.");
    return;
  }
  pageUrl.searchParams.set("remoteMirror", "1");
  if (mirror.dataset.pageUrl !== pageUrl.href) {
    mirror.dataset.pageUrl = pageUrl.href;
    mirror.src = pageUrl.href;
  }
  mirror.hidden = false;
}

function showPage(data) {
  currentPage = data;
  setMirrorPage(data);
  setConnection("Zrkadlené z počítača", "connected");
  showNotice("");
}

function watchCurrentPage(user) {
  stopPage?.();
  clearMirror();
  showView("control");
  setConnection("Hľadám otvorenú stránku…");
  showNotice("Otvorte prednášku na počítači.");

  // A single owner document removes collection queries and stale session selection.
  const pageRef = firestore.doc(db, "remoteSessions", user.uid);
  stopPage = firestore.onSnapshot(pageRef, { includeMetadataChanges: true }, (snapshot) => {
    if (snapshot.metadata.fromCache) {
      setConnection("Bez siete · čakám na pripojenie", "offline");
      showNotice("Zrkadlo sa obnoví po návrate internetového spojenia.");
      return;
    }
    if (!snapshot.exists()) {
      showWaiting();
      return;
    }

    const data = snapshot.data();
    if (data.ownerUid !== user.uid) {
      showWaiting("Otvorená stránka patrí inému účtu.");
      return;
    }
    if (!data.pageActive || isStale(data.pageHeartbeatAt)) {
      showWaiting("Čakám, kým sa stránka na počítači obnoví.");
      return;
    }

    showPage(data);
  }, (error) => {
    console.error("Mobilné zrkadlo: nepodarilo sa pripojiť k stránke.", error);
    setConnection("Spojenie sa prerušilo", "error");
    showNotice(error?.code === "permission-denied"
      ? "Prihláste sa rovnakým učiteľským účtom ako na počítači."
      : "Skontrolujte internetové spojenie.");
  });

  clearInterval(freshnessTimer);
  freshnessTimer = window.setInterval(() => {
    if (currentPage && isStale(currentPage.pageHeartbeatAt)) {
      showWaiting("Čakám, kým sa stránka na počítači obnoví.");
    }
  }, 10_000);
}

function installMirrorLayout() {
  let doc;
  try {
    doc = mirror.contentDocument;
  } catch {
    showNotice("Stránku nie je možné zobraziť v zrkadle.");
    return;
  }
  if (!doc || doc.documentElement.dataset.remoteMirrorReady === "yes") return;
  doc.documentElement.dataset.remoteMirrorReady = "yes";

  const panel = doc.querySelector(".lesson-side-panel");
  if (!panel) return;

  const style = doc.createElement("style");
  style.textContent = `
    html,body{min-height:100%;height:auto;margin:0!important}
    .lesson-side-panel{position:sticky!important;top:0!important;right:auto!important;bottom:auto!important;left:auto!important;z-index:5000!important;width:100%!important;max-height:56vh!important;overflow:auto!important;margin:0!important;border-radius:0 0 14px 14px!important;backdrop-filter:blur(12px)}
    @media(max-width:620px){.lesson-side-panel{max-height:57vh!important}.lesson-side-panel .narration-controls{gap:.4rem!important}.lesson-side-panel .narration-controls button{min-height:42px!important}}
  `;
  doc.head.append(style);
  doc.body.prepend(panel);
}

mirror.addEventListener("load", installMirrorLayout);
authButton.addEventListener("click", async () => {
  authButton.disabled = true;
  try {
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    if (matchMedia("(pointer: coarse)").matches) await authSdk.signInWithRedirect(auth, provider);
    else await authSdk.signInWithPopup(auth, provider);
  } catch (error) {
    showNotice("Prihlásenie sa nepodarilo. Skúste to znova.");
    console.error("Mobilné zrkadlo: prihlásenie zlyhalo.", error);
  } finally {
    authButton.disabled = false;
  }
});

authSdk.onAuthStateChanged(auth, (user) => {
  currentUser = user;
  stopPage?.();
  stopPage = null;
  if (!user) {
    clearMirror();
    showView("auth");
    setConnection("Vyžaduje sa učiteľské prihlásenie", "error");
    return;
  }
  watchCurrentPage(user);
});
