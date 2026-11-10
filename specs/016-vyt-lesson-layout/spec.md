# Feature Specification: Rozloženie ovládania prednášky VYT

**Feature Branch**: `016-vyt-lesson-layout`  
**Created**: 2026-11-10  
**Status**: In progress  
**Input**: Optimalizovať hornú navigáciu, priebeh hodiny a bočný panel podľa používateľského zadania; zachovať obsah a existujúce správanie ovládania.

## User Scenarios & Testing

### User Story 1 - Rýchla orientácia v prednáške (Priority: P1)
Žiak otvorí očíslovanú prednášku, vidí kompaktnú hornú navigáciu, názov a stav hodiny a nájde všetky ovládacie prvky bez zakrývania obsahu.

**Why this priority**: Ide o prvú obrazovku, ktorú žiak používa počas hodiny; preplnenie a prázdne plochy spomaľujú orientáciu.

**Independent Test**: Skontrolovať prednášku pri šírkach 375, 768, 1024 a 1440 px; navigácia a názov sa nesmú prekrývať.

**Acceptance Scenarios**:
1. **Given** prednáška na širokom displeji, **When** sa načíta, **Then** navigácia je vysoká približne 56–64 px a panel hodiny je čitateľný bez dekoratívneho pozadia.
2. **Given** úzky displej, **When** sa zúži viewport, **Then** navigácia a ovládanie sa zalomia alebo preskladajú bez horizontálneho posúvania.

### User Story 2 - Ovládanie času a čítania (Priority: P1)
Žiak vie spustiť, pozastaviť, pokračovať a vynulovať hodiny, Pomodoro aj hlasové čítanie; každý stav je oznámený textom.

**Independent Test**: Prejsť stavy hodiny, Pomodoro a čítania; skontrolovať popisy tlačidiel a stavové hlásenia.

**Acceptance Scenarios**:
1. **Given** pripravený časovač, **When** sa spustí alebo pozastaví, **Then** sa zmení jedna hlavná akcia aj viditeľný stav.
2. **Given** čítanie nahlas, **When** sa spustí, pozastaví, obnoví alebo zastaví, **Then** jedna hlavná akcia vyjadruje dostupný krok a ostatné akcie sú sekundárne.

### User Story 3 - Navigácia v sekciách a pripojenie (Priority: P2)
Žiak prejde na predchádzajúcu/nasledujúcu sekciu a spravuje pripojenie zariadenia bez toho, aby QR alebo technické nastavenia zahltili panel.

**Independent Test**: Otestovať prvú, strednú a poslednú sekciu, neprihlásený a pripojený stav, QR aj kopírovanie párovacieho odkazu.

**Acceptance Scenarios**:
1. **Given** prvá alebo posledná sekcia, **When** sa zobrazí navigácia, **Then** nedostupné tlačidlo je deaktivované a počet sekcií je správny.
2. **Given** pripojenie zariadenia, **When** panel nie je rozbalený, **Then** stav zostáva viditeľný a QR kód je zbalený; po rozbalení je dostupný QR aj kopírovanie odkazu.

## Requirements

### Functional Requirements
- **FR-001**: Horná navigácia MUST zaberať približne 56–64 px, ponechať názov kurzu vľavo a ostatné odkazy vpravo bez pretekania.
- **FR-002**: Panel hodiny MUST zobrazovať názov, stav ako textový štítok, výrazný zostávajúci čas a utlmený aktuálny čas/dátum.
- **FR-003**: Hodiny MUST zachovať odpočet a udalosti; akcie sa pomenujú „Pozastaviť hodinu“ a „Vynulovať čas“.
- **FR-004**: Bočný panel MUST mať šírku 280–320 px na širokých displejoch a zoskupenie navigácia, Pomodoro, zariadenie, čítanie.
- **FR-005**: Pomodoro MUST mať veľký čas, textový režim, jednu hlavnú akciu, sekundárne vynulovanie a zbalené nastavenia intervalov.
- **FR-006**: Navigácia MUST zobrazovať predchádzajúcu/nasledujúcu sekciu a čítať stav „Sekcia x z n“; na hraniciach deaktivuje nedostupnú akciu.
- **FR-007**: Pripojenie MUST ukazovať zrozumiteľný stav, ponechať technické voľby pod „Spravovať pripojenie“ a predvolene zbaliť QR.
- **FR-008**: Čítanie MUST používať jednu meniacu sa hlavnú akciu a ponechať zastavenie, opakovanie aj zbalené nastavenia hlasu.
- **FR-009**: Na šírkach 375, 768, 1024 a 1440 px MUST nevzniknúť horizontálne posúvanie, prekrytie ani neprístupné prvky pri nízkej výške okna.
- **FR-010**: MUST zostať funkčné existujúce odkazy, hlasové nastavenia, synchronizácia, QR, navigácia a časovače.
- **FR-011**: Text ovládania MUST mať aspoň 14 px, interaktívne ciele aspoň 44×44 px, viditeľný fokus a stav dostupný bez spoliehania sa na farbu.

## Success Criteria
- **SC-001**: Všetky štyri šírky cieľového viewportu sa zmestia bez horizontálneho posúvania a prekrytia ovládania.
- **SC-002**: Hodiny, Pomodoro a čítanie ponúkajú zrozumiteľný stav a správnu dostupnú akciu v každom stave.
- **SC-003**: Navigácia je správne deaktivovaná na začiatku a konci prednášky a zobrazuje aktuálny počet sekcií.
- **SC-004**: Obsah prednášky aj všetky doterajšie navigačné ciele zostávajú zachované.

## Assumptions
- Rozsahom je všetkých 66 očíslovaných prednášok VYT, ktoré zdieľajú koreňové ovládacie skripty.
- Osem prednášok s `c-lecture-controls.js` zachová svoj vlastný prehrávač a Pomodoro; úpravy spoločného štýlu sa na ne aplikujú iba tam, kde neporušia ich identifikátory/API.
- Synchronizácia zostáva obmedzená existujúcim Firebase účtom a API; ak zdieľanie nie je dostupné, UI musí stav jasne oznámiť.
