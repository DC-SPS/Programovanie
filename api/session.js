import { verifyTeacherToken } from "../lib/firebase-token.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { idToken } = request.body || {};
    const claims = await verifyTeacherToken(idToken);
    const expiresIn = Math.max(60, Math.min(Number(claims.exp) - Math.floor(Date.now() / 1000), 3600));
    response.setHeader("Cache-Control", "no-store");
    response.setHeader(
      "Set-Cookie",
      `teacher_session=${encodeURIComponent(idToken)}; Max-Age=${expiresIn}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );
    return response.status(200).json({ ok: true });
  } catch {
    return response.status(401).json({ error: "Unauthorized." });
  }
}
