# Špecifikácia: Pamäťový systém a dátová reprezentácia

**Vetva:** `codex/vypoctova-celok-03`  
**Vstup:** požiadavka zapracovať tému 3 podľa zdieľaného odkazu.

## Kontext a scenáre

Pripravte kompletný tematický celok 03 pre študentov strednej odbornej školy v súlade s existujúcou osnovou kurzu. Študent má postupne pochopiť číselné sústavy, veľkosť a typy dát, bitové operácie, pamäte MCU, adresovanie a prácu so zásobníkom a ukazovateľmi.

### P1 – Štúdium samostatnej prednášky

Každá zo siedmich tém je dostupná ako samostatná HTML prednáška s cieľmi, prerekvizitami, časovým plánom 45 minút, vysvetlením, analyzovaným príkladom, častými chybami, úlohami A–D a autoritatívnymi zdrojmi.

**Overenie:** navigáciou z osnovy sa otvorí každá prednáška a z každej sa možno vrátiť na osnovu a pokračovať na ďalšiu.

### P2 – Bezpečné a spustiteľné ukážky

Študent môže skopírovať celý príklad a otvoriť vhodný online simulátor Wokwi. AVR príklady používajú Arduino Uno; hardvérovo nezávislé vysvetľujúce úryvky sú jasne označené ako úryvky.

**Overenie:** kódové ukážky majú dostupné tlačidlo kopírovania a zodpovedajúci odkaz simulátora.

## Požiadavky

- Zachovať názvy a poradie siedmich tém z `05_Vypoctova_technika/index.html`.
- Uvádzať veľkosti pamätí len s určením konkrétneho MCU; pre Arduino Uno/ATmega328P uviesť Flash 32 KiB, SRAM 2 KiB a EEPROM 1 KiB podľa datasheetu.
- Vysvetliť obmedzenú šírku celočíselných typov, znamienkové a neznamienkové hodnoty, masky a posuny bez nebezpečných alebo nedefinovaných ukážok.
- Pri pamäti rozlíšiť účel, volatilitu a obmedzenia Flash, SRAM a EEPROM; neprezentovať jednu univerzálnu mapu adries pre všetky MCU.
- Pri zásobníku a ukazovateľoch vysvetliť adresu, dereferencovanie, životnosť lokálnych premenných a riziko návratu ukazovateľa na zaniknutú premennú.
- Používať prístupný sémantický HTML, formálne vykanie a relatívne interné odkazy.
- Odkazovaná konverzácia sa pri príprave nedala načítať; obsah sa preto tvorí podľa lokálnej osnovy a autoritatívnych technických zdrojov, bez domýšľania neviditeľného textu.

## Mimo rozsahu

Zmeny iných tematických celkov, úpravy spoločného vzhľadu kurzu a zavádzanie nového JavaScriptového frameworku.

## Predpoklady

- Každá prednáška je samostatná 45-minútová vyučovacia jednotka.
- Príklady na Wokwi Uno cielia na Arduino Uno s ATmega328P; presné detaily sa môžu líšiť medzi revíziami dosiek.
- Zdieľaný odkaz môže byť nedostupný, preto sa ako zdroj obsahu použije dostupná osnova projektu.
