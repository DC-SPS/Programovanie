# Research: course sections and lecture controls

## Existing course structure

- `05_Vypoctova_technika/index.html` is a static HTML course catalogue. It contains all 10 thematic units and 66 linked lesson topics, and loads `theme.js` plus the shared `course-overview.css`.
- `05_Vypoctova_technika/README.md` links to that catalogue and lists the existing lesson files.
- No module-specific `AGENTS.md` exists under `05_Vypoctova_technika/`; the repository and Python/C lesson conventions still apply to the shared layout work.
- Lesson files use encoded relative paths and shared scripts. The C lecture controls currently move and replace the top lesson clock body, then append a combined lesson/Pomodoro timer disclosure at the end of the side panel. That ordering conflicts with the requested layout.

## Decisions

1. Preserve the current catalogue as `teoreticka_cast.html` and keep all of its topic markup and lesson URLs. Change only its section title/navigation.
2. Reuse `index.html` as a short three-card entry page. Add `cvicenia.html` and `preskusanie.html` with the same theme and course navigation.
3. Align practical activities and self-check questions to the ten existing thematic units; use simulation, diagrams, and written design as alternatives to hardware.
4. Keep the existing `lesson-top.js` clock in the main lesson content. Make Pomodoro a separate first item in the `.lesson-side-panel`, with its own controls and durations, while leaving shared synchronization and speech controls intact.
5. Do not add dependencies, backend features, or an official grading scale.

## Source review

The referenced Vercel page could not be opened by the available web tool during planning. The local `05_Vypoctova_technika/index.html`, README, shared CSS, and shared C lecture controls are the source of truth for implementation. The numbered lesson list is already complete locally and will be retained verbatim on the theory page.
