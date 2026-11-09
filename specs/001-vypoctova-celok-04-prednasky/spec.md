# Špecifikácia: Prednášky tematického celku 4

**Vytvorené:** 2026-11-09  
**Stav:** Schválené na implementáciu  
**Vstup:** Zapracovať všetky prednášky zo sprístupneného zdieľaného chatu do kurzu Výpočtová technika.

## Scenáre používateľa

### US1 – Študent otvorí prednášku z osnovy (Priorita P1)

Ako študent chcem otvoriť každú z ôsmich 45-minútových prednášok celku 4 priamo z osnovy, aby som sa vedel učiť v poradí tém.

**Akceptačné scenáre**

1. Osnova obsahuje aktívne odkazy na témy 4.1 až 4.8 v pedagogickom poradí.
2. Každý odkaz otvorí samostatnú slovenskú HTML stránku s názvom, bezpečnostným upozornením a obsahom príslušnej prednášky.
3. Už existujúca kvalitnejšia stránka 4.3 sa zachová.

### US2 – Vyučujúci použije obsah hodiny (Priorita P2)

Ako vyučujúci chcem v prednáškach zachovať vysvetlenie, príklady, úlohy, kontrolné otázky a zdroje zo zdieľaného podkladu, aby som ich mohol použiť pri 45-minútovej hodine.

**Akceptačné scenáre**

1. Obsah siedmich chýbajúcich prednášok sa prevedie z Markdownu do prístupného HTML bez straty tabuliek, zoznamov a ukážok kódu.
2. Stránky používajú existujúce štýly, horný panel hodiny, ovládanie čítania, režim žiak/učiteľ a navigáciu kurzu.

## Požiadavky

- **FR-001:** Zahrnúť témy 4.1–4.8 zo zdieľaného chatu.
- **FR-002:** Zachovať existujúcu prednášku 4.3 a pridať chýbajúce 4.1, 4.2 a 4.4–4.8.
- **FR-003:** Každá nová stránka musí byť samostatné HTML s kódovaním UTF-8 a slovenčinou.
- **FR-004:** Osnova aj README musia správne odkazovať na hotové prednášky a uvádzať ich stav.
- **FR-005:** Dodržať projektové pravidlá pre formálne vykanie, bezpečnosť v učebni a relatívnu navigáciu.

## Predpoklady

- Jedna prednáška 4.3 už existuje v repozitári a je upravená nad rámec textu zo zdieľaného chatu; zostane zachovaná.
- Zdieľaný chat obsahuje osem tém celku 4, nie celý 65-témový kurz.
- Cieľová skupina a dĺžka hodiny sú podľa zdrojového chatu tretí ročník strednej školy a 45 minút.

## Kritériá úspechu

- Osnova má osem funkčných odkazov na témy 4.1–4.8.
- V repozitári existuje osem prednášok celku 4 vrátane zachovanej 4.3.
- README už netvrdí, že je hotová iba prvá prednáška.
