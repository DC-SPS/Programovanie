# Téma 4: Úvod do programovania v štruktúrovanom programovacom jazyku

## Hodina 1: Historický úvod a normy jazyka C++

**Veľká téma:** Úvod do programovania v štruktúrovanom programovacom jazyku  
**Trvanie:** 45 minút

## Ciele hodiny

Na konci hodiny študent:

- vysvetlí, prečo vznikajú jazykové normy;
- rozpozná, že C++ má viacero verzií štandardu;
- vysvetlí, prečo sa v tomto kurze budeme držať C++17;
- odlíši štandard jazyka od konkrétneho kompilátora.

## Nadväznosť na Python

Študenti už poznajú algoritmy a písali programy v Pythone. V tejto hodine sa zoznámia s tým, že programovací jazyk sa vyvíja a jeho normy určujú spoločné pravidlá, ktorým sa kompilátory snažia vyhovovať. Rozdiely medzi Python a C++ zatiaľ len pomenujeme; prvý program príde v nasledujúcej hodine.

## Časový plán

| Čas | Činnosť | Čo robí učiteľ a študenti |
|---:|---|---|
| 0–5 min | Motivácia a video | Premietnite [Kurz C C++ – Lekcia 1: Úvod](https://www.youtube.com/watch?v=bz-IgboqUP0) od Informatiky s Mišom (vyberte krátku úvodnú časť). Spýtajte sa, čo musí byť spoločné, aby programátori vedeli písať a spúšťať programy v rovnakom jazyku. |
| 5–13 min | Historický úvod | Stručne predstavte vznik C++ a vývoj jeho štandardov. Študenti si zaznačia míľniky. |
| 13–23 min | Čo je štandard | Vysvetlite vzťah medzi jazykom, normou a kompilátorom. Trieda rozoberie jednoduchú analógiu spoločných pravidiel. |
| 23–31 min | Prečo C++17 | Predstavte C++17 ako dohodnutý cieľ kurzu. Študenti porovnajú označenia verzií na časovej osi. |
| 31–39 min | Aktivita v dvojiciach | Dvojice vysvetlia vzťah medzi pojmami „jazyk“, „štandard“, „kompilátor“ a „program“. |
| 39–45 min | Kontrola a záver | Krátke otázky a záverečný lístok: študent jednou vetou vysvetlí, prečo trieda používa rovnaký štandard. |

## Výklad pre učiteľa

### Krátka história

C++ vytvoril Bjarne Stroustrup na začiatku 80. rokov ako rozšírenie a vývoj jazyka C. Jazyk sa postupne menil a pribúdali doň nové možnosti. Na zjednotenie pravidiel pre kompilátory a programátorov vznikali normy C++.

Na tabuľu napíšte zjednodušenú časovú os:

**C++ vzniká → C++98 → C++11 → C++14 → C++17 → C++20 → C++23**

Označenia číslom spravidla odkazujú na rok vydania príslušnej normy alebo návrhu. Aktuálnym publikovaným štandardom je C++23, oficiálne vydaný ako ISO/IEC 14882:2024. V kurze používame C++17 ako spoločný cieľ výučby; nejde o tvrdenie, že je to najnovší štandard. ([ISO](https://committee.iso.org/standard/83626.html), [Standard C++](https://isocpp.org/std/the-standard))

### Čo znamená štandard

Štandard je spoločná špecifikácia pravidiel jazyka a jeho štandardnej knižnice. Určuje napríklad, aké konštrukcie jazyk obsahuje a aké správanie sa od nich očakáva.

Analógia: keď sa pri hre dohodneme na rovnakých pravidlách, všetci môžu hrať bez toho, aby si každý vytvoril vlastnú verziu hry.

- **C++** je programovací jazyk.
- **C++17** je jedna z verzií jeho štandardu.
- **GCC, Clang alebo MSVC** sú kompilátory, ktoré prekladajú kód a podporujú vybrané verzie štandardu v rôznej miere.

Štandard nie je program, ktorý si študent nainštaluje. Kompilátor sa pokúša pravidlá štandardu implementovať. V kurze budeme pri preklade uvádzať `-std=c++17`, aby sa výsledky v triede čo najviac zjednotili. GCC umožňuje zvoliť jazykový štandard pomocou prepínača `-std=` ([dokumentácia GCC](https://gcc.gnu.org/onlinedocs/gcc/Standards.html)).

### Prečo sa držať jednej verzie

Ak každý používa inú verziu alebo rozšírenia konkrétneho kompilátora, môže sa stať, že rovnaký program sa na dvoch počítačoch nebude správať rovnako alebo sa na jednom z nich ani neskompiluje. Jedna dohodnutá verzia zjednodušuje vysvetľovanie, zadávanie úloh aj spoločnú kontrolu výsledkov.

## Aktivita študentov

V dvojiciach doplňte a vysvetlite vety:

- Programátor píše…
- Jazyk C++ určuje…
- Štandard C++17 spresňuje…
- Kompilátor vykonáva…

**Očakávané vysvetlenie:** Programátor píše zdrojový kód v C++. Štandard stanovuje pravidlá jazyka a knižnice pre danú verziu. Kompilátor preloží zdrojový kód podľa podporovaných pravidiel a nastavení.

## Otázky na kontrolu porozumenia

1. Je C++17 názov kompilátora alebo verzia štandardu?
2. Aký je rozdiel medzi jazykom a kompilátorom?
3. Prečo je užitočné, keď celá trieda používa rovnaký štandard?
4. Znamená použitie C++17, že novšie verzie C++ neexistujú?

**Očakávané odpovede:** C++17 je verzia štandardu; kompilátor prekladá program; jednotné nastavenie uľahčuje spoločnú prácu; novšie verzie existujú, v kurze však zámerne zostávame pri C++17.

## Záverečný lístok

Každý študent doplní vetu: **„V tomto kurze používame C++17, pretože…“**

Odpoveď má spomenúť spoločné pravidlá alebo zjednotenie prostredia triedy.

## Časté nedorozumenia

- **„C++17 je ďalší jazyk po C++.“** Ide o verziu štandardu jazyka C++.
- **„Kompilátor je štandard.“** Kompilátor je nástroj; štandard je špecifikácia pravidiel.
- **„Najnovšia verzia je vždy najlepšia pre každú hodinu.“** Kurz používa jednu stanovenú verziu, aby boli príklady a prostredie konzistentné.

## Pomôcky a poznámky pre učiteľa

- Premietnite úvodné video od Informatiky s Mišom a časovú os štandardov.
- Pripravte tabuľu alebo snímku na vysvetlenie štyroch pojmov.
- V tejto hodine netreba písať ani spúšťať kód; prvý program patrí do hodiny 2.
- Voliteľná domáca úloha: zistiť názov kompilátora dostupného v školskom prostredí. Ak prostredie ešte nie je známe, úlohu vynechajte.
