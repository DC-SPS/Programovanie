# Pokyny pre prácu v kurze Win32 API

Tieto pokyny platia pre celý priečinok `04_Win32_API/` a majú prednosť pred staršími textami v materiáloch, ak sú v rozpore.

## Identita kurzu

- Predmet: **Aplikovaná informatika**.
- Cieľová skupina: **4. ročník strednej priemyselnej školy (SPŠ)**. Nikdy kurz neoznačuj ako kurz pre 3. ročník.
- Názov: **Win32 API – tvorba natívnych desktopových aplikácií pre Windows v C++**.
- Rozsah: 66 hodín po 45 minútach, rozdelených do 4 modulov podľa `struktura.html`.
- Vstupné vedomosti: C, C++, Python, algoritmizácia, OOP a Visual Studio Code. Nevysvetľuj úplné základy programovania od nuly.

## Odborné a technické pravidlá

- Uč skutočné natívne Win32 API v C++ s Windows SDK. Nezamieňaj ho s Windows Forms, WPF, Qt, MFC ani .NET.
- Primárna konfigurácia: Windows 10/11, VS Code, MSVC v143 a Windows 10/11 SDK; C++17; explicitné Unicode API varianty (`...W`). Pri každom príklade uveď konkrétne build/run kroky a potrebné knižnice.
- MSVC a MinGW-w64 majú odlišné kompilátorové/linkerové príkazy. Neuvádzaj ich ako jeden univerzálny príkaz; alternatívu označ a vysvetli rozdiel.
- Natívne Win32 aplikácie vyžadujú Windows a príslušné SDK. Bežný online C++ kompilátor v Linuxe ich nespustí. Webová interaktivita smie simulovať koncept, nie predstierať spustenie Win32 binárky.
- Over názvy API, typy, parametre a správanie v primárnej dokumentácii Microsoft Learn. Pri SQLite použi oficiálnu SQLite dokumentáciu. Uveď priamy zdroj pri dôležitom odbornom tvrdení.
- Zachovaj číslovanie a poradie hodín v `struktura.html`. Súčet modulov je 2 + 20 + 6 + 38 = 66 hodín.

## Povinná štruktúra každej lekcie

Každá 45-minútová lekcia je samostatná slovenská HTML stránka a obsahuje:

1. Predmet, **4. ročník SPŠ**, modul, číslo/názov témy a čas 45 minút.
2. Na začiatku upozornenie: skontrolovať pracovisko a počítač, závady ihneď oznámiť vyučujúcemu, stručný súhrn poslať cez EduPage, poškodené alebo nebezpečné zariadenie nepoužívať.
3. 3–5 merateľných cieľov a zaradenie do postupnosti kurzu.
4. Praktickú motiváciu a prepojenie na predchádzajúce vedomosti.
5. Postupný odborný výklad, vizuálnu schému/ukážku a jasné oddelenie C++ od Win32 API.
6. Realistický 45-minútový harmonogram.
7. Aspoň dve otázky na priebežné overenie, jednu skutočne funkčnú interaktívnu alebo rozhodovaciu úlohu, praktickú úlohu a samostatnú výzvu.
8. Praktické zadanie s cieľom, predpokladmi, krokmi, očakávaným výsledkom a kritériami; základnú, rozširujúcu a náročnejšiu verziu.
9. Keď je kód cieľom hodiny: úplný a konzistentný príklad, vysvetlenie, zostavenie/spustenie pre Windows a typické chyby. Nepoužívaj neoverený ani neúplný kód vydávaný za hotový.
10. Zhrnutie 5–8 poznatkov, 3–5 kontrolných otázok a učiteľskú časť s odpoveďami, riešeniami, hodnotením a odporúčaním pre žiakov, ktorí potrebujú pomoc.
11. Záver s nadväznosťou a presnú povinnú sekciu **„Poznámky a povinné vedomosti, ktoré si zapamätať z hodiny“**.

Interakcie musia fungovať klávesnicou aj myšou a poskytovať spätnú väzbu. Zachovaj responzívnosť, kontrast, čitateľnosť na projektore a štýly pre tlač. Kódové nástroje (kopírovanie/spustenie, ak sú prítomné) musia zodpovedať platforme; Win32 kód neoznačuj za spustiteľný v Linuxovom online editore.

## Postup kurzu

- Najprv tvor metodickú koncepciu, mapu modulov, technické prostredie, míľniky projektu, oficiálne zdroje a problémy osnovy; všetkých 66 lekcií nevytváraj naraz.
- Potom pripravuj vždy iba požadovanú/nasledujúcu lekciu v poradí a zachovaj nadväznosť.
- Smart Student Manager používaj ako spoločnú ukážkovú líniu: dátový model → okno a slučka správ → ovládacie prvky a udalosti → zobrazenie/GDI → súbory a SQLite → CRUD, validácia a vyhľadávanie → záverečný projekt.
- Pôvodný názov modulu 02 a poradie tém zachovaj. Vysvetli, že jeho C++ témy pripravujú žiaka na Win32; osnovu svojvoľne neprečísluj ani nevynechávaj.
- Kontroluj odkazy, číslovanie a súlad s osnovou pred dokončením stránky. Nevykonávaj deployment ani externé publikovanie, pokiaľ o to používateľ výslovne nepožiada.

## Rozsah a výstupy modulov

- Modul 01 (hodiny 1–2) uvádza predmet, bezpečnosť a nástroje; modul 02 (3–22) rozvíja OOP aj potrebné základy C++: typy, funkcie, štruktúry, šablóny a vstup/výstup. Modul 03 (23–28) pripravuje VS Code, zostavenie a prvý reprodukovateľný Win32 projekt. Modul 04 (29–66) pokrýva okná, formuláre z natívnych ovládacích prvkov, GDI, SQLite, dátum/čas a záverečný projekt.
- Modul 04 postupuje v tomto poradí: návrh komponentov (29–30), okno/formulár (31–32), textové polia (33–37), tlačidlá a zoznamy (38–41), súradnice a GDI (42–44), SQLite/CRUD/vyhľadávanie (45–49), dátum a čas (50–51), test (52), návrh projektu (53–56), implementácia a dokumentácia (57–62), prezentácie (63–64), hodnotenie a reflexia (65–66). Pri odkazovaní na hodiny zachovaj toto rozvrhnutie podľa `struktura.html`.
- Očakávaný výsledok kurzu: žiak dokáže navrhnúť natívnu aplikáciu, vysvetliť vstupný bod, registráciu a vytvorenie okna, slučku správ a procedúru okna, vytvoriť ovládacie prvky, spracovať udalosti, kresliť cez GDI, ukladať/čítať dáta vrátane SQLite a odprezentovať projekt.

## Praktické pravidlá pre ukážky a postup

- Primárne prostredie kurzu je MSVC v143 (Visual Studio 2022 C++ Build Tools). Win32 projekt zostavuj v Developer Command Prompt/Developer PowerShell alebo cez VS Code task so zdedeným MSVC prostredím; obyčajný PowerShell nemusí mať nastavené cesty ku kompilátoru a SDK. GUI vstupný bod je spravidla `wWinMain`, konzolové prípravné príklady používajú `main`. Uveď skutočné systémové knižnice podľa použitých API (napr. `user32.lib`, `gdi32.lib`, `comctl32.lib`), nie odhadovaný univerzálny zoznam.
- Smart Student Manager je spoločná niť, nie dôvod meniť každý týždeň jeden narastajúci projekt. Model `Student` a kolekcie patria do prípravy v module 02; konkrétne prepojenie s oknom prichádza v module 03 a hodinách 29–32. V GDI oddeľ vykresľovanie od dátovej logiky. Pri ukladaní začni modelom a základnými operáciami a potom zaveď SQLite; projektové míľniky 53–62 majú oddeliť návrh, implementáciu, testovanie a dokumentáciu.
- Pojem „formulár“ vysvetli ako okno s natívnymi child controls vytvorenými cez Win32 API, nie ako návrhár Windows Forms.
- Časová dotácia je 2 970 minút = 49 h 30 min astronomického času. Pri uvádzaní celkovej dĺžky neprepočítaj 66 vyučovacích hodín na 66 hodín.

## Vzhľad a odborné zdroje

- Lekcie sú samostatné HTML stránky v `lekcie/`, s navigáciou späť na osnovu a medzi susednými hodinami. Zachovaj jednotnú tmavú paletu kurzu, výraznú typografiu, dobrý kontrast, čitateľnosť na projektore, responzívne zobrazenie a štýly pre tlač. Každá stránka jasne uvádza predmet, 4. ročník SPŠ, modul, číslo hodiny a 45 minút.
- Každá prednáška v `lekcie/` má na úplnom začiatku spoločné horné okno z koreňového súboru `lesson-top.js`: číslo a názov hodiny, jej krátky opis a ovládateľný 45-minútový časovač (spustiť, pozastaviť, vynulovať). Pri nových lekciách vlož `<script src="../../lesson-top.js" defer></script>`; preber iba tento horný prvok z referenčnej simulácie, nie zvyšok jej rozhrania.
- Uprednostňuj primárne zdroje: Microsoft Learn pre Win32, Windows SDK a MSVC, oficiálnu dokumentáciu SQLite pre SQLite. Referenciu ku konkrétnemu API alebo knižnici pridaj pri jej prvom použití; odkazy musia smerovať na konkrétny relevantný zdroj.
