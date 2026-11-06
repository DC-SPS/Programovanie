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
  if (publicPaths.has(url.pathname) || url.pathname.startsWith("/remote/")) return;
  if (/\.(?:css|m?js|json|map|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mp3|ogg|vtt|pdf)$/i.test(url.pathname)) return;

  if (url.searchParams.get("remoteMirror") === "1") {
    const roomId = url.searchParams.get("session") || "";
    if (await canOpenMirror(url.pathname, roomId)) return;
  }

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

async function canOpenMirror(pathname, roomId) {
  if (!/^[a-f0-9]{48}$/.test(roomId)) return false;
  try {
    const endpoint = `https://firestore.googleapis.com/v1/projects/programovanie-sps/databases/(default)/documents/lectureMirrors/${roomId}`;
    const response = await fetch(endpoint, { headers: { "Cache-Control": "no-cache" } });
    if (!response.ok) return false;
    const document = await response.json();
    const fields = document.fields || {};
    const pagePath = fields.pagePath?.stringValue;
    const heartbeat = Date.parse(fields.pageHeartbeatAt?.timestampValue || "");
    return fields.pageActive?.booleanValue === true
      && pagePath === pathname
      && Number.isFinite(heartbeat)
      && Date.now() - heartbeat <= 60_000;
  } catch {
    return false;
  }
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
