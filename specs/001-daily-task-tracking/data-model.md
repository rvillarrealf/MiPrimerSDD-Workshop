# Data Model: Daily Task Tracking

## Task

Represents one independently manageable item in the user's local task list.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `id` | String | Yes | Unique and stable for the lifetime of the task; used for selection, update, and deletion. |
| `title` | String | Yes | Must contain a non-whitespace character. Trim surrounding whitespace when saved. Duplicate titles are allowed. |
| `description` | String | No | Optional; treat an omitted value as an empty string. |
| `status` | `pending` \| `done` | Yes | New tasks start as `pending`; a task can transition between either status. |
| `createdAt` | ISO 8601 date-time string | Yes | Set when created and used to order tasks newest first. |

## Collection and relationships

- The application has one local task collection and no accounts or cross-device relationships.
- The collection is stored as serialized task data in the browser's origin-scoped storage.
- Tasks with identical titles remain distinct by `id`.
- The list sorts by `createdAt` descending. Tasks with equal timestamps retain a stable
  relative order.

## Lifecycle

```text
Create -> Pending <-> Done
                    -> Deleted (only after confirmation)
```

- A failed create or edit leaves entered form values visible and does not report success.
- A failed status change or confirmed deletion leaves the last saved task state visible.
- Failed saves show a clear error and allow retry, as specified by FR-020 and FR-021.
