import { firebaseConfig } from "./firebase-config.js";

(() => {
  const main = document.querySelector("main");
  if (!main || new URLSearchParams(location.search).get("remoteMirror") === "1") return;

  const pageTitle = (main.querySelector("h1")?.textContent.trim() || document.title).slice(0, 160);
  const pagePath = location.pathname.slice(0, 500);
  const version = "10.14.1";
  let sessionRef = null;
  let dbSdk = null;
  let heartbeatTimer = 0;

  const loadFirebase = async () => {
    const [appSdk, authSdk, firestore] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
    ]);
    const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
    dbSdk = firestore;
    return {
      auth: authSdk.getAuth(app),
      authSdk,
      db: firestore.getFirestore(app),
      firestore,
    };
  };

  const publishHeartbeat = async () => {
    if (!sessionRef || !dbSdk) return;
    try {
      await dbSdk.updateDoc(sessionRef, {
        pageActive: true,
        pageHeartbeatAt: dbSdk.serverTimestamp(),
      });
    } catch (error) {
      console.error("Mobilné zrkadlo: nepodarilo sa obnoviť spojenie.", error);
    }
  };

  const publishCurrentPage = async (user, firestore, db) => {
    sessionRef = firestore.doc(db, "remoteSessions", user.uid);
    try {
      await firestore.runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(sessionRef);
        const pageData = {
          ownerUid: user.uid,
          pageTitle,
          pagePath,
          pageActive: true,
          pageHeartbeatAt: firestore.serverTimestamp(),
          playbackState: "stopped",
          canReplay: false,
          canRestartCurrent: false,
          displayMode: "student",
        };
        if (snapshot.exists()) {
          transaction.update(sessionRef, pageData);
        } else {
          transaction.set(sessionRef, { ...pageData, createdAt: firestore.serverTimestamp() });
        }
      });
      clearInterval(heartbeatTimer);
      heartbeatTimer = window.setInterval(publishHeartbeat, 10_000);
    } catch (error) {
      console.error("Mobilné zrkadlo: nepodarilo sa zverejniť otvorenú stránku.", error);
    }
  };

  loadFirebase().then(({ auth, authSdk, db, firestore }) => {
    authSdk.onAuthStateChanged(auth, (user) => {
      clearInterval(heartbeatTimer);
      heartbeatTimer = 0;
      sessionRef = null;
      if (user) publishCurrentPage(user, firestore, db);
    });
  }).catch((error) => {
    console.error("Mobilné zrkadlo: Firebase sa nepodarilo spustiť.", error);
  });
})();
