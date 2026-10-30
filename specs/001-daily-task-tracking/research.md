# Research: Daily Task Tracking

## Browser application structure

**Decision**: Use semantic HTML, responsive CSS, and native JavaScript ES modules without a
UI framework. Use Vite only as a local HTTP development server and static production build
tool.

**Rationale**: The application has a small, defined interface and no existing codebase or
framework to preserve. Native modules avoid framework and transpilation complexity. A
consistent local HTTP(S) origin is needed for modules and browser storage; Vite provides that
development workflow and a static build without adding an application runtime dependency.

**Alternatives considered**:

- A UI framework and its associated runtime/build setup: not justified by the two-view,
  single-user feature.
- Opening `index.html` directly with `file://`: rejected because module and local-storage
  behavior for file URLs is not a reliable application origin.
- A custom static server: rejected in favor of a standard development tool that also creates
  the static build.

## Persistence

**Decision**: Store task data in `localStorage` behind a small task-store interface. Serialize
the task collection as JSON. Keep storage access out of UI modules.

**Rationale**: The requirements specify one local user and persistence after reopening, while
excluding accounts and synchronization. `localStorage` persists by browser origin across
normal browser sessions and is sufficient for the small task collection. The interface lets
unit tests substitute an in-memory or failure-producing store. Reads and writes can fail, so
failures must remain visible and follow FR-020 and FR-021 rather than being presented as
successful saves.

**Alternatives considered**:

- IndexedDB: better suited to larger or more complex datasets, but adds asynchronous data
  access and implementation complexity not justified by this scope.
- Remote storage: would require accounts or a service and conflict with the local-only,
  no-sync scope.
- Direct `localStorage` access in views: rejected because it violates the constitution's
  persistence boundary and makes failure testing harder.

**Limitations**: Browser storage is isolated by origin and browser profile, is not a backup or
cross-device sync mechanism, and may be cleared by the user or private browsing. `localStorage`
is synchronous and stores strings, so it is appropriate here only while the task data remains
small.

## Testing

**Decision**: Use Node.js's built-in `node:test` runner for fast, independent unit tests and
`@playwright/test` for browser acceptance tests. Use Playwright with Chromium at desktop and
mobile viewport widths; cover each user story with at least one end-to-end acceptance test.

**Rationale**: The built-in runner requires no separate unit-testing framework. Playwright
checks the real browser interface, persistence across reloads, visible error handling, and
responsive layouts, directly supporting the constitution's acceptance-test requirement.
Injecting the task-store interface enables deterministic storage-failure unit tests.

**Alternatives considered**:

- Manual-only acceptance checks: rejected because they would not provide repeatable,
  independently runnable tests for each user story.
- A single browser-testing tool for all business logic: rejected because isolated rules and
  storage errors can be tested faster and more deterministically with `node:test`.
- A multi-browser acceptance matrix: deferred because the spec defines mobile/desktop
  viewport support but does not state a supported browser-engine matrix.

## Accessibility and responsive behavior

**Decision**: Use native labeled fields and keyboard-operable buttons, retain the specified
minimum target size and contrast ratios, and verify reflow at the specified 320, 768, and 1440
CSS-pixel widths. Expose asynchronous save errors as accessible status feedback.

**Rationale**: Native controls provide standard keyboard and label behavior. The error message
must remain perceivable without losing the user's in-progress form values.

## References

- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [MDN: `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN: `Storage.setItem()`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem)
- [Node.js test runner](https://nodejs.org/api/test.html)
- [Playwright introduction](https://playwright.dev/docs/intro)
- [Playwright assertions](https://playwright.dev/docs/test-assertions)
- [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [W3C: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [W3C: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [W3C: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
