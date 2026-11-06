# Diaľkový ovládač prednášky

`/remote/` je inštalovateľná webová aplikácia pre telefón. Po prihlásení overeným učiteľským Google účtom zadajte kód `134679` z tlačidla **Ovládač** na otvorenej prednáške. Kód platí dve minúty a v rámci relácie ho možno použiť iba raz. Každé načítanie prednášky vytvorí náhodnú reláciu; ovládač počúva príkazy len v dokumente tejto relácie.

Prednášková stránka vystavuje tenké rozhranie nad existujúcimi tlačidlami a funkciami čítania. Telefón neposiela text prednášky ani hlasové údaje. Firebase Authentication vyžaduje rovnakú učiteľskú rolu (`teacher` custom claim), ktorú už kontrolujú pravidlá Firestore. Firestore pravidlá obmedzujú relácie a príkazy na učiteľský účet, spárované zariadenie a aktívnu konkrétnu stránku.

## Stav infraštruktúry

Projektové poznámky hovoria, že Firestore API/databáza zatiaľ nie sú vytvorené a existujúce pravidlá povoľujú iba čítanie určených dát. Kód v tomto priečinku a návrh v `../firestore.rules` sú preto lokálne pripravené, ale samy osebe nezapnú spojenie v produkcii. Pred nasadením treba vytvoriť/aktivovať projektovú databázu, otestovať pravidlá cez Firebase Emulator Suite a následne nasadiť pravidlá po samostatnom schválení. Aplikácia ani pravidlá neboli publikované.

Webová konfigurácia Firebase je zdieľaná s projektom cez `../firebase-config.js`; nepridávajte do aplikácie servisné účty, privátne kľúče ani heslá.
