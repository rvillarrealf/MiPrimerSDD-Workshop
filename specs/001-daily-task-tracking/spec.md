# Feature Specification: Daily Task Tracking

**Feature Branch**: `001-daily-task-tracking`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: Build a simple to-do list application named "Curso-PSWE-07" to create, view, filter, edit, complete, and delete daily tasks, retaining them after the application is closed. Provide a responsive, minimal list and detail experience. Exclude accounts, categories, due dates, priorities, search, and sync.

## Clarifications

### Session 2026-10-29

- Q: Where should users open Curso-PSWE-07? → A: A responsive browser app, without installation.
- Q: In what order should tasks appear in the list? → A: Newest first.
- Q: If the application cannot save a new or edited task, how should it respond? → A: Keep changes, show an error, allow retry.
- Q: What should happen if saving a status change or confirmed deletion fails? → A: Keep last saved state, show error, allow retry.
- Q: Can two tasks have the same title? → A: Allow duplicate titles; treat them as separate tasks.
- Q: If the app cannot read saved tasks when it opens, what should it show? → A: Show an error, preserve saved data, and allow retry.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and find tasks (Priority: P1)

As a user, I want to add tasks and see or filter them in a to-do list so I can keep track of what needs to be done.

**Why this priority**: Creating and finding tasks is the core value of the application and provides a useful first increment.

**Independent Test**: Add tasks with titles and optional descriptions, then verify the list, completion indicators, and each status filter.

**Acceptance Scenarios**:

1. **Given** the list is open, **When** the user selects Add task, enters a title and optional description, and saves, **Then** the new pending task appears in the list.
2. **Given** the add form is open, **When** the user saves with an empty title, **Then** a validation message appears and no task is created.
3. **Given** tasks exist, **When** the user selects All, Pending, or Done, **Then** the list shows all tasks, only not-done tasks, or only done tasks respectively, and the active option is highlighted.
4. **Given** no tasks exist or the selected filter has no matches, **When** the list is displayed, **Then** a short, friendly empty-state message is shown.
5. **Given** a task is done, **When** it appears in the list, **Then** it has a status indicator, a struck-through title, and muted color; selecting any task opens its detail.
6. **Given** the list screen is open, **When** the user views the header and browser tab, **Then** both display "Curso-PSWE-07".
7. **Given** multiple tasks exist, **When** the list is displayed, **Then** tasks appear from newest to oldest.
8. **Given** saving a new task fails, **When** the failure is reported, **Then** the entered values remain visible, the user is told the task was not saved, and retry is available.
9. **Given** a task already exists, **When** the user creates another task with the same title, **Then** both tasks are saved and can be opened separately.

### User Story 2 - Review and manage a task (Priority: P2)

As a user, I want to inspect and change a task so its details and completion status stay accurate.

**Why this priority**: Editing and completion management keep the task list useful after tasks are created.

**Independent Test**: Open a task, edit its fields, change its status in both directions, and exercise both outcomes of the delete confirmation.

**Acceptance Scenarios**:

1. **Given** a task exists, **When** the user opens it, **Then** the detail view shows its title, description or muted "No description", status label, and a back control.
2. **Given** task details are displayed, **When** the user selects Edit, changes the title or description, and saves, **Then** the updated values are shown; if the title is empty, a validation message appears and changes are not saved.
3. **Given** edit mode is open, **When** the user cancels, **Then** the task remains unchanged.
4. **Given** a task is pending, **When** the user selects Mark as done, **Then** its status becomes done; **Given** a task is done, **When** the user selects Mark as not done, **Then** its status becomes pending. The action label always reflects the available status change.
5. **Given** a task's detail is displayed, **When** the user selects Delete, **Then** a confirmation is requested; cancelling keeps the task, while confirming removes it.
6. **Given** a task is shown in a Pending or Done filter, **When** its status changes so it no longer matches that filter, **Then** it no longer appears in that filtered list.
7. **Given** saving an edit fails, **When** the failure is reported, **Then** the entered values remain visible, the user is told the changes were not saved, and retry is available.
8. **Given** saving a status change or confirmed deletion fails, **When** the failure is reported, **Then** the last saved task state remains visible, the user is told the change was not saved, and retry is available.

### User Story 3 - Return to saved tasks (Priority: P3)

As a user, I want my tasks and changes to remain available after closing and reopening the application so I can continue later.

**Why this priority**: Durable task retention is necessary for ongoing daily use.

**Independent Test**: Create and modify tasks, close and reopen the application, and verify all non-deleted task data and statuses.

**Acceptance Scenarios**:

1. **Given** tasks have been created or changed, **When** the user closes and reopens the application, **Then** all saved titles, descriptions, and completion statuses remain.
2. **Given** a task was deleted with confirmation, **When** the application is reopened, **Then** the deleted task is absent.
3. **Given** saved tasks cannot be read when the application opens, **When** the read failure is reported, **Then** the application shows an error instead of an empty list, leaves the saved data unchanged, and allows the user to retry.

### Edge Cases

- Saving a task with a title containing only whitespace MUST be treated as an empty title.
- An omitted or empty description is valid and is shown as "No description" in task details.
- A filter with no matching tasks MUST show the friendly empty state without presenting unrelated tasks.
- Cancelling edit or deletion MUST leave the original task unchanged.
- Changing status while a status filter is active MUST update list membership to match the selected filter.
- If saving a new or edited task fails, entered values MUST remain visible, the user MUST be told the changes were not saved, and retry MUST be available.
- If saving a status change or confirmed deletion fails, the last saved task state MUST remain visible, the user MUST be told the change was not saved, and retry MUST be available.
- If saved tasks cannot be read on startup, the application MUST show an error rather than an empty list, MUST NOT overwrite the saved data, and MUST allow the user to retry.
- On narrow and wide screens, controls and content MUST remain usable without horizontal page scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The browser application MUST be named "Curso-PSWE-07"; that name MUST appear in the To-Do List header and browser tab title.
- **FR-002**: The To-Do List MUST display tasks from newest to oldest, with a status indicator and title, and allow a user to open each task's detail.
- **FR-003**: The list MUST provide All, Pending, and Done filters that display respectively all tasks, tasks not done, and done tasks, and visibly highlight the active filter.
- **FR-004**: The list MUST provide a clearly visible Add task action that opens a form with title and description fields.
- **FR-005**: A task MUST have a required title, an optional description, and a completion status of done or not done. New tasks MUST start as not done.
- **FR-005a**: Task titles MUST NOT be required to be unique; tasks with the same title MUST remain independently manageable.
- **FR-006**: The application MUST reject an empty or whitespace-only title with a validation message and MUST NOT save the invalid task or edit.
- **FR-007**: The list MUST show a short, friendly empty state when it has no tasks or when the active filter has no matches.
- **FR-008**: Done tasks in the list MUST display a struck-through title and muted color in addition to a status indicator.
- **FR-009**: The To-Do Detail view MUST include a back control, prominent title, description below the title, visible Done or Pending status, and Edit, status-change, and Delete actions.
- **FR-010**: When a task has no description, its detail view MUST show "No description" in muted text.
- **FR-011**: The status-change action MUST change a task between done and not done, and its label MUST be "Mark as done" for a pending task and "Mark as not done" for a done task.
- **FR-012**: Edit mode MUST reuse the title-and-description form and provide Save and Cancel actions. Cancelling MUST leave the task unchanged.
- **FR-013**: Delete MUST use a distinct warning color and require confirmation. Cancelling confirmation MUST preserve the task; confirming MUST remove it.
- **FR-014**: Tasks, including their titles, descriptions, and completion statuses, MUST persist after the application is closed and reopened. Confirmed deletions MUST remain deleted.
- **FR-015**: The visual design MUST use a light background, generous whitespace, one accent color for primary actions and the active filter, and one sans-serif font family. Titles MUST be larger and bolder than descriptions.
- **FR-016**: Text MUST have sufficient contrast: at least 4.5:1 for normal text and 3:1 for large text (at least 18 points, or at least 14 points when bold).
- **FR-017**: Interactive touch and click targets MUST be at least 44 by 44 pixels.
- **FR-018**: The layout MUST support mobile and desktop screens and remain usable without horizontal page scrolling at viewport widths from 320 to 1440 pixels.
- **FR-019**: The application MUST NOT include accounts, categories, due dates, priorities, search, or synchronization.
- **FR-020**: If saving a new or edited task fails, the application MUST retain the entered values in the form, clearly state that the changes were not saved, and allow the user to retry.
- **FR-021**: If saving a status change or confirmed deletion fails, the application MUST retain the last saved task state, clearly state that the change was not saved, and allow the user to retry.
- **FR-022**: If saved tasks cannot be read when the application opens, the application MUST show an error instead of an empty list, MUST leave saved data unchanged, and MUST allow the user to retry.

### Key Entities

- **Task**: A user-created item with a required title, optional description, and completion status (done or not done).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add a valid task, including its optional description, in under 30 seconds.
- **SC-002**: A user can locate pending and done tasks using their respective filters, and each filter displays only matching tasks in every tested case.
- **SC-003**: After closing and reopening the application, 100% of saved, non-deleted tasks retain their title, description, and status.
- **SC-004**: Users can complete an edit, status change, or confirmed deletion in no more than three actions from the task detail view, excluding text entry and confirmation response.
- **SC-005**: At viewport widths of 320, 768, and 1440 pixels, all primary controls remain visible and operable without horizontal scrolling.
- **SC-006**: Every text style meets the contrast thresholds in FR-016, and every interactive target meets the dimensions in FR-017.

## Assumptions

- The application has one local user and does not require sign-in; accounts and synchronization are explicitly out of scope.
- The application is a responsive browser app and does not require installation.
- Saved task data is available on the same installation after reopening; moving data between devices is not required.
- A title containing only whitespace is invalid; surrounding whitespace on a non-empty title may be trimmed when saved.
- Duplicate task titles are allowed; each saved task is a separate item.
- The empty state may use different short friendly wording for a new list and for a filter with no matches.
- The stated contrast ratios and viewport widths provide measurable interpretations of sufficient contrast and mobile/desktop support.
