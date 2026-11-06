# Nastavenie Firebase

## Učiteľský prístup bez Cloud Functions

Ovládanie prednášok nepotrebuje vlastné tokenové nároky, blokovacie funkcie Identity Platform, Secret Manager ani Cloud Functions. Učiteľský prístup kontrolujú Firestore Security Rules podľa overeného Google účtu. Povolený účet je `dusan.cabala.sps@gmail.com`.

Kontrola e-mailu v `firestore.rules` je bezpečnostná hranica. Iný účet môže zobraziť prihlasovací alebo párovací formulár, ale Firestore mu odmietne čítanie aj zápis. Prístup nezabezpečuj iba kontrolou v JavaScripte.

## Projekt Firebase

- Projekt: `programovanie-sps`.
- Konfigurácia webovej aplikácie: `firebase-config.js`.
- Hosting: `https://programovanie-sps.web.app`.
- Projekt používa bezplatný plán Spark. Nenasadzuj Cloud Functions ani tajomstvá do Secret Managera; tie vyžadujú plán Blaze s fakturáciou.
- Databáza Firestore ešte nebola vytvorená. Vytvor predvolenú databázu v edícii **Standard** vo vhodnom regióne. Pre toto riešenie bez fakturácie nepouži Enterprise. Vytvorenie databázy zároveň povolí príslušné API. Edícia Standard má na pláne Spark bezplatné limity; pri ich prekročení sa používanie služby na zvyšok fakturačného obdobia zastaví.
- V Firebase Authentication musí byť povolené prihlásenie cez Google a doména webu musí byť medzi autorizovanými doménami.

## Zapnutie diaľkového ovládača

1. Vo Firebase Console otvor projekt `programovanie-sps`.
2. V **Firestore Database** vytvor predvolenú databázu v edícii **Standard**, vo vhodnom regióne a v produkčnom režime.
3. V **Authentication → Sign-in method** over, že je povolený Google. Skontroluj aj autorizovanú doménu webu.
4. Po kontrole lokálnych zmien v `firestore.rules` nasaď iba bezpečnostné pravidlá z koreňového priečinka projektu:

   ```powershell
   firebase deploy --only firestore:rules --project programovanie-sps
   ```

5. Na prednáške aj v mobilnom ovládači sa prihlás overeným Google účtom uvedeným v `firestore.rules`. Telefón spáruj krátkodobým kódom z otvorenej prednášky.

## Bezpečnostné poznámky

- Diaľkové relácie sú viazané na Firebase UID povoleného učiteľského účtu. Párovací kód platí dve minúty a dá sa použiť iba raz.
- Párovací kód je pevne `134679`; nie je to heslo ani autentifikácia. Skutočné oprávnenie kontrolujú Firestore pravidlá a overený učiteľský Google účet.
- Pravidlá Firestore obmedzujú reláciu na jej vlastníka a spárovaný telefón. Neprihlásené účty ani iné účty nemôžu čítať relácie alebo zapisovať príkazy.
- Pri zmene učiteľského účtu aktualizuj povolený e-mail v `firestore.rules`, skontroluj zmenu a nasaď pravidlá. Toto riešenie nepoužíva Firebase custom claim.
- Staršie funkcie v `functions/index.js` nie sú súčasťou riešenia bez fakturácie. Nenasadzuj ich v pláne Spark.
- Prihlasovanie žiakov, zber ich aktivít a e-mailové reporty zostávajú vypnuté, kým sa osobitne neschvália a nenavrhnú.
