export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).end();
  }
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Set-Cookie", "teacher_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");
  return response.status(200).json({ ok: true });
}
