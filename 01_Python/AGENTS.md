# Pokyny pre materiály Pythonu

- Zachovaj existujúci vzhľad, tému a obsah každej lekcie.
- Každá výučbová stránka (okrem prehľadu `index.html`) používa spoločné horné okno z `../lesson-top.js`; zobrazuje názov a opis témy, aktuálny čas a dátum vo vybranom UTC posune a 45-minútový časovač so spustením, pozastavením a vynulovaním.
- UTC posun sa vyberá v nastaveniach horného okna a ukladá sa pre ďalšie lekcie Pythonu aj Win32 API.
- Pri stránkach v tomto priečinku vlož `<script src="../lesson-top.js" defer></script>`; pri stránkach v podpriečinku použi `<script src="../../lesson-top.js" defer></script>`.
- Časovač sa spúšťa až po stlačení tlačidla a musí byť ovládateľný klávesnicou aj myšou.
