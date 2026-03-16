 # notifications.handler
   Handles the CRUD operations for notifications in the Next Step platform.

   ## Purpose
   This module manages the retrieval and dismissal of notifications, providing real-time updates to users about job applications, events, and published jobs.

   ## API
   - `GET /api/notifications`: Retrieves all active notifications.
   - `PUT /api/notifications/:id/dismiss`: Dismisses a specific notification by its ID.

   ## Usage
   ```typescript
   // Minimal usage example
   import { http } from 'msw'
   import { notificationsHandlers } from '@/modules/notifications/handlers'

   msw.use(...notificationsHandlers)
   ```

   ## Dependencies
   - Backend routes: `GET /api/notifications`, `PUT /api/notifications/:id/dismiss`