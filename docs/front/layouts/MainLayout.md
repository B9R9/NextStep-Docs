# MainLayout

Layout racine de l'application. Contient la NavBar et le `<RouterView>` pour toutes les pages authentifiées.

## Structure

```
MainLayout.vue
├── NavBar          — barre de navigation persistante
└── <main>          — zone de contenu, RouterView avec transition de page
```

## Transitions

### Page-level fade (changement de route)

`RouterView` est wrappé dans une `<Transition name="page-fade" mode="out-in">`. Toute navigation entre routes produit un fade-out (130ms) puis fade-in (200ms) de la vue entrante.

```
page-fade-leave-active : opacity 130ms ease
page-fade-enter-active : opacity 200ms var(--ease-organic)
```

### Initial page load (F5)

`<main>` porte la classe `ns-fade-in` : au montage initial (rechargement navigateur), le contenu entier apparaît avec un fade-in + translateY(6px → 0) en 240ms.

## Dépendances

- `NavBar.vue` — barre de navigation
- `style.css` — classes `.ns-fade-in`, `.page-fade-*`
