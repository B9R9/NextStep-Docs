# LanguageSelector

Pill-shaped locale switcher qui affiche un expand au hover sur desktop et un dropdown au tap sur mobile, en persistant la sélection dans `localStorage`.

## Props
Aucune.

## Emits
Aucun.

## What it renders

**Desktop (`sm` et plus)** — pill fixe (`h-8`) collapsée à `w-[3.5rem]` affichant uniquement le label actif, qui s'étend à `w-[12rem]` au `mouseenter` pour révéler les 4 boutons côte à côte. Transition `width` animée (`duration-200`). Le bouton actif est souligné (`underline underline-offset-4`). Les boutons inactifs sont `opacity-0 pointer-events-none` quand collapsé.

**Mobile (sous `sm`)** — bouton pill affichant le label actif avec un `▾`. Le tap ouvre un dropdown positionné (`absolute right-0 w-28`) listant les 4 options ; l'option active a `bg-surface-2` + checkmark `✓`.

Labels rendus : `FR`, `EN`, `FI`, `SV` (majuscules, `tracking-[0.2em]`). Ordre : `fr`, `en`, `fi`, `sv`.

## Internal logic

**`currentLabel`** — computed qui mappe `locale.value` via le record `labels: { fr: 'FR', en: 'EN', fi: 'FI', sv: 'SV' }`.

**`setLocale(value)`** — assigne `locale.value` (ref vue-i18n), écrit `value` dans `localStorage[SESSION_LOCALE_KEY]`, ferme `isExpanded` et `isMobileOpen`.

**`isExpanded`** — `ref<boolean>` piloté par `mouseenter`/`mouseleave` sur le wrapper desktop.

**`isMobileOpen`** — `ref<boolean>` togglé par le click sur le bouton mobile.

## Usage
```vue
<LanguageSelector />
```

## Dependencies
- `useI18n` — lit/écrit `locale` ; `t('languageSelector.aria')` pour les aria-labels
- `SESSION_LOCALE_KEY` depuis `@/app/i18n` — clé `localStorage` pour persister la locale de session
