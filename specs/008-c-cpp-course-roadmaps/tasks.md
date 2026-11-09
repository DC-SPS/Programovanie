# Tasks: Oddelené osnovy C a C++

**Vstup:** [Špecifikácia](./spec.md), [plán](./plan.md), [výskum](./research.md)

## Fáza 1: Spoločná funkcionalita pokroku

- [x] T001 [US3] Vytvoriť `course-progress.js` na obnovenie/uloženie stavu checkboxov a aktualizáciu súhrnov; pri nedostupnom úložisku oznámiť chybu.

## Fáza 2: Osnova jazyka C (P1)

- [x] T002 [US1] Upraviť hlavičkovú navigáciu `02_C/c-language.html` tak, aby C a C++ boli dosiahnuteľné oddelene.
- [x] T003 [US1] Pridať do `02_C/c-language.html` úplnú osnovu hodín 19–60 rozdelenú do celkov 4–10; pri hodinách 19–21 odkazovať na existujúce prednášky a pri ostatných len na existujúce moduly.
- [x] T004 [US3] Pridať do každej hodiny v rozsahu C vlastný checkbox, prístupný popis a súhrn pokroku.
- [x] T005 [US4] Pridať do `02_C/c-language.html` odkaz na oficiálny playlist Informatika s Mišom.

## Fáza 3: Osnova C++ a záverečný projekt (P1)

- [x] T006 [US2] Zachovať existujúce moduly, hotové materiály a metadáta prehľadu `03_C++/index.html`; pridať odkaz na existujúci 66-hodinový rozpis.
- [x] T007 [US2] Pridať do `03_C++/index.html` záverečný projekt C/C++ v blokoch 61–62, 63–64 a 65–66 bez neexistujúcich odkazov.
- [x] T008 [US3] Pridať pokrokový checkbox pre každú hodinu 61–66 a jej súhrn.
- [x] T009 [US4] Pridať do `03_C++/index.html` odkaz na oficiálny playlist Informatika s Mišom.

## Fáza 4: Overenie

- [x] T010 Overiť, že hodiny C 19–60 a projektu 61–66 sú každá zastúpená práve raz a v poradí.
- [x] T011 Overiť všetky lokálne odkazy a načítanie zdieľaného JavaScriptu/CSS.
- [x] T012 Overiť v prehliadači persistenciu pokroku, prístupnosť ovládacích prvkov, tému a úzku šírku obrazovky.
- [x] T013 Spustiť `git diff --check` a skontrolovať, že existujúce lekcie a moduly zostali zachované.
