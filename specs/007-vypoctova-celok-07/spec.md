# Špecifikácia: Embedded a reálne operačné systémy

**Vetva:** `codex/vypoctova-celok-07`
**Vstup:** používateľom dodaný obsah šiestich 45-minútových prednášok.

## Scenár P1 – Štúdium celku 07

Študent otvorí z osnovy ktorúkoľvek zo šiestich prednášok a nájde ciele, časový plán, vysvetlenia, príklady, úlohy a zhrnutie z pôvodného materiálu.

**Overenie:** všetkých šesť položiek celku 07 vedie na vlastnú stránku; stránky prepájajú susedné prednášky.

## Scenár P2 – Simulácia FreeRTOS príkladov

Študent skopíruje C++ príklad a otvorí Wokwi ESP32. Fragmenty sú označené a vysvetľujú potrebný kontext Arduino-ESP32. Materiál odlišuje všeobecné princípy RTOS od vlastností konkrétnej dosky a implementácie.

**Overenie:** každá kopírovateľná C++ ukážka má kopírovacie tlačidlo a Wokwi ESP32; bezpečnostné a platformové upozornenie je na každej stránke.

## Rozsah

- Zachovať obsah všetkých šiestich prednášok z dodaného textu vrátane tabuliek, výpočtov, ukážok a úloh.
- Pridať šesť samostatných HTML stránok a prepojiť osnovu a README.
- Zachovať slovenský jazyk, formálne oslovenie a štruktúru kurzu.
- Doplniť Spec Kit špecifikáciu, plán, výskum a úlohy.

## Predpoklady

- Prednášky sú určené pre tretí ročník strednej školy a trvajú 45 minút.
- V tejto téme pojem „reálny operačný systém“ znamená RTOS.
- Kódové ukážky používajú FreeRTOS v Arduino-ESP32 na ESP32; presné vlastnosti sa môžu líšiť podľa dosky a verzie frameworku.
