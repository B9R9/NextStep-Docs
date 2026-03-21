# SharedModal

A generic modal overlay component that renders a titled dialog with a scrollable content slot, a backdrop, and a close button.

## Props
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | `boolean` | Yes | — | Controls whether the modal is visible. When `false` the entire component is removed from the DOM via `v-if`. |
| `title` | `string` | No | `undefined` | Optional heading rendered in the modal header. If omitted, the header contains only the close button. |

## Emits
| Event | Payload | When |
|-------|---------|------|
| `close` | — | Emitted when the user clicks the backdrop overlay or the close button in the header. |

## What it renders

When `open` is `true`, a full-screen fixed overlay (`z-50`) is mounted with two layers:

1. **Backdrop** — a semi-transparent black div (`bg-black/40`) that covers the full viewport and emits `close` on click.
2. **Dialog panel** — a centered card (`ns-card`) constrained to `max-w-md` and `max-height: calc(100vh - 4rem)`, positioned with `items-start pt-12` so the panel appears near the top of the viewport rather than vertically centered. This prevents bottom overflow when inner content (e.g. `ReminderDaysPicker`) expands downward.

The panel has two internal sections:
- **Header** (`shrink-0`): displays the `title` prop in a semibold `<p>` tag (only if provided) and a ghost icon button with a Material Symbols `close` icon that emits `close`.
- **Body** (`overflow-y-auto`): a scrollable container that renders the default `<slot />`.

## Internal logic

`useScrollLock(() => props.open)` is called on mount. This composable watches the reactive getter and locks the document scroll whenever the modal is open, and unlocks it when `open` becomes `false`.

## Usage

```vue
<SharedModal :open="isModalOpen" title="Edit Application" @close="isModalOpen = false">
  <MyFormComponent />
</SharedModal>
```

## Dependencies
- **Composable**: `useScrollLock` from `@/shared/composables/useScrollLock`
- **Slot**: one unnamed default slot for modal body content
- **Icons**: Material Symbols Rounded (`close`, 18px)
- **CSS classes**: `ns-card`, `ns-btn`, `ns-btn-ghost`
- No child components, Pinia stores, or i18n keys used
