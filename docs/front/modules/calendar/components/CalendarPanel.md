# CalendarPanel.vue

**Path:** `next-step/src/modules/calendar/components/CalendarPanel.vue`
**Module:** Calendar
**Type:** Display component (calendar grid)

---

## Purpose

Renders a calendar grid of day cells, each populated with colour-coded event chips. Supports two display modes: a **monthly grid** (42-cell standard calendar layout) and a **rolling range grid** (N consecutive days from a base date). Used by both `CalendarMainView` (monthly mode) and `CalendarModal` (range mode).

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `showAction` | `boolean` | `false` | When `true`, renders an expand icon button in the header |
| `actionLabel` | `string` | `''` | Accessible label for the action icon button |
| `baseDate` | `Date \| null` | `null` | Reference date. In monthly mode: drives the displayed month. In range mode: the first day of the range. Falls back to next month if `null`. |
| `rangeDays` | `number \| null` | `null` | When set, switches to rolling-range mode and shows this many days. Also changes the header label to the range translation. |
| `events` | `CalendarEvent[]` | `[]` | Events to display on the grid |

---

## Emits

| Event | Payload | Description |
|---|---|---|
| `action` | — | Fired when the optional header action button is clicked |
| `select` | `CalendarEvent` | Fired when an event chip is clicked |

---

## Display modes

### Monthly mode (`rangeDays` is `null`)
- `monthGrid` computed: 42 cells (6 rows × 7 columns), aligned to Monday as first column.
- Header label: locale-aware month + year via `Intl.DateTimeFormat`.

### Range mode (`rangeDays` is set)
- `rangeGrid` computed: cells from `baseDate` (or today) spanning `rangeDays` consecutive days, padded with `null` cells to fill complete weeks.
- Header label: `calendar.rangeLabel` i18n key with `{ days }` interpolation.

---

## Event colouring

Each event chip receives a CSS class based on event type and link:

| Condition | Class | Colour |
|---|---|---|
| `type === 'deadline'` | `calendar-event-deadline` | `--color-danger` |
| `type === 'published'` | `calendar-event-published` | `--color-success` |
| `type === 'event'` + `applicationId` set | `calendar-event-applied` | `--color-primary` |
| Generic / standalone event | `calendar-event-generic` | `--color-surface-2` |

---

## Event label text

Event chips display an i18n string derived from the event type:

| Condition | i18n key |
|---|---|
| `type === 'deadline'` | `calendar.event.deadline` with `{ position, company }` |
| `type === 'published'` | `calendar.event.published` with `{ position, company }` |
| `applicationId` set (type `event`) | `calendar.event.applied` with `{ position, company }` |
| Standalone | `item.title` or `calendar.event.generic` |

---

## Today highlight

The cell matching today's ISO date (`YYYY-MM-DD`) receives the `calendar-cell-today` class:
- Border tinted with `--color-primary` at 50% mix
- Subtle box-shadow ring using `--color-primary` at 20% opacity
- Background lightly tinted with `--color-primary` at 8%

---

## Internal computeds

| Computed | Description |
|---|---|
| `activeDate` | `baseDate` or next month's first day if `null` |
| `monthLabel` | Localised month/year string or range label |
| `weekdayLabels` | 7 locale-aware abbreviated weekday labels (Mon–Sun) |
| `monthGrid` | 42-cell array (`Date \| null`) for monthly mode |
| `rangeGrid` | Variable-length array (`Date \| null`) for range mode |
| `eventsByDate` | `Map<string, CalendarEvent[]>` keyed by ISO date for O(1) lookup per cell |
| `todayIso` | Today as `YYYY-MM-DD` |

---

## Dependencies

- `IconButton` — optional action button in the panel header
- `useI18n` — locale + translations
- `toISODate` from `@/shared/utils/date` — normalises event date strings for map keying

---

## i18n keys used

- `nav.calendar.title` — section label above the month heading
- `calendar.rangeLabel` — header label in range mode, interpolated with `{ days }`
- `calendar.event.deadline` / `calendar.event.published` / `calendar.event.applied` / `calendar.event.generic` — event chip labels
