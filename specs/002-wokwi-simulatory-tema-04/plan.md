# Plán: Online simulátory pre tému 04

1. Doplniť trvalé pravidlo do `AGENTS.md` a `CONTRIBUTING.md`.
2. Prejsť kódové bloky prednášok 4.1–4.8 a určiť platformu podľa obsahu a kontextu.
3. Doplniť odkazy na Wokwi Arduino Uno, ESP32 alebo Raspberry Pi Pico ku kódu, ktorý sa v danej doske dá skúšať.
4. Pri Raspberry Pi ukážkach otvárať Wokwi Pico a jasne uviesť, že `gpiozero` vyžaduje prepis na MicroPython.
5. Skontrolovať všetkých osem stránok, odkazy, prístupnosť tlačidiel a diff.

## Technické rozhodnutia

- Wokwi odkazy otvárajú nový projekt príslušnej dosky; používateľ vloží skopírovaný kód do editora.
- Jednoriadkové a neúplné ukážky sú v kurze didaktické úryvky. Simulátor slúži na ich vyskúšanie po vložení do úplného programu.
- Kód využívajúci `gpiozero` a GPIO Raspberry Pi s Linuxom nie je kompatibilný s Wokwi Pico MicroPythonom. Odkaz preto smeruje na Wokwi Pico s viditeľným upozornením, že treba zvoliť MicroPython a kód prepísať.
- Každá ukážka patriaca do sekcie ESP32 smeruje na Wokwi ESP32 aj vtedy, keď jej izolovaný úryvok sám neobsahuje názov čipu.
