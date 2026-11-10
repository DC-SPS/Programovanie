# Feature Specification: Course sections and focused lecture controls

**Feature Branch**: `014-course-sections`

**Created**: 2026-11-10

**Status**: Draft

**Input**: Split the Výpočtová technika course into a landing page with Teoretická časť, Cvičenia and Preskúšanie. Move the current topic overview into the theory page. Keep the lesson header and put Pomodoro first in the lecture controls.

## User Scenarios & Testing

### User Story 1 - Find each course section (Priority: P1)

A student opens the Výpočtová technika course and can choose the theory catalogue, practical exercises, or exam preparation. The existing 10-unit, 66-topic overview remains available under Teoretická časť.

**Why this priority**: The requested restructure must retain all existing theory links while making the three purposes clear.

**Independent Test**: Open the course index, follow each of its three links, and confirm the theory page contains all existing course topics and each link still opens its lesson.

**Acceptance Scenarios**:

1. **Given** the course index, **When** a student selects Teoretická časť, **Then** the existing 10 thematic units and 66 theory topics are available.
2. **Given** any one of the three section pages, **When** a student selects the course index, **Then** the student returns to the three-section chooser.
3. **Given** the theory page, **When** a student uses course navigation, **Then** links to Cvičenia, Preskúšanie and all courses remain available.

### User Story 2 - Practise and prepare for assessment (Priority: P2)

A student can use a practical exercise page aligned to the ten course units, then use an assessment page to review knowledge and prepare for an oral or practical check.

**Why this priority**: These are the two new course sections requested by the user.

**Independent Test**: Open both pages and confirm that every course unit has a relevant exercise and review prompts with self-check guidance.

**Acceptance Scenarios**:

1. **Given** the exercises page, **When** a student selects a thematic unit, **Then** they see a practical task, a concrete output to produce, and a way to check it.
2. **Given** the assessment page, **When** a student prepares for a check, **Then** they can review questions and reveal concise answer guidance.
3. **Given** an exercise or assessment activity, **When** the student has no physical hardware, **Then** the page identifies simulation, diagrams, or written design as a valid way to practise.

### User Story 3 - Keep the lesson context and surface Pomodoro (Priority: P3)

A student sees the existing lesson header and 45-minute lesson timer at the top of the lesson page. The Pomodoro readout and its controls appear first in the side panel.

**Why this priority**: The user asked to preserve the top-of-lesson display and move Pomodoro from the end of the controls to the beginning.

**Independent Test**: Open a lesson that loads `c-lecture-controls.js`, confirm its lesson clock remains at the top of the main content, and confirm Pomodoro is the first side-panel control and starts, pauses, resets, and switches work/rest phases.

**Acceptance Scenarios**:

1. **Given** a lesson with the shared clock, **When** the page loads, **Then** its title, current time, 45-minute display, and lesson controls remain at the top of the lesson.
2. **Given** the side panel, **When** it renders, **Then** Pomodoro is the first item before playback and device synchronization controls.
3. **Given** a running Pomodoro, **When** the work or rest duration ends, **Then** it switches phase and announces the new duration.

### Edge Cases

- The theory page must keep working when opened directly, not only through the new index.
- Links with spaces and Slovak characters in lesson filenames must keep their percent-encoded relative URLs.
- The side panel may be shorter than its content; Pomodoro must remain at its top while the remaining controls can scroll.
- At narrow widths the course overview and section pages must remain readable and retain course navigation.
- Student-facing instructions must use Slovak formal address; assessment guidance must not invent an official grading scale.

## Requirements

### Functional Requirements

- **FR-001**: The course `index.html` MUST present three distinct destinations: Teoretická časť, Cvičenia, and Preskúšanie.
- **FR-002**: The existing course overview MUST be moved to a dedicated theory subpage without dropping any of its ten thematic units or existing lesson links.
- **FR-003**: The theory, exercises, and assessment pages MUST provide navigation back to the course index and to the other two sections.
- **FR-004**: The exercises page MUST contain practical activities aligned to all ten thematic units and state an expected output or check for each activity.
- **FR-005**: The assessment page MUST contain review questions aligned to all ten thematic units, reveal self-check guidance, and identify the page as preparation rather than an official grading policy.
- **FR-006**: Course and lesson navigation MUST use valid relative URLs for the repository's static-site structure.
- **FR-007**: On lessons using `c-lecture-controls.js`, the existing lesson header and 45-minute timer MUST remain in the main lesson area.
- **FR-008**: On those lessons, Pomodoro MUST be the first side-panel control and MUST provide independent start, pause/resume, reset, duration adjustment, and automatic work/rest phase changes.
- **FR-009**: The pages MUST retain the course's light/dark theme support, keyboard focus indicators, responsive layout, and formal Slovak student-facing instructions.

### Key Entities

- **Course section**: One of theory, exercises, or assessment; each has a destination page and return links.
- **Exercise**: A practical task associated with a thematic unit, with an output and self-check.
- **Assessment prompt**: A review question associated with a thematic unit and hidden answer guidance.
- **Pomodoro phase**: Work or rest interval with an adjustable duration and timer state.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 66 existing lesson entries remain reachable from the theory page.
- **SC-002**: The course index exposes all three requested sections without requiring a student to search the theory catalogue.
- **SC-003**: Each of the ten thematic units has at least one exercise and at least one assessment prompt.
- **SC-004**: In supported lessons the top lesson clock remains visible in the main content and Pomodoro is the first side-panel component.
- **SC-005**: Changed internal links resolve to files in the repository.

## Assumptions

- The existing `05_Vypoctova_technika/index.html` is the current theory catalogue and will become `teoreticka_cast.html`; `index.html` will become a section chooser.
- `cvicenia.html` and `preskusanie.html` are suitable filenames under repository naming conventions.
- Assessment material is self-study preparation; official grading weights and school-specific rules are intentionally out of scope.
- The existing shared clock and side-panel JavaScript remain the source of behavior; no new framework is introduced.
