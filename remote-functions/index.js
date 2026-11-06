const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");
const { createHmac, timingSafeEqual } = require("node:crypto");

const pinPepper = defineSecret("REMOTE_PIN_PEPPER");
const teacherAccountEmail = "dusan.cabala.sps@gmail.com";
const pinLifetimeMs = 10 * 60 * 1000;
initializeApp();

function requireTeacher(request) {
  const token = request.auth?.token;
  if (!token || token.email_verified !== true || token.email?.toLowerCase() !== teacherAccountEmail) {
    throw new HttpsError("permission-denied", "Teacher sign-in is required.");
  }
  return request.auth.uid;
}

function pinMac(uid, pin) {
  return createHmac("sha256", pinPepper.value()).update(`remote-pin:v1:${uid}:${pin}`).digest();
}

function validatePin(pin) {
  if (typeof pin !== "string" || !/^\\d{6}$/.test(pin)) {
    throw new HttpsError("invalid-argument", "Enter a six-digit PIN.");
  }
}

function getRemoteDeviceCollection(uid) {
  return getFirestore().collection("remoteDevices").where("ownerUid", "==", uid);
}

async function deleteRemoteDevices(uid) {
  const snapshot = await getRemoteDeviceCollection(uid).get();
  for (let offset = 0; offset < snapshot.docs.length; offset += 400) {
    const batch = getFirestore().batch();
    snapshot.docs.slice(offset, offset + 400).forEach((device) => batch.delete(device.ref));
    await batch.commit();
  }
}

exports.saveRemotePin = onCall(
  { region: "europe-west3", secrets: [pinPepper] },
  async (request) => {
    const uid = requireTeacher(request);
    const pin = request.data?.pin;
    validatePin(pin);
    const db = getFirestore();
    const now = Date.now();
    await deleteRemoteDevices(uid);
    await db.doc(`remotePinAttempts/${uid}`).delete();
    await db.doc(`remotePinChallenges/${uid}`).set({
      mac: pinMac(uid, pin).toString("base64url"),
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + pinLifetimeMs),
    });
    // Only a temporary HMAC verifier is persisted; the submitted PIN is never saved.
    return { saved: true, expiresInSeconds: pinLifetimeMs / 1000 };
  },
);

exports.verifyRemotePin = onCall(
  { region: "europe-west3", secrets: [pinPepper] },
  async (request) => {
    const uid = requireTeacher(request);
    const pin = request.data?.pin;
    const deviceId = request.data?.deviceId;
    validatePin(pin);
    if (typeof deviceId !== "string" || !/^[a-f0-9-]{36}$/i.test(deviceId)) {
      throw new HttpsError("invalid-argument", "This device could not be identified.");
    }

    const db = getFirestore();
    const challengeRef = db.doc(`remotePinChallenges/${uid}`);
    const attemptsRef = db.doc(`remotePinAttempts/${uid}`);
    const outcome = await db.runTransaction(async (transaction) => {
      const [challenge, attempts] = await Promise.all([
        transaction.get(challengeRef),
        transaction.get(attemptsRef),
      ]);
      const blockedUntil = attempts.data()?.blockedUntil;
      if (blockedUntil?.toMillis() > Date.now()) return { error: "blocked" };
      const challengeData = challenge.data();
      if (!challengeData || challengeData.expiresAt?.toMillis() <= Date.now()) return { error: "expired" };

      const expected = Buffer.from(challengeData.mac, "base64url");
      const actual = pinMac(uid, pin);
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        const old = attempts.data() || {};
        const now = Date.now();
        const sameWindow = typeof old.windowStartedAt === "number" && now - old.windowStartedAt < 15 * 60 * 1000;
        const count = (sameWindow ? old.count || 0 : 0) + 1;
        transaction.set(attemptsRef, {
          count,
          windowStartedAt: sameWindow ? old.windowStartedAt : now,
          ...(count >= 6 ? { blockedUntil: Timestamp.fromMillis(now + 15 * 60 * 1000) } : {}),
        });
        return { error: count >= 6 ? "blocked" : "incorrect" };
      }

      transaction.delete(challengeRef);
      transaction.delete(attemptsRef);
      transaction.set(db.doc(`remoteDevices/${uid}_${deviceId}`), {
        ownerUid: uid,
        deviceId,
        authorizedAt: FieldValue.serverTimestamp(),
      });
      return { paired: true };
    });

    if (outcome.paired) return outcome;
    if (outcome.error === "blocked") throw new HttpsError("resource-exhausted", "Too many attempts. Generate a new PIN later.");
    if (outcome.error === "expired") throw new HttpsError("failed-precondition", "The one-time PIN has expired. Generate a new one.");
    throw new HttpsError("permission-denied", "The one-time PIN is incorrect.");
  },
);

exports.clearRemotePin = onCall(
  { region: "europe-west3" },
  async (request) => {
    const uid = requireTeacher(request);
    const db = getFirestore();
    await Promise.all([
      db.doc(`remotePinChallenges/${uid}`).delete(),
      db.doc(`remotePinAttempts/${uid}`).delete(),
      deleteRemoteDevices(uid),
    ]);
    return { cleared: true };
  },
);

exports.expireRemotePinChallenges = onSchedule(
  { schedule: "every 5 minutes", timeZone: "Etc/UTC", region: "europe-west3" },
  async () => {
    const expired = await getFirestore().collection("remotePinChallenges")
      .where("expiresAt", "<=", Timestamp.now())
      .get();
    for (let offset = 0; offset < expired.docs.length; offset += 400) {
      const batch = getFirestore().batch();
      expired.docs.slice(offset, offset + 400).forEach((challenge) => batch.delete(challenge.ref));
      await batch.commit();
    }
  },
);
