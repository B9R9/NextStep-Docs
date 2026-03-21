# ReminderDaysPicker.vue

**Path:** `next-step/src/shared/components/ReminderDaysPicker.vue`
**Module:** Shared
**Type:** Reusable `v-model` component

---

## Purpose

Toggle + chip list + number input for configuring a list of reminder days (e.g. "same day", "1 day before", "7 days before"). Used in:

- `CalendarEventForm` — per-event reminder on creation
- `CalendarMainView` inline edit form — per-event reminder on edit
- `SettingsRemindersSection` — global reminder days in user settings

---

## Props

| Prop | Type | Description |
|---|---|---|
| `modelValue` | `number[] \| null` | `null` = reminders disabled; `[]` = enabled, no days; `[0,1,7]` = enabled with days |

---

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `number[] \| null` | Standard `v-model` update |

---

## Behavior

### Toggle

- Click the toggle to switch between `null` (disabled) and `[]` (enabled, empty)
- Styled as a pill switch: gray when off, `--color-primary` when on

### Days list (chips)

- Displayed when enabled (`modelValue !== null`)
- Each day shown as a removable chip: `0 → "Same day"`, `n → "n days before"` (via i18n)
- Click × on a chip to remove that day

### Add input

- Number input (0–365) + "Add" button (also triggered by Enter key)
- Validates: must be an integer in [0, 365] and not already in the list
- List is kept sorted ascending after each add

---

## i18n keys used

| Key | Usage |
|---|---|
| `settings.reminders.sameDay` | Label for day `0` |
| `settings.reminders.daysBefore` | Label for day `n` (param: `n`) |
| `settings.reminders.addDay` | "Add" button label |
| `settings.reminders.addDayPlaceholder` | Input placeholder |
| `settings.reminders.removeDay` | Aria label for × button |
| `settings.reminders.noDays` | Empty state message |
| `settings.reminders.hint` | Helper text below the input |
| `calendar.form.reminderEnable` | Toggle label |

---

## Usage example

```html
<ReminderDaysPicker v-model="reminderDays" />

<!-- Or with explicit binding -->
<ReminderDaysPicker
  :model-value="selectedEvent.reminder_days ?? null"
  @update:model-value="selectedEvent.reminder_days = $event"
/>
```
