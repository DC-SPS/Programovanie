# Prompty na postupné vylepšovanie projektu

Tento zoznam slúži na postupnú kontrolu a vylepšovanie výučbového projektu Programovanie. Prompty sú pripravené tak, aby sa dali zadávať po jednom. Po každom kroku najprv skontrolujeme zistenia a návrhy; kód ani obsah sa nemení, kým výslovne neschválim konkrétne úpravy.

## Ako so zoznamom pracovať

1. Požiadaj AI napríklad: **„Urob prompt č. 1 z `PROMPTY.md`.“**
2. AI preskúma príslušnú časť projektu, uvedie konkrétne zistenia a navrhne ďalší postup.
3. Skontroluj návrhy a rozhodni, čo schvaľuješ. Bez schválenia AI nič neupravuje.
4. Po dokončení kontroly pokračuj ďalším číslom. Ak sa rozsah promptu prekrýva s už schválenou prácou, najprv to AI oznámi.

## Spoločné pokyny pre všetky prompty

- Pracuj s aktuálnym obsahom repozitára, nie s domnienkami. Pred návrhom si prečítaj súvisiace súbory a odkazy.
- Projekt je slovenský výučbový materiál pre stredné odborné školy. Zachovaj slovenčinu, odbornú správnosť a primeranú náročnosť pre študentov.
- Zohľadni existujúcu štruktúru modulov a pravidlá v `CONTRIBUTING.md`. Pri Win32 API rešpektuj koncepciu v `04_Win32_API/README.md` vrátane natívneho C++ pre Windows.
- Oddeľuj overiteľné zistenia od návrhov. Pri každom zistení uveď konkrétny súbor, prípadne sekciu alebo riadok, a vysvetli dopad na študenta alebo vyučujúceho.
- Nevymýšľaj fakty, zdroje, vlastnosti aplikácie ani učebné ciele. Neistotu jasne označ a navrhni, čo treba overiť.
- V tejto fáze pripravuj iba kontrolu, vysvetlenie alebo návrhy. Neupravuj súbory, nespúšťaj nasadenie a nerob iné zmeny, kým ich výslovne neschválim.
- Návrhy zoraď podľa prínosu a naliehavosti. Uveď aj riziko, náročnosť, závislosti a spôsob overenia tam, kde sú relevantné.

## Zoznam promptov

### 1. Zmapovanie projektu a východiskový stav

> Preskúmaj štruktúru výučbového projektu Programovanie. Zameraj sa na webové stránky, navigáciu, učebné moduly, lekcie a materiály pre učiteľa aj študenta. Zisti, čo je hotové, čo je označené ako pripravované a aké technológie alebo pravidlá projekt používa. Zatiaľ nič neupravuj. Vráť stručnú mapu projektu, dôležité súbory, silné stránky, konkrétne problémy a nejasnosti, ktoré treba vyriešiť pred ďalším plánovaním.

### 2. Zoradenie príležitostí na zlepšenie

> Na základe aktuálneho stavu projektu navrhni zoradený zoznam zlepšení pre webové stránky a výučbový obsah. Pri každom bode uveď problém a dôkaz v projekte, prínos pre študenta alebo učiteľa, prioritu, odhad náročnosti, závislosti a spôsob overenia. Rozdeľ návrhy na rýchle opravy, stredne veľké úlohy a dlhodobejšie zlepšenia. Neopakuj všeobecné rady, ktoré sa nedajú spojiť s konkrétnou stránkou alebo materiálom. Nič neupravuj.

### 3. Navigácia a orientácia na webe

> Skontroluj, ako sa študent a učiteľ dostanú z hlavnej stránky ku kurzom, modulom a jednotlivým lekciám a ako sa vracajú späť. Over popisy odkazov, konzistentnosť navigácie, pomenovanie kurzov a zrozumiteľnosť toho, čo je dostupné alebo pripravované. Navrhni konkrétne zmeny v poradí, štítkoch, breadcrumb navigácii alebo odkazoch len tam, kde ich opodstatňuje súčasný web. Uveď dotknuté súbory a možné riziká pre existujúce odkazy. Nič neupravuj.

### 4. Hlavná stránka a stránky kurzov

> Skontroluj hlavnú stránku a prehľadové stránky kurzov z pohľadu prvého návštevníka: komu je kurz určený, čo sa v ňom naučí, aký je rozsah a ako začať. Posúď zrozumiteľnosť textov, vizuálnu hierarchiu, karty kurzov, obrázky, výzvy na akciu a informácie o stave obsahu. Navrhni konkrétne zmeny textov a rozloženia, ktoré zlepšia orientáciu bez zavádzania o tom, čo je hotové. Uveď súbory a navrhované znenia; zatiaľ ich nezapisuj.

### 5. Štruktúra a jednotnosť stránok lekcií

> Porovnaj reprezentatívne stránky lekcií z rôznych častí projektu a zisti, či majú študenti jednotnú orientáciu, ciele, potrebné vedomosti, vysvetlenie, príklady, úlohy a ďalšie kroky. Zohľadni existujúcu šablónu v `CONTRIBUTING.md`, ale nevynucuj rovnaký obsah tam, kde sa typy lekcií odlišujú. Navrhni praktickú štruktúru stránky pre typické lekcie a osobitne uveď, čo má byť spoločné a čo špecifické. Podlož návrhy konkrétnymi príkladmi zo súborov. Nič neupravuj.

### 6. Čitateľnosť, prístupnosť a použitie v triede

> Skontroluj vybrané dôležité stránky na mobilnom zobrazení, čitateľnosť, kontrast, veľkosť a štruktúru textu, ovládanie klávesnicou, alternatívne texty obrázkov a obmedzenie pohybu. Zohľadni, že materiál sa môže premietať v triede a používať pri výklade. Rozlišuj medzi problémami preukázanými v kóde a tým, čo treba overiť v prehliadači alebo na zariadení. Výsledok uveď ako konkrétny zoznam podľa závažnosti vrátane súboru a odporúčaného overenia. Nič neupravuj.

### 7. Kontrola učebného obsahu a odbornej správnosti

> Vyber konkrétny modul alebo lekciu a skontroluj nadväznosť tém, primeranosť pre cieľovú skupinu, presnosť odborných vysvetlení, príklady a odkazy na zdroje. Pri Win32 API rozlišuj natívne Win32 C++ od webovej simulácie a iných UI technológií. Každú spornú formuláciu cituj alebo presne lokalizuj, vysvetli, v čom je problém, a navrhni bezpečnejšie alebo presnejšie znenie. Ak tvrdenie nevieš overiť z projektu, označ ho na odborné overenie namiesto hádania. Nič neupravuj.

### 8. Návrh výkladu konkrétnej 45-minútovej hodiny

> Pre lekciu [uveď názov alebo cestu k súboru] priprav učiteľský plán na jednu 45-minútovú hodinu podľa skutočného obsahu lekcie a predchádzajúcich vedomostí študentov. Rozdeľ čas na úvod a motiváciu, výklad, ukážku alebo spoločnú prácu, aktivitu študentov, kontrolu porozumenia a záver. Ku každej časti uveď cieľ, hlavné myšlienky, čo má učiteľ vysvetliť alebo ukázať, čo robia študenti a ako sa zistí, či tomu rozumejú. Nepridávaj obsah, ktorý lekcia alebo projekt nepodporuje; navrhni ho osobitne ako možnosť. Zatiaľ nič neupravuj.

### 9. Čo a ako počas výkladu povedať

> Pre lekciu [uveď názov alebo cestu k súboru] navrhni osnovu ústneho výkladu pre učiteľa: kľúčové posolstvo, poradie vysvetľovania, zrozumiteľné formulácie, otázky pre triedu, prechody medzi témami a časté nedorozumenia. Pri kóde alebo technickom postupe uveď, čo treba premietnuť a na čo upozorniť; nerozpisuj dlhý text určený na mechanické čítanie. Odlišuj fakty priamo potvrdené materiálom od doplňujúcich návrhov. Zahrň aj krátku záverečnú rekapituláciu. Nič neupravuj.

### 10. Ukážky, vizuálne vysvetlenia a zapojenie študentov

> Pre lekciu [uveď názov alebo cestu k súboru] navrhni konkrétnu ukážku, nákres, diagram, demonštráciu alebo krátku aktivitu, ktorá pomôže pochopiť jej hlavný pojem. Vysvetli, čo sa má zobraziť, čo pri tom učiteľ povie, čo majú študenti predpovedať alebo urobiť a ako sa vyhodnotí výsledok. Pri programátorskej ukážke rešpektuj technológie a prostredie projektu; upozorni na predpoklady spustenia a typické chyby. Nevymýšľaj neexistujúce funkcie webu. Nič neupravuj.

### 11. Úlohy a priebežné overovanie vedomostí

> Pre lekciu [uveď názov alebo cestu k súboru] navrhni primerané otázky na kontrolu porozumenia a praktické úlohy aspoň v základnej a rozširujúcej náročnosti. Ku každej uveď, aký cieľ overuje, očakávaný výsledok alebo hodnotiace kritérium a typickú chybu. Úlohy musia nadväzovať na obsah lekcie a dostupné nástroje študenta. Ak navrhuješ riešenia pre učiteľa, oddeľ ich od zadania pre študenta. Nič neupravuj.

### 12. Príprava študentskej prezentácie záverečného projektu

> Na základe pravidiel a obsahu projektu navrhni metodiku pre prezentáciu záverečného projektu. Zahrň odporúčané poradie častí (problém a cieľ, návrh, hlavné rozhodnutia, ukážka funkčnosti, testovanie, obmedzenia a záver), čo má študent pri každej časti povedať a ukázať, ako sa pripraviť na otázky a čo robiť pri zlyhaní živej ukážky. Navrhni kontrolný zoznam pre študenta a hodnotiace kritériá pre učiteľa. Neurčuj časový limit, ak ho projekt alebo učiteľ neurčil; prípadnú potrebu rozhodnutia označ otázkou. Výstup prispôsob lekciám 63–66 v `04_Win32_API/lekcie/` a jasne označ, čo v aktuálnych materiáloch chýba. Nič neupravuj.

### 13. Kontrola súvislostí a kvality pred schválením zmien

> Prejdi schválené návrhy alebo upravené materiály z predchádzajúcich krokov a skontroluj ich ako celok. Over súlad medzi textom stránky, osnovou, cieľmi hodiny, učiteľským výkladom, aktivitami a hodnotením. Skontroluj tiež odkazy a pomenovania, konzistentnosť so susednými lekciami, odbornú presnosť a či sa zmena nedotkla nesúvisiaceho obsahu. Výsledok rozdeľ na potvrdené v poriadku, problémy vyžadujúce opravu a odporúčania na neskôr. Pred akoukoľvek opravou najprv predlož konkrétny návrh na schválenie.
