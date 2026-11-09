# Plán implementácie: Analógové a výkonové periférie

**Špecifikácia:** [spec.md](spec.md)

**Vetva:** `codex/vypoctova-celok-05` (závisí od predchádzajúcej vetvy celku 03).

## Súhrn

Prevediem dodaný obsah šiestich 45-minútových prednášok do samostatných stránok kurzu, doplním simulátory podľa platformy a aktualizujem navigáciu a katalóg.

## Technické rozhodnutia

- Statické HTML5/CSS a existujúce skripty kurzu; bez nových knižníc.
- Kód Uno → Wokwi Arduino Uno; kód originálneho ESP32 → Wokwi ESP32.
- Raspberry Pi OS/Python `gpiozero` nie je priamo spustiteľný na Pico; simulátor Pico je doplnený ako alternatíva po prepise na MicroPython.
- Kontrola interných odkazov, ovládacích prvkov, simulátorov a diffu; testy sa nepridávajú.

## Rozloženie

`05_Vypoctova_technika/5.1–5.6 ...html`, aktualizovaný `index.html`, `README.md` a artefakty Spec Kit v tomto priečinku.

## Kontrola ústavy

Obsah nadväzuje na lokálnu osnovu, uvádza platformové obmedzenia, chráni hardvér pred priamym pripojením výkonových záťaží na GPIO a používa prístupné HTML.
