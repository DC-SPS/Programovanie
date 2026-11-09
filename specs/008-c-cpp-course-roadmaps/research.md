# Výskum: Oddelené osnovy C a C++

## Existujúce stránky

- `02_C/index.html` je spoločný vstupný rozcestník C/C++; používateľ potvrdil, že ho máme ponechať.
- `02_C/c-language.html` je skutočný prehľad kurzu C, obsahuje tri hotové prednášky 4.1–4.3, PDF a interaktívny test.
- `03_C++/index.html` je samostatný prehľad C++ s 12 existujúcimi tematickými modulmi a odkazmi na hotové materiály.
- `03_C++/Kurz_2_rocnik/README.md` obsahuje samostatnú existujúcu osnovu 66 vyučovacích hodín vrátane záverečného projektu v hodinách 61–66; obsah sa zachová a pridá sa naň priamy odkaz z prehľadu.
- Moduly C a C++ sú podložené existujúcimi priečinkami a README.

## Zdieľané vizuálne a interaktívne súbory

- Obe stránky používajú `../course-overview.css` a `../theme.js`; nové komponenty majú nadviazať na ich farebné premenné a triedy `.course-module`, `.module-lesson-list` a `.module-lesson`.
- Oficiálny playlist použitý existujúcou prednáškou C: `https://www.youtube.com/playlist?list=PLNAMH_0HgWT_lzUDYYKHYczKvjT4xqLCn`.
- Nie je potrebný framework ani balík. Pokrok možno bezpečne ukladať ako lokálny stav prehliadača cez zdieľaný JavaScript.

## Rozhodnutia

- Vytvoriť osnovu C ako 7 tematických celkov pokrývajúcich súvislé hodinové rozsahy 19–60.
- Pri hodinách 19–21 uviesť priame odkazy na hotové HTML prednášky; plánované témy neprezentovať ako existujúce stránky.
- Pre hodiny bez vlastnej prednášky uviesť odkaz na existujúce README príslušného modulu, ak zodpovedá téme.
- V prehľade C++ ponechať modulovú učebnú cestu aj existujúci 66-hodinový rozpis; pridať priamy odkaz na jeho README a zvýrazniť spoločný záverečný projekt 61–66.
- Pridať progresový skript bez externých závislostí; upozorniť používateľa, ak lokálne úložisko nie je dostupné.
