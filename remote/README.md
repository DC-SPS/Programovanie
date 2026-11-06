# Mobiln� ovl�da� predn�ky

QR k�d na hlavnej str�nke otv�ra re�im **Predn�aj�ci**. Po prihl�sen� t�m ist�m u�ite�sk�m Google ��tom a zadan� PIN-u mobil sleduje akt�vnu kartu predn�ky a pon�ka iba ovl�danie ��tania: spusti�, pozastavi�/pokra�ova�, zastavi�, za�a� predn�ku odznova a zopakova� aktu�lny odsek.

Existuj�ce re�imy **�iak** a **U�ite�** na str�nkach kurzov zost�vaj� zachovan�. Mobiln� ovl�da� je tret�, samostatn� poh�ad. PIN sa nikdy neposiela nasp� klientovi a nie je ulo�en� v HTML, JavaScripte ani Firestore. Nastavenie z hlavnej str�nky vytvor� HMAC-SHA-256 overova� v `.github/remote-pin-hmac.json`; pepper a GitHub token s� ur�en� iba pre Firebase Functions Secrets.

Predn�kov� str�nky zverej�uj� heartbeat iba pre akt�vnu kartu a vzdialen� pr�kazy s� zacielen� na jej n�hodn� ID rel�cie. Firestore povo�uje z�pis pr�kazov len overen�mu u�ite�sk�mu ��tu a zariadeniu, ktor� server autorizoval po overen� PIN-u.

## Serverov� konfigur�cia

Pred pou�it�m treba zapn�� Firebase Functions na platenom pl�ne Blaze, nastavi� Secrets `REMOTE_PIN_GITHUB_TOKEN` a `REMOTE_PIN_PEPPER` a nasadi� Functions a Firestore pravidl�. GitHub token m� ma� minim�lne opr�vnenie **Contents: Read and write** iba pre repozit�r `DC-SPS/Programovanie`. Pepper vytvor ako n�hodn� tajn� k���; nevkladaj ho do repozit�ra ani klienta. Bez t�chto krokov formul�r PIN bezpe�ne neulo�� a aplik�cia PIN neover�.

Zmeny v tomto prie�inku s� iba lok�lne pripraven�. Hosting, Firebase Functions, Firestore pravidl� ani GitHub Secrets sa automaticky nemenia.
