# Win32 API – metodická koncepcia kurzu

## Základné údaje

- **Predmet:** Aplikovaná informatika
- **Ročník:** 4. ročník strednej priemyselnej školy
- **Tematický celok:** Win32 API – tvorba natívnych desktopových aplikácií pre Windows
- **Jazyk:** C++
- **Rozsah:** 66 vyučovacích hodín × 45 minút (spolu 49 h 30 min)
- **Prostredie:** Visual Studio Code, MSVC C++ compiler a Windows SDK
- **Cieľová skupina:** žiaci so skúsenosťami s C, C++, Python a základmi objektového programovania

Kurz rozvíja existujúce programátorské vedomosti pri tvorbe skutočných desktopových aplikácií pre Windows. Nezačína výkladom algoritmizácie od nuly. Hlavnými témami sú Win32 API, udalostne riadená architektúra, okná a správy, natívne ovládacie prvky, GDI, práca so súbormi a SQLite.

## Metodická koncepcia

Každá hodina je samostatná 45-minútová interaktívna jednotka v slovenčine. Stránka spája overiteľné ciele, praktickú motiváciu, primeraný odborný výklad, vizuálnu alebo živú ukážku, krátke kontrolné otázky, úlohy v troch úrovniach a učiteľské riešenia. Hodina s programovaním obsahuje konzistentný kód, vysvetlenie zostavenia a spustenia vo Windows a upozornenie na typické chyby. Všetky ovládacie prvky webovej ukážky musia fungovať; študijné stránky musia byť čitateľné na projektore, responzívne a tlačiteľné.

Kód kurzu je natívne Win32 C++. Rozlišujeme ho od štandardného C++, Windows Forms, WPF, Qt, MFC a .NET. Webová simulácia môže vysvetľovať rozloženie či tok udalostí, ale nesmie predstierať, že spúšťa natívne Win32 API. Bežné online C++ kompilátory často bežia na Linuxe a nemajú Windows SDK, preto sa Win32 ukážky zostavujú a spúšťajú na Windows.

### Očakávané výsledky kurzu

Žiak navrhne a vytvorí natívnu Windows aplikáciu v C++, vysvetlí jej vstupný bod, registráciu a vytvorenie okna, správovú slučku a procedúru okna, vytvorí štandardné ovládacie prvky, spracuje vstupy a udalosti, vykreslí obsah pomocou GDI, uloží a načíta dáta, použije SQLite a odovzdá a odprezentuje vlastný projekt.

## Štyri moduly a ich výstupy

| Modul | Hodiny | Rozsah a výsledné zručnosti |
|---|---:|---|
| **01 – Vstup do predmetu** | 1–2 (2 h) | Bezpečnosť pracoviska, pravidlá práce, ciele a nástroje kurzu; žiak vie pripraviť pracovisko a opísať priebeh kurzu. |
| **02 – Úvod do objektového programovania** | 3–22 (20 h) | Triedy, objekty, stav, metódy, udalosti, zapuzdrenie, dedičnosť a polymorfizmus; následne dátové typy, funkcie, štruktúry, šablóny a vstupno-výstupné operácie. Žiak modeluje problém a rozdeľuje C++ program na zrozumiteľné časti. |
| **03 – Prostredie programu** | 23–28 (6 h) | VS Code, zostavenie a spustenie, nový Win32 projekt, zdrojové súbory, konfigurácia kompilátora a práca so schránkou. Žiak zostaví reprodukovateľný lokálny projekt a rozumie úlohe Windows SDK. |
| **04 – Tvorba projektov** | 29–66 (38 h) | Návrh okna a komponentov, formuláre, jedno- a viacriadkový text, tlačidlá, výberové zoznamy, kreslenie cez GDI, SQLite, dátum a čas; kontrolné testy, plánovanie, implementácia, testovanie a prezentácia záverečnej aplikácie. |

### Rozvrhnutie modulu 04

Hodiny 29–30: návrh komponentov a ich prepojenie s logikou; 31–32: okno a formulár; 33–37: textové polia a kontrola; 38–41: tlačidlá a výberové zoznamy; 42–44: súradnice, GDI a interaktívne kreslenie; 45–49: databázový model, CRUD, vyhľadávanie a chyby; 50–51: dátum a čas; 52: kontrolný test; 53–56: zadanie, návrh UI, dátový model a plán; 57–62: implementácia, testovanie, dokumentácia; 63–64: prezentácie; 65–66: hodnotenie, spätná väzba a reflexia.

## Technické prostredie

### Primárna konfigurácia kurzu

- Windows 10 alebo Windows 11, Visual Studio Code a jeho C/C++ rozšírenie.
- **MSVC v143 (Visual Studio 2022 C++ Build Tools)** a Windows 10/11 SDK. MSVC je primárny kompilátor, aby všetci žiaci používali rovnaké hlavičky, linker a nastavenia pre Windows.
- C++17 ako spoločný jazykový štandard; používať Unicode varianty Win32 funkcií (`...W`) a široké reťazce (`wchar_t`, `L"..."`).
- Typický vstupný bod GUI aplikácie je `wWinMain`; pre konzolové prípravné úlohy sa používa `main`.
- Win32 kód sa zostavuje z Windows Developer Command Prompt/Developer PowerShell alebo cez nakonfigurovaný VS Code task, ktorý zdedí prostredie MSVC. Bežný PowerShell nemusí mať nastavené cesty ku kompilátoru a SDK.
- Podľa použitých funkcií sa linkujú príslušné systémové knižnice, napr. `user32.lib`, `gdi32.lib` a `comctl32.lib`; príklady uvedú presné závislosti.

MinGW-w64 možno uviesť ako alternatívu, ale každá lekcia musí jasne označiť, či sa príkaz týka MSVC alebo GCC/MinGW. Syntax linkerových prepínačov a dostupné nástroje sa líšia. Nekombinovať príkaz jednej toolchain s druhou. Konkrétnu zostavovaciu konfiguráciu vrátane názvov cieľových súborov treba doložiť v lekcii, ktorá vytvára prvý projekt.

## Postupné budovanie aplikácie Smart Student Manager

Spoločná ukážková línia prepája moduly, ale nenúti každú hodinu meniť ten istý projekt.

1. **Model dát (modul 02):** štruktúra alebo trieda `Student`, identifikátor, meno, trieda; funkcie na validáciu a prácu s kolekciou.
2. **Projekt a okno (modul 03 a hodiny 29–32):** zdrojový súbor, `wWinMain`, registrácia triedy okna, `CreateWindowExW`, správová slučka; okno s rozložením.
3. **Ovládanie a udalosti (hodiny 33–41):** popisy, `EDIT`, `BUTTON`, `COMBOBOX`, identifikátory, `WM_COMMAND`, validácia a zrozumiteľné hlásenia.
4. **Zobrazenie (hodiny 42–44):** `WM_PAINT`, GDI a stav aplikácie; kreslenie zostáva oddelené od práce s dátami.
5. **Ukladanie (hodiny 45–51):** najprv dátový model a základné operácie, potom SQLite; pridávanie, čítanie, úprava, mazanie, filtrovanie a práca s dátumom/časom.
6. **Záverečný projekt (hodiny 53–66):** žiak navrhne vlastnú tému alebo rozšírenie evidencie, zvolí vhodné ukladanie, implementuje, otestuje, zdokumentuje a odprezentuje riešenie.

## Oficiálne zdroje podľa modulov

Používame prednostne dokumentáciu Microsoft Learn a dokumentáciu tvorcov technológií. Odkaz na referenciu konkrétnej funkcie sa doplní pri jej prvom použití.

### Modul 01 – Windows a kontext predmetu

- [Windows desktop app development](https://learn.microsoft.com/en-us/windows/apps/desktop/)
- [Get started with Win32 and C++](https://learn.microsoft.com/en-us/windows/win32/learnwin32/learn-to-program-for-windows)

### Modul 02 – C++ a objektový návrh

- [C++ language reference (Microsoft Learn)](https://learn.microsoft.com/en-us/cpp/cpp/cpp-language-reference)
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- [C++ reference](https://en.cppreference.com/w/)

### Modul 03 – vývojové prostredie a Windows API

- [MSVC – zostavenie C/C++ programu](https://learn.microsoft.com/en-us/cpp/build/compiling-a-c-cpp-program)
- [MSVC compiler options](https://learn.microsoft.com/en-us/cpp/build/reference/compiler-options)
- [Create a window – Win32](https://learn.microsoft.com/en-us/windows/win32/learnwin32/creating-a-window)
- [Windows messages and message loop](https://learn.microsoft.com/en-us/windows/win32/learnwin32/window-messages)
- [Using the Clipboard](https://learn.microsoft.com/en-us/windows/win32/dataxchg/using-the-clipboard)

### Modul 04 – okná, komponenty, grafika, súbory a dáta

- [Win32 desktop application documentation](https://learn.microsoft.com/en-us/windows/win32/learnwin32/)
- [Writing the Window Procedure](https://learn.microsoft.com/en-us/windows/win32/learnwin32/writing-the-window-procedure)
- [Windows Controls](https://learn.microsoft.com/en-us/windows/win32/controls/window-controls)
- [Windows Messages](https://learn.microsoft.com/en-us/windows/win32/winmsg/)
- [Windows GDI](https://learn.microsoft.com/en-us/windows/desktop/gdi/windows-gdi)
- [Reading from and writing to files](https://learn.microsoft.com/en-us/windows/win32/fileio/reading-from-and-writing-to-files)
- [SQLite documentation](https://www.sqlite.org/docs.html)
- [C++ SQLite interface](https://www.sqlite.org/cintro.html)

## Jednotný dizajn a funkcie interaktívnych prednášok

- Samostatná HTML stránka v `lekcie/`, navigácia späť na osnovu a medzi susednými hodinami.
- Jednotná tmavá paleta kurzu, veľké nadpisy, kontrastný text a dobrá čitateľnosť cez projektor; zobrazenie prispôsobené mobilu aj tlači.
- Každá lekcia obsahuje identifikáciu predmetu a **4. ročníka SPŠ**, modul, poradové číslo a 45 minút.
- Na začiatku každej hodiny je pokyn skontrolovať pracovisko a zariadenie, závady oznámiť vyučujúcemu, súhrn poslať cez EduPage a nebezpečné zariadenie nepoužívať.
- Časový plán hodiny, 3–5 merateľných cieľov, motiváciu, výklad, schému alebo ukážku, dve priebežné otázky, jednu interaktívnu úlohu, praktickú úlohu a samostatnú výzvu.
- Praktické zadanie má cieľ, predpoklady, kroky, očakávaný výsledok a hodnotiace kritériá; ponúka základnú, rozširujúcu a náročnejšiu úroveň.
- Kód je konzistentný s toolchain kurzu; kopírovanie a zvýraznenie kódu musia fungovať. Pri natívnom Win32 kóde uviesť build/run kroky pre Windows, nie falošné online spustenie.
- Kontrolné odpovede, riešenia, časté chyby a individuálna podpora sú v zreteľne označenej učiteľskej časti.
- Povinný záver každej hodiny: **Poznámky a povinné vedomosti, ktoré si zapamätať z hodiny**.

## Poznámky k pôvodnej osnove a riešenia

1. **Súčet hodín sedí:** 2 + 20 + 6 + 38 = 66. Čísla hodín 1–66 sa nemenia.
2. **Modul 02 má širší obsah ako OOP:** zahŕňa aj dátové typy, funkcie, štruktúry, šablóny a vstup/výstup. Zachováme schválený názov a poradie; výklad vysvetlí, že ide o prípravu C++ základov potrebných pred Win32.
3. **„Formulár“ nie je Visual Studio návrhár:** v tomto kurze ide o okno a natívne child controls vytvorené cez Win32 API; termín sa vysvetlí pri hodinách 29–32.
4. **Win32 je špecifické pre Windows:** interaktívny webový prvok môže simulovať diagram či logiku, ale samotný natívny kód vyžaduje Windows a Windows SDK.
5. **Kompilátory nie sú zameniteľné:** MSVC je primárna konfigurácia. MinGW-w64 sa uvádza len ako odlíšená alternatíva s vlastnými príkazmi.
6. **Záverečný projekt potrebuje priebežné míľniky:** hodiny 53–62 rozdeľujú návrh, implementáciu, ukladanie, testovanie a dokumentáciu; prezentácie a hodnotenie ostávajú na hodinách 63–66.
7. **Časová dotácia:** 66 vyučovacích hodín znamená 2 970 minút, teda 49 hodín a 30 minút astronomického času.

Podrobná osnova jednotlivých lekcií je v [`struktura.html`](./struktura.html). Každá lekcia sa tvorí samostatne podľa pravidiel v [`AGENTS.md`](./AGENTS.md); všetkých 66 stránok sa nevytvára naraz.
