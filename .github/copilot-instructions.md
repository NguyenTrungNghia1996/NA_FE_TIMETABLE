# AI Agent Instructions for Vn TimeTable Frontend

Vn TimeTable is a Vietnamese school timetable management system built on **Nuxt 3 + Vue 3**, with complex drag-and-drop scheduling, multi-unit support, and extensive data validation. This guide accelerates onboarding for AI agents.

## Project Architecture Overview

### The "Big Picture": Multi-Unit Timetable Engine

The system manages school timetables across multiple **units** (schools/institutions):
- `unitStore`: Detects unit via subdomain (e.g., `tkb.domain.com`, `testtkb.domain.com`)
- Maps unit → API base URL dynamically; fallback to `NUXT_PUBLIC_BASE_URL`
- All API calls inherit the unit's base URL automatically

### Core Data Flow

1. **User Login** → Token stored in `userStore` (persisted via cookies)
2. **Auth Middleware** (`auth.global.js`): Validates JWT expiry; redirects to login if expired
3. **Unit Detection**: Hostname subdomain parsed; matched against hardcoded unit routes in `unitStore.baseUrl`
4. **Menu/Permissions Load**: Lazy-loaded from API after auth; controls UI visibility
5. **Timetable Interaction**: Flat lesson records ↔ Grid structure via `useTimetable` composable

### Key Components & Stores

**Stores** (Pinia, cookie-persisted):
- `userStore`: `user.token`, `user.item.hoten`, user login/logout
- `unitStore`: Resolves API base URL from unit
- `settingStore`: Menu, permissions, timetable config
- `timetableStore`: Likely holds grid state (confirm via [stores/timetableStore.ts](stores/timetableStore.ts))

**Components**:
- `TimetableGrid.vue` (1800+ lines): Interactive grid, drag-drop, right-click context menu
- `components/Select/*.vue`: 20+ auto-imported select components (e.g., `SelectClass`, `SelectTeacher`)
- Supporting: `UnscheduledTable.vue`, `ReviewTimetableGrid.vue`, `TimetableInfo.vue`

**Composables**:
- `useApi`: Centralized HTTP layer; wraps `useFetch`, auto-injects headers, handles 401 redirects
- `useTimetable`: Transforms flat records ↔ 3D grid (shifts → days → periods)
- `usePermissions`, `useMenu`: Auth-related logic

## API Architecture: RESTful Class-Based Design

**useApi Pattern** ([composables/useApi.js](composables/useApi.js)):
- Singleton `RestApi` exposes resource namespaces: `api.user`, `api.timetable`, `api.classroom`, etc.
- Each resource (e.g., `Timetable` class) wraps `Request` helper with CRUD + domain-specific methods
- Example: `api.timetable.arrange_class(data)` → POST `/api/tkb/xeptheolop`

**Key Endpoints**:
- Timetable: `/api/tkb/*` (regular), `/api/lich/*` (review/exam)
- Search: `.list(params)`, `.detail(id)`
- Arrange: `.arrange_all()`, `.arrange_class()`, `.arrange_teacher()`, `.arrange_room()`
- Lock/Cancel: `.lock_period()`, `.cancel_period()`, `.unlock_teacher_period()`

**Error Handling**:
- 401 → auto-logout & redirect to `/login`
- Errors thrown; components must wrap calls in `try/catch`

## Critical Patterns & Gotchas

### Select Components (`components/Select/`)

**DO**:
- Use `v-model` (two-way binding); will be array if `multiple=true`
- Set `:noFormItem="true"` + `:inlineLabel="true"` for embedded displays (not in forms)
- Implement 300ms debounce for server-side search (already built-in)

**DON'T**:
- Modify options after selection without updating `modelValue`
- Forget `:size="small"` or equivalent for compact layouts

**Special Props**:
- `autoSelectFirst`: Auto-selects first option on mount (e.g., class selector)
- `hasNavigation`: Previous/next buttons for sequential selection

### Timetable Grid (`TimetableGrid.vue`)

**Structure**: `ds_Ca[] → ds_Ngay[] → ds_Tiet[]` (shifts → days → periods)
- Drag-drop from unscheduled → grid, or between cells
- Right-click menu: Lock, unlock, cancel, delete lesson
- Cells styled via `cellClasses()` (error states, locks, drags)

**Common Tasks**:
- Find lesson by position: `timetable.find_class_position({ body: {...}, params: {...} })`
- Update after drag: `timetable.update_class()`
- Unscheduled lessons: `timetable.unscheduled()`

### Persisted State & Reactivity

- Stores use `pinia-plugin-persistedstate` + cookies (survives refresh)
- Don't access `userStore.user.token` directly outside composables; use getter
- `settingStore.menuPermissions` drives visibility; compare against permission codes

### Environment & Build

**Runtime Config** (injected at build time):
- `NUXT_PUBLIC_BASE_URL`: Fallback API URL
- `NUXT_ENCRYPTION_KEY`: 32+ chars; unused in current codebase (crypto-js imported but not deployed)
- `NUXT_PUBLIC_BUILD_TAG`, `BUILD_SHA`, `BUILD_TIME`: Optional; injected via Docker build args

**Docker Multi-Stage Build**:
```bash
docker build \
  --build-arg BUILD_TAG=$(git rev-parse --abbrev-ref HEAD) \
  --build-arg BUILD_SHA=$(git rev-parse --short HEAD) \
  -t vn_time_table:dev .
```

## Development Workflow

```bash
yarn install              # Install dependencies
yarn dev                  # Run http://localhost:3000
yarn build                # Production build (outputs .output/)
yarn preview              # Test production build locally
```

**Debugging**:
- Enable DevTools in `nuxt.config.ts` (already on)
- Check `unitStore.baseUrl` if API calls fail (unit detection issue)
- Inspect cookies for `user` store state (auth/token issues)

## Common Issues & Solutions

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| API 404 on requests | Wrong base URL (unit not matched) | Verify hostname subdomain in `unitStore.baseUrl` switch |
| Lesson won't drag | `isDraggable()` returns false | Check lesson lock status, unscheduled state, validation errors |
| Select options empty | API fetch failed silently | Check browser DevTools Network; confirm `useApi` call and error handling |
| Grid not refreshing | Mutation outside action | Always mutate stores via actions; use `const { data } = await api.call()` |
| Login redirect loop | Token expired or missing | Check cookie storage; clear & retry login |

## File Organization Reference

```
components/
  Select/                # 20+ auto-imported selectors
    Class.vue            # Main class selector; handles navigation
    Teacher.vue, Classroom.vue, Subject.vue, etc.
  TimetableGrid.vue      # Interactive grid (1800 LOC)
  Base/                  # Layout wrappers (Menu, Header, etc.)
  Review/                # Review schedule grids & tables
composables/
  useApi.js              # REST client (1509 LOC)
  useTimetable.js        # Grid ↔ flat transformations
  useAuth.ts, useMenu.js, usePermissions.js
stores/
  userStore.js           # JWT + user info
  unitStore.js           # Unit → API URL mapping
  settingStore.js        # Menu + permissions
  timetableStore.ts      # Grid state (TBD)
pages/
  login.vue              # Auth entry point
  dashboard.vue          # Main app shell
  category_management/   # Masters (class, teacher, subject, etc.)
  list_management/       # Timetable CRUD
  schedule/              # Scheduling interface
middleware/
  auth.global.js         # JWT validation + unit detection
```

## Key Takeaways for Agents

1. **Always use `useApi()`**: Never call `useFetch()` directly; let the composable handle headers & errors
2. **Unit context matters**: API URLs are dynamic; confirm unit is detected correctly
3. **Transform via `useTimetable`**: Don't manipulate grid structure manually; use provided helpers
4. **Pinia first**: Store state in actions; avoid direct mutations or local state for shared data
5. **Test auth flow**: Login, verify token in cookie, check menu loads before testing features
