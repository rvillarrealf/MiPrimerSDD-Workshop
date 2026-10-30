# User Interface Contract

This feature exposes a browser interface only; it has no public API or external service
contract.

## Application identity and layout

- The browser tab title and the task-list header display **Curso-PSWE-07**.
- The interface supports mobile and desktop widths from 320 to 1440 CSS pixels without
  horizontal page scrolling.
- Interactive targets are at least 44 by 44 CSS pixels. Text meets the contrast thresholds
  specified in FR-016.

## To-Do List

- Shows tasks newest first, with status indicator and title.
- Provides All, Pending, and Done filters; the selected filter is visibly active.
- Shows a friendly empty state when there are no tasks or no filter matches.
- Provides a visible **Add task** action that opens the shared title/description form.
- Selecting a task opens its detail. Done tasks use a struck-through title and muted color.

## Task form

- Provides a labeled required title field and optional description field.
- Add mode provides Save and Cancel; edit mode provides Save and Cancel and starts with the
  selected task's current values.
- A missing or whitespace-only title shows a validation message and is not saved.
- A save failure retains entered values, states that the change was not saved, and allows
  retry. Error feedback is programmatically exposed as a status message.

## To-Do Detail

- Provides a back control, prominent title, description (or muted **No description**),
  visible Done or Pending status, and Edit, status-change, and Delete actions.
- Status action labels are **Mark as done** and **Mark as not done**, matching the current
  task status.
- Delete is visually distinct and requests confirmation before removal.
- Cancelling edit or deletion leaves the saved task unchanged.
- A failed status change or deletion keeps the last saved task state visible and allows retry.
