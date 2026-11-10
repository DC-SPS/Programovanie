# Tasks: Rozloženie ovládania prednášky VYT

**Input**: [spec.md](spec.md), [plan.md](plan.md)

## Phase 1: Rozloženie a navigácia
- [x] T001 [US1] Upraviť grid, hornú navigáciu a bočný panel v `lecture-sync.js`.
- [x] T002 [US3] Oddeliť sekčnú navigáciu od správy pripojenia a doplniť hraničné stavy v `lecture-sync.js`.
- [x] T003 [US3] Zbaliť pripojenie a QR; pridať kopírovanie párovacieho odkazu v `lecture-sync.js`.

## Phase 2: Časovače a čítanie
- [x] T004 [US1] Vylepšiť hierarchiu, stavový štítok a akcie hodiny v `lesson-top.js`.
- [x] T005 [US2] Zjednotiť Pomodoro na jednu stavovú akciu a zbalené nastavenia v `lesson-pomodoro.js`.
- [x] T006 [US2] Zjednotiť hlasové čítanie na jednu stavovú akciu v `lesson-voice.js`.
- [x] T007 [US1] Zabezpečiť pevné poradie bočného panela aj pri C prehrávači v `02_C/00_Prostredie_a_struktura_programu/c-lecture-controls.js` ak bude potrebné.

## Phase 3: Kontrola
- [ ] T008 Overiť syntax, odkazy, duplicity a stavy časovačov/navigácie.
- [ ] T009 Zobraziť šírky 375, 768, 1024 a 1440 px; uložiť iba naše dôkazy, nie screenshoty používateľa.
- [ ] T010 Overiť focus, klávesnicu, veľkosť textu a cieľové plochy.

## Nevykonané overenia

- T008 (stavy), T009 (šírky 375/768/1024/1440) a T010 (klávesnica/focus) ostávajú otvorené. Chrome DevTools nemá v tomto prostredí nainštalovaný Chrome; vizuálny dôkaz preto nevznikol.
