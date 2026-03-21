# CalendarEventForm.vue

**Path:** `next-step/src/modules/calendar/components/CalendarEventForm.vue`
**Module:** Calendar
**Type:** Form component (modal content)

---

## Purpose

Form for creating a new manual calendar event. Emits a `submit` payload with all event data including optional per-event reminder configuration.

---

## Emits

| Event | Payload | Description |
|---|---|---|
| `submit` | `{ title, type, description, date, reminder_days }` | Fired when form is valid and submitted |
| `close` | — | Fired when user cancels |

### Submit payload type

```ts
{
  title: string
  type: 'deadline' | 'event' | 'published'
  description: string
  date: string                   // ISO YYYY-MM-DD
  reminder_days: number[] | null // null = no reminder
}
```

---

## State

| Ref | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `''` | Event name |
| `type` | `'deadline' \| 'event' \| 'published'` | `'event'` | Event type |
| `description` | `string` | `''` | Optional description |
| `date` | `string` | `''` | ISO date string |
| `reminderDays` | `number[] \| null` | `null` | Per-event reminder days (null = disabled) |

---

## Validation

Submission is blocked if `title` is empty or `date` is not set.
On successful submit, all fields are reset to their defaults.

---

## Template sections

1. **Name input** — `v-model="title"`
2. **Type select** — `deadline | event | published`
3. **Description textarea**
4. **Date input** — type `date`
5. **ReminderDaysPicker** — `v-model="reminderDays"` (toggle + chip list + number input)
6. **Action buttons** — Close / Create

---

## Dependencies

- `ReminderDaysPicker` — shared component for per-event reminder configuration
- i18n keys: `calendar.form.*`
