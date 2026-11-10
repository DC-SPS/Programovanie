# Implementation Plan: Jednotné ovládanie prednášok VYT

**Branch**: `015-vyt-lecture-controls` | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md)

## Summary
Doplniť chýbajúce zdieľané ovládanie do všetkých 66 očíslovaných prednášok VYT. Znovu použiť prehrávač, hodiny a synchronizáciu v koreňových skriptoch; pridať samostatný opakovane použiteľný Pomodoro skript. Opraviť návratové kotvy teórie. Výberové stránky ponechať ako navigáciu bez hodín prednášky.

## Technical Context
**Language/Version**: JavaScript ES modules, HTML, CSS  
**Primary Dependencies**: existujúce `theme.js`, `lesson-voice.js`, `lesson-top.js`, `lecture-sync.js`, Firebase konfigurácia  
**Storage**: localStorage iba pre nastavenia Pomodoro  
**Testing**: statická kontrola ciest, počtov a diffu; bez testov na výslovnú požiadavku  
**Target Platform**: moderné desktopové a mobilné prehliadače  
**Project Type**: statický vzdelávací web  
**Constraints**: relatívne cesty; nezdvojovať ovládanie; slovenčina a formálne vykanie; ovládanie klávesnicou

## Constitution Check
- Zachovať obsah a členenie existujúcich prednášok: PASS.
- Opakované ovládanie implementovať v zdieľaných skriptoch: PASS.
- Relatívne cesty a prístupnosť: kontrola pri implementácii.
- Zmena je ohraničená na sekciu VYT a nevyžaduje zásah do obsahu osnovy: PASS.

## Design
- Každá očíslovaná VYT stránka načíta `lesson-top.js`, `lesson-pomodoro.js` a `lecture-sync.js`; `theme.js` zabezpečí automatický prehrávač.
- `lesson-pomodoro.js` vytvorí alebo použije spoločný bočný panel a cez CSS `order` ponechá Pomodoro pred ostatným ovládaním.
- Rozhranie čítania sprístupní existujúcemu synchronizačnému skriptu API kompatibilné s `window.lessonSpeechRemote`.
- Navigačné odkazy v synchronizačnom paneli sa zostavia relatívne voči stránke.
- Odkazy na tematické kotvy sa zmenia z výberového `index.html` na `teoreticka_cast.html`.

## Project Structure
- Root shared scripts: `lesson-voice.js`, `lesson-top.js`, `lesson-pomodoro.js`, `lecture-sync.js`
- Module pages: `05_Vypoctova_technika/*.html`
- Feature docs: `specs/015-vyt-lecture-controls/`

## Risks
- Synchronizácia závisí od Firebase a prihlásenia; lokálne dostupné sú ovládacie prvky aj bez spojenia.
- Existujúce skripty vytvárajú panel dynamicky, preto sa poradie určí explicitne CSS a overí sa v kóde.
