# Project Context for AI Assistants

## 1) Project overview
This repository is the frontend for **Quinzenal (CashFlow)**, a personal cashflow management app.

Core domains currently implemented:
- Balance by period (quincenal)
- Cards and card movements
- Debts (people, debts, debt movements)
- Credits and credit payments

The app is a **Vue 3 SPA** with route-level pages and a component-first feature structure.

---

## 2) Architecture

### High-level architecture
- **UI layer:** Vue SFCs (`.vue`) with Composition API (`<script setup>`)
- **Routing layer:** Vue Router with lazy-loaded pages
- **Data access layer:** centralized Axios instance in `src/services/api.js`
- **State layer:** local component/page state using `ref`, `computed`, `watch`, `onMounted`
- **Styling layer:** Vuetify + Tailwind + CSS theme variables

### Runtime flow
1. App bootstraps in `src/main.js`
2. Registers Pinia, Router, Vuetify
3. Mounts `App.vue`, which renders `MainLayout`
4. `MainLayout` renders sidebar/header and `<RouterView />`
5. Each page handles its own data fetching and mutations through `api`

### Routing strategy
Routes are defined in `src/router/index.js` and lazy-load each page via dynamic imports.
Pattern:
- List pages: `/cards`, `/debts`, `/credits`, `/balance`
- Detail pages: `/cards/:id`, `/debts/:id`, `/people/:id`, `/credits/:id`

---

## 3) Folder structure and responsibilities

```text
src/
  components/
    common/        # Reusable cross-domain UI (modals, date filter, period cards)
    balance/       # Balance domain UI pieces
    cards/         # Cards domain UI pieces
    debts/         # Debts domain UI pieces
    credits/       # Credits domain UI pieces
  pages/
    BalanceQuick/  # Balance page container(s)
    CardsHistory/  # Card list + detail containers
    Debts/         # People/debt list + detail containers
    Credits/       # Credit list + detail containers
  layouts/
    MainLayout.vue # App shell (sidebar, header, router outlet)
  router/
    index.js       # Route table + lazy imports
  services/
    api.js         # Axios instance + interceptors
  composables/
    useTheme.js    # Theme synchronization (CSS class + Vuetify)
  utils/
    formatters.js  # Shared helpers (currency formatting)
  styles/
    theme.css              # CSS custom properties + dark/light palettes
    vuetify-overrides.css  # Vuetify style alignment with custom theme
  stores/
    (currently empty)
```

Design intent:
- **Pages = orchestration/state + API calls**
- **Components = presentation + emitted actions**

---

## 4) Frameworks and libraries used

- **Vue 3** (`<script setup>`, Composition API)
- **Vite** for build/dev server
- **Vue Router 4** for SPA navigation
- **Vuetify 3** as primary component system
- **Tailwind CSS v4** for utility-first layout/styling
- **Axios** for HTTP requests
- **Pinia** installed and registered, but no active stores yet
- **Day.js** dependency present (limited visible usage)

---

## 5) Coding patterns used in this repo

### 5.1 Component/page pattern
Typical page structure:
- Define reactive state with `ref`
- Derive values with `computed`
- Fetch initial data in `onMounted`
- Handle user actions via local async functions
- Pass data to feature components via props
- Receive user intent from components via emits

Examples:
- List pages: `loadX`, `submitX`, `deleteX`, `goToX`
- Detail pages: `loadSummary`, `loadMovements`, `editMovement`, `resetDates`

### 5.2 CRUD interaction pattern
Common flow:
1. Open dialog (`dialogX = true`, optional `editingX`)
2. Submit create/update request
3. Reload affected lists/summary (`await load...` or `Promise.all`)
4. Close dialog and reset loading flags

### 5.3 Props/emits conventions
- Dialog components often expose `v-model` via `modelValue` + `update:modelValue`
- Domain actions emitted as simple verbs: `save`, `edit`, `delete`, `open`, `refresh`
- Some filter components use named model events (e.g. `update:from-date`, `update:to-date`)

### 5.4 Error handling pattern
- API calls wrapped in `try/catch`
- Errors logged with `console.error`
- Fallback values assigned (`[]` or `null`) to keep UI stable
- Browser `confirm(...)` used for delete confirmations in several pages

---

## 6) How API calls are done

All API calls use the shared Axios instance in `src/services/api.js`.

### API client setup
- Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`
- Timeout: `10000ms`
- Request interceptor exists (prepared for auth header injection)

### Endpoint style
- REST-style under `/v1/...`
- Common methods used: `get`, `post`, `put`, `patch`, `delete`
- Query params passed via `{ params: { ... } }`

### Typical page call examples
- `GET /v1/cards`
- `POST /v1/cards`
- `PUT /v1/cards/:id`
- `DELETE /v1/cards/:id`
- `GET /v1/cards/:id/summary`
- `GET /v1/cards/:id/movements?fromDate=&toDate=`

### Current constraints
- No centralized error normalization
- No centralized loading/error store
- No retry/caching layer

---

## 7) How state management works

### Current state approach
State is **local to pages/components**, not global.

Used primitives:
- `ref` for mutable state (lists, form data, dialog booleans, loading flags)
- `computed` for derived values (summaries, filtered lists, CSS classes)
- `watch` for dependent refreshes (e.g., selected period changes)
- `onMounted` for initial fetches

### Pinia status
- Pinia is created in `main.js` (`app.use(createPinia())`)
- `src/stores` is currently empty
- No active `defineStore(...)` usage in current codebase

Implication: feature logic is page-centric; cross-page shared state is minimal at the moment.

---

## 8) Naming conventions observed

### Files and folders
- Vue components: **PascalCase** (e.g., `CardFormDialog.vue`)
- Feature folders under `components/`: **lowercase plural** (`cards`, `debts`, `credits`, `balance`, `common`)
- Page folders under `pages/`: **PascalCase** domain names (`CardsHistory`, `Debts`, `Credits`)

### Symbols
- Variables/functions/composables: **camelCase** (`loadCards`, `editingMovement`, `useTheme`)
- Boolean flags: prefixed with `is`, `show`, `loading`, `saving`
- Route names: lowercase with hyphen for detail (`card-detail`, `person-detail`)

### Events and model bindings
- `update:modelValue` for standard dialog two-way binding
- Custom update events often use kebab-case suffixes (`update:from-date`)

### Language usage
- Code identifiers mostly in English
- User-facing UI strings commonly in Spanish

---

## 9) Rules for adding new features

Use these repository-specific rules when implementing new functionality.

### 9.1 Placement rules
1. Add/extend page container in `src/pages/<Domain>/...` for orchestration/state/API logic.
2. Put reusable domain UI in `src/components/<domain>/...`.
3. Put cross-domain reusable elements in `src/components/common/...`.
4. Put API helper changes in `src/services/api.js` only when globally needed (interceptors, defaults).
5. Put shared formatting utilities in `src/utils/formatters.js`.

### 9.2 Page implementation rules
1. Use `<script setup>` + Composition API.
2. Keep async operations in explicit functions (`loadX`, `submitX`, `deleteX`).
3. Track loading and saving with dedicated refs.
4. Prefer `Promise.all` when refreshing multiple independent resources.
5. On mutation success, refresh server state rather than mutating local arrays ad-hoc.

### 9.3 Component contract rules
1. Keep presentational components stateless when possible.
2. Use props for input data and emits for actions.
3. For dialogs, follow `modelValue` + `update:modelValue` convention.
4. Keep emitted action names concise and verb-based: `save`, `edit`, `delete`, `refresh`, `open`.

### 9.4 API rules
1. Reuse `api` client from `src/services/api.js`; do not instantiate Axios per component.
2. Keep endpoints under existing `/v1/...` style.
3. Pass filters as Axios `params` objects.
4. Handle errors with `try/catch`; preserve safe fallback state.

### 9.5 Styling/theming rules
1. Prefer Vuetify components for forms/tables/dialogs/buttons.
2. Use existing CSS variables (`--color-*`) and Vuetify theme tokens.
3. Use Tailwind utility classes for layout/spacing tweaks.
4. Avoid hardcoded colors when equivalent theme variables exist.
5. Keep theme behavior compatible with `useTheme` and current dark/light mechanism.

### 9.6 Naming rules
1. New components in PascalCase.
2. New local refs/functions in camelCase.
3. New booleans with semantic prefixes (`is`, `show`, `loading`, `saving`).
4. Keep route names and path semantics consistent with current router style.

### 9.7 Recommended quality baseline
For each new feature:
- Add clear loading state handling
- Add empty/fallback state handling
- Ensure mutation paths trigger data refresh
- Keep UI text consistent with existing language context (Spanish labels/messages)

---

## 10) Current technical notes (important for assistants)

- `readme.md` mentions “Vite / Next.js”, but actual project is Vite + Vue.
- Tailwind + Vuetify hybrid styling is intentional.
- Pinia is available but not yet adopted by feature code.
- `src/stores` is currently empty; introducing global stores should be deliberate and justified.

This document is intended to be the baseline context for future AI-assisted changes in this repository.
