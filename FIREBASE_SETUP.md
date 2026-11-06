# Nastavenie mobilného ovládača

Mobilný ovládač používa existujúce Firebase prihlásenie učiteľa a samostatný Firebase Functions codebase `remote-functions`.

## Jednorazový PIN

Učiteľ sa prihlási na hlavnej stránke, zadá svoj šesťmiestny PIN a zvolí **Uložiť PIN a vytvoriť QR**. QR kód sa zobrazí až po úspešnom uložení. PIN sa nezapisuje do GitHubu, Firestore ani browser storage. Na serveri sa dočasne uchová iba HMAC kontrolný údaj s desaťminútovou expiráciou, ktorý sa odstráni po úspešnom spárovaní alebo pri odhlásení. Neúspešné pokusy sa obmedzujú.

PIN sa dá použiť raz. Pri uložení ďalšieho PIN-u sa predchádzajúci zneplatní. Pri odhlásení sa serverová výzva a autorizácie mobilných zariadení odstránia; PIN sa zároveň vymaže z formulára. Ak sa prehliadač náhle zavrie alebo stratí spojenie, výzva vyprší po desiatich minútach a plánovaná funkcia ju odstráni v najbližšom päťminútovom cykle.

## Požiadavky na nasadenie

Firebase callable Functions vyžadujú plán Blaze. Nastav iba serverový Secret `REMOTE_PIN_PEPPER` ako náhodný tajný kľúč. Do klientského JavaScriptu ani repozitára ho nevkladaj.

Po schválení nasadenia použi:

```powershell
firebase functions:secrets:set REMOTE_PIN_PEPPER --project programovanie-sps
firebase deploy --only functions:remote,firestore:rules,hosting --project programovanie-sps
```

Tento repozitár neobsahuje vygenerovaný PIN ani GitHub token na jeho zápis. Produkčné nasadenie sa musí vykonať samostatne po schválení.
