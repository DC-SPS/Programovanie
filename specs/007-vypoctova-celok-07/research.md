# Výskum: Embedded a reálne operačné systémy

## Autoritatívne zdroje

- [Espressif ESP-IDF FreeRTOS](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos.html) – implementácia FreeRTOS a jej vlastnosti na ESP32.
- [FreeRTOS – plánovanie úloh](https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/01-Tasks-and-co-routines/04-Task-scheduling)
- [FreeRTOS – fronty](https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/02-Queues-mutexes-and-semaphores/01-Queues)
- [FreeRTOS – mutexy](https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/02-Queues-mutexes-and-semaphores/04-Mutexes)
- [Wokwi ESP32](https://wokwi.com/projects/new/esp32) – online simulátor použitý v ukážkach.

## Rozhodnutia

- Zachovať rozdiel medzi všeobecným konceptom RTOS a konkrétnym ESP-IDF FreeRTOS pre ESP32.
- Pri viacjadrovom ESP32 neuvádzať jednojadrové zjednodušenia ako univerzálne pravidlá.
- Upozorniť, že správna priorita ani použitie RTOS samostatne negarantujú splnenie deadlineov.
