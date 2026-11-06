# Mobilné zrkadlo prednášky

Mobil sa pripája cez QR kód s náhodným súkromným kódom miestnosti. Telefón sa neprihlasuje cez Google. Počítač zapisuje aktuálnu cestu prednášky do Firestore každých 10 sekúnd; mobil ju sleduje a otvorí v ráme. Middleware povoľuje načítať chránenú HTML stránku iba v režime zrkadla, ak Firestore potvrdí platný QR kód, rovnakú cestu a čerstvý heartbeat. Statické súbory (štýly, skripty, obrázky, videá) sú dostupné bez prihlásenia, aby sa mohli načítať v zrkadle.

Prístup ku QR kódu slúži ako prístupový kľúč k zrkadlu. Kódy miestností majú 192 bitov náhodnosti. Firestore pravidlá povoľujú čítať iba konkrétny dokument podľa kódu a nedovoľujú zoznamovať miestnosti. Keďže zrkadlo nepoužíva identitu učiteľa, klient, ktorý pozná QR kód, môže prepísať stav tejto miestnosti; QR preto zdieľajte iba s účastníkmi prednášky.

Po zmene pravidiel ich treba nasadiť do Firebase:

```powershell
firebase deploy --only firestore:rules --project programovanie-sps
```

Nasadenie pravidiel ani webu z tejto pracovnej kópie nebolo vykonané.
