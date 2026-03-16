 # companies.handler
   Handles API requests for company data, including sorting and filtering.

   ## Purpose
   This module provides a mock backend for the companies feature of Next Step, allowing for testing and development without relying on an external database or server.

   ## API
   - `companiesHandlers`: An array of MSW handlers for GET and POST requests to '/api/companies'.
   - `sortCompanies(rows, key, dir)`: Sorts an array of companies based on a given key and direction.
   - `matchesSearch(company, query)`: Checks if a company matches a search query.

   ## Usage
   ```typescript
   // Import and use the handlers in your MSW setup
   import { setupServer } from 'msw/node'
   import { companiesHandlers } from './companies.handler'

   const server = setupServer(...companiesHandlers)
   beforeAll(() => server.listen())
   afterEach(() => server.resetHandlers())
   afterAll(() => server.close())
   ```

   ## Dependencies
   - MSW (Mock Service Worker) for mocking API requests and responses
   - No external dependencies beyond the project's stack