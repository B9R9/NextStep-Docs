 # index.ts
   Aggregates and exports all API handlers for the Next Step module.

   ## Purpose
   This module simplifies the import process by providing a single entry point for all API handlers.

   ## API
   - **handlers**: An array containing all API handlers from various modules (companies, jobs, locations, calendar, notifications).

   ## Usage
   ```typescript
   // Minimal usage example
   import { handlers } from './index'
   ```

   ## Dependencies
   - **Modules**: companies.handler, jobs.handler, locations.handler, calendar.handler, notifications.handler (auth.handlers is commented out)
   - **Backend Routes**: Depends on the individual handlers used.