# Next Step - Job Application Tracker 🎯

> A modern, enterprise-grade job application management platform built with **Quasar Framework** and **Vue 3**

[![Quasar](https://img.shields.io/badge/Quasar-2.16.0-00b4ff.svg)](https://quasar.dev/)
[![Vue](https://img.shields.io/badge/Vue.js-3.4.18-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0.1-ffd859?logo=pinia)](https://pinia.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)](https://www.ecmascript.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)](https://vitejs.dev/)

## 🚀 Project Overview

**Next Step** is a comprehensive SaaS platform designed to streamline the job search process. Built with modern web technologies, it provides job seekers with powerful tools to manage applications, track companies, and organize career documents efficiently.

### 🎯 Key Features

#### 📊 Application Management
- **Smart Dashboard** - Real-time analytics and application status tracking
- **Kanban & List Views** - Flexible visualization of application pipeline
- **Advanced Filtering** - Multi-criteria search with translated options
- **Status Workflow** - Track applications from discovery to offer stage

#### 🏢 Company Intelligence
- **Company Database** - Centralized company information management
- **Job Availability Tracking** - Monitor open positions per company
- **Application History** - Complete application timeline per company
- **Integration** - Direct links to career pages and Google Maps location

#### 📄 Document Management
- **CV & Cover Letter Library** - Centralized document repository
- **Version Control** - Multiple versions per position/company
- **File Upload** - Support for PDF and DOCX formats
- **Smart Categorization** - Link documents to specific applications

#### 🔐 Authentication & Security
- **Secure Authentication** - JWT-based session management
- **Email Verification** - Account confirmation workflow
- **Password Recovery** - Secure password reset flow
- **Protected Routes** - Role-based access control

#### 🌍 Internationalization (i18n)
- **4 Language Support**: English, French, Finnish, Swedish
- **Real-time Translation** - Dynamic locale switching
- **Localized References** - Translated enums and static data
- **Vue I18n Integration** - Professional translation management

## 💻 Technical Architecture

### Frontend Stack

#### Core Framework
```javascript
Vue 3 (Composition API)     // Progressive JavaScript framework
Quasar v2                   // Material Design UI framework
Pinia                       // Official Vue state management
Vue Router 4                // Client-side routing
```

#### Build Tools & Development
```javascript
Vite                        // Next-generation build tool
ESLint 9                    // Code quality and consistency
Prettier 3                  // Opinionated code formatter
PostCSS + Autoprefixer      // CSS processing
```

#### Testing & Mocking
```javascript
MSW (Mock Service Worker)   // API mocking for development/testing
```

### State Management Architecture (Pinia)

```
stores/
├── session-store.js      → Authentication & user session
├── user-store.js         → User profile management
├── jobs-store.js         → Job applications CRUD + filtering
├── companies-store.js    → Company data management
├── content-store.js      → CV/CL document management
└── reference-store.js    → Static data (positions, statuses, locations)
```

**Key Design Patterns:**
- ✅ **Modular Store Architecture** - Separation of concerns
- ✅ **Centralized State** - Single source of truth
- ✅ **Computed Getters** - Reactive derived state
- ✅ **Async Actions** - Promise-based API calls
- ✅ **HMR Support** - Hot Module Replacement for stores

### Service Layer (API Integration)

```
services/
├── authServices.js       → Login, register, password reset
├── jobServices.js        → Job CRUD operations
├── companiesServices.js  → Company management
├── contentServices.js    → CV/CL file operations
├── referenceService.js   → Static reference data
└── uploadServices.js     → File upload handling
```

**Architecture Highlights:**
- 🔹 **Axios-based HTTP Client** - Centralized API communication
- 🔹 **Error Handling** - Standardized error messages
- 🔹 **Request Interceptors** - JWT token injection
- 🔹 **Response Transformation** - Normalized data structures

### Component Architecture

#### Custom Reusable Components

**TranslatedMultiSelect** - A production-ready, intelligent multi-select component:
```vue
<TranslatedMultiSelect
  v-model="filterPosition"
  :options="positionOptions"
  label="Position"
  reference-map-name="positionMap"
  @update:model-value="onFilterChange"
/>
```

**Features:**
- ✅ Automatic translation via reference maps
- ✅ Support for string arrays, objects, and translated enums
- ✅ Smart chip rendering with remove functionality
- ✅ "All" option filtering
- ✅ Fully customizable styling

**Impact:** Reduced code duplication by **60+ lines** per usage

## 🛠 Installation & Setup

### Prerequisites
```bash
Node.js: ^20 || ^22 || ^24 || ^26 || ^28
npm: >= 6.13.4 || yarn: >= 1.21.1
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/B9R9/next-step-frontend.git
cd next-step-frontend

# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
quasar dev

# Build for production
npm run build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build optimized production bundle |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run test suite |

## 📁 Project Structure

```
next-step-frontend/
├── src/
│   ├── components/
│   │   ├── common/              # Shared UI components
│   │   │   └── TranslatedMultiSelect.vue
│   │   ├── content-forms/       # Form components (Jobs, Companies)
│   │   ├── dialog/              # Dialog/Modal components
│   │   └── form/                # Authentication forms
│   │
│   ├── composables/             # Vue composables (shared logic)
│   ├── layouts/                 # Application layouts
│   │   └── MainLayout.vue       # Authenticated user layout
│   │
│   ├── pages/
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── myjobs/              # Job applications page
│   │   ├── mycompanies/         # Companies management
│   │   ├── cvcl/                # CV/Cover letter manager
│   │   ├── HomePage.vue         # Public landing page
│   │   ├── LoginPage.vue        # Authentication page
│   │   └── ConfirmEmailPage.vue # Email verification
│   │
│   ├── router/
│   │   ├── index.js             # Router configuration + guards
│   │   └── routes.js            # Route definitions
│   │
│   ├── stores/                  # Pinia state management
│   ├── services/                # API service layer
│   ├── i18n/                    # Translation files (en/fr/fi/sv)
│   ├── utils/                   # Helper functions
│   └── boot/                    # Quasar boot files
│
├── public/                      # Static assets
├── quasar.config.js             # Quasar framework config
├── vite.config.js               # Vite build config
└── package.json
```

## 🌐 Internationalization

The application uses **Vue I18n** for comprehensive internationalization:

```javascript
// Translation structure
i18n/
├── en/
│   ├── common.json       // Common UI strings
│   ├── form.json         // Form labels and validation
│   └── reference.json    // Enums (positions, statuses, etc.)
├── fr/
├── fi/
└── sv/
```

**Usage example:**
```vue
<template>
  <div>{{ $t('common.welcome') }}</div>
  <div>{{ $t('form.jobs.position') }}</div>
</template>

<script>
// Programmatic usage
this.$i18n.locale = 'fr'
</script>
```

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **HTTP-only Cookies** - XSS protection
- ✅ **Route Guards** - Protected authenticated routes
- ✅ **Token Refresh** - Automatic session renewal
- ✅ **CSRF Protection** - Cross-site request forgery prevention
- ✅ **Input Validation** - Client-side form validation

## 📊 Key Technical Achievements

### Performance Optimizations
- ⚡ **Vite Build Tool** - Lightning-fast HMR and builds
- ⚡ **Lazy Loading** - Route-based code splitting
- ⚡ **Component Caching** - Optimized re-renders with Vue 3 reactivity

### Code Quality
- ✨ **ESLint Configuration** - Enforced code standards
- ✨ **Prettier Integration** - Consistent code formatting
- ✨ **Modular Architecture** - High cohesion, low coupling
- ✨ **Reusable Components** - DRY principles

### Developer Experience
- 🔧 **Hot Module Replacement** - Instant feedback loop
- 🔧 **TypeScript-ready** - JSConfig for IDE support
- 🔧 **EditorConfig** - Consistent editor settings
- 🔧 **Git Hooks** - Pre-commit linting (optional)

## 🎨 UI/UX Highlights

- **Material Design** - Following Google's design principles
- **Responsive Layout** - Mobile-first approach
- **Dark Mode Support** - User preference detection
- **Smooth Transitions** - Vue Router transitions
- **Accessibility** - ARIA labels and keyboard navigation

## 📈 Future Enhancements

- [ ] Unit & E2E Testing (Vitest + Cypress)
- [ ] PWA Support (Offline functionality)
- [ ] Analytics Dashboard (Chart.js integration)
- [ ] Email Notifications (Application reminders)
- [ ] PDF Generation (CV/CL export)
- [ ] AI-powered Recommendations

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
```bash
# Before committing
npm run lint    # Check code quality
npm run format  # Auto-format code
```

## 📄 License

Private repository. All rights reserved © 2025 Baptiste Riffard

## 👤 Author

**Baptiste Riffard**  
📧 baptiste.riffard@gmail.com  
🔗 [GitHub](https://github.com/B9R9)

---

**Built with** ❤️ **using** [Quasar Framework](https://quasar.dev/) • [Vue 3](https://vuejs.org/) • [Pinia](https://pinia.vuejs.org/)
