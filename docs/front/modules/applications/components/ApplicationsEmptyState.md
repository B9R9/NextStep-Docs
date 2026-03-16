 # ApplicationsEmptyState
   A Vue component that displays a placeholder state for applications when there are none.

   ## Purpose
   This component is used to inform users about the absence of any job applications and provides an option to create a new application.

   ## Props & Events
   - **Events**: `create` (emitted when the user clicks the "Create Application" button)

   ## Usage
   ```vue
   <ApplicationsEmptyState @create="openApplicationForm"/>
   ```

   ## Dependencies
   - **Stores**: None
   - **Services**: None
   - **i18n Keys**: `applications.emptyState.title`, `applications.emptyState.subtitle`, `applications.emptyState.button`