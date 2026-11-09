# Výskum a technické rozhodnutia

Používateľ dodal kompletný odborný podklad. Platformovo závislé príklady a bezpečnostné tvrdenia kontrolujeme podľa primárnej dokumentácie:

- [Arduino Language Reference](https://docs.arduino.cc/language-reference/) – `analogRead`, `analogWrite` a jazykové API.
- [Arduino API](https://docs.arduino.cc/learn/programming/reference) – bežné rozlíšenia `analogRead`/`analogWrite`.
- [Arduino-ESP32 LEDC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html) – PWM API pre aktuálne Arduino-ESP32.
- [Raspberry Pi Pico SDK hardware APIs](https://www.raspberrypi.com/documentation/pico-sdk/hardware.html) – ADC a PWM mikrokontroléra Pico.
- [Raspberry Pi GPIO dokumentácia](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html) – napäťové limity GPIO počítačových dosiek.
- [Wokwi Arduino Uno](https://wokwi.com/projects/new/arduino-uno), [Wokwi ESP32](https://wokwi.com/projects/new/esp32), [Wokwi Raspberry Pi Pico](https://wokwi.com/projects/new/pi-pico).

Príklad ESP32 LEDC v podklade cieli na Arduino-ESP32 3.x. DAC ukážka cieli na pôvodný ESP32 a nie je prenosná na každý variant. Raspberry Pi Pico je MCU; `gpiozero` príklad určený Linuxu treba prepísať na MicroPython, ak sa má spustiť v Pico simulátore.
