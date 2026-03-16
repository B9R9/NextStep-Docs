 # routes.ts
Defines the routing structure for the Next Step application using Vue Router.

## Purpose
This module organizes and manages navigation between different sections of the application, such as applications, jobs, companies, calendar, settings, and authentication.

## API
- **routes**: An array of RouteRecordRaw objects that define each route in the application.

## Usage
The routes are imported into the main Vue Router instance for use in the application.

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

## Dependencies
- **Stores**: None directly, but indirectly through imported modules (applications, jobs, companies, calendar, settings).
- **Services**: None directly, but indirectly through imported modules.
- **i18n keys**: None in this file.
- **Components**: MainLayout, AuthLayout, Home, NotFound.
- **Backend routes**: None defined in this file; they are defined in the individual module route files that are imported here.