# Implementation Plan: Course sections and focused lecture controls

**Branch**: `014-course-sections` | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/014-course-sections/spec.md`

## Summary

Turn the current 05 course index into a three-part chooser, move its complete ten-unit theory catalogue to `teoreticka_cast.html`, add aligned `cvicenia.html` and `preskusanie.html` pages, and reorder the shared lecture controls so the original lesson clock stays in the main page while an independent Pomodoro panel appears first in the side panel.

## Technical Context

**Language/Version**: HTML5, CSS, vanilla JavaScript (existing repository conventions)

**Primary Dependencies**: Existing `theme.js`, `course-overview.css`, `lesson-top.js`, `c-lecture-controls.js`, and `lecture-sync.js`; no new dependency

**Storage**: Browser local storage only where already used by shared preferences; Pomodoro may remain per-page in-memory state

**Testing**: Verify internal relative links, preserve all existing 66 theory links, check changed JavaScript syntax, and inspect relevant diffs. No new test suite is requested.

**Target Platform**: Static site hosted on Vercel; desktop and narrow/mobile browser layouts

**Project Type**: Static educational website

**Performance Goals**: No additional network requests beyond local static assets; controls render with existing page scripts

**Constraints**: Slovak student-facing text with formal address; preserve current lesson content and theme; no invented official assessment policy; all repository links relative to the page

**Scale/Scope**: Three section pages in `05_Vypoctova_technika/`, README navigation, and shared C lecture control ordering

## Constitution Check

- **I. Clear and ordered instruction**: Exercises and review prompts follow the course's ten existing thematic units. Pass.
- **II. Respect local structure**: Existing catalogue is preserved under a theory filename; new files use ASCII filenames and existing course style. Pass.
- **III. Accuracy**: Exercise tasks use the curriculum already present; self-check answers are concise and avoid unsupported hardware assumptions. Pass.
- **IV. Bounded, reviewable changes**: Scope is limited to the requested course pages, navigation, and timer ordering. Pass.
- **Accessibility**: Use semantic headings, visible links, native `details` for answer reveal, labels, keyboard focus styles, responsive CSS, and reduced-motion compatibility. Pass.

## Project Structure

### Documentation

```text
specs/014-course-sections/
├── spec.md
├── plan.md
├── research.md
└── tasks.md
```

### Source Code

```text
05_Vypoctova_technika/
├── index.html                 # New chooser for three course parts
├── teoreticka_cast.html       # Existing 10-unit / 66-topic catalogue
├── cvicenia.html              # Practical activities aligned to all 10 units
├── preskusanie.html           # Self-check and assessment preparation
└── README.md                  # Course entry links

02_C/00_Prostredie_a_struktura_programu/
└── c-lecture-controls.js      # Keep top lesson clock; make Pomodoro a first side-panel item
```

**Structure Decision**: Retain the static HTML architecture and existing shared scripts. Use semantic HTML and the shared course theme rather than introducing a framework or generated content system.

## Implementation Sequence

1. Review the spec, map current catalogue links, and preserve the original overview as the theory page.
2. Replace the course index with three section cards and add consistent section navigation.
3. Add practical tasks and answer-reveal self-check questions, each aligned to the ten course units.
4. Refactor the shared C lecture controls: leave the lesson clock at the top, add independent Pomodoro start/pause/reset and duration controls, and put Pomodoro first in the side panel.
5. Update course README and layout guidance. Review changed HTML/JS, confirm links, and check the final diff.

## Complexity Tracking

No constitution violations or additional infrastructure are required.