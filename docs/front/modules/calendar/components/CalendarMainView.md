# CalendarMainView.vue

**Path:** `next-step/src/modules/calendar/components/CalendarMainView.vue`
**Module:** Calendar
**Type:** Page-level view component

---

## Purpose

Top-level orchestrator for the Calendar page. Renders the monthly grid with month/year navigation, manages the full event lifecycle (create, preview, edit, delete), and surfaces feedback toasts to the user. It owns all modal state and delegates rendering to child components.

---

## Dependencies

| Dependency | Kind | Role |
|---|---|---|
| `CalendarPanel` | Component | Monthly grid displaying all events |
| `CalendarPanelSkeleton` | Component | Loading skeleton shown on initial fetch |
| `CalendarEventForm` | Component | New-event creation form (inside a modal) |
| `CalendarEventPreview` | Component | Read-only event detail view with Edit / Delete actions |
| `ReminderDaysPicker` | Shared component | Reminder day selector used inside the inline edit form |
| `JobsPreviewDialog` | Component | Mounted but not actively triggered from this view |
| `ApplicationsPreviewDialog` | Component | Mounted but not actively triggered from this view |
| `SharedModal` | Shared component | Reusable modal wrapper (used for create, preview, edit) |
| `IconButton` | Shared component | Prev / Next navigation chevrons |
| `useCalendarStore` | Pinia store | Calendar events state + CRUD actions |
| `useJobsStore` | Pinia store | Jobs data, preloaded on mount |
| `useApplicationsStore` | Pinia store | Applications data, preloaded on mount |
| `useCalendarEventSync` | Composable | Propagates event date changes back to the linked job or application |

---

## Reactive state

| Ref | Type | Description |
|---|---|---|
| `monthOffset` | `number` | Offset from the current calendar month; drives `baseDate` |
| `selectedMonth` | `number \| null` | Bound to the month `<select>` dropdown |
| `selectedYear` | `number \| null` | Bound to the year `<select>` dropdown |
| `isFormOpen` | `boolean` | Controls the create-event modal |
| `isEventPreviewOpen` | `boolean` | Controls the event preview modal |
| `isEventEditOpen` | `boolean` | Controls the inline edit modal |
| `isJobPreviewOpen` | `boolean` | Controls the job preview dialog (reserved) |
| `isApplicationPreviewOpen` | `boolean` | Controls the application preview dialog (reserved) |
| `selectedEvent` | `CalendarEvent \| null` | The event currently being previewed or edited |
| `selectedJob` | `Job \| null` | The job currently being previewed (reserved) |
| `selectedApplication` | `Application \| null` | The application currently being previewed (reserved) |
| `feedback` | `{ kind, message } \| null` | Active toast notification payload |

---

## Computed values

### `baseDate`
Derived from `monthOffset` relative to today's date. Always set to the first day of the target month. Used as the single source of truth passed to `CalendarPanel`.

```ts
const baseDate = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + monthOffset.value, 1)
})
```

### `monthOptions`
Array of 12 objects `{ value: number, label: string }` localised via `Intl.DateTimeFormat` using the active `locale`.

### `yearOptions`
7-year window centred on the current year (current year − 3 to current year + 3).

### `feedbackClass`
CSS class string applied to the toast element: `'feedback-success'` or `'feedback-error'`.

---

## Watchers

| Watch target | Direction | Effect |
|---|---|---|
| `baseDate` (immediate) | `monthOffset` → dropdowns | Keeps `selectedMonth` and `selectedYear` in sync with the offset |
| `[selectedMonth, selectedYear]` | dropdowns → `monthOffset` | Recalculates `monthOffset` from the dropdown values; avoids circular updates via equality check |

---

## Month navigation

| Function | Action |
|---|---|
| `goPrev()` | Decrements `monthOffset` by 1 |
| `goNext()` | Increments `monthOffset` by 1 |

Navigation is also available through the month and year dropdowns, which are two-way bound to the offset via the watcher pair described above.

---

## Event lifecycle

### Create
1. User clicks "Add event" → `isFormOpen = true`.
2. `CalendarEventForm` emits `submit` with `{ title, type, description, date, reminder_days }`.
3. `submitEvent(payload)` calls `calendarStore.createEvent`.
4. On success: `isFormOpen = false`, success toast is shown.
5. On error: error toast is shown.

### Preview
1. User clicks an event chip on the grid → `CalendarPanel` emits `select(event)`.
2. `openFromEvent(event)` sets `selectedEvent` and `isEventPreviewOpen = true`.
3. `CalendarEventPreview` renders event details with Edit and Delete buttons.

### Edit
1. User clicks Edit in the preview → `CalendarEventPreview` emits `edit`.
2. `openEventEdit()` closes the preview modal and opens the edit modal.
3. The edit form binds directly to `selectedEvent` fields (mutated in place).
4. `saveEventEdit()` calls `calendarStore.updateEvent(selectedEvent)` then `syncEventToLinkedEntity(selectedEvent)`.
5. On success: edit modal closes, preview modal re-opens, success toast shown.
6. On error: error toast shown.

### Delete
1. User clicks Delete in the preview → `CalendarEventPreview` emits `delete`.
2. `deleteEvent()` calls `calendarStore.deleteEvent(selectedEvent.id)`.
3. On success: `closePreviews()` resets all modal and selection state, success toast shown.
4. On error: error toast shown.

---

## `closePreviews()`

Resets all preview/edit modal flags and clears `selectedEvent`, `selectedJob`, and `selectedApplication` to `null`. Called after a successful delete and on any modal close event.

---

## Inline edit form (inside `isEventEditOpen` modal)

The second `SharedModal` contains a hand-built form that directly mutates `selectedEvent`:

| Field | Input element | Bound property |
|---|---|---|
| Title | `<input>` | `selectedEvent.title` |
| Type | `<select>` | `selectedEvent.type` — options: `deadline`, `event`, `published` |
| Description | `<textarea>` | `selectedEvent.description` |
| Date | `<input type="date">` | `selectedEvent.date` |
| Reminders | `ReminderDaysPicker` | `selectedEvent.reminder_days` |

The form has Cancel (calls `closePreviews`) and Save (calls `saveEventEdit`) buttons.

---

## `useCalendarEventSync` — sync behaviour

When `saveEventEdit` succeeds, `syncEventToLinkedEntity(event)` propagates the updated date back to the linked entity:

| Event condition | Entity updated | Field written |
|---|---|---|
| `type === 'published'` + `jobId` | Job | `published_at` |
| `type === 'deadline'` + `jobId` | Job | `deadline_at` |
| `type === 'event'` + `applicationId` | Application | `applied` |
| `type === 'deadline'` + `applicationId` | Application | `deadline` |

No sync is performed for standalone events (no `jobId` or `applicationId`).

---

## Loading state

```
calendarStore.isLoading && !calendarStore.hasLoaded
  → <CalendarPanelSkeleton />

else
  → <CalendarPanel class="ns-fade-in" :base-date="baseDate" :events="calendarStore.rows" />
```

The skeleton is only shown on the **first** load. Subsequent reloads (e.g. after create/update) do not re-trigger the skeleton because `hasLoaded` remains `true`.

---

## Feedback toast

| Property | Detail |
|---|---|
| Position | Fixed, bottom-centre (`bottom-5`, horizontally centred with `-translate-x-1/2`) |
| z-index | `z-[70]` |
| Width | `min(92vw, 30rem)` |
| Auto-dismiss | 3 000 ms via `setTimeout`; timer is cleared and reset on each new toast |
| Animation | `<Transition name="feedback-toast">` — slides up from 24 px below with opacity fade |
| Accessibility | `role="status"`, `aria-live="polite"` |

### CSS classes

| Kind | Class | Variables used |
|---|---|---|
| Success | `.feedback-success` | `--color-success`, `--color-success-soft`, `--color-text`, `--color-border` |
| Error | `.feedback-error` | `--color-danger`, `--color-danger-soft`, `--color-text`, `--color-border` |

Colors are blended with `color-mix(in oklab, ...)` to produce muted foreground, border, and background tints.

---

## `onMounted`

Three parallel store loads are triggered:

```ts
calendarStore.loadEvents()
jobsStore.loadJobs()
applicationsStore.loadApplications()
```

Jobs and applications are preloaded so that `useCalendarEventSync` and the preview dialogs have data available without an additional fetch.

---

## i18n keys used

| Key | Context |
|---|---|
| `calendar.title` | Page heading |
| `calendar.subtitle` | Page subheading |
| `calendar.month` | Month dropdown label |
| `calendar.year` | Year dropdown label |
| `calendar.prev` | Prev button aria-label |
| `calendar.next` | Next button aria-label |
| `calendar.form.add` | "Add event" button label |
| `calendar.form.title` | Create modal title |
| `calendar.form.edit` | Edit modal title |
| `calendar.form.name` | Title field label |
| `calendar.form.type` | Type field label |
| `calendar.form.types.deadline` | Type option |
| `calendar.form.types.event` | Type option |
| `calendar.form.types.published` | Type option |
| `calendar.form.description` | Description field label |
| `calendar.form.date` | Date field label |
| `calendar.form.reminder` | Reminder field label |
| `calendar.event.generic` | Fallback event title |
| `calendar.feedback.created` | Success toast — create |
| `calendar.feedback.updated` | Success toast — edit |
| `calendar.feedback.deleted` | Success toast — delete |
| `calendar.feedback.error` | Error toast (all operations) |
| `common.close` | Cancel button |
| `common.save` | Save button |
