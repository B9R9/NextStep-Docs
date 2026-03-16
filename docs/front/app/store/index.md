 # index.ts
   Creates and exports a Pinia store instance for use in Vue 3 applications.

   ## Purpose
   This module centralizes the creation of the Pinia store, which is used to manage state across components in a Vue 3 application. By exporting a single instance, it ensures that all components have access to the same state.

   ## API
   - **pinia**: The created Pinia store instance.

   ## Usage
   ```typescript
   import { pinia } from './index'
   app.use(pinia)
   ```

   ## Dependencies
   - Vue 3, Pinia library