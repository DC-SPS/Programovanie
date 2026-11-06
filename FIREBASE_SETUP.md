# Mobilné zrkadlo prednášky

Mobil sa prihlási existujúcim učiteľským Google účtom. QR kód na hlavnej stránke otvorí mobilné zrkadlo. Zrkadlo nájde aktívnu prednášku rovnakého účtu, zobrazí jej stránku v ráme a presunie pôvodný ovládací panel na začiatok zobrazenia.

PIN a Cloud Functions sa nepoužívajú. Firestore Rules obmedzujú čítanie relácií a odosielanie ovládacích príkazov na overený učiteľský účet a jeho vlastnú aktívnu stránku. Príkazy z mobilného panelu sa vykonajú na otvorenej stránke v počítači.

Ak treba zmeny aktivovať vo Firebase, nasadzujú sa iba Firestore Rules po kontrole:

```powershell
firebase deploy --only hosting,firestore:rules --project programovanie-sps
```

Nasadenie pravidiel ani webu z tejto pracovnej kópie nebolo vykonané.
