import { createRemoteJWKSet, jwtVerify } from "jose";

const projectId = "programovanie-sps";
const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export async function verifyTeacherToken(token) {
  if (typeof token !== "string" || token.length > 12000) {
    throw new Error("Missing or invalid Firebase token.");
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"]
  });

  const allowedEmail = (process.env.TEACHER_EMAIL || "dusan.cabala.sps@gmail.com").trim().toLowerCase();
  if (
    payload.email?.toLowerCase() !== allowedEmail ||
    payload.email_verified !== true ||
    !payload.sub ||
    payload.firebase?.sign_in_provider !== "google.com"
  ) {
    throw new Error("This Google account is not allowed.");
  }

  return payload;
}
