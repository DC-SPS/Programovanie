(() => {
  "use strict";
  const main = document.querySelector("main") || document.querySelector(".page") || document.querySelector(".wrap") || document.querySelector(".w");
  if (!main || document.body.dataset.lessonExportReady === "true") return;
  document.body.dataset.lessonExportReady = "true";

  const title = document.querySelector("h1")?.textContent.trim() || document.title;
  const normalized = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const isWin32 = /win32|windows api|hodina \d+ \/ 66/i.test(document.body.innerText.slice(0, 1200)) || location.pathname.includes("04_Win32_API");
  const intro = document.createElement("aside");
  intro.className = "lesson-guidance lesson-opening-guidance";
  intro.setAttribute("aria-label", "Pokyny na začiatku hodiny");
  intro.innerHTML = "<strong>Začíname kontrolou pracoviska:</strong> Skontrolujte lavicu, stoličku, pridelený počítač a viditeľný stav príslušenstva. Poškodenie, chýbajúcu časť alebo inú závadu ihneď ústne oznámte vyučujúcemu a stručný súhrn pošlite cez EduPage podľa jeho pokynov. Poškodené, nefunkčné ani nebezpečné zariadenie nepoužívajte.";
  if (!main.querySelector(".safety-notice,.notice,.lesson-opening-guidance")) {
    const anchor = main.querySelector(".top") || main.querySelector("header") || main.firstElementChild;
    if (anchor) anchor.after(intro); else main.prepend(intro);
  }

  const guidance = guidanceFor(normalized, isWin32);
  const existingReminders = main.querySelectorAll(".safety-reminder,.lesson-guidance").length;
  const headings = [...main.querySelectorAll("h2")].filter((heading) => !heading.closest(".lesson-export-sections"));
  if (existingReminders < 2 && headings.length > 2) {
    const first = headings[Math.max(0, Math.floor(headings.length / 3))];
    const second = headings[Math.max(0, Math.floor((headings.length * 2) / 3))];
    if (first && !first.previousElementSibling?.matches(".safety-reminder,.lesson-guidance")) first.before(makeReminder("Počas práce na tejto téme", guidance.work));
    if (existingReminders < 2 && second && second !== first && !second.previousElementSibling?.matches(".safety-reminder,.lesson-guidance")) second.before(makeReminder("Pri praktickej časti", guidance.practice));
  }

  const hasDeparture = [...main.querySelectorAll(".safety-reminder,.lesson-guidance")].some((node) => /pred odchodom/i.test(node.textContent));
  if (!main.querySelector(".lesson-departure-guidance") && !hasDeparture) {
    const ending = makeReminder("Pred odchodom", "Uložte rozpracovanú prácu na určené miesto, zavrite používané nástroje a odhláste sa alebo vypnite počítač podľa pokynov vyučujúceho. Pracovisko zanechajte čisté a pripravené pre ďalšiu skupinu.");
    ending.classList.add("lesson-departure-guidance");
    const footer = main.querySelector("footer");
    (footer || main.lastElementChild)?.before(ending) || main.append(ending);
  }

  const footer = main.querySelector("footer");
  if (!main.querySelector(".lesson-export-sections")) {
    const sections = document.createElement("div");
    sections.className = "lesson-export-sections";
    sections.innerHTML = `<section class="lesson-sources"><h2>Odporúčané zdroje</h2><ul>${sourceLinks(isWin32, normalized)}</ul><p>Pri práci so zdrojmi si overte, či opisujú rovnaký jazyk, nástroj a verziu ako táto lekcia.</p></section><section class="lesson-glossary"><h2>Register pojmov a skratiek</h2><dl>${glossaryTerms(normalized, isWin32)}</dl></section>`;
    (footer || null)?.before(sections);
    if (!footer) main.append(sections);
  }

  const header = main.querySelector("header") || main.querySelector(".top");
  if (header && !header.querySelector(".lesson-export-button") && !main.querySelector(".pdf-export")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-export-button";
    button.textContent = "Exportovať do PDF";
    button.addEventListener("click", () => window.print());
    const mode = header.querySelector(".mode");
    (mode || header).after(button);
  }

  function makeReminder(label, text) {
    const box = document.createElement("aside");
    box.className = "lesson-guidance safety-reminder";
    box.innerHTML = `<strong>${label}:</strong> ${text}`;
    return box;
  }
  function guidanceFor(key, win) {
    const safe = "Pracujte iba so školským účtom a schválenými súbormi. Systémové nastavenia, periférie ani káble nemeňte bez pokynu vyučujúceho.";
    const map = [
      [/bezpec|pracovisk/, "Ak spozorujete poškodenie alebo nebezpečenstvo, prerušte činnosť, zariadenia sa nedotýkajte a ihneď informujte vyučujúceho.", "Počas cvičenia nič nerozoberajte ani nepripájajte. Bezpečný postup má prednosť pred dokončením úlohy."],
      [/algorit|podmien|cykl|rekur|tried|funkci|diagram|vypocet/, "Najprv si overte vstupné hodnoty, podmienky ukončenia a očakávaný výsledok; skúšajte aj hraničné prípady.", "Postupujte po malých krokoch a priebežne porovnávajte výsledok s ručne overeným príkladom. Pri nekonečnom cykle prácu zastavte a opravte podmienku."],
      [/typ|premenn|pretyp|komentar|docstring|jazyk|programov/, "Používajte zrozumiteľné názvy a overujte typy aj význam hodnôt; pri nejasnosti sa vráťte k definíciám v lekcii.", "Príklady upravujte v samostatnom súbore a zachovajte pôvodnú ukážku. Výsledok spustite alebo skontrolujte podľa zadania."],
      [/okno|button|combo|textov|formul|graf|gdi|clipboard|datab|sqlite|datum|udalost|projekt|prezent|test|hodnoten/, "Zmeny robte v pracovnej kópii. Pred spustením skontrolujte názvy prvkov, vstupné údaje a možné vedľajšie účinky.", "Testujte bežný aj chybný vstup. Ak aplikácia alebo nástroj nereaguje očakávane, zastavte ju bezpečným spôsobom a požiadajte o pomoc."],
    ];
    const match = map.find(([pattern]) => pattern.test(key));
    const fallback = win ? [safe, "Ukladajte zmeny priebežne a spúšťajte len kód, ktorému rozumiete a ktorý patrí do zadania."] : ["Pracujte v školskom prostredí a priebežne si ukladajte vlastné riešenie.", "Skontrolujte riešenie na viacerých vstupoch a vysvetlite, prečo zodpovedá zadaniu."];
    return match ? [match[1], match[2]] : fallback;
  }
  function sourceLinks(win, key) {
    if (win) return '<li><a href="https://learn.microsoft.com/windows/win32/">Microsoft Learn: Windows API</a> — oficiálna dokumentácia Win32.</li><li><a href="https://learn.microsoft.com/cpp/">Microsoft Learn: C++</a> — dokumentácia jazyka a nástrojov MSVC.</li><li><a href="https://www.sqlite.org/docs.html">SQLite Documentation</a> — zdroje pre databázové témy.</li>';
    if (/algorit|podmien|cykl|rekur|tried|diagram|vypocet/.test(key)) return '<li><a href="https://docs.python.org/3/tutorial/controlflow.html">Python Tutorial: Control Flow</a> — vetvenie, cykly a funkcie.</li><li><a href="https://docs.python.org/3/library/stdtypes.html">Python Standard Types</a> — vstavané dátové typy a operácie.</li><li><a href="https://www.python.org/doc/">Python Documentation</a> — oficiálna dokumentácia.</li>';
    return '<li><a href="https://docs.python.org/3/tutorial/">The Python Tutorial</a> — oficiálny úvod do jazyka Python.</li><li><a href="https://docs.python.org/3/library/">Python Standard Library</a> — dokumentácia štandardnej knižnice.</li><li><a href="https://www.python.org/doc/">Python Documentation</a> — prehľad dokumentácie a ďalších zdrojov.</li>';
  }
  function glossaryTerms(key, win) {
    const terms = win ? [["Win32 API", "Natívne rozhranie Windows používané programom na prácu s oknami, správami a systémovými službami."], ["C++", "Programovací jazyk použitý na tvorbu aplikácie v tejto lekcii."], ["Windows SDK", "Súbor hlavičiek, knižníc a nástrojov potrebných na vývoj pre Windows."]] : [["Python", "Programovací jazyk používaný na zápis a spúšťanie príkladov v kurze."], ["Algoritmus", "Konečný a jednoznačný postup riešenia úlohy."], ["Vstup a výstup", "Údaje, ktoré riešenie prijíma, a výsledky, ktoré vytvára."]];
    const matched = key.match(/algorit|cykl|podmien|funkci|rekur|tried|typ|premenn|jazyk|komentar|docstring|win32|okno|button|combo|graf|datab/);
    if (matched) {
      const label = matched[0];
      const definitions = {algorit:"Postupnosť krokov, ktorá rieši zadaný problém.",cykl:"Riadiaca konštrukcia, ktorá opakuje príkazy podľa podmienky alebo počtu opakovaní.",podmien:"Logický výraz, podľa ktorého program vyberá ďalší postup.",funkci:"Pomenovaná časť programu, ktorú možno zavolať a prípadne jej odovzdať argumenty.",rekur:"Postup, pri ktorom funkcia rieši menší prípad úlohy vlastným volaním.",tried:"Usporiadanie prvkov podľa zvoleného pravidla.",typ:"Určuje druh hodnoty a operácie, ktoré s ňou možno vykonať.",premenn:"Pomenované miesto v programe, ktorému je priradená hodnota.",jazyk:"Formálny súbor pravidiel a zápisov na vyjadrenie programu.",komentar:"Text v zdrojovom súbore určený na vysvetlenie kódu, ktorý sa nevykonáva ako príkaz.",docstring:"Reťazec dokumentácie priradený k modulu, triede alebo funkcii.",win32:"Rozhranie Windows na tvorbu natívnych aplikácií a používanie systémových služieb.",okno:"Grafický prvok Windows, ktorý zobrazuje obsah a prijíma používateľské správy.",button:"Ovládací prvok, ktorý vyvolá akciu po aktivovaní používateľom.",combo:"Kombinovaný zoznam umožňujúci vybrať položku z ponuky.",graf:"Vizuálne zobrazenie údajov alebo kresby v aplikácii.",datab:"Organizované úložisko údajov, ktoré možno vyhľadávať a upravovať."};
      terms.unshift([label[0].toUpperCase()+label.slice(1), definitions[label] || "Kľúčový pojem použitý v tejto téme."]);
    }
    return terms.map(([term, definition]) => `<dt>${term}</dt><dd>${definition}</dd>`).join("");
  }
})();
