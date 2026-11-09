# Plán implementácie: Prednášky celku 4

**Dátum:** 2026-11-09  
**Špecifikácia:** [spec.md](./spec.md)

## Súhrn

Prevediem sedem chýbajúcich Markdown prednášok 4.1, 4.2 a 4.4–4.8 zo zdieľaného chatu do samostatných stránok HTML podľa vzoru existujúcej 4.3. Doplním ich do osnovy a README; stránku 4.3 ponechám.

## Technický kontext

- **Formát:** statické HTML5, UTF-8, slovenský jazyk.
- **Závislosti:** existujúce `theme.js`, `lesson-top.js`, `c-lecture-controls.js` a `lesson-remote.js`.
- **Testovanie:** používateľ nepožadoval testy; vykoná sa kontrola diffu a interných odkazov.
- **Obmedzenia:** zachovať obsah podkladu, štruktúru kurzu, prístupnú navigáciu a platformové upozornenia.
- **Rozsah:** sedem nových stránok a aktualizácia dvoch prehľadových dokumentov.

## Kontrola ústavy

- Obsah je ohraničený na požadovaný celok a zachováva doterajšiu osnovu.
- Študentský obsah bude v slovenčine s formálnym vykaním.
- Kód a technické príklady zostanú v kontexte podkladu a budú označené ako platformovo špecifické.
- Nepotrebné testy ani zmeny mimo predmetu sa nepridávajú.

## Rozhodnutie o štruktúre

Nové stránky zostanú priamo v `05_Vypoctova_technika/` a budú pomenované číslom témy a ASCII názvom. Zoznam odkazov bude v `index.html`; stručný katalóg bude v `README.md`.
