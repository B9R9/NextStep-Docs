# CalendarModal.vue

**Path:** `next-step/src/modules/calendar/components/CalendarModal.vue`
**Module:** Calendar
**Type:** Overlay / modal orchestrator component

---

## Purpose

Slide-down overlay that surfaces the calendar from any screen without navigating away. Renders a `CalendarPanel` in a fixed top overlay, and orchestrates event preview and inline editing via two `SharedModal` instances. Intended as a quick-access panel (e.g. from the nav bar), with an action button to open the full calendar page.

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `open` | `boolean` | Yes | Controls visibility of the overlay and both child modals |

---

## Emits

| Event | Payload | Description |
|---|---|---|
| `close` | — | Fired when the user clicks the backdrop or the close icon button |
| `open-calendar` | — | Fired when the user clicks the expand action inside `CalendarPanel` |

---

## State

| Ref | Type | Default | Description |
|---|---|---|---|
| `selectedEvent` | `CalendarEvent \| null` | `null` | Currently selected event, shared between preview and edit modals |
| `isEventPreviewOpen` | `boolean` | `false` | Controls the read-only event preview modal |
| `isEventEditOpen` | `boolean` | `false` | Controls the inline event edit modal |

---

## Behaviour

### Lazy loading
Events are loaded from `calendarStore` the first time the overlay opens (`open` becomes `true`), only if `calendarStore.hasLoaded` is `false`. Subsequent opens reuse the cached data.

### Event lifecycle

#### Preview
1. User clicks an event chip in `CalendarPanel` → `openFromEvent(event)` sets `selectedEvent` and opens the preview modal.
2. `CalendarEventPreview` shows event details with Edit and Delete buttons.

#### Edit
1. User clicks Edit in the preview → `openEventEdit()` closes the preview modal and opens the edit modal.
2. Fields are bound directly to `selectedEvent` (mutated in place): title, type, description, date.
3. `saveEventEdit()` calls `calendarStore.updateEvent` then `syncEventToLinkedEntity`, then re-opens the preview modal.

#### Delete
1. User clicks Delete in the preview → `deleteEvent()` calls `calendarStore.deleteEvent`.
2. On completion, both modals close and `selectedEvent` is reset via `closePreviews()`.

### Closing
`closePreviews()` resets all three pieces of state (`isEventPreviewOpen`, `isEventEditOpen`, `selectedEvent`). Clicking the backdrop or the `IconButton` at the top-right emits `close` to the parent.

---

## Inline edit form

Rendered inside the second `SharedModal`. Directly mutates `selectedEvent`:

- **Title** — text input, `v-model="selectedEvent.title"`
- **Type** — `<select>` with options `deadline | event | published`
- **Description** — `<textarea>`
- **Date** — `<input type="date">`

---

## Animation

The slide-down panel uses a `<transition name="calendar-slide">`:

- Enter / leave: `transform: translateY(-12px)` + `opacity: 0` → visible
- Duration: 500 ms (transform), 380 ms (opacity)

---

## Dependencies

| Component / Composable | Role |
|---|---|
| `CalendarPanel` | Calendar grid rendered inside the overlay |
| `CalendarEventPreview` | Read-only event details with edit/delete actions |
| `SharedModal` | Reusable modal wrapper (used twice) |
| `IconButton` | Close button in the top-right corner |
| `useCalendarStore` | Event data source + CRUD actions |
| `useCalendarEventSync` | Syncs edited event dates back to linked job/application |

---

## i18n keys used

- `calendar.form.openCalendar` — label for the expand action button
- `calendar.form.edit` — title of the edit modal
- `calendar.form.name` — label for the title field
- `calendar.form.type` — label for the type field
- `calendar.form.types.deadline / event / published` — type options
- `calendar.form.description` — label for the description field
- `calendar.form.date` — label for the date field
- `calendar.event.generic` — fallback title when `selectedEvent` has neither `title` nor `position`
- `common.close` / `common.save`
