const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");
const { createHmac, timingSafeEqual } = require("node:crypto");

const githubToken = defineSecret("REMOTE_PIN_GITHUB_TOKEN");
const pinPepper = defineSecret("REMOTE_PIN_PEPPER");
const githubOwner = "DC-SPS";
const githubRepository = "Programovanie";
const githubPinPath = ".github/remote-pin-hmac.json";
const teacherAccountEmail = "dusan.cabala.sps@gmail.com";
initializeApp();

function requireTeacher(request) {
  const token = request.auth?.token;
  if (!token || token.email_verified !== true || token.email?.toLowerCase() !== teacherAccountEmail) {
    throw new HttpsError("permission-denied", "Teacher sign-in is required.");
  }
  return request.auth.uid;
}

function pinMac(pin) {
  return createHmac("sha256", pinPepper.value()).update(`remote-pin:v1:${pin}`).digest("base64url");
}

function validatePin(pin) {
  if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
    throw new HttpsError("invalid-argument", "Enter a six-digit PIN.");
  }
}

async function githubRequest(method, body) {
  const response = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepository}/contents/${githubPinPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${githubToken.value()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 404 && method === "GET") return null;
  if (!response.ok) throw new Error(`GitHub settings request failed (${response.status}).`);
  return response.status === 204 ? null : response.json();
}

async function readPinVerifier() {
  const response = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepository}/contents/${githubPinPath}`, {
    headers: {
      Authorization: `Bearer ${githubToken.value()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (response.status === 404) throw new HttpsError("failed-precondition", "The presenter PIN has not been configured yet.");
  if (!response.ok) throw new Error(`GitHub settings request failed (${response.status}).`);
  const file = await response.json();
  const record = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
  if (record.version !== 1 || typeof record.mac !== "string" || record.mac.length > 100) {
    throw new HttpsError("failed-precondition", "The presenter PIN configuration is invalid.");
  }
  return record.mac;
}

async function enforcePinRateLimit(uid) {
  const db = getFirestore();
  const ref = db.doc(`remotePinAttempts/${uid}`);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const blockedUntil = snapshot.data()?.blockedUntil;
    if (blockedUntil?.toMillis() > Date.now()) {
      throw new HttpsError("resource-exhausted", "Too many attempts. Try again later.");
    }
  });
  return ref;
}

async function recordPinAttempt(ref, success) {
  const db = getFirestore();
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (success) {
      if (snapshot.exists) transaction.delete(ref);
      return;
    }
    const data = snapshot.data() || {};
    const now = Date.now();
    const withinWindow = typeof data.windowStartedAt === "number" && now - data.windowStartedAt < 15 * 60 * 1000;
    const attempts = (withinWindow ? data.attempts || 0 : 0) + 1;
    transaction.set(ref, {
      attempts,
      windowStartedAt: withinWindow ? data.windowStartedAt : now,
      ...(attempts >= 6 ? { blockedUntil: Timestamp.fromMillis(now + 15 * 60 * 1000) } : {}),
    });
  });
}

exports.saveRemotePin = onCall(
  { region: "europe-west3", secrets: [githubToken, pinPepper] },
  async (request) => {
    const uid = requireTeacher(request);
    const pin = request.data?.pin;
    validatePin(pin);
    try {
      const existing = await githubRequest("GET");
      const record = { version: 1, mac: pinMac(pin) };
      const content = Buffer.from(`${JSON.stringify(record, null, 2)}\n`).toString("base64");
      await githubRequest("PUT", {
        message: "Update presenter PIN verifier",
        content,
        ...(existing?.sha ? { sha: existing.sha } : {}),
      });
      const devices = await getFirestore().collection("remoteDevices").where("ownerUid", "==", uid).get();
      for (let offset = 0; offset < devices.docs.length; offset += 400) {
        const batch = getFirestore().batch();
        devices.docs.slice(offset, offset + 400).forEach((device) => batch.delete(device.ref));
        await batch.commit();
      }
      return { saved: true };
    } catch (error) {
      console.error("Could not save presenter PIN verifier.", error?.message || "unknown error");
      throw new HttpsError("unavailable", "The PIN could not be saved to the repository.");
    }
  },
);

exports.verifyRemotePin = onCall(
  { region: "europe-west3", secrets: [githubToken, pinPepper] },
  async (request) => {
    const uid = requireTeacher(request);
    const pin = request.data?.pin;
    const deviceId = request.data?.deviceId;
    validatePin(pin);
    if (typeof deviceId !== "string" || !/^[a-f0-9-]{36}$/i.test(deviceId)) {
      throw new HttpsError("invalid-argument", "This device could not be identified.");
    }
    const attemptsRef = await enforcePinRateLimit(uid);
    try {
      const expected = Buffer.from(await readPinVerifier(), "base64url");
      const actual = Buffer.from(pinMac(pin), "base64url");
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        await recordPinAttempt(attemptsRef, false);
        throw new HttpsError("permission-denied", "The PIN is incorrect.");
      }
      await recordPinAttempt(attemptsRef, true);
      await getFirestore().doc(`remoteDevices/${uid}_${deviceId}`).set({
        ownerUid: uid,
        deviceId,
        authorizedAt: FieldValue.serverTimestamp(),
      });
      return { paired: true };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("Could not verify presenter PIN.", error?.message || "unknown error");
      throw new HttpsError("unavailable", "PIN verification is temporarily unavailable.");
    }
  },
);
