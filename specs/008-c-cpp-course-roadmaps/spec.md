# Špecifikácia: Oddelené osnovy C a C++

**Vstup:** Používateľom dodaná osnova hodín 19–66 a následne potvrdený rozsah: dva samostatné prehľady, zachovať existujúce lekcie, použiť aktuálnu osnovu C++ a finálny projekt zaradiť do hodín 61–66.

## Scenáre používateľov

### P1 – Študent prechádza osnovu C (priorita P1)

Študent otvorí prehľad C a nájde osnovu hodín 19–60 zoradenú podľa tematických celkov a zadaného hodinového rozsahu. Existujúce prednášky 4.1–4.3 môže otvoriť priamo; plánované prednášky sa nezobrazujú ako hotové stránky.

**Nezávislé overenie:** Každá vyučovacia hodina 19–60 je uvedená presne raz, v správnom poradí a v správnom tematickom celku; odkazy vedú iba na existujúce stránky alebo materiály.

### P2 – Študent prechádza osnovu C++ a záverečný projekt (priorita P1)

Študent otvorí samostatný prehľad C++, zachová si prístup k existujúcim 12 modulom, hotovej prednáške aj existujúcemu 66-hodinovému rozpisu a nájde plán záverečného projektu pre hodiny 61–66.

**Nezávislé overenie:** Pôvodné odkazy, moduly, materiály a rozpis C++ zostanú dostupné; projektové bloky 61–62, 63–64 a 65–66 sú jasne oddelené.

### P3 – Študent sleduje vlastný pokrok (priorita P2)

Študent označí absolvované hodiny C alebo záverečného projektu C/C++ a po obnovení príslušnej stránky v tom istom prehliadači sa stav zachová.

**Nezávislé overenie:** Zaškrtnutie a odškrtnutie sa uloží lokálne a súhrnný počet sa aktualizuje; pri nedostupnom úložisku stránka zobrazí zrozumiteľné upozornenie.

### P4 – Študent otvorí doplnkové video (priorita P3)

Študent sa z oboch prehľadov dostane na existujúci playlist Informatika s Mišom.

**Nezávislé overenie:** Odkaz na playlist je prítomný na oboch stránkach a používa bezpečné atribúty pre novú kartu.

## Funkčné požiadavky

- **FR-001:** Prehľad C MUST zobrazovať hodiny 19–60 podľa dodanej osnovy a poradia.
- **FR-002:** Prehľad C MUST zachovať existujúce prednášky, test, PDF a navigáciu.
- **FR-003:** Odkaz na hotovú lekciu MUST smerovať iba na existujúci súbor; plánované lekcie MUST byť označené ako pripravované.
- **FR-004:** Prehľad C++ MUST zachovať existujúcich 12 modulov a všetky existujúce odkazy a sprístupniť existujúci 66-hodinový rozpis.
- **FR-005:** Prehľad C++ MUST zobrazovať záverečný spoločný projekt C/C++ v blokoch 61–62, 63–64 a 65–66 bez predstierania existujúcich nových prednášok.
- **FR-006:** Hodiny C 19–60 a projekt 61–66 MUST mať študentské zaškrtávacie políčko s trvalým lokálnym uložením v prehliadači.
- **FR-007:** Každý prehľad MUST obsahovať odkaz na dodaný playlist Informatika s Mišom.
- **FR-008:** Stránky MUST zachovať tému, responzívnosť, prístupnosť a existujúci štýl kurzu bez novej závislosti.
- **FR-009:** C a C++ MUST zostať samostatnými prehľadmi; spoločný vstupný rozcestník sa nemení.

## Hraničné prípady

- Prehliadač nepovoľuje alebo odmieta prístup k `localStorage`.
- Niektoré zadané prednášky ešte nemajú vlastnú HTML stránku.
- Existujúca osnova C++ v `03_C++/Kurz_2_rocnik/README.md` zostáva nezmenená a jej 66-hodinový rozpis musí byť z prehľadu dosiahnuteľný.
- Názvy súborov a ciest obsahujú medzery, diakritiku alebo znaky C++.

## Kritériá úspechu

- **SC-001:** V osnove C je zastúpené každé celé číslo hodiny 19–60 práve raz; spolu 42 vyučovacích hodín.
- **SC-002:** V záverečnom bloku sú zastúpené hodiny 61–66 práve raz.
- **SC-003:** Všetky interné odkazy na súbory na oboch stránkach existujú.
- **SC-004:** Po obnovení stránky zostane pokrok uložený a po zmene políčka sa aktualizuje jeho súhrn.
- **SC-005:** Obe stránky sa dajú používať na úzkej obrazovke bez vodorovného pretekania.

## Predpoklady a hranice rozsahu

- Táto fáza upravuje iba dva prehľady kurzov a spoločný malý skript pokroku; nevytvára 48 samostatných prednášok.
- Úvodný súbor `02_C/index.html` ostáva rozcestníkom; C osnovný prehľad je `02_C/c-language.html`.
- Existujúca osnova 12 modulov C++ je autoritatívna; nové hodinové rozsahy pre jej témy sa neprideľujú.
- Témy C++ z dodaného promptu ostanú pokryté existujúcimi modulmi; blok 61–66 predstavuje záverečný projekt.
- Stav zaškrtnutia sa ukladá iba lokálne v prehliadači používateľa.
