# Blueprint rozloženia stránok projektu

## Účel a rozsah

Stránka [02_C/00_Prostredie_a_struktura_programu/4.1_Historicky_uvod_a_normy_jazyka_C.html](02_C/00_Prostredie_a_struktura_programu/4.1_Historicky_uvod_a_normy_jazyka_C.html) je kanonickým vzorom rozloženia **prednáškových stránok** v projekte. Pri tvorbe alebo úprave prednášky porovnávaj priamo túto stránku; tento dokument ju nenahrádza a neoprávňuje vynechať kontrolu jej HTML, CSS, skriptov a zobrazenia.

Prehľadové stránky kurzov, prihlásenie a diaľkové ovládanie majú odlišný účel a ponechávajú si vlastnú informačnú architektúru. Majú však rešpektovať spoločný vizuálny jazyk projektu, prístupnosť, responzívnosť a tlač tam, kde je relevantná.

## Pravidlá pre AI

- Uprav skutočné požadované stránky, nielen šablónu alebo dokumentáciu.
- Pred zmenou preskúmaj cieľovú stránku, kanonický vzor 4.1 a použité spoločné súbory.
- Zachovaj odborný obsah, príklady, odkazy, funkčné interakcie a názvy kurzu. Meníš-li iba rozloženie, nemeníš obsah; doplň obsah iba ak to používateľ výslovne žiada.
- Znovu použi zdieľané skripty a štýly. Nevytváraj druhú implementáciu čítania, prepínača režimu, hodín ani tlače.
- Relatívne cesty na zdieľané súbory počítaj od umiestnenia konkrétnej stránky a po zmene ich over.
- Píš po slovensky a zachovaj formálne vykanie v texte pre žiakov.

## Vizuálny základ

- Jazyk dokumentu je `sk`; nastav UTF-8 a viewport pre mobilné zariadenia.
- Použi svetlý/tmavý systémový vzhľad a preferenciu témy uloženú webom. Základné CSS premenné majú byť kompatibilné so spoločnými ovládacími prvkami: `--bg`, `--fg`, `--card`, `--mut`, `--acc`, `--line`, `--note`, `--good` a `--bad`.
- Základná typografia je systémové bezpätkové písmo, približne `16px/1.65`; kód používa monospace.
- Hlavný obsah je čitateľne centrovaný s maximálnou šírkou približne 860 px. Na širokej obrazovke vyhradzuj miesto pre pevný pravý panel podľa spoločného CSS; na menšej obrazovke používaj spodný panel a vyhraď obsah pod ním.
- Používaj konzistentné karty, poznámky, štítky, tabuľky a kódové bloky. Dlhé tabuľky môžu mať horizontálny posuvník, nie celá stránka.
- Odkazy a ovládacie prvky musia mať viditeľný fokus, dostatočný kontrast a použiteľnú dotykovú plochu. Rešpektuj `prefers-reduced-motion`.

## Povinná kostra prednášky

1. `<head>`: `lang="sk"`, charset, viewport, výstižný opis a názov; načítaj zdieľaný skript témy a `lesson-top.js` s cestami správnymi pre priečinok stránky.
2. Horná navigácia: odkaz na prehľad predmetu a na všetky kurzy.
3. Bočný panel `.lesson-side-panel`: celý panel čítania podľa 4.1 vrátane tlačidiel Prehrať/Zastaviť/Pozastaviť/Prehrať znova, rýchlosti, jazyka/hlasu, hlasitosti a prístupného stavu. Načíta sa zdieľaný ovládací skript; nemiešaj do tejto oblasti duplicitné ovládanie.
4. Hlavná oblasť `<main>`:
   - úvodné upozornenie na kontrolu pracoviska pred hlavičkou;
   - hlavička s drobenkovou navigáciou, prepínačom Žiak/Učiteľ a tlačidlom **Exportovať do PDF**;
   - názov prednášky, štítky (modul/celok, predmet, norma alebo technológia podľa témy), krátky úvod a nadväznosť na predchádzajúce učivo;
   - učiteľská poznámka k cieľom, predpokladom alebo pomôckam, ak je pre lekciu vhodná;
   - realistický 45-minútový plán hodiny;
   - merateľné ciele a zrozumiteľne členený výklad, príklady, úlohy a overenie;
   - priebežné upozornenia súvisiace s konkrétnou činnosťou;
   - poznámky a vedomosti na zapamätanie;
   - pokyn pred odchodom a učiteľská poznámka, ak je relevantná;
   - odporúčané zdroje, register pojmov a pätička s navigáciou späť/pokračovať.

Prispôsob obsahové sekcie predmetu a cieľom hodiny; nevkladaj prázdne ani nerelevantné bloky len kvôli zoznamu. Neprepracúvaj názov, číslovanie ani poradie prednášky.

## Triedy a správanie

- Použi existujúce triedy vzoru, ak zdieľané skripty alebo CSS podľa nich vyhľadávajú prvky: `.global-course-nav`, `.lesson-side-panel`, `.narration-controls`, `.mode`, `.pdf-export`, `.teacher-note`, `.safety-notice`, `.safety-reminder`, `.card`, `.sources`, `.glossary-list` a `footer`.
- Prepínač Žiak/Učiteľ musí aktualizovať `body.teacher`, vzhľad tlačidiel aj `aria-pressed`. Odpovede a učiteľské poznámky sa skryjú v žiackom režime a zobrazia v učiteľskom režime. Pri tlači zobraz učiteľské riešenia podľa vzoru.
- Tlačidlo PDF spúšťa `window.print()`. Tlačové štýly skryjú navigáciu a ovládacie prvky, nastavia biely podklad a tmavý text, zachovajú čitateľnosť tabuliek a kódu a obmedzia nevhodné zalomenie kariet. Nepridávaj PDF knižnicu, ak ju projekt nepoužíva.
- Každý interaktívny prvok musí mať popis, klávesnicové ovládanie a zrozumiteľnú spätnú väzbu. Nevkladaj interakcie, ktoré predstierajú funkčnosť.

## Kontrolný zoznam pred dokončením

- Porovnaj výsledné rozloženie a ovládanie s 4.1 na širokej aj úzkej obrazovke.
- Over umiestnenie a fungovanie navigácie, hodín, čítania, hlasu, prepínača režimu a exportu do tlače/PDF.
- Skontroluj všetky relatívne odkazy na skripty, CSS, navigáciu a lokálne zdroje.
- Over tlačový vzhľad vrátane učiteľských poznámok, dlhých tabuliek a blokov kódu.
- Spusti dostupné kontroly syntaxe a `git diff --check`; over, že nesúvisiaci obsah stránky zostal zachovaný.
