# reminders.ts — Reminders Routes

**Path:** `next-step-api/src/routes/reminders.ts`
**Router:** `remindersRoutes` — mounted at `/reminders`
**Auth:** Required (all routes via `authMiddleware`)

---

## Overview

Provides reminder events to display on user login. Applies different reminder logic depending on whether the calendar event was auto-created (linked to a job or application) or manually created.

---

## Route

### `GET /reminders/today`

Returns the list of `ReminderEvent` objects that match today's reminder schedule for the authenticated user.

**Returns `[]` if:**
- User not found
- `reminders_enabled` is `false`

---

## Logic

### Step 1 — Auto-created events (jobId or applicationId present)

Uses **global reminder days** from `users.reminder_days` (JSON array, e.g. `[0, 1, 7]`).
Computes target dates: `today + n` for each `n` in the array.
Queries `calendar_events` where `jobId IS NOT NULL OR applicationId IS NOT NULL` and `date IN (targetDates)`.

### Step 2 — Manually created events (no jobId, no applicationId)

Uses **per-event `reminder_days`** stored on each `calendar_events` row.
Iterates all manual events with `reminder_days IS NOT NULL`.
Includes the event if `daysUntil(event.date)` is in the event's `reminder_days` array.

### Step 3 — Merge

Deduplicates by event ID, sorts by date ascending, maps to `ReminderEvent` shape.

---

## Response shape: `ReminderEvent`

```ts
{
  id: number
  type: 'deadline' | 'published' | 'event'
  date: string          // ISO YYYY-MM-DD
  position: string
  company: string
  title: string
  days_until: number    // 0 = today, 1 = tomorrow, etc.
}
```

---

## Helper functions

| Function | Description |
|---|---|
| `toDateStr(date)` | Formats a `Date` to `YYYY-MM-DD` string |
| `daysUntil(eventDate, today)` | Returns number of days from today to event date (0 = same day) |
| `toReminderEvent(event, today)` | Maps a DB row to the `ReminderEvent` response shape |
