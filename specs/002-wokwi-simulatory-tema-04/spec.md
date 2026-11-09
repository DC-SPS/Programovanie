# Špecifikácia: Online simulátory pri kóde v celku 04

**Vytvorené:** 2026-11-09
**Stav:** Schválené na implementáciu

## Scenár používateľa

Ako študent chcem pri ukážkovom kóde otvoriť simulátor správnej dosky, aby som mohol kód vyskúšať bez fyzického hardvéru.

## Požiadavky

- **FR-001:** Vedľa tlačidla kopírovania vo všetkých prednáškach 4.1–4.8 musí byť dostupný odkaz na vhodný simulátor pri spustiteľných príkladoch.
- **FR-002:** Príklady pre Arduino Uno a ESP32 smerujú na príslušný Wokwi projekt.
- **FR-003:** Platformovo špecifické príklady správne identifikujú dosku; úryvky majú vysvetliť potrebu vloženia do úplného programu.
- **FR-004:** Raspberry Pi s Linuxom sa nesmie zamieňať s Raspberry Pi Pico. Príklady `gpiozero` sa nesmú označiť ako kód priamo spustiteľný vo Wokwi Pico.
- **FR-005:** Zachovať kopírovanie, prístupnosť, existujúci obsah a štýl prednášok.

## Kritériá úspechu

- Všetky ukážky v témach 4.1–4.8 majú podľa cieľovej platformy vhodný online editor alebo simulátor.
- Každý odkaz používa správnu platformu a novú kartu s bezpečnými atribútmi.
- Obmedzenia Wokwi pre Raspberry Pi OS a ukážky Pythonu sú jasne vysvetlené.
