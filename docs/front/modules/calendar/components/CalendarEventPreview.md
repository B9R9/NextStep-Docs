# CalendarEventPreview.vue

**Path:** `next-step/src/modules/calendar/components/CalendarEventPreview.vue`
**Module:** Calendar
**Type:** Read-only detail component (modal content)

---

## Purpose

Displays the details of a single `CalendarEvent` in a read-only layout. Shows a contextual badge, the event title and company, the formatted date, and an optional description. Provides Edit and Delete action buttons that emit upward to the parent orchestrator.

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `event` | `CalendarEvent` | Yes | The event to display |

---

## Emits

| Event | Payload | Description |
|---|---|---|
| `edit` | — | Fired when the user clicks the Edit button |
| `delete` | — | Fired when the user clicks the Delete button |

---

## Context resolution

A `context` computed derives the badge label, badge style class, and an auto-generated description based on the combination of `event.type` and the presence of `applicationId` or `jobId`:

| Condition | Label key | Badge class | Auto-description key |
|---|---|---|---|
| `type === 'event'` + `applicationId` | `calendar.context.appliedApplication` | `ns-badge-primary` | `calendar.context.appliedApplicationDesc` |
| `type === 'deadline'` + `applicationId` | `calendar.context.deadlineApplication` | `ns-badge-danger` | `calendar.context.deadlineApplicationDesc` |
| `type === 'deadline'` + `jobId` | `calendar.context.deadlineJob` | `ns-badge-warning` | `calendar.context.deadlineJobDesc` |
| `type === 'published'` + `jobId` | `calendar.context.published` | `ns-badge-success` | `calendar.context.publishedDesc` |
| Standalone / manual event | `calendar.context.event` | _(none)_ | _(none)_ |

Auto-description keys are interpolated with `{ position, company }` from the event.

---

## Displayed fields

| Field | Source | Notes |
|---|---|---|
| Badge | `context.label` + `context.badgeClass` | Always shown |
| Title | `event.position` → `event.title` → `calendar.event.generic` | First non-empty value used |
| Company | `event.company` | Only rendered when present |
| Date | `formatDateDDMMYYYY(event.date)` | Displayed as DD/MM/YYYY in `tabular-nums` style |
| Description | `event.description` → `context.autoDescription` | Only rendered when non-empty; `whitespace-pre-wrap` preserved |

---

## Actions

Both buttons are plain `<button type="button">` elements:

- **Edit** — `ns-btn ns-btn-ghost`, emits `edit`
- **Delete** — `ns-btn ns-btn-ghost text-danger`, emits `delete`

Actual update and delete API calls are performed by the parent component.

---

## Dependencies

- `formatDateDDMMYYYY` from `@/shared/utils/date` — date display formatting
- `useI18n` — badge labels and auto-descriptions
- `CalendarEvent` type from `../types`

---

## i18n keys used

- `calendar.context.appliedApplication` / `deadlineApplication` / `deadlineJob` / `published` / `event` — badge labels
- `calendar.context.appliedApplicationDesc` / `deadlineApplicationDesc` / `deadlineJobDesc` / `publishedDesc` — auto-generated descriptions (interpolated with `{ position, company }`)
- `calendar.event.generic` — fallback title
- `common.edit` / `common.delete` — action button labels
