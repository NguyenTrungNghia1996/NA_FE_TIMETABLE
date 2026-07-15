# Vn TimeTable (FE) - Project Context

## Project Overview

**Vn TimeTable** is a frontend application for managing school timetables. It allows users to view, arrange (drag & drop), and manage schedules for classes and teachers.

### Tech Stack
- **Framework:** [Nuxt 3](https://nuxt.com/) (Vue 3)
- **UI Library:** [Ant Design Vue](https://antdv.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Pinia](https://pinia.vuejs.org/) (with `pinia-plugin-persistedstate`)
- **Utilities:** [VueUse](https://vueuse.org/), Day.js, Lodash, Crypto-js

## Getting Started

### Prerequisites
- **Node.js:** v18+ (Recommended v20+)
- **Package Manager:** Yarn v1.x (Locked in `yarn.lock`)

### Installation

```bash
yarn install
```

### Development Server

Start the development server at http://localhost:3000:

```bash
yarn dev
```

## Building & Deployment

### Production Build

```bash
yarn build
```

To preview the production build locally:

```bash
yarn preview
```

### Docker

The project uses a multi-stage `Dockerfile`.

**Build Image:**
```bash
docker build \
  -t vn_time_table:dev \
  --build-arg BUILD_TAG=$(git rev-parse --abbrev-ref HEAD) \
  --build-arg BUILD_SHA=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  .
```

**Run Container:**
```bash
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e NUXT_PUBLIC_BASE_URL=https://api.testtkb.nguyenanhtsc.com \
  -e NUXT_ENCRYPTION_KEY=your-secret-key \
  vn_time_table:dev
```

## Project Structure

- **`assets/`**: Static assets and global CSS (`tailwind.css`).
- **`components/`**: reusable Vue components.
    - **`Select/`**: A large collection of specialized selection components (e.g., `SelectClass`, `SelectTeacher`, `SelectSubject`) that handle API fetching and filtering automatically.
    - **`TimetableGrid.vue`**: The core component for the interactive timetable grid.
- **`composables/`**: Auto-imported logic.
    - `useApi.js`: API wrapper with token handling and error interception.
    - `useTimetable.js`: Logic for timetable operations.
- **`layouts/`**: App layouts (`default.vue`, `auth.vue`).
- **`pages/`**: Application routes.
- **`stores/`**: Pinia stores (`userStore`, `settingStore`, `unitStore`).
- **`nuxt.config.ts`**: Main Nuxt configuration.

## Key Conventions

### API Handling
- Use the `useApi` composable for all API requests.
- It handles authentication tokens from `userStore` and redirects to login on 401 errors.
- Base URL is dynamic, prioritizing `unitStore.baseUrl` and falling back to runtime config.

### Select Components (`components/Select/*.vue`)
- Follow a consistent pattern for dropdowns.
- **Auto-import:** `components/Select/Class.vue` -> `<SelectClass />`.
- **Common Props:** `v-model`, `multiple`, `placeholder`, `size`.
- **Special Props:** Some components have specific filters (e.g., `SelectClass` has `id_khoi`, `SelectClassroom` has `idLoaiPhonghoc`).

## Configuration (Environment Variables)

Key variables in `nuxt.config.ts` (`runtimeConfig`):

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NUXT_PUBLIC_BASE_URL` | Backend API URL | `https://api.testtkb.nguyenanhtsc.com` |
| `NUXT_ENCRYPTION_KEY` | Key for data encryption | `default-strong-key...` |
| `NUXT_PUBLIC_BUILD_TAG` | Build version/tag | `dev` |
