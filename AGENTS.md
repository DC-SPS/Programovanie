# Pokyny pre AI agentov

Tento repozitár je slovenský vzdelávací kurz s viacerými jazykmi a samostatnými modulmi.

- Pred zmenou si prečítaj `CONTRIBUTING.md` a všetky `AGENTS.md` v dotknutom module.
- Pri novej funkcii alebo väčšej zmene použi projektový Spec Kit a ukladaj špecifikáciu, plán a úlohy do `specs/`. V GitHub Copilot používaj nainštalované skills `/speckit-specify`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement` a `/speckit-converge` podľa potreby; postupuj po krokoch a pred implementáciou skontroluj špecifikáciu aj plán. Pri malej oprave najprv zisti príčinu a over opravu podľa pôvodného scenára.
- Dodržuj ústavu v `.specify/memory/constitution.md`; pri tvorbe lekcií zachovaj osnovu, slovenský jazyk a formálne vykanie.
- Pri každom ukážkovom kóde určenom na kopírovanie pridaj vedľa tlačidla „Kopírovať kód“ odkaz do vhodného simulátora Wokwi. Platformu určuj podľa kódu aj nadpisu: pre AVR použi Arduino Uno, pri každej ukážke pre ESP32 Wokwi ESP32 a pre Raspberry Pi Pico Wokwi Pico. Pri úryvku uveď, že ho treba vložiť do úplného programu. Raspberry Pi Pico nie je Raspberry Pi s Linuxom: kód `gpiozero` neoznačuj ako priamo spustiteľný vo Wokwi Pico; upozorni na potrebu prepísania na MicroPython.
- Nezamieňaj pravidlá jedného modulu s pravidlami celého repozitára. Chráň nesúvisiaci obsah a existujúcu štruktúru.
- Pred dokončením skontroluj zmenené súbory a relatívne odkazy. Testy spúšťaj podľa požiadavky alebo existujúcich projektových pravidiel.
