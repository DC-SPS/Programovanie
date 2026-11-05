# Blueprint prednášky C

Stránka [4.1 Historický úvod a normy jazyka C](./4.1_Historicky_uvod_a_normy_jazyka_C.html) je záväzný blueprint aj zdrojová šablóna. Súbor [TEMPLATE_PREDNASKY_C.html](./TEMPLATE_PREDNASKY_C.html) je jej úplná kópia. Pri každej novej téme vytvorte kópiu šablóny a prepíšte obsah priamo v nej. Zachovajte formát, poradie, rozloženie, nastavenia, ovládanie a spoločné skripty stránky 4.1.

## Použitie

### Nová téma

1. Skopírujte `TEMPLATE_PREDNASKY_C.html` do priečinka tematického celku a pomenujte kópiu podľa zaužívaného číslovania tém.
2. Prepíšte číslo a názov témy, navigáciu a všetok odborný text. Každý príklad, otázku, odpoveď, zdroj a odkaz prispôsobte novej téme.
3. Zachovajte existujúce sekcie a ich poradie. Ak časť pre novú tému nemá obsah, odstráňte celú príslušnú sekciu vrátane jej navigačného odkazu; nepridávajte náhradný prázdny blok. Zachovajte rozloženie a vizuálne nastavenia zostávajúcich častí.
4. Zachovajte spoločný panel, jeho poradie ovládacích prvkov, identifikátory, štýly a skripty. Odstráňte iba obsahovo voliteľné časti stránky 4.1 a ich výlučne súvisiace skripty; spoločné ovládanie nemažte.
5. Skontrolujte navigáciu, odkazy, odpovede kvízu a zaradenie stránky do README tematického celku.

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

Panel vpravo kopírujte presne zo stránky [4.1](./4.1_Historicky_uvod_a_normy_jazyka_C.html), vrátane poradia prvkov. Panel obsahuje:

- čas a nastavenie časového pásma z `../../lesson-top.js`;
- 45-minútový časovač hodiny a Pomodoro;
- prehratie, zastavenie, pozastavenie a opakovanie hlasového čítania;
- rýchlosť čítania, viditeľný popis **Hlas** s rozbaľovacím výberom hlasu a hlasitosť;
- výber častí na čítanie v režime Učiteľ.

### Povinné ovládanie hlasu

V každej téme musí byť pod rýchlosťou čítania viditeľný nadpis „Hlas“ a rozbaľovací zoznam hlasov. Nevypúšťajte ho ani vtedy, keď prehliadač poskytuje iba automatický hlas. Zachovajte túto štruktúru a ID; spoločný skript načíta všetky hlasy a jazyky, ktoré poskytne prehliadač/zariadenie, zoradí slovenčinu na začiatok a zapamätá výber. Ponuka nie je pevne obmedzená na slovenčinu:

```html
<label class="narration-voice" for="narration-voice">
  <span class="narration-voice-label">Hlas</span>
  <select id="narration-voice" aria-label="Vyberte hlas na čítanie">
    <option value="">Automaticky – slovenský hlas</option>
  </select>
</label>
```

Neodstraňujte ani nezakrývajte `.narration-voice` alebo `#narration-voice` pri úprave štýlov. Ak sa hlas v zozname ešte nezobrazuje, spoločný skript ho doplní po načítaní hlasov prehliadača.

Povinné skripty v `<head>`:

```html
<script src="../../theme.js" defer></script>
<script src="../../lesson-top.js" defer></script>
```

Spoločný panel vložte raz do `<body>` pred `<main>`. Jeho presné HTML je na stránke 4.1. Na koniec stránky vložte:

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
- [ ] Pod rýchlosťou čítania je viditeľný popis **Hlas** aj výber hlasu s ID `narration-voice`.
- [ ] Register, zdroje, interné odkazy a odkazy v päte sú vyplnené.
- [ ] Pri úprave existujúcej témy sa nestratil jej jedinečný obsah ani dôležité ID odkazované skriptami.
