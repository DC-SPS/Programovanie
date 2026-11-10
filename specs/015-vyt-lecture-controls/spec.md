# Feature Specification: Jednotné ovládanie prednášok VYT

**Feature Branch**: `015-vyt-lecture-controls`  
**Created**: 2026-11-10  
**Status**: Complete  
**Input**: Použiť pravidlá z `LAYOUTS_OVLADANIE.md` na všetky prednášky a podstránky kurzu Výpočtová technika.

## User Scenarios & Testing

### User Story 1 - Ovládanie každej prednášky (Priority: P1)
Žiak otvorí ľubovoľnú očíslovanú prednášku v kurze VYT a nájde jednotné ovládanie hlasového čítania a návratové odkazy.

**Why this priority**: Bez jednotného ovládania sa pravidlá kurzu uplatňujú len na niektoré stránky.

**Independent Test**: Otvoriť ľubovoľnú stránku z každej z 10 tematických oblastí a overiť prehrávanie, zastavenie, pauzu, opakovanie, hlas a odkazy.

**Acceptance Scenarios**:
1. **Given** očíslovaná prednáška, **When** stránka sa načíta, **Then** zobrazí sa jediný prehrávač a odkazy na prehľad kurzu aj všetky kurzy.
2. **Given** prehrávač, **When** sa zmení hlas alebo rýchlosť, **Then** nastavenie sa použije a zostane uložené.

### User Story 2 - Hodina a Pomodoro (Priority: P1)
Žiak sleduje čas hodiny v hlavičke a samostatne ovláda cyklus práce a oddychu v bočnom paneli.

**Independent Test**: Spustiť, pozastaviť/pokračovať a vynulovať oba časovače a meniť dĺžku práce/oddychu.

**Acceptance Scenarios**:
1. **Given** očíslovaná prednáška, **When** sa načíta, **Then** hodiny sú hore v obsahu a Pomodoro je prvé v bočnom paneli.
2. **Given** oba časovače, **When** sa spustí jeden, **Then** druhý pokračuje nezávisle.

### User Story 3 - Navigácia a synchronizácia (Priority: P2)
Žiak prejde na susednú sekciu alebo synchronizuje čítanie medzi zariadeniami; prehľadové podstránky ponúkajú navigáciu medzi časťami kurzu.

**Independent Test**: Skontrolovať odkazy z každej prehľadovej stránky a ovládacie prvky synchronizácie na prednáške.

**Acceptance Scenarios**:
1. **Given** prednáška, **When** sa zobrazí panel, **Then** obsahuje navigáciu, stav, zdieľanie a QR ovládanie synchronizácie.
2. **Given** podstránka Teória/Cvičenia/Preskúšanie, **When** sa načíta, **Then** navigácia zostáva funkčná bez zavádzajúcich hodín prednášky.

### Edge Cases
- Ak prehliadač nepodporuje hlas, ovládanie oznámi dôvod a zvyšok stránky zostane dostupný.
- Ak úložisko alebo hlasové hlasy nie sú dostupné, prehrávač použije bezpečné predvolené nastavenia.
- Na úzkom displeji nesmie panel prekryť obsah ani spôsobiť horizontálne posúvanie.

## Requirements

### Functional Requirements
- **FR-001**: Všetky očíslované prednášky VYT MUST načítať spoločné ovládanie čítania a hodín.
- **FR-002**: Každá prednáška MUST ponúknuť prehratie, zastavenie, pauzu/pokračovanie, opakovanie a nastavenia hlasu.
- **FR-003**: Každá prednáška MUST mať hodiny v hornej časti obsahu a samostatné Pomodoro ako prvý prvok bočného panela.
- **FR-004**: Každá prednáška MUST ponúknuť odkazy na prehľad kurzu a všetky kurzy, ako aj synchronizáciu zariadení.
- **FR-005**: Odkazy na sekcie z prednášok MUST smerovať na existujúcu stránku teoretickej časti.
- **FR-006**: Prehľadové stránky Teória, Cvičenia a Preskúšanie MUST zachovať navigáciu medzi kurzami a časťami bez hodín určených pre prednášku.
- **FR-007**: Rozhranie MUST podporovať klávesnicu, čitateľné stavové hlásenia, úzky viewport a tlač bez ovládacích prvkov.

## Success Criteria
- **SC-001**: Všetkých 66 očíslovaných prednášok načíta presne jednu sadu spoločných ovládacích skriptov.
- **SC-002**: Všetky interné odkazy na tematické kotvy smerujú na existujúcu stránku teoretickej časti.
- **SC-003**: V každej prednáške sú prítomné hodiny, Pomodoro, čítanie, navigácia a synchronizácia.

## Assumptions
- Kurz tvorí 66 očíslovaných prednášok a samostatné výberové/prezentačné stránky.
- Spoločné skripty zostanú v koreňovom adresári; stránky VYT sú priamo v adresári modulu.
- Synchronizácia používa existujúce Firebase nastavenie a obmedzenia projektu.
