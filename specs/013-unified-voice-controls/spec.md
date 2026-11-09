# Zjednotenie hlasového ovládania prednášok

## Cieľ
Zjednotiť hlasové ovládanie vo všetkých kurzoch a prednáškach podľa referenčného prehrávača: Prehrať, Zastaviť, Pozastaviť/Pokračovať, Prehrať znova a rozbaľovacie Nastavenia hlasu.

## Požiadavky
- Existujúce prednášky so spoločným prehrávačom zachovajú čítanie, výber textu, režim žiak/učiteľ a synchronizáciu.
- Nastavenia rýchlosti, hlasu a hlasitosti budú zoskupené v rozbaľovacom prvku.
- Prednášky bez prehrávača dostanú funkčné čítanie cez Web Speech API.
- Ovládanie bude použiteľné klávesnicou, označené prístupnými názvami a použije stavové oznámenia.
- Nastavenia hlasu sa uložia v prehliadači a zachová sa responzívne rozloženie.

## Rozsah
Spoločný prehrávač existujúcich stránok a chýbajúce prednášky Git a Výpočtovej techniky/C. Obsah prednášok sa nemení.

## Akceptačné kritériá
- Štyri akčné tlačidlá sú v mriežke 2 × 2 a tlačidlá zodpovedajú prehrávaciemu stavu.
- Nastavenia sú predvolene zbalené a obsahujú rýchlosť, hlas a hlasitosť.
- Na stránke bez existujúceho prehrávača možno spustiť, pozastaviť, zastaviť a zopakovať hlasové čítanie.
- Synchronizácia a existujúce hlasové rozhranie sa nenačítajú duplicitne.
- Zmenené odkazy na skripty sú relatívne a fungujú v podpriečinkoch.
