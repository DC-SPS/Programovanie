import { renderQrCode } from "./remote-qr.js";

const qr = document.querySelector("#home-remote-qr");
if (qr) {
  try {
    const storageKey = "lectureRemoteRoomId";
    let roomId = localStorage.getItem(storageKey);
    if (!/^[a-f0-9]{48}$/.test(roomId || "")) {
      roomId = Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) => byte.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(storageKey, roomId);
    }
    const target = new URL("remote/", document.baseURI);
    target.searchParams.set("session", roomId);
    document.querySelector(".remote-fallback")?.setAttribute("href", target.href);
    renderQrCode(qr, target.href, 172).catch(() => {
      qr.textContent = "QR kód sa nepodarilo načítať. Použite odkaz na mobilné zrkadlo.";
      qr.setAttribute("role", "status");
      qr.setAttribute("aria-label", "QR kód nie je dostupný; použite odkaz na mobilné zrkadlo");
    });
  } catch (error) {
    console.error("Mobilné zrkadlo: QR kód sa nepodarilo pripraviť.", error);
    qr.textContent = "QR kód nie je dostupný. Obnovte stránku.";
  }
}
