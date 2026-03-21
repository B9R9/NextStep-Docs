# Animations & Transitions

Classes utilitaires définies dans `style.css` pour les transitions et animations de l'application.

---

## `.ns-fade-in`

Fade-in avec légère montée verticale. Utilisé pour les éléments qui apparaissent après un état de chargement.

```css
@keyframes ns-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ns-fade-in {
  animation: ns-fade-in 240ms var(--ease-organic) both;
}
```

**Utilisé sur :** blocs de contenu dans ApplicationsMainView, JobsMainView, CompaniesMainView, CalendarPanel, AdminDashboard, EmptyState components, `<main>` de MainLayout.

---

## `.ns-skeleton`

Bloc de placeholder animé pour les états de chargement.

```css
.ns-skeleton {
  background: color-mix(in oklab, var(--color-border) 80%, var(--color-bg) 20%);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}
```

**Utilisé sur :** AdminDashboard (inline skeleton cards).

---

## `.page-fade-*` (Vue Transition)

Transition de route utilisée dans `MainLayout.vue` via `<Transition name="page-fade" mode="out-in">`.

```css
.page-fade-enter-active { transition: opacity 200ms var(--ease-organic); }
.page-fade-leave-active { transition: opacity 130ms ease; }
.page-fade-enter-from,
.page-fade-leave-to     { opacity: 0; }
```

**Comportement :** mode `out-in` — la vue sortante disparaît complètement avant que la vue entrante commence à apparaître.

---

## Skeleton components (scoped)

Chaque module qui a un skeleton dédié définit localement `.skeleton` + `@keyframes skeleton-pulse` en `<style scoped>` :

| Composant | Module |
|---|---|
| `ApplicationsTableSkeleton.vue` | applications |
| `JobsTableSkeleton.vue` | jobs |
| `CompaniesTableSkeleton.vue` | companies |
| `CalendarPanelSkeleton.vue` | calendar |

---

## Variables de motion (thème)

| Variable | Valeur | Usage |
|---|---|---|
| `--ease-organic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Courbe principale (overshoot doux) |
| `--duration-fast` | `120ms` | Micro-interactions |
| `--duration-base` | `180ms` | Transitions standard |
| `--duration-slow` | `260ms` | Transitions lentes (modales) |
