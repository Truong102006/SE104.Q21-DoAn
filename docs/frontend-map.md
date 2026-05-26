# Frontend Map

## Frontend Architecture
- Framework: Next.js App Router (`frontend/src/app`)
- Main route groups:
  - `(auth)`: login
  - `(dashboard)`: authenticated app shell + business modules
- Shared UI:
  - `components/ui`: shadcn primitives
  - `components/dashboard`: reusable page/header/table/dialog blocks
  - `components/layout`: sidebar + header
- Data access:
  - `services/api-client.ts`: base request + token + envelope parsing
  - `services/backend-api.ts`: endpoint-specific wrappers

## Route Guard & Auth Flow
- `middleware.ts` checks `auth-token` cookie:
  - no token on protected route -> redirect `/login?callbackUrl=...`
  - token on public route (`/login`) -> redirect `/dashboard`
- `auth-store.ts` persists token/user in localStorage and cookie.
- Dashboard layout rehydrates auth and calls `/api/auth/me`.

## Route/Page Inventory

| Route | File | Status | Data Source | Notes |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Redirect | N/A | Redirects to `/dashboard` or `/login` |
| `/login` | `src/app/(auth)/login/page.tsx` | Active | Backend API | Uses `/api/auth/login` + `/api/auth/me` |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | Active | Backend + local simulated ticker | KPIs from products/sales/service tickets |
| `/dashboard/suppliers` | `.../suppliers/page.tsx` | Active | Backend API | CRUD, delete admin-only |
| `/dashboard/customers` | `.../customers/page.tsx` | Active | Backend API | CRUD, delete admin-only |
| `/dashboard/units` | `.../units/page.tsx` | Active | Backend API | CRUD; create/update/delete admin-only |
| `/dashboard/product-types` | `.../product-types/page.tsx` | Active | Backend API | CRUD; create/update/delete admin-only |
| `/dashboard/service-types` | `.../service-types/page.tsx` | Active | Backend API | CRUD; create/update/delete admin-only |
| `/dashboard/products` | `.../products/page.tsx` | Active | Backend API | Paged list/filter + CRUD |
| `/dashboard/product-catalog` | `.../product-catalog/page.tsx` | Active | Backend API | Card/grid catalog + temporary sales draft handoff to `/dashboard/orders` |
| `/dashboard/purchase-orders` | `.../purchase-orders/page.tsx` | Active | Backend API | Create voucher + history + print data |
| `/dashboard/orders` | `.../orders/page.tsx` | Active | Backend API | Sales voucher creation + history |
| `/dashboard/service-orders` | `.../service-orders/page.tsx` | Active | Backend API | Service voucher create + deliver item/all + integrated lookup/history (filters, paging, detail modal) |
| `/dashboard/reports` | `.../reports/page.tsx` | Active | Backend API | Generate/get 3 monthly reports |
| `/dashboard/settings` | `.../settings/page.tsx` | Active | Backend API | Admin settings + prepayment rate |
| `/dashboard/staff` | `.../staff/page.tsx` | Active | Backend API | Uses `/api/v1/nguoi-dung` and `/api/v1/nhom-nguoi-dung` |
| `/dashboard/notifications` | `.../notifications/page.tsx` | Active UI | **Mock/local** | Uses `MOCK_NOTIFICATIONS`, no backend |
| `/dashboard/profile` | `.../profile/page.tsx` | Active UI | **Local auth store** | Displays persisted auth-store user |
| `/dashboard/gold-prices` | `.../gold-prices/page.tsx` | Placeholder | None | `FeaturePlaceholder` only |
| `/dashboard/categories` | `.../categories/page.tsx` | Redirect | N/A | Redirects to `/dashboard/units` |
| `/dashboard/services` | `.../services/page.tsx` | Redirect | N/A | Redirects to `/dashboard/service-types` |

## Sidebar/Menu Map
- Menu source: `components/layout/sidebar.tsx`
- Role filtering:
  - ADMIN + STAFF: most operational modules
  - ADMIN only: `staff`, `settings`, `reports`
- Lookup mode:
  - Product lookup uses `/dashboard/products?mode=search`
  - Service lookup is integrated in `/dashboard/service-orders` (history/advanced lookup section)

## State Management
- `auth-store.ts`: JWT/user persistence and role helpers
- `toast-store.ts`: in-app notification toasts
- `unit-store.ts`: local unit storage (legacy/local-only; current unit pages use backend API)
- `sales-draft-store.ts`: temporary sales draft persistence + handoff signal for catalog -> sales order flow

## Mock/Local-State Areas (Important)
1. Notifications module:
- `src/app/(dashboard)/dashboard/notifications/page.tsx`
- Uses `src/lib/mock-notifications.ts`

2. Gold price page:
- `src/app/(dashboard)/dashboard/gold-prices/page.tsx`
- Placeholder only

3. Profile page:
- Reads user only from `auth-store` local persisted state

4. Dashboard live gold ticker panel:
- Uses local simulated values in dashboard page

5. `src/lib/mock-data.ts`:
- Legacy mock dataset utilities remain in repo (not primary data path for current core pages)

## Frontend Coding Conventions Observed
- `use client` pages for interactive modules
- Reusable page chrome via `PageHeader`, `TableToolbar`, `EmptyState`, `ConfirmDialog`
- API errors normalized through `getApiErrorMessage`
- API typing centralized in `src/types/backend.ts`
- Query params for list/search are normalized in `backend-api.ts`

## Frontend Risks / Verify Later
- Env naming mismatch:
  - code uses `NEXT_PUBLIC_API_BASE_URL`
  - docs/env examples mention `NEXT_PUBLIC_API_URL`
- Stale route references:
  - `/dashboard/service-voucher-lookup` is referenced in dashboard quick actions and header title map
  - route file is currently absent, so direct navigation can lead to 404
- Playwright e2e file (`tests/e2e/main-flows.spec.ts`) appears out-of-sync with current labels/UI behavior.
