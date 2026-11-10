# Implementation Plan: Rozloženie ovládania prednášky VYT

**Branch**: `016-vyt-lesson-layout` | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md)

## Summary
Upraviť zdieľané skripty tak, aby všetky VYT prednášky mali kompaktnú navigáciu, čitateľnú hlavičku hodiny a bočný panel so stabilným poradím a zjednotenými interakciami. Zachovať HTML obsahu, existujúce API, navigačné ciele a osem stránok so špecifickým C prehrávačom.

## Technical Context
**Language/Version**: JavaScript ES modules, HTML, CSS  
**Primary Dependencies**: `lecture-sync.js`, `lesson-top.js`, `lesson-pomodoro.js`, `lesson-voice.js`  
**Storage**: existujúce localStorage nastavenia hlasu a Pomodoro; Firebase RTDB pre synchronizáciu  
**Testing**: manuálna kontrola stavov a šírok 375/768/1024/1440 px; statická kontrola odkazov a syntaxe  
**Target Platform**: moderné desktopové a mobilné prehliadače  
**Project Type**: statický vzdelávací web  
**Constraints**: zachovať selektory/API synchronizácie; bez novej závislosti; prístupnosť a formálne vykanie

## Constitution Check
- Obsah prednášok sa nemení: PASS.
- Zdieľané ovládanie sa mení v spoločných skriptoch: PASS.
- Interné odkazy a dáta zostávajú nedotknuté: kontrola pred dokončením.
- Rozloženie a stavy sa kontrolujú pri štyroch žiadaných šírkach: podľa dostupnosti prehliadača.

## Design Direction
- **Účel**: rýchle opakované ovládanie počas vyučovacej hodiny.
- **Používatelia**: žiaci a vyučujúci, ktorí potrebujú okamžite nájsť hodiny, sekcie, Pomodoro, pripojenie a čítanie.
- **Tón**: pokojný, technický, úsporný; obsah prednášky je vizuálne dominantný.
- **Hierarchia**: kompaktná navigácia → hlavička hodiny → hlavný obsah; v paneli sekcie → Pomodoro → zariadenie → hlas.
- **Cieľové viewporty**: 375, 768, 1024, 1440 px; nízka výška okna musí ponechať panel posúvateľný.

## Project Structure
- `lecture-sync.js`: rozloženie tela, sekčná navigácia a správa pripojenia
- `lesson-top.js`: hlavička hodiny, názov/stav a ovládanie odpočtu
- `lesson-pomodoro.js`: hlavná akcia, stav a zbalené nastavenia Pomodoro
- `lesson-voice.js`: meniaca sa hlavná akcia čítania a sekundárne akcie
- `specs/016-vyt-lesson-layout/`: špecifikácia, plán a úlohy

## Risks
- Osem stránok C používa vlastný prehrávač; spoločné vizuálne poradie ich nesmie zdvojiť ani meniť ich API.
- Synchronizácia môže byť neprihlásená/offline; stav pripojenia zostane viditeľný a obnoviteľný.
- Ak prehliadač nie je dostupný, vizuálne overenie sa musí označiť ako neuskutočnené, nie úspešné.
