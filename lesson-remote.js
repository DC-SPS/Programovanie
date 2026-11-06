import { firebaseConfig } from "./firebase-config.js";

(() => {
  const main = document.querySelector("main");
  if (!main || new URLSearchParams(location.search).get("remoteMirror") === "1") return;

  const pageTitle = (main.querySelector("h1")?.textContent.trim() || document.title).slice(0, 160);
  const pagePath = location.pathname.slice(0, 500);
  const roomId = getOrCreateRoomId();
  const version = "10.14.1";
  let firestore;
  let sessionRef;
  let heartbeatTimer = 0;
  let publishNotice;

  function showPublishError(error) {
    if (!publishNotice) {
      publishNotice = document.createElement("p");
      publishNotice.setAttribute("role", "status");
      Object.assign(publishNotice.style, {
        position: "fixed", left: "12px", bottom: "12px", zIndex: "99999",
        maxWidth: "min(460px, calc(100vw - 24px))", margin: "0", padding: "10px 14px",
        borderRadius: "8px", background: "#411d29", color: "#ffe4e6",
        font: "14px/1.4 system-ui, sans-serif", boxShadow: "0 4px 20px #0005",
      });
      document.body.append(publishNotice);
    }
    const code = error?.code || "unknown";
    publishNotice.textContent = `Mobilné zrkadlo sa nepripojilo k prednáške (${code}). Skontrolujte nasadenie Firestore pravidiel.`;
  }

  function getOrCreateRoomId() {
    const storageKey = "lectureRemoteRoomId";
    let roomId = localStorage.getItem(storageKey);
    if (!/^[a-f0-9]{48}$/.test(roomId || "")) {
      const bytes = crypto.getRandomValues(new Uint8Array(24));
      roomId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(storageKey, roomId);
    }
    return roomId;
  }

  async function publishPage() {
    if (!sessionRef || !firestore) return;
    try {
      await firestore.setDoc(sessionRef, {
        pageTitle,
        pagePath,
        pageHeartbeatAt: firestore.serverTimestamp(),
        pageActive: true,
        updatedAt: firestore.serverTimestamp(),
      }, { merge: true });
      publishNotice?.remove();
      publishNotice = null;
    } catch (error) {
      console.error("Mobilné zrkadlo: stránku sa nepodarilo zverejniť.", error);
      showPublishError(error);
    }
  }

  async function start() {
    const [appSdk, firestoreSdk] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
    ]);
    const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
    firestore = firestoreSdk;
    const db = firestore.getFirestore(app);
    sessionRef = firestore.doc(db, "lectureMirrors", roomId);

    await publishPage();
    heartbeatTimer = window.setInterval(publishPage, 10_000);
    window.addEventListener("pagehide", () => clearInterval(heartbeatTimer), { once: true });
  }

  start().catch((error) => {
    console.error("Mobilné zrkadlo: nepodarilo sa spustiť zdieľanie.", error);
    showPublishError(error);
  });
})();
