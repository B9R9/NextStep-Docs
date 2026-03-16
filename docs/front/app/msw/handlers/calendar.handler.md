 # calendar.handler
   Handles CRUD operations for calendar events in the Next Step application, using MSW to mock API endpoints.

   ## Purpose
   This module provides a way to retrieve, create, update, and delete calendar events. It uses an in-memory database to simulate data persistence.

   ## API
   - `GET /api/calendar/events`: Retrieves all calendar events with optional sorting and searching.
   - `POST /api/calendar/events`: Creates a new calendar event.
   - `PUT /api/calendar/events/:id`: Updates an existing calendar event by ID.
   - `DELETE /api/calendar/events/:id`: Deletes a calendar event by ID.

   ## Usage
   ```typescript
   // Minimal usage example
   import { setupServer } from 'msw/node'
   import { calendarHandlers } from './calendar.handler'

   const server = setupServer(...calendarHandlers)
   beforeAll(() => server.listen())
   afterEach(() => server.resetHandlers())
   afterAll(() => server.close())
   ```

   ## Dependencies
   - Uses `msw` for mocking API endpoints and `http` for creating HTTP responses.
   - Defines a custom type `CalendarEvent`.