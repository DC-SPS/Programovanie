# Nastavenie mobiln�ho ovl�da�a

## Poh�ady

- **�iak** a **U�ite�** s� existuj�ce re�imy na str�nkach kurzov.
- **Predn�aj�ci** je mobiln� ovl�da� otvoren� QR k�dom na hlavnej str�nke. Po u�ite�skom prihl�sen� a overen� PIN-u sa pripoj� k akt�vnej karte predn�ky.
- Mobil pon�ka prehratie, pozastavenie/pokra�ovanie, zastavenie, re�tart celej predn�ky a re�tart aktu�lneho odseku.

## Bezpe�n� ulo�enie PIN-u

Webov� klient nikdy neuklad� ani ne��ta PIN z repozit�ra. Hlavn� str�nka odo�le nov� nastavenie do Firebase callable Function. Function over� povolen� ��et u�ite�a, vytvor� HMAC-SHA-256 pomocou serverov�ho pepperu a cez obmedzen� GitHub token ulo�� iba HMAC overova� do `.github/remote-pin-hmac.json`. Mobil posiela PIN iba serverovej Function na overenie. Firestore uklad� iba autoriz�ciu zariadenia a stav rel�cie, nikdy PIN ani jeho overova�.

## Po�iadavky na nasadenie

Projekt aktu�lne pou��va Firebase Spark. Callable Functions vy�aduj� pl�n Blaze, preto t�to implement�cia zatia� nem��e fungova� na �ivej str�nke bez zmeny pl�nu a v�slovn�ho nasadenia. Ni� z toho som nenasadil.

Po samostatnom schv�len� konfigur�cie nastav vo Firebase Secrets:

```powershell
firebase functions:secrets:set REMOTE_PIN_GITHUB_TOKEN --project programovanie-sps
firebase functions:secrets:set REMOTE_PIN_PEPPER --project programovanie-sps
```

GitHub token mus� by� fine-grained a ma� iba opr�vnenie **Contents: Read and write** pre repozit�r `DC-SPS/Programovanie`. Pepper mus� by� n�hodn� tajn� k��� a ulo�en� iba vo Firebase Secrets. Ani jeden �daj nevkladaj do klienta alebo repozit�ra. Account `TEACHER_EMAIL` je u� potrebn� pre existuj�ce identity blocking functions, ale PIN funkcie samostatne kontroluj� overen� u�ite�sk� ��et.

Po nastaven� Secrets treba nain�talova� z�vislosti v `remote-functions/`, otestova� pravidl� vo Firebase Emulator Suite a a� po schv�len� samostatne nasadi� codebase `remote` (`firebase deploy --only functions:remote`) a Firestore rules (`firebase deploy --only firestore:rules --project programovanie-sps`). Existuj�ci identity-blocking codebase `default` sa t�m nemen�. Hosting sa nasadzuje samostatne.

## Rel�cie a opr�vnenia

Predn�kov� str�nka vytvor� n�hodn� rel�ciu a ozna�uje ju akt�vnou iba po�as zobrazenia jej karty. Mobil sleduje rel�cie prihl�sen�ho u�ite�a a vyber� akt�vnu pod�a heartbeat-u. Firestore odmietne pr�kazy od in�ho ��tu, neautorizovan�ho zariadenia, neakt�vnej str�nky alebo zastaranej rel�cie. Opakovan� nespr�vne PIN pokusy sa do�asne zablokuj�.

Webov� konfigur�cia Firebase je verejn� klientsk� konfigur�cia, nie servisn� k���. Do repozit�ra neukladaj service-account JSON, GitHub token, pepper ani in� tajn� poverenia.
