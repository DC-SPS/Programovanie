# Špecifikácia: Analógové a výkonové periférie

**Vetva:** `codex/vypoctova-celok-05`  
**Vstup:** kompletný text používateľa pre celok 5, šesť 45-minútových prednášok.

## Scenár P1 – Štúdium jednotlivých prednášok

Študent otvorí z osnovy ktorúkoľvek zo šiestich samostatných prednášok a nájde ciele, časový plán, vysvetlenie, praktické príklady, výpočty, úlohy a zhrnutie.

**Overenie:** každá položka celku 05 v osnove vedie na vlastnú stránku; navigácia prepája susedné prednášky.

## Scenár P2 – Simulácia kódu a bezpečné zapojenie

Študent skopíruje ukážku a otvorí správny online simulátor pre jej platformu. Pri výkonovej záťaži sa dozvie, že GPIO potrebuje vhodný výkonový ovládač. Kód pre Raspberry Pi s Linuxom sa neoznačí za priamo spustiteľný na Pico.

**Overenie:** Arduino AVR odkazuje na Wokwi Uno, ESP32 ukážky na Wokwi ESP32; Raspberry Pi `gpiozero` vysvetľuje nutný prepis a smeruje na Pico ako príbuznú platformu.

## Požiadavky a rozsah

- Zachovať všetkých šesť tém, výpočty, platformové rozdiely a bezpečnostné upozornenia z poskytnutého textu.
- Pridať šesť samostatných HTML stránok, prepojiť osnovu a README.
- Zachovať formálne vykanie, prístupné ovládanie a kompatibilitu existujúceho kurzu.
- Pri kóde pridať tlačidlo kopírovania a vhodný Wokwi simulátor; fragmenty označiť ako úryvky s pokynom na vloženie do úplného programu.
- Vytvoriť Spec Kit špecifikáciu, plán, výskum a úlohy.

## Predpoklady

- Celok je určený pre 3. ročník a každá prednáška trvá 45 minút.
- Doska, čip a verzia frameworku sa vždy uvádzajú pri platformovo závislých tvrdeniach.
- Zdieľaný textový súbor je autoritatívny obsah tejto úpravy.
