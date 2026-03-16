 # ApplicationsMainView
   Displays a list of job applications with filtering and sorting options, including status, company, and date applied.

   ## Purpose
   This component provides an overview of all job applications in the system, allowing users to easily manage and track their progress.

   ## Props & Events
   - `statusOptions`: Array of objects representing possible application statuses with labels and badge classes.
   - `statusColors`, `statusRowBg`: Objects mapping application statuses to colors for display purposes.

   ## Usage
   ```vue
   <template>
     <ApplicationsMainView />
   </template>
   ```

   ## Dependencies
   - Stores used: useApplicationsStore, useCompaniesStore, useCalendarStore
   - Components used: ApplicationsEmptyState, ApplicationsTableSkeleton, ApplicationsPreviewDialog, ApplicationsFormDialog, ActionsMenu, SortButton, SharedMultiSelect, SharedDateFilter
   - i18n keys: 'applications.status.*'
   - Backend routes: Not specified in the provided code