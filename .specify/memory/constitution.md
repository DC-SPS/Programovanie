# Ústava repozitára Programovanie

## Základné princípy

### I. Výučba je zrozumiteľná a metodicky usporiadaná
- Materiály tvoria vzdelávací obsah pre študentov stredných odborných škôl. Nová lekcia má nadväzovať na existujúcu osnovu a vedomosti študenta.
- Pri novom učebnom materiáli používaj štruktúru z `CONTRIBUTING.md`: cieľ, prerekvizity, vysvetlenie, príklad s rozborom, časté chyby, úlohy a zdroje.
- Študentov oslovuj formálne. Pokyny pre vyučujúceho oddeľ od študentského obsahu.

### II. Rešpektuj štruktúru a lokálne pravidlá modulov
- Dodržuj `CONTRIBUTING.md`, existujúcu navigáciu, pomenovanie a číslovanie materiálov.
- Pred úpravou priečinka si prečítaj príslušný `AGENTS.md`. Špecifické pravidlá modulu dopĺňajú túto ústavu a platia v jeho rozsahu.
- Zachovaj existujúci vzhľad a správanie nesúvisiace s požiadavkou. Interné odkazy píš relatívne od koreňa repozitára.

### III. Odborná presnosť a overiteľné príklady
- Ukážkový kód musí byť úplný v kontexte zadania, konzistentný s používaným jazykom a vysvetlený na úrovni cieľovej skupiny.
- Pri tvrdeniach o nástrojoch, API a knižniciach používaj autoritatívnu dokumentáciu; pri Win32 API uprednostni Microsoft Learn.
- C a C++ príklady musia byť zostaviteľné bez upozornení pri `-Wall -Wextra`, ak sa na ne tento kompilátor vzťahuje.
- Neuvádzaj neoverený kód alebo platformovo nefunkčné kroky ako hotové riešenie.

### IV. Zmeny majú byť ohraničené a spätne kontrolovateľné
- Špecifikuj nové funkcie cez Spec Kit: ústava → špecifikácia → plán → úlohy → analýza → implementácia → konvergencia.
- Oprav chybu po určení jej príčiny a skontroluj pôvodný scenár. Rozsah dokumentácie a overovania prispôsob zmeneným súborom a existujúcim možnostiam projektu.
- Nemeň nesúvisiace materiály ani nevytváraj naraz celý kurz, ak požiadavka smeruje na konkrétny diel.

## Technické a obsahové obmedzenia

- Repozitár obsahuje viacero jazykov a modulov; nepredpokladaj, že celý projekt je JavaScriptový iba preto, že niektoré nástroje používajú JavaScript.
- Zachovaj lokálne štandardy každého modulu, existujúci formát súborov a kompatibilitu stránok či aplikácií.
- Každá zmena používateľského rozhrania má rešpektovať prístupnosť a ovládanie klávesnicou, ak sa to na daný obsah vzťahuje.

## Pracovný postup

- Pri začatí práce preskúmaj existujúce súbory, lokálne pokyny a relevantnú architektúru.
- Pri novej funkcii vytvor špecifikáciu pred návrhom implementácie. Použi skills Spec Kit aktívnej integrácie (`/speckit-constitution`, `/speckit-specify`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement` a `/speckit-converge`) podľa potreby; vykonávaj ich postupne a artefakty kontroluj.
- Pred odovzdaním skontroluj diff, odkazy a súlad s touto ústavou a lokálnymi pokynmi. Spúšťaj iba tie testy alebo verifikácie, ktoré požiadavka alebo projektové pravidlá vyžadujú.
- Vetvy, commity a pull requesty vytváraj podľa `CONTRIBUTING.md`, ak ich používateľ alebo pracovný kontext požaduje.

## Správa ústavy

Táto ústava je projektovým východiskom pre plánovanie zmien. Pri rozpore sa uplatnia bezpečnostné a platformové obmedzenia a potom špecifickejšie pravidlá dotknutého modulu. Ústavu upravuj iba pri zmene dohodnutých projektových zásad a spolu s úpravou skontroluj nadväzujúce šablóny.

**Verzia:** 1.0.1 | **Schválené:** 2026-11-09 | **Naposledy upravené:** 2026-11-09
