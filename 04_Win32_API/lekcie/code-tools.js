(() => {
  const compilerUrl = "https://www.programiz.com/cpp-programming/online-compiler/";
  const win32Pattern = /windows\.h|WNDCLASSEX|CreateWindowEx|GetMessage|DispatchMessage|TranslateMessage|PAINTSTRUCT|BeginPaint|EndPaint|WindowProc|WM_[A-Z_]+|\bHWND\b|\bHINSTANCE\b|\bWinMain\b/i;

  const style = document.createElement("style");
  style.textContent = `
    .code-tools{display:flex;flex-wrap:wrap;align-items:center;gap:.55rem;margin:1rem 0 .45rem}
    .code-tools button,.code-tools a{display:inline-flex;align-items:center;gap:.35rem;min-height:2.35rem;padding:.45rem .75rem;border:1px solid #32617e;border-radius:.55rem;background:#12334b;color:#e6f6ff;font:600 .88rem/1.2 system-ui,sans-serif;text-decoration:none;cursor:pointer}
    .code-tools button:hover,.code-tools a:hover{background:#164766;border-color:#38bdf8}
    .code-tools button:focus-visible,.code-tools a:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}
    .code-tools-status{flex-basis:100%;min-height:1.4em;margin:0;color:#a8bdcf;font-size:.82rem}
    .code-help,.code-warning{margin:.5rem 0 1rem;padding:.7rem .9rem;border-left:3px solid #38bdf8;border-radius:0 .55rem .55rem 0;background:#0e2638;color:#c5d7e6;font-size:.9rem}
    .code-warning{border-left-color:#fbbf24}
  `;
  document.head.append(style);

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error("Kopírovanie sa nepodarilo."));
  }

  document.querySelectorAll("pre > code").forEach((code) => {
    const pre = code.parentElement;
    if (pre.dataset.codeToolsReady) return;
    pre.dataset.codeToolsReady = "true";

    const source = code.textContent.trim();
    const usesWin32 = win32Pattern.test(source);
    const standalone = /\b(?:int\s+)?main\s*\(/.test(source);
    const toolbar = document.createElement("div");
    toolbar.className = "code-tools";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Akcie s ukážkou kódu");

    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "Skopírovať kód";
    const status = document.createElement("p");
    status.className = "code-tools-status";
    status.setAttribute("aria-live", "polite");
    copy.addEventListener("click", async () => {
      try {
        await copyText(source);
        status.textContent = "Kód je skopírovaný do schránky.";
      } catch {
        status.textContent = "Kopírovanie sa nepodarilo. Označ kód a skopíruj ho ručne.";
      }
    });
    toolbar.append(copy);

    if (usesWin32) {
      const warning = document.createElement("p");
      warning.className = "code-warning";
      warning.textContent = "Táto ukážka používa Win32 API. Bežný online C++ kompilátor ju nespustí; potrebuje Windows a Windows SDK. Kód skopíruj a spusti v pripravenom prostredí Windows.";
      pre.before(toolbar, warning);
    } else {
      if (standalone) {
        const run = document.createElement("a");
        run.href = compilerUrl;
        run.target = "_blank";
        run.rel = "noopener noreferrer";
        run.textContent = "Vyskúšať online ↗";
        run.addEventListener("click", () => {
          copyText(source).then(() => {
            status.textContent = "Kód je skopírovaný. V online editore ho vlož pomocou Ctrl+V a stlač Run.";
          }).catch(() => {
            status.textContent = "Vlož kód do online editora ručne a stlač Run.";
          });
        });
        toolbar.append(run);
      } else {
        const note = document.createElement("p");
        note.className = "code-help";
        note.textContent = "Čiastková ukážka: skopíruj ju do úplného programu podľa zadania. Samostatne ju online nespustíš.";
        pre.before(toolbar, note);
      }
    }
    toolbar.append(status);
    if (!usesWin32 && standalone) pre.before(toolbar);
  });
})();