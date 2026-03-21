# calendar.ts — Calendar Events Routes

**Path:** `next-step-api/src/routes/calendar.ts`
**Router:** `calendarRoutes` — mounted at `/calendar`
**Auth:** Required (all routes via `authMiddleware`)

---

## Overview

CRUD routes for calendar events. Supports filtering, sorting, and per-event reminder configuration. Auto-created events (linked to a job or application) carry `jobId`/`applicationId`; manually created events have neither.

---

## Helper: `pickCalendarPayload(payload)`

Sanitizes and normalizes a raw request body into a safe DB-insert payload.

| Field | Validation |
|---|---|
| `type` | Must be `deadline`, `published`, or `event` — defaults to `event` |
| `date` | Must be a string — defaults to today (ISO format) |
| `jobId` | Must be a number or null |
| `applicationId` | Must be a number or null |
| `position`, `company`, `title`, `description` | Must be strings — defaults to `''` |
| `reminder_days` | Array of integers 0–365 — deduplicated, sorted, JSON-stringified; null if not an array |

---

## Exported function: `createCalendarEvent(userId, data)`

Programmatic event creation used by other routes (e.g. when an application transitions to a state that should create a calendar event).

```ts
createCalendarEvent(userId: number, data: {
  type?, date?, jobId?, applicationId?,
  position?, company?, title?, description?
}): Promise<CalendarEventRow>
```

---

## Routes

### `GET /calendar/events`

Returns all calendar events for the authenticated user.

**Query params:**
- `q` — full-text search on `title`, `description`, `type`
- `sortKey` — one of `type | date | jobId | applicationId | position | company | title`
- `sortDir` — `asc | desc`

**Response:** `CalendarEventRow[]`

---

### `GET /calendar/events/:id`

Returns a single event by ID. Returns `404` if not found or not owned by user.

---

### `POST /calendar/events`

Creates a new calendar event. Payload is sanitized via `pickCalendarPayload`.
Tracks `calendar_event.created` user event.

---

### `PUT /calendar/events/:id`

Updates an event. Payload is sanitized via `pickCalendarPayload`.
On success:
- Creates a notification: `"Calendar event updated"`
- Tracks `calendar_event.updated` user event

Returns `404` if event not found or not owned by user.

---

### `DELETE /calendar/events/:id`

Deletes an event.
On success:
- Creates a notification: `"Calendar event deleted"`
- Tracks `calendar_event.deleted` user event

Returns `404` if event not found or not owned by user.

---

## Reminder days handling

`reminder_days` is stored as a JSON-stringified array in the DB (e.g. `"[0,1,7]"`).
It is set per-event and only used for **manually created events** (no `jobId`/`applicationId`).
For auto-created events, reminders are driven by the global `users.reminder_days` field (see `reminders.ts`).
