# Blueprint prednášky C

Tento blueprint vychádza zo stránky [4.1 Historický úvod a normy jazyka C](./4.1_Historicky_uvod_a_normy_jazyka_C.html). Použite ho na založenie novej témy aj na postupné zjednotenie už existujúcich stránok. Hotový štartovací súbor je [TEMPLATE_PREDNASKY_C.html](./TEMPLATE_PREDNASKY_C.html).

## Použitie

### Nová téma

1. Skopírujte `TEMPLATE_PREDNASKY_C.html` do priečinka tematického celku a pomenujte súbor podľa zaužívaného číslovania tém.
2. Nahraďte všetky `TODO` a `{{...}}` hodnotami novej témy. Zachovajte kód panelu, odkazy na spoločné skripty a identifikátory ovládacích prvkov.
3. Upravte obsahové sekcie tak, aby zodpovedali cieľom a náročnosti témy. Voliteľné sekcie pridajte iba vtedy, keď podporujú učenie.
4. Skontrolujte navigáciu, odkazy, odpovede kvízu a zaradenie stránky do README tematického celku.

### Existujúca téma

1. Zachovajte jej tému, odborný obsah, správne príklady, odkazy a fungujúce interakcie.
2. Porovnajte štruktúru stránky s blueprintom. Najprv doplňte chýbajúce základné časti; následne zjednoťte hlavičku, ovládanie, karty, učiteľské poznámky, zdroje a register.
3. Neodstraňujte jedinečné cvičenia ani odborné vysvetlenia iba kvôli zjednoteniu vzhľadu. Presuňte ich do vhodnej sekcie a zachovajte ich účel.
4. Nezavádzajte duplicitné ID, druhý panel, druhý časovač ani vlastnú verziu spoločných ovládačov. Pri zmene spoločného panelu upravte súvisiace spoločné súbory a stránky, ktoré ich používajú.

## Základná osnova stránky

| Poradie | Časť | Pravidlo |
| --- | --- | --- |
| 1 | Navigácia a kontrola pracoviska | Odkaz na prehľad kurzu a všetky kurzy. Bezpečnostné upozornenie patrí pred obsah lekcie. |
| 2 | Hlavička témy | Číslo a názov, režim Žiak/Učiteľ a export do PDF. |
| 3 | Úvod a nadväznosť | Stručne vysvetlite, čo sa žiak naučí a ako téma nadväzuje na predchádzajúcu. |
| 4 | Plán hodiny | Rozdeľte 45 minút na realizovateľné časti; súčet musí byť 45 minút. |
| 5 | Ciele | Uveďte pozorovateľné výsledky učenia formulované ako „Po hodine dokážete…“. |
| 6 | Výklad | Vysvetlite pojmy v nadväznosti, ukážte príklad a oddeľte časté omyly. Časti číslujte. |
| 7 | Precvičenie | Zahrňte aspoň jednu úlohu, na ktorej žiak použije vysvetlené poznatky. |
| 8 | Overenie | Pridajte funkčný kvíz alebo inú interaktívnu kontrolu a jasnú spätnú väzbu. |
| 9 | Záver | Zhrňte kľúčové poznatky a uveďte otázky alebo krátku výstupnú úlohu. |
| 10 | Zdroje a register | Zdroje musia podporovať obsah. Register vysvetľuje hlavné odborné pojmy a skratky. |
| 11 | Päta | Návrat na kurz, predchádzajúca/nasledujúca téma a odkaz na všetky kurzy podľa dostupnosti. |

Videá, väčšia projektová úloha, učiteľské riešenia, bezpečnostná pripomienka počas práce či osobitná sekcia častých chýb sú voliteľné. Zachovajte ich, ak už stránka obsahuje hodnotný materiál.

## Spoločné ovládanie

Panel vpravo preberajte z ukážky v [4.1](./4.1_Historicky_uvod_a_normy_jazyka_C.html) alebo použite spoločné súbory `c-lecture-controls.css` a `c-lecture-controls.js`. Panel obsahuje:

- čas a nastavenie časového pásma z `../../lesson-top.js`;
- 45-minútový časovač hodiny a Pomodoro;
- prehratie, zastavenie, pozastavenie a opakovanie hlasového čítania;
- rýchlosť čítania, výber hlasu a hlasitosť;
- výber častí na čítanie v režime Učiteľ.

Povinné skripty v `<head>`:

```html
<script src="../../theme.js" defer></script>
<script src="../../lesson-top.js" defer></script>
```

Spoločný panel vložte raz do `<body>` pred `<main>`. Jeho presné HTML je v štartovacom súbore. Na koniec stránky vložte:

```html
<script src="c-lecture-controls.js" defer></script>
```

Používajte relatívne cesty z priečinka konkrétnej stránky. Ak je téma hlbšie v adresárovej štruktúre, upravte počet `../` podľa skutočnej cesty. Zachovajte ID ovládačov (`play-reading`, `stop-reading`, `pause-reading`, `replay-reading`, `narration-speed`, `narration-voice`, `narration-volume`, `narration-volume-value`, `reading-status`, `student-mode`, `teacher-mode`). Nevkladajte ďalší `.lesson-side-panel`.

## Obsahové a technické pravidlá

- Píšte po slovensky a žiakom sa prihovárajte vykaním.
- Výklad rozdeľte na krátke, samostatné bloky. Pri novom pojme ho vysvetlite skôr, než ho použijete v náročnejšom príklade.
- Kód musí byť úplný v rozsahu ukážky, správny pre deklarovanú normu a doplnený vysvetlením očakávaného výsledku.
- Odpovede kvízu uveďte v `data-answer` a overte, že formulár poskytuje spätnú väzbu aj pri nevyplnenej odpovedi.
- Hlavné časti označte `data-read-aloud="selected"`; voliteľné pokyny pre učiteľa označte `data-read-aloud="optional"`. Spoločný skript sprístupní výber častí v učiteľskom režime.
- Učiteľské riešenia a metodické poznámky označte triedou `.teacher-note`. Žiak ich v bežnom režime nemá vidieť.
- Pri tabuľkách a kóde zachovajte mobilné horizontálne posúvanie; nezmenšujte písmo tak, aby sa kód stal nečitateľným.
- Zdroje označte názvom a funkčným odkazom. Neuvádzajte neoverené alebo nesúvisiace zdroje.
- Zachovajte prístupné popisy ovládacích prvkov, viditeľný fokus klávesnice a režim obmedzeného pohybu.

## Záverečná kontrola stránky

- [ ] Číslo, názov a navigácia zodpovedajú osnove kurzu.
- [ ] Bezpečnostné upozornenie a nadväznosť sú relevantné pre túto tému.
- [ ] Plán hodiny má spolu 45 minút a ciele sú merateľné.
- [ ] Výklad, príklady, precvičenie a overenie na seba nadväzujú.
- [ ] Kvíz, tlačidlá, kopírovanie kódu a ďalšie interakcie majú funkčnú spätnú väzbu.
- [ ] Učiteľské poznámky sa zobrazujú iba v režime Učiteľ.
- [ ] Panel obsahuje všetky ovládače podľa vzoru 4.1 a je na stránke iba raz.
- [ ] Register, zdroje, interné odkazy a odkazy v päte sú vyplnené.
- [ ] Pri úprave existujúcej témy sa nestratil jej jedinečný obsah ani dôležité ID odkazované skriptami.
