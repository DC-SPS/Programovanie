# Plán: Online simulátory pre tému 04

1. Doplniť trvalé pravidlo do `AGENTS.md` a `CONTRIBUTING.md`.
2. Prejsť kódové bloky prednášok 4.1–4.8 a určiť platformu podľa obsahu a kontextu.
3. Doplniť odkazy na Wokwi Arduino Uno, ESP32 alebo Raspberry Pi Pico ku kódu, ktorý sa v danej doske dá skúšať.
4. Zachovať primeraný editor pri Python/Raspberry Pi OS ukážkach a jasne uviesť nekompatibilitu s Wokwi Pico.
5. Skontrolovať všetkých osem stránok, odkazy, prístupnosť tlačidiel a diff.

## Technické rozhodnutia

- Wokwi odkazy otvárajú nový projekt príslušnej dosky; používateľ vloží skopírovaný kód do editora.
- Jednoriadkové a neúplné ukážky sú v kurze didaktické úryvky. Simulátor slúži na ich vyskúšanie po vložení do úplného programu.
- Kód využívajúci `gpiozero` a GPIO Raspberry Pi s Linuxom nie je kompatibilný s Wokwi Pico MicroPythonom. Zachová sa kontext ukážky a doplní sa Wokwi Pico iba ako alternatívna doska s výslovným upozornením na úpravu kódu.
