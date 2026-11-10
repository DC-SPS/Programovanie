# Pokyny pre AI: ovládanie prednášok a stránok

Tieto pokyny používajte pri úprave prednášky alebo inej obsahovej stránky v tomto repozitári. Cieľom je zachovať jednotné ovládanie čítania, hodiny, Pomodoro a synchronizácie zariadení bez kopírovania ich implementácie do jednotlivých stránok.

## Pred úpravou

1. Prečítajte si koreňový `AGENTS.md`, `CONTRIBUTING.md` a pokyny `AGENTS.md` v dotknutom module.
2. Prezrite si stránku, ktorú upravujete, a porovnajte ju s existujúcimi prednáškami v tom istom module. Zachovajte jej obsah, tému, navigáciu a existujúce funkcie.
3. Skontrolujte, ktoré spoločné skripty stránka už načítava. V tomto projekte ovládanie poskytujú najmä `theme.js`, `lesson-voice.js`, `lesson-top.js`, `lecture-sync.js` a podľa modulu `c-lecture-controls.js`.
4. Načítajte si živú stránku alebo dostupné snímky obrazovky, ak používateľ určí referenčný vzhľad. Rozlíšte prehrávanie reči od časovača hodiny a synchronizácie zariadení; ide o samostatné funkcie v spoločnom paneli.

## Požadované ovládanie

Spoločný panel prednášky má podľa podpory príslušného modulu obsahovať:

- **Čítanie prednášky:** Prehrať, Zastaviť, Pozastaviť/Pokračovať a Prehrať znova. Tlačidlá majú správne odrážať stav prehrávania a pri nedostupnom rozhraní hlasu sa má zobraziť zrozumiteľný stav.
- **Nastavenia hlasu:** rýchlosť čítania, výber dostupného hlasu a hlasitosť čítania. Nastavenia, ktoré spoločný skript ukladá, ponechajte perzistentné. Ovládanie hlasitosti sa týka hlasu prednášky, nie hlasitosti zariadenia.
- **Hodiny a Pomodoro:** názov a kontext aktuálnej prednášky, čas a časové pásmo, spustenie/pozastavenie/vynulovanie 45-minútovej hodiny a ovládanie Pomodoro, ak ich modul poskytuje.
- **Synchronizácia zariadení:** predchádzajúca/nasledujúca časť, pripojenie alebo zdieľanie, stav pripojenia a QR kód, ak stránka načítava `lecture-sync.js`.

Na úzkych obrazovkách panel musí zostať použiteľný, nesmie zakrývať obsah ani horizontálne rozťahovať stránku. Pri tlači skryte iba interaktívne ovládacie prvky, nie obsah prednášky. Zachovajte ovládanie klávesnicou, viditeľný fokus, popisy prístupnosti a slovenčinu s formálnym vykaním v texte určenom žiakom.

## Implementačné pravidlá

- Uprednostnite existujúci spoločný skript a štýly. Nevkladajte ich kód znovu do HTML každej prednášky.
- Nevytvárajte duplicitný prehrávač v HTML. `lesson-voice.js` vytvorí prehrávač automaticky pre očíslované prednášky, keď stránka načíta `theme.js` alebo `lesson-top.js` a neobsahuje vlastný `.narration-controls`.
- Ak stránka obsahuje starý vlastný `.narration-controls`, overte, či tým neblokuje spoločný prehrávač. Pri migrácii odstráňte iba duplicitný blok prehrávania; existujúci panel synchronizácie, časovače a Pomodoro zachovajte.
- V Python module používajte `../lesson-top.js` pre HTML priamo v `01_Python/` a `../../lesson-top.js` pre HTML v jeho podpriečinkoch. Prehľad `index.html` je výnimka podľa `01_Python/AGENTS.md`.
- Zachovajte `lecture-sync.js` na stránkach, ktoré už poskytujú synchronizáciu. Jeho panel môže zdieľať kontajner `.lesson-side-panel` s prehrávačom.
- Zachovajte poradie načítania a deduplikáciu spoločných skriptov. Nevkladajte druhú inštanciu ovládania, ak ho stránka už vytvára dynamicky.
- Odkazy na lokálne skripty, štýly a obrázky musia byť relatívne k HTML súboru a musia viesť na existujúce súbory.
- Nevytvárajte ani neprepisujte screenshoty používateľa. Použite ich ako vizuálnu referenciu.

## Kontrola po úprave

1. Skontrolujte rozdiely a potvrďte, že sa nezmenil nesúvisiaci obsah prednášky.
2. Overte relatívne cesty a to, že stránka načítava len jednu inštanciu prehrávača, hodín a synchronizácie.
3. Ak je dostupný prehliadač, skontrolujte desktop aj úzky viewport: prehrávanie, zastavenie, pauzu/pokračovanie, opakovanie, výber hlasu, časovače a panel zariadení.
4. Pri kontrole cez prehliadač overte aj svetlú/tmavú tému a to, že obsah zostáva čitateľný bez prekrytia panelom.
5. Testy spúšťajte podľa požiadavky používateľa alebo existujúcich projektových pravidiel.
