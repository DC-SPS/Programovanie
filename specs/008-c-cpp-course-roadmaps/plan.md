# Implementation Plan: Oddelené osnovy C a C++

**Date**: 2026-11-09  
**Spec**: [spec.md](./spec.md)

## Zhrnutie

Doplniť osnovy C hodín 19–60 a záverečného projektu 61–66 do existujúcich, navzájom oddelených prehľadov. Zachovať všetky existujúce moduly a materiály, pridať lokálne študentské sledovanie pokroku a odkaz na playlist. Použiť existujúci vizuálny štýl bez frameworku a balíkov.

## Technický kontext

- **Jazyk/verzia:** HTML5, CSS, moderný JavaScript.
- **Závislosti:** existujúce `course-overview.css` a `theme.js`; bez nových balíkov.
- **Úložisko:** `localStorage` v lokálnom prehliadači; žiadne serverové alebo účtové údaje.
- **Cieľová platforma:** statické stránky v tomto repozitári, desktop aj mobil.
- **Testovanie:** kontrola HTML štruktúry, rozsahov hodín a interných odkazov; spustenie stránok v prehliadači a overenie persistencie.
- **Rozsah:** `02_C/c-language.html`, `03_C++/index.html`, nový spoločný `course-progress.js` a artefakty tejto špecifikácie; existujúci `03_C++/Kurz_2_rocnik/README.md` sa zachová a prepojí.

## Kontrola ústavy

- Zachovať slovenský jazyk, existujúcu osnovu, samostatné moduly a pôvodné materiály.
- Vytvárať odkazy len na existujúce ciele; pripravované témy označiť ako také.
- Zabezpečiť ovládanie klávesnicou, prístupné popisy stavov a použiteľnosť na mobile.
- Nepridávať závislosti ani nezasahovať do spoločného vstupného rozcestníka.

## Súbory a štruktúra

```text
course-progress.js
02_C/
  c-language.html
03_C++/
  index.html
specs/008-c-cpp-course-roadmaps/
  spec.md
  research.md
  plan.md
  tasks.md
```

## Implementačné poznámky

- Osnova C obsahuje 42 jedinečných 45-minútových hodín. Dvojhodinovky ostanú zoskupené tak, ako sú zadané, ale ich obe čísla budú označiteľné samostatne.
- Hotové HTML prednášky majú priame odkazy. Pre nehotové témy budú dostupné iba existujúce README príslušných modulov a jasný stav „prednáška sa pripravuje“.
- C++ si ponechá moduly 00–11, hotové materiály aj existujúcu 66-hodinovú osnovu v `Kurz_2_rocnik/README.md`; prehľad na ňu priamo odkáže a zvýrazní hodiny 61–66 ako šesť sledovateľných hodín v troch dvojhodinových blokoch.
- Zdieľaný skript načíta/uloží stav podľa stabilného identifikátora a aktualizuje súhrn každej skupiny. Pri chybe úložiska zobrazí viditeľné hlásenie.
