 # locations.handler
   Handles API requests for job locations by filtering and returning a list of cities based on search queries.

   ## Purpose
   This module exists to provide an efficient way to search and retrieve job locations, enhancing the user experience when applying for jobs.

   ## API
   - `locationsHandlers`: An array containing an HTTP GET handler that filters a list of cities based on query parameters.

   ## Usage
   ```typescript
   // Minimal usage example
   import { locationsHandlers } from './locations.handler'
   // Use with MSW to mock API responses in tests
   server.use(...locationsHandlers)
   ```

   ## Dependencies
   - `LOCATION_VALUES`: An array of city names imported from the shared references catalog.
   - `msw`, `http`, and `HttpResponse`: Libraries used to mock API responses in tests.