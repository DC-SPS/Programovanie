# Tasks: Course sections and focused lecture controls

**Input**: Design documents in `specs/014-course-sections/`

**Prerequisites**: `plan.md`, `spec.md`, and `research.md` are complete.

## Phase 1: Course chooser and theory catalogue (US1, P1)

- [x] T001 Preserve the existing 10-unit course catalogue as `05_Vypoctova_technika/teoreticka_cast.html` without dropping existing lesson entries or links.
- [x] T002 Replace `05_Vypoctova_technika/index.html` with a three-card chooser for theory, exercises, and assessment.
- [x] T003 Add consistent section navigation and return links among the chooser, theory, exercise, and assessment pages.

## Phase 2: Practice and assessment content (US2, P2)

- [x] T004 Create `05_Vypoctova_technika/cvicenia.html` with practical tasks, outputs, and self-check cues for each of the ten thematic units.
- [x] T005 Create `05_Vypoctova_technika/preskusanie.html` with review questions and answer-reveal guidance for each of the ten units; identify it as self-study preparation.
- [x] T006 Update `05_Vypoctova_technika/README.md` to describe and link the three sections.

## Phase 3: Lesson and Pomodoro layout (US3, P3)

- [x] T007 Keep `lesson-top.js`'s lesson clock at the top of the lesson content and remove the duplicate lesson timer currently created by `c-lecture-controls.js`.
- [x] T008 Add independent Pomodoro start, pause/resume, reset, work/rest duration controls, automatic phase changes, and announcements in `02_C/00_Prostredie_a_struktura_programu/c-lecture-controls.js`.
- [x] T009 Ensure Pomodoro appears before speech and synchronization controls in the side panel.
- [x] T010 Update `LAYOUTS_OVLADANIE.md` with the clock/Pomodoro order and requirements to preserve the main lesson header.

## Phase 4: Review

- [x] T011 Review changed files and verify all internal links, including encoded lesson links on the theory page.
- [x] T012 Check the changed JavaScript syntax and `git diff --check`; review that no unrelated user files are staged.
