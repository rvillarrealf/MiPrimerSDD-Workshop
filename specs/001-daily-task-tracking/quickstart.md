# Quickstart: Daily Task Tracking

## Prerequisites

- Node.js 22 or later and npm.
- A desktop browser supported by Playwright Chromium for automated acceptance tests.

## Install and run

From the repository root:

```powershell
npm install
npx playwright install chromium
npm run dev
```

Open the local HTTP URL printed by Vite in a browser. Use the same URL after restarting the
development server so browser-origin storage remains available.

## Validate

In a second terminal at the repository root:

```powershell
npm test
npm run test:acceptance
npm run build
```

Expected outcomes:

- Unit tests pass for task validation, filtering/order/state transitions, storage operations,
  and explicit handling of storage failures.
- Browser acceptance tests pass for task creation/filtering (Story 1), detail/edit/status/
  confirmed deletion (Story 2), and saved task retention after reload (Story 3).
- The acceptance suite checks responsive behavior at 320, 768, and 1440 CSS-pixel widths,
  including no horizontal page scrolling and usable primary controls.
- The production build completes without adding a backend or external service.

## Manual smoke check

1. Add two tasks, including two with the same title; verify both are saved and the newest is
   listed first.
2. Switch All, Pending, and Done filters; verify membership, active styling, and empty states.
3. Open and edit a task, cancel another edit, and verify the corresponding saved values.
4. Change a task's status in both directions; verify its detail label and filtered-list
   membership.
5. Start deletion and cancel, then confirm deletion; verify only the confirmed deletion
   removes the task.
6. Reload the page; verify saved task data and statuses persist.

## Measurable acceptance checks

- **SC-001**: Start a timer before opening Add task. Enter a valid title and optional
  description, save, and stop the timer when the task appears in the list. Record the elapsed
  time; it must be under 30 seconds.
- **SC-004**: Starting at task detail, count Edit and Save as the two edit actions (exclude
  text entry); count the status-change button as one action; and count Delete as one action,
  excluding the confirmation response. Each operation must take no more than three actions.
