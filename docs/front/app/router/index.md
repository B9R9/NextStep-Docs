 # index
   Vue Router configuration for Next Step module, handling authentication and route navigation.

   ## Purpose
   This module sets up the Vue Router with defined routes, handles authentication checks, and manages redirection based on login status.

   ## API
   - `router`: The created Vue Router instance.

   ## Usage
   ```typescript
   import { router } from './index'
   // Use the router in your application setup
   ```

   ## Dependencies
   - `vue-router` for routing configuration
   - `./routes` module for route definitions
   - LocalStorage 'auth_token' for authentication check