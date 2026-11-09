# Špecifikácia: Komunikačné rozhrania a protokoly

**Vetva:** `codex/vypoctova-celok-06`  
**Vstup:** používateľom dodaný kompletný obsah ôsmich 45-minútových prednášok.

## Scenár P1 – Štúdium prednášok

Študent otvorí ktorúkoľvek z ôsmich tém z osnovy a nájde ciele, časový plán, vysvetlenie, príklady, úlohy a zdroje podľa dodaného materiálu.

**Overenie:** osnova odkazuje na osem samostatných stránok a stránky umožňujú prechod medzi susednými témami.

## Scenár P2 – Bezpečné skúšanie ukážok

Študent skopíruje príklad Arduino Uno a môže ho otvoriť v online simulátore Wokwi. Pri zapojení rozhraní sa dozvie, že logické úrovne GPIO, UART, RS-232 a RS-485 nie sú zameniteľné.

**Overenie:** všetky kopírovateľné C++ ukážky majú tlačidlo kopírovania a Wokwi Uno; výňatky sú označené. Stránky obsahujú bezpečnostné upozornenie.

## Požiadavky a rozsah

- Zachovať všetkých osem prednášok, ich vysvetlenia, tabuľky, schémy, výpočty a úlohy z dodaného textu.
- Pridať osem samostatných HTML stránok a prepojiť osnovu a README.
- Zachovať slovenský jazyk, formálne oslovenie, existujúci vzhľad a prístupné ovládanie.
- Pridať tlačidlá kopírovania a vhodný online simulátor ku kopírovateľnému kódu.
- Vytvoriť špecifikáciu, plán, výskum a úlohy Spec Kit.

## Predpoklady

- Prednášky sú určené pre tretí ročník strednej školy a každá trvá 45 minút.
- Používateľom dodaný text je autoritatívnym zdrojom obsahu.
- Arduino C++ ukážky používajú Uno R3; Wokwi Uno slúži na ich simuláciu.
