# Mobilné zrkadlo prednášky

Naskenujte QR kód na hlavnej stránke v tom istom prehliadači, v ktorom je otvorená prednáška. Telefón bez Google prihlásenia zobrazí aktuálnu stránku a po zmene prednášky ju automaticky obnoví.

QR kód obsahuje súkromný kód miestnosti. Zdieľajte ho iba s účastníkmi. Pravidlá Firestore treba nasadiť po ich zmene:

```powershell
firebase deploy --only firestore:rules --project programovanie-sps
```
