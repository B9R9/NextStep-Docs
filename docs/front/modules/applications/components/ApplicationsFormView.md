 # ApplicationsFormView
   A Vue component for managing application forms, allowing users to input job details and their application status.

   ## Purpose
   This component facilitates the creation and editing of applications, providing a user-friendly interface for entering information such as job selection, company name, position, application date or deadline, and whether they have attached a CV or cover letter.

   ## Props & Events
   - **Props:** `draft`, `jobOptions`, `companyOptions`, `selectedJobId`, `isCreating`
   - **Emits:** `update:selectedJobId`, `addCompany`

   ## Usage
   ```vue
   <ApplicationsFormView
     :draft="applicationDraft"
     :job-options="jobs"
     :company-options="companies"
     :selected-job-id="selectedJobId"
     @update:selectedJobId="handleJobSelection"
     @addCompany="openAddCompanyModal"
   />
   ```

   ## Dependencies
   - **Stores:** None (directly)
   - **Services:** None (directly)
   - **i18n keys:** Various application-related strings for labels and placeholders.
   - **Components:** `SharedSelect`
   - **Backend routes:** Not directly mentioned in the code snippet.