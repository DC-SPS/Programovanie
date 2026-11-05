const qrcodeScript = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
const qrcodeIntegrity = "sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA==";
let libraryPromise;

function loadLibrary() {
  if (window.QRCode) return Promise.resolve();
  if (!libraryPromise) {
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = qrcodeScript;
      script.integrity = qrcodeIntegrity;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.onload = () => window.QRCode ? resolve() : reject(new Error("QR knižnica sa nenačítala."));
      script.onerror = () => reject(new Error("QR knižnicu sa nepodarilo načítať."));
      document.head.append(script);
    });
  }
  return libraryPromise;
}

export async function renderQrCode(container, value, size = 220) {
  await loadLibrary();
  container.replaceChildren();
  container.setAttribute("role", "img");
  if (!container.hasAttribute("aria-label")) {
    container.setAttribute("aria-label", "QR kód na otvorenie mobilného ovládača");
  }
  new window.QRCode(container, {
    text: value,
    width: size,
    height: size,
    colorDark: "#06111c",
    colorLight: "#ffffff",
    correctLevel: window.QRCode.CorrectLevel.M,
  });
}
