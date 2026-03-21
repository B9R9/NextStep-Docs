# types.ts — Calendar Module Types

**Path:** `next-step/src/modules/calendar/types.ts`

---

## `CalendarEventType`

```ts
type CalendarEventType = 'deadline' | 'published' | 'event'
```

| Value | Meaning |
|---|---|
| `deadline` | Application deadline |
| `published` | Job published date |
| `event` | Generic manual event (interview, etc.) |

---

## `CalendarEvent`

```ts
type CalendarEvent = {
  id: number
  type: CalendarEventType
  date: string                    // ISO YYYY-MM-DD
  jobId?: number | null           // Set for auto-created events linked to a job
  applicationId?: number | null   // Set for auto-created events linked to an application
  position: string
  company: string
  title?: string
  description?: string
  reminder_days?: number[] | null // Per-event reminder schedule (manual events only)
}
```

### `reminder_days` semantics

- `null` / `undefined` — no reminder configured for this event
- `[]` — reminders enabled but no days configured yet
- `[0, 1, 7]` — remind on the same day, 1 day before, and 7 days before

For **auto-created events** (`jobId` or `applicationId` set), reminders are driven by the global `users.reminder_days` setting, not this field.
For **manually created events** (no `jobId`, no `applicationId`), this field is used by `GET /reminders/today`.
