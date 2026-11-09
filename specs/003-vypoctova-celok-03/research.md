# Výskum a technické rozhodnutia

## Zdroje

- [Microchip ATmega328P datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf): 32 KiB programovej Flash, 2 KiB SRAM, 1 KiB EEPROM; pamäťové priestory a registre.
- [Microchip: pamäte ATmega328P](https://onlinedocs.microchip.com/oxy/GUID-4B32B28F-63FC-4320-842D-ECC5E5164A23-en-US-3/GUID-D87F58C5-61E8-41BB-A886-393A5946EC12.html): rozdiel programovej Flash, SRAM a EEPROM.
- [Arduino language reference](https://docs.arduino.cc/language-reference/): syntax C/C++ používaná v príkladoch.
- [Wokwi Arduino Uno](https://wokwi.com/projects/new/arduino-uno): online simulátor pre ukážky AVR.

## Rozhodnutia

- Pamäťové kapacity uvádzame v binárnych násobkoch a viažeme ich na konkrétny čip; marketingové „KB“ v zdroji neznamená, že všetky MCU majú rovnaké kapacity.
- Rozloženie Flash/SRAM/EEPROM a registre sa líšia podľa architektúry. „Memory map“ sa preto učí ako mapa konkrétneho cieľového čipu, nie ako univerzálne adresy.
- Ukážky bitov používajú neznamienkové typy a masky; posun sa vykonáva len o počet bitov menší než šírka typu.
- Ukazovateľ na lokálnu premennú sa nesmie použiť po skončení jej životnosti.
- Zdieľaný chat sa nepodarilo načítať; implementácia sa drží dostupného lokálneho zoznamu tém.
