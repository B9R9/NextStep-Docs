 # start
   Starts the Mock Service Worker (MSW) for development environment.

   ## Purpose
   This module initializes MSW, which is used to mock backend API responses during development. It ensures consistent and predictable data for testing and development purposes.

   ## API
   - `startMSW()`: An asynchronous function that starts the MSW if in a development environment and if VITE_API_MOCK is set to 'true'.

   ## Usage
   ```typescript
   import { startMSW } from './start'

   // Call this function at the beginning of your application setup
   await startMSW()
   ```

   ## Dependencies
   - `./browser`: The MSW worker implementation.
   - Environment variables: `DEV`, `VITE_API_MOCK`.