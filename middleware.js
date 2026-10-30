import { verifyTeacherToken } from "./lib/firebase-token.js";

const publicPaths = new Set([
  "/login.html",
  "/login.js",
  "/firebase-config.js",
  "/theme.js",
  "/api/session",
  "/api/logout"
]);

export const config = { runtime: "nodejs" };

export default async function middleware(request) {
  const url = new URL(request.url);
  if (publicPaths.has(url.pathname)) return;

  const token = readCookie(request.headers.get("cookie"), "teacher_session");
  if (token) {
    try {
      await verifyTeacherToken(token);
      return;
    } catch {
      // Invalid, expired, or unauthorized session: clear it and redirect to sign-in.
    }
  }

  const login = new URL("/login.html", url);
  login.searchParams.set("next", url.pathname + url.search);
  const headers = new Headers({ Location: login.toString(), "Cache-Control": "no-store" });
  if (token) headers.set("Set-Cookie", "teacher_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");
  return new Response(null, { status: 307, headers });
}

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}
