const { beforeUserCreated, beforeUserSignedIn } = require("firebase-functions/v2/identity");
const { HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const teacherEmail = defineSecret("TEACHER_EMAIL");

function isTeacher(event) {
  const user = event.data;
  return user
    && user.emailVerified === true
    && typeof user.email === "string"
    && user.email.toLowerCase() === teacherEmail.value().trim().toLowerCase();
}

exports.allowTeacherAccountCreation = beforeUserCreated(
  { region: "europe-west3", secrets: [teacherEmail] },
  (event) => {
    if (!isTeacher(event)) {
      throw new HttpsError("permission-denied", "This Google account is not authorized.");
    }
  }
);

exports.allowTeacherSignIn = beforeUserSignedIn(
  { region: "europe-west3", secrets: [teacherEmail] },
  (event) => {
    if (!isTeacher(event)) {
      throw new HttpsError("permission-denied", "This Google account is not authorized.");
    }

    return {
      sessionClaims: {
        teacher: true
      }
    };
  }
);

