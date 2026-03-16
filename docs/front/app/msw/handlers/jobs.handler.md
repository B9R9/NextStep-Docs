 # jobs.handler
   Handles the mocking of job data for testing and development purposes using MSW (Mock Service Worker).

   ## Purpose
   This module provides a simulated database of job listings used to test frontend components and services that interact with job data. It allows developers to work on these features without relying on live data or a fully functioning backend.

   ## API
   - `jobsDb`: An array of Job objects, each representing a job listing.
   - `sortJobs(rows: Job[], key: keyof Job, dir: 'asc' | 'desc')`: A function to sort an array of Job objects based on a specified key and direction.

   ## Usage
   ```typescript
   // Import the jobsDb array and use it in your tests or development environment
   import { jobsDb } from './jobs.handler'
   console.log(jobsDb)
   ```

   ## Dependencies
   - `msw`: Used for mocking HTTP requests and responses.
   - `@/modules/jobs/types`: Contains the Job type definition used in this module.