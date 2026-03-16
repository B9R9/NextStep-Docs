 # ApplicationsFormDialog
   A Vue component for creating and editing application entries in the Next Step career platform.

   ## Purpose
   This component allows users to manage their job applications efficiently by providing a user-friendly form interface. It handles data validation, interaction with backend services, and updates the Pinia store accordingly.

   ## Props & Events
   - **Props:** `open` (boolean), `row` (object), `isCreating` (optional boolean)
   - **Emits:** `close`, `save`

   ## Usage
   ```vue
   <ApplicationsFormDialog :open="dialogOpen" :row="selectedApplication" @close="dialogOpen = false" @save="handleSave"/>
   ```

   ## Dependencies
   - **Stores:** useJobsStore, useCompaniesStore
   - **Services:** jobs.service, companies.service
   - **i18n keys:** 'applications.form.*'
   - **Backend routes:** /jobs, /companies