# Mobilný ovládač prednášky

Táto stránka je určená na použitie po naskenovaní QR kódu z hlavnej stránky. Učiteľ sa prihlási rovnakým Google/Firebase účtom ako v počítači a zadá jednorazový PIN vytvorený na hlavnej stránke. Po úspešnom spárovaní sa zobrazí iba ovládanie aktuálne aktívnej prednášky.

PIN platí desať minút a možno ho použiť iba raz. Samotný PIN sa neukladá. Server dočasne drží iba HMAC kontrolný údaj, ktorý zmaže po spárovaní alebo odhlásení; expirované výzvy čistí plánovaná funkcia. Ovládacie príkazy sú autorizované Firebase Rules a viazané na konkrétnu reláciu prednášky a spárované zariadenie.

Pred použitím treba nasadiť `remote-functions`, Firestore Rules a Hosting. Firebase Functions vyžadujú Blaze a serverový Secret `REMOTE_PIN_PEPPER`; postup je v `FIREBASE_SETUP.md`. Nasadenie z tejto pracovnej kópie nebolo vykonané.
