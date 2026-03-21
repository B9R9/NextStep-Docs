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

When `open` is `true`, a full-screen fixed overlay (`z-50`) is mounted with three layers:

1. **Outer wrapper** — `fixed inset-0 z-50`, contains everything.
2. **Backdrop** — `absolute inset-0 bg-black/40`, emits `close` on click.
3. **Scroll container** — `absolute inset-x-0 top-16 bottom-[3.25rem] overflow-y-auto flex items-start justify-center p-4`. Constrains content to sit strictly between the 64 px navbar (`top-16`) and the 52 px footer (`bottom-[3.25rem]`), and scrolls if content overflows.

Inside the scroll container:
- **Card** (`ns-card`, `max-w-md`, `max-height: calc(100vh - 7.25rem - 2rem)`): the dialog surface.
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
