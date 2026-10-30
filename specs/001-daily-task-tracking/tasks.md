---

description: "Dependency-ordered implementation tasks for Daily Task Tracking"

---

# Tasks: Daily Task Tracking

**Input**: Design documents from `/specs/001-daily-task-tracking/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui.md`, `quickstart.md`

**Tests**: Test tasks are required by the constitution: use Red-Green-Refactor, unit-test business logic, and provide acceptance coverage for every user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Tasks touch different files and can run in parallel after prerequisites.
- **[Story]**: US1 = Create and find tasks, US2 = Review and manage a task, US3 = Return to saved tasks.
- Every task uses the checkbox/ID format, includes its file path, and maps to a story when in a user-story phase. Tests MUST be run and shown failing before the production changes they require.

## Phase 1: Setup

**Purpose**: Initialize the client-side JavaScript project and browser test tooling.

- [X] T001 Create `package.json` with ES-module mode, Vite development/build scripts, `node --test` unit-test script, Playwright acceptance-test script, and Vite plus `@playwright/test` development dependencies.
- [X] T002 Generate `package-lock.json` by installing the dependencies declared in `package.json`.
- [X] T003 [P] Create `index.html` with the application mount point and a neutral placeholder title, and configure `vite.config.js` to serve and build the static browser application.
- [X] T004 [P] Configure Chromium browser acceptance-test discovery and execution in `playwright.config.js`.

## Phase 2: Foundational

**Purpose**: Establish the persistence boundary required by all user stories.

- [X] T005 Document the replaceable `TaskStore` JSDoc interface with `loadTasks` and `saveTasks` methods in `src/persistence/task-store.js`; UI modules MUST NOT access storage directly.

**Checkpoint**: Project scripts and the UI-to-logic-to-persistence boundary are ready; no task behavior is implemented yet.

## Phase 3: User Story 1 - Create and find tasks (Priority: P1) 🎯 MVP

**Goal**: Create pending tasks and find them in a newest-first list using completion filters.

**Independent Test**: Add valid tasks with and without descriptions, including duplicate titles; verify validation, order, visible status, all three filters, empty states, list identity, and save-error recovery.

### Tests for User Story 1

- [X] T006 [P] [US1] Write and run failing unit tests for task creation, trimmed non-empty titles, allowed duplicate titles, pending initial status, ISO 8601 `createdAt`, newest-first sorting with stable ordering for equal timestamps, and All/Pending/Done filtering in `tests/unit/task-service.test.js`.
- [X] T007 [P] [US1] Write and run failing unit tests for JSON task serialization and explicit storage-write failure propagation in `tests/unit/local-storage-task-store.test.js`.
- [X] T008 [P] [US1] Write and run failing browser acceptance scenarios for task creation, blank-title validation, duplicate titles, list order, filters, done styling, empty states, browser-tab/header title, retained form values after save failure, and timed task entry under 30 seconds per SC-001 in `tests/acceptance/create-and-filter-tasks.spec.js`.

### Implementation for User Story 1

- [X] T009 [US1] Implement task creation, title validation and trimming, duplicate-title support, pending status, ISO 8601 `createdAt`, newest-first ordering with stable relative order for equal timestamps, and All/Pending/Done filtering in `src/application/task-service.js`; make T006 pass.
- [X] T010 [US1] Implement the `localStorage` task-store write adapter with JSON serialization and surfaced write errors in `src/persistence/local-storage-task-store.js`; make T007 pass.
- [X] T011 [US1] Implement the shared add-task form with labeled title/description fields, whitespace-only title validation, and save-failure feedback that retains entered values and allows retry in `src/ui/task-form.js`; make the corresponding T008 scenarios pass.
- [X] T012 [US1] Implement newest-first task rows, status indicators, Done styling, All/Pending/Done filters, active-filter styling, task selection, and friendly empty states in `src/ui/task-list-view.js`; make the corresponding T008 scenarios pass.
- [X] T013 [US1] Set the Curso-PSWE-07 browser-tab title in `index.html`, connect the task service, task store, add form, and list view in `src/main.js`, and implement the light responsive list layout, 44-by-44-pixel controls, and contrast-compliant styles in `src/styles.css`; make the remaining T008 scenarios pass.
- [X] T014 [US1] Add a timed acceptance check to `specs/001-daily-task-tracking/quickstart.md`: time a tester adding a valid task with an optional description, record the elapsed time, and verify it appears in the list in under 30 seconds as required by SC-001.

**Checkpoint**: User Story 1 works independently; run its unit and browser acceptance tests before continuing.

## Phase 4: User Story 2 - Review and manage a task (Priority: P2)

**Goal**: Inspect, edit, complete, restore, and confirm deletion of an individual task.

**Independent Test**: Open a task, verify detail fields and status, save and cancel edits, switch status both ways, and test both outcomes of delete confirmation plus persistence-failure recovery.

### Tests for User Story 2

- [X] T015 [P] [US2] Write and run failing unit tests for task editing, pending/done transitions, deletion, and preserving the last saved state when an update or delete write fails in `tests/unit/task-service.test.js`.
- [X] T016 [P] [US2] Write and run failing browser acceptance scenarios for task detail, empty-description text, edit/save/cancel/validation, both status-action labels, active-filter membership, warning-colored delete confirmation, and failed-write recovery in `tests/acceptance/manage-task.spec.js`; assert that edit/save uses no more than three actions, status change no more than three actions, and opening delete confirmation no more than three actions from detail, excluding text entry and confirmation response, as required by SC-004.

### Implementation for User Story 2

- [X] T017 [US2] Implement edit, status-change, and delete operations so each persistence write succeeds before in-memory state changes in `src/application/task-service.js`; make T015 pass.
- [X] T018 [US2] Extend the shared form for edit mode with populated values, Save and Cancel actions, and unchanged saved data on cancel or failed save in `src/ui/task-form.js`; make the relevant T016 scenarios pass.
- [X] T019 [US2] Implement task detail with back navigation, title, description or muted “No description,” Done/Pending label, Edit, status-change, and confirmed Delete actions in `src/ui/task-detail-view.js`; make the relevant T016 scenarios pass.
- [X] T020 [US2] Connect list selection, detail, edit, and return navigation in `src/main.js`, and style the detail actions including a distinct warning color for Delete in `src/styles.css`; make the remaining T016 scenarios pass.
- [X] T021 [US2] Add a manual action-count check for edit, status change, and delete initiation to `specs/001-daily-task-tracking/quickstart.md`, applying the SC-004 exclusions for text entry and confirmation response.

**Checkpoint**: User Stories 1 and 2 work; run their unit and browser acceptance tests before continuing.

## Phase 5: User Story 3 - Return to saved tasks (Priority: P3)

**Goal**: Restore saved tasks and their statuses after reloading or reopening the browser app.

**Independent Test**: Create, edit, and complete tasks, reload the same browser origin, and verify all non-deleted task data remains; confirm a deleted task stays absent and an unreadable saved collection is not shown as empty or overwritten.

### Tests for User Story 3

- [X] T022 [P] [US3] Write and run a failing browser acceptance test that creates and modifies tasks, reloads the application, verifies saved fields/statuses/order and confirmed deletion, then simulates a saved-task read failure and verifies an error, preserved data, and retry instead of an empty list in `tests/acceptance/persist-tasks.spec.js`.
- [X] T023 [P] [US3] Write and run failing unit tests for loading serialized tasks, an empty collection, storage-read failures, and malformed stored data without overwriting the original value in `tests/unit/local-storage-task-store.test.js`.
- [X] T023a [US3] Write and run a failing unit test for task-service initialization from loaded tasks, preserving task identity and newest-first ordering in `tests/unit/task-service.test.js`.

### Implementation for User Story 3

- [X] T024 [US3] Implement `loadTasks` using the task-store contract, JSON parsing, and explicit error propagation for unavailable or malformed stored data without modifying the saved value in `src/persistence/local-storage-task-store.js`; make T023 pass.
- [X] T025 [US3] Implement task-service initialization from loaded tasks while preserving task identity and newest-first ordering in `src/application/task-service.js`.
- [X] T026 [US3] Load saved tasks before first rendering in `src/main.js`; on read failure show an error instead of an empty list, leave saved data unchanged, and allow retry; make T022 pass.

**Checkpoint**: All three user stories work independently; run their complete unit and browser acceptance suites.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate accessibility and responsive requirements while maintaining Red-Green-Refactor.

- [X] T027 [P] Write and run failing browser checks for no horizontal scrolling and usable primary controls at 320, 768, and 1440 CSS pixels, 44-by-44-pixel interactive targets, and required text contrast in `tests/acceptance/responsive-accessibility.spec.js`; confirm the checks fail against the current implementation before changing production styles.
- [X] T028 Refine responsive reflow and verify contrast, type hierarchy, whitespace, and interactive target dimensions against FR-015 through FR-018 in `src/styles.css`; make T027 pass.
- [X] T029 Run unit tests, all browser acceptance tests, the production build, timed SC-001 and action-count SC-004 checks, and the manual smoke steps in `specs/001-daily-task-tracking/quickstart.md`; resolve failures in the relevant files.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No source-code dependencies; complete before executing tests.
- **Foundational (Phase 2)**: Depends on Setup; the store boundary blocks feature implementation.
- **User Stories (Phases 3–5)**: Depend on Setup and Foundational tasks. The stories are sequential because task management builds on the list/service and saved-data restoration validates data created and modified by the earlier stories.
- **Polish (Phase 6)**: Depends on all three user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after the foundational interface; establishes task creation, list, filters, and persistence writes.
- **US2 (P2)**: Depends on US1; extends its task service, shared form, and list navigation.
- **US3 (P3)**: Depends on US1 and US2; restores the tasks and changes those stories persist.

### Within Each User Story

- Write and run unit and acceptance tests first; verify each fails for the intended missing behavior.
- Implement only enough production behavior to pass those tests, then refactor while keeping tests green.
- Complete service/storage behavior before integrating the corresponding UI.
- Run that story's independent tests at its checkpoint before starting the next story.

### Parallel Opportunities

- After T001, T002 and T003 can proceed in parallel; T004 can be prepared alongside T003 and run after dependencies are installed.
- Within each story, independent unit-test and browser-test files are marked `[P]`; production tasks begin only after the relevant failing tests exist.
- T027 can be written and run independently after the stories; T028 must wait until the failure is confirmed.
- User stories themselves are not parallelizable because US2 extends US1 and US3 restores data produced by US1 and US2.

## Parallel Example: User Story 1

```text
After T001:
Task: T002 - Install and lock project dependencies.
Task: T003 - Configure the HTML entry point and Vite application build.
Task: T004 - Configure Playwright Chromium acceptance tests.

After the foundational contract is ready:
Task: T006 - Write task-service unit tests.
Task: T007 - Write local-storage adapter unit tests.
Task: T008 - Write browser acceptance tests for task creation and filtering.
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Write and run the US1 unit and acceptance tests; confirm they fail before implementation.
3. Implement and independently validate task creation, filtering, and the list.
4. Perform the timed SC-001 check and demonstrate the MVP after its story checkpoint. Full
   restoration after reload is delivered in US3.

### Incremental Delivery

1. Setup and the persistence interface.
2. US1: create/find tasks; test, run the timed entry check, and validate as an MVP.
3. US2: review and manage tasks; verify SC-004 action counts and preserve all US1 tests.
4. US3: restore saved tasks; validate persistence and read-failure recovery after reload.
5. Polish: verify responsive layout, contrast, target sizes, full tests, build, and quickstart.
