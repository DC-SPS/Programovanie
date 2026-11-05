import { renderQrCode } from "./remote-qr.js";

const qr = document.querySelector("#home-remote-qr");
if (qr) {
  const target = new URL("remote/", document.baseURI).href;
  renderQrCode(qr, target, 172).catch(() => {
    qr.textContent = "QR kód sa nepodarilo načítať. Použite odkaz na otvorenie ovládača.";
    qr.setAttribute("role", "status");
    qr.setAttribute("aria-label", "QR kód nie je dostupný; použite odkaz na otvorenie ovládača");
  });
}
