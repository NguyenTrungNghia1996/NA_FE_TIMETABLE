# AI Agent Instructions for Vn TimeTable Frontend

This document provides essential context for AI agents working with the Vn TimeTable codebase, a Nuxt 3 + Vue 3 based school timetable management system.

## Project Architecture

### Core Components
- `components/TimetableGrid.vue` - Main timetable grid with drag & drop functionality
- `components/Select/*.vue` - Reusable select components (auto-imported as PascalCase)
- `stores/` - Pinia stores for state management
- `composables/` - Reusable logic hooks

### Key Technologies
- Nuxt 3 + Vue 3 + Vue Router
- Pinia for state management
- Ant Design Vue + Tailwind CSS
- Node.js 18+ (recommended 20+)

## Development Workflow

### Running the Project
```bash
yarn install        # Install dependencies
yarn dev           # Development server at http://localhost:3000
yarn build         # Production build
yarn preview       # Preview production build
```

### Docker Support
Uses multi-stage Dockerfile. Example build:
```bash
docker build -t vn_time_table:dev .
```

## Critical Patterns

### Component Conventions
1. Select Components:
   - Located in `components/Select/`
   - Auto-imported in PascalCase (e.g., `SelectClass`, `SelectTeacher`)
   - Common props: `v-model`, `multiple`, `placeholder`, `size`, `disabled`, `rules`
   - Remote search with 300ms debounce, server-side filtering

2. TimetableGrid:
   ```vue
   <TimetableGrid 
     v-model:classId="classId" 
     :timetableId="timetableId" 
   />
   ```

### State Management
1. Store Pattern:
   - `unitStore` - Handles unit-specific settings and API base URL
   - `settingStore` - Manages timetable configuration
   - `userStore` - Handles authentication state

### API Integration
1. API Calls:
   - Use `useApi` composable for all API interactions
   - Base URL priority: `unitStore.baseUrl` then `NUXT_PUBLIC_BASE_URL`
   - 401 responses auto-redirect to login page

### Environment Configuration
Required environment variables:
- `NUXT_PUBLIC_BASE_URL`: API backend URL
- `NUXT_ENCRYPTION_KEY`: App encryption key (32+ chars)
- Optional build info: `NUXT_PUBLIC_BUILD_TAG`, `NUXT_PUBLIC_BUILD_SHA`, `NUXT_PUBLIC_BUILD_TIME`

## Common Gotchas
1. Select Components:
   - Always use `:noFormItem="true"` and `:inlineLabel="true"` for inline displays
   - `modelValue` will be array when `multiple=true`
   - Some selects auto-select first item (`autoSelectFirst` prop)

2. API Base URL:
   - Dynamically chosen based on unit context
   - Falls back to `NUXT_PUBLIC_BASE_URL` if no unit match

## File Organization
```
components/
  Select/         # Shared select components
  TimetableGrid.vue
pages/            # Route pages
stores/           # Pinia stores
composables/      # Shared logic
```

## Do's and Don'ts
- DO use Pinia stores for state management
- DO handle API errors via `useApi` composable
- DO follow established naming conventions for Select components
- DON'T bypass the `useApi` composable for API calls
- DON'T modify store state outside of actions