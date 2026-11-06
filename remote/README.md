# Mobilný ovládač prednášky

Učiteľ sa na hlavnej stránke prihlási rovnakým Google/Firebase účtom ako na prednáške, zadá vlastný šesťmiestny PIN a uloží ho. QR kód sa zobrazí až po úspešnom uložení. V mobile učiteľ naskenuje QR kód, prihlási sa tým istým účtom a zadá uložený PIN. Potom sa zobrazí iba ovládanie aktuálne aktívnej prednášky.

PIN možno použiť iba raz a platí desať minút. Samotný PIN sa nikde neukladá. Server dočasne uchová iba HMAC kontrolný údaj, ktorý sa zmaže po spárovaní alebo odhlásení. Expirované výzvy čistí plánovaná funkcia. Ovládacie príkazy sú viazané na konkrétnu reláciu prednášky a spárované zariadenie.

Pred použitím treba nasadiť `remote-functions`, Firestore Rules a Hosting. Firebase Functions vyžadujú Blaze a serverový Secret `REMOTE_PIN_PEPPER`; postup je v `FIREBASE_SETUP.md`. Nasadenie z tejto pracovnej kópie nebolo vykonané.
