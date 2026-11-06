import { firebaseConfig } from "../firebase-config.js";

const version = "10.14.1";
const [appSdk, firestore] = await Promise.all([
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
]);
const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app);
const $ = (selector) => document.querySelector(selector);
const connection = $("#connection");
const mirror = $("#lesson-mirror");
const mirrorView = mirror.closest(".mirror-view");
const notice = $("#notice");
const sessionId = new URLSearchParams(location.search).get("session") || "";
let currentPage = null;

function setConnection(message, state = "connecting") {
  connection.textContent = message;
  connection.dataset.state = state;
}

function showNotice(message = "") {
  notice.textContent = message;
  notice.hidden = !message;
}

function showWaiting() {
  currentPage = null;
  mirror.hidden = true;
  mirrorView.hidden = true;
  mirror.removeAttribute("src");
  delete mirror.dataset.pageUrl;
  setConnection("Čakám na otvorenú prednášku", "offline");
  showNotice("Otvorte prednášku na počítači, na ktorom sa zobrazuje tento QR kód.");
}

function showPage(data) {
  const heartbeat = data.pageHeartbeatAt?.toMillis?.() || 0;
  if (!data.pageActive || !heartbeat || Date.now() - heartbeat > 60_000) {
    showWaiting();
    return;
  }

  let pageUrl;
  try {
    pageUrl = new URL(data.pagePath, location.origin);
  } catch {
    showNotice("Otvorenú stránku sa nepodarilo načítať.");
    return;
  }
  if (pageUrl.origin !== location.origin || !pageUrl.pathname.endsWith(".html")) {
    showNotice("Táto stránka sa nedá bezpečne zrkadliť.");
    return;
  }

  pageUrl.searchParams.set("remoteMirror", "1");
  pageUrl.searchParams.set("session", sessionId);
  currentPage = data;
  if (mirror.dataset.pageUrl !== pageUrl.href) {
    mirror.dataset.pageUrl = pageUrl.href;
    mirror.src = pageUrl.href;
  }
  mirror.hidden = false;
  mirrorView.hidden = false;
  setConnection(`Zrkadlím: ${data.pageTitle || "prednáška"}`, "connected");
  showNotice("");
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

if (!/^[a-f0-9]{48}$/.test(sessionId)) {
  setConnection("Najprv naskenujte QR kód z počítača", "error");
  showNotice("Otvorte túto stránku cez QR kód z hlavnej stránky kurzu.");
} else {
  setConnection("Hľadám otvorenú prednášku…");
  firestore.onSnapshot(firestore.doc(db, "lectureMirrors", sessionId), (snapshot) => {
    if (!snapshot.exists()) {
      showWaiting();
      return;
    }
    showPage(snapshot.data());
  }, (error) => {
    console.error("Mobilné zrkadlo: spojenie sa nepodarilo.", error);
    setConnection("Spojenie sa prerušilo", "error");
    showNotice("Nepodarilo sa pripojiť. Obnovte stránku alebo znovu naskenujte QR kód.");
  });
  window.setInterval(() => {
    if (currentPage) showPage(currentPage);
  }, 10_000);
}
