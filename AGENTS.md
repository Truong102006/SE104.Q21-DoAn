# AGENTS.md

## Purpose
This file is the working contract for future coding agents in this repository.
Goal: ship changes safely without re-learning the whole project each session.

## Project Snapshot
- Monorepo:
  - `backend/`: Spring Boot 4 + Java 21 + PostgreSQL + Flyway
  - `frontend/`: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui
- Business domain: gold/jewelry store management (catalog, products, purchase/sale/service vouchers, lookup, reports, settings, auth/RBAC).
- API style: JSON envelope `ApiResponse<T>` with `success`, `message`, `data`, optional `errors`.

## Hard Rules To Preserve
1. Never update product stock directly from product CRUD.
- Stock is controlled by purchase/sale voucher flows.
- See `SanPhamServiceImpl`, `PhieuMuaHangServiceImpl`, `PhieuBanHangServiceImpl`.

2. Product selling price is server-derived.
- `donGiaBan = donGiaMua + (donGiaMua * tiLeLoiNhuan / 100)`.
- Do not trust client-calculated price as source of truth.

3. Service voucher prepayment rules must stay enforced in backend.
- Per-line minimum prepayment uses `SERVICE_PREPAYMENT_RATE` setting.
- Delivery transitions line status to delivered and recalculates ticket totals/status.

4. Keep role boundaries intact.
- Admin-only areas include reports, settings, user/group/permission, and selected destructive operations.
- Method-level `@PreAuthorize` exists on top of URL-pattern security.

5. Keep dual endpoint compatibility unless explicitly deprecating.
- Many controllers expose both legacy `/api/v1/...` and current `/api/...` paths.
- Frontend currently uses a mix of both (notably users/groups via `/api/v1/...`).

6. Auth is stateless JWT.
- Backend expects `Authorization: Bearer <token>`.
- Frontend uses localStorage + `auth-token` cookie so middleware can guard routes.

## Frontend Constraints
- Use `backendApi` + `apiRequest` for API access; keep envelope/error handling consistent.
- Preserve i18n keys when changing text (`frontend/src/i18n/locales/*.json`).
- Existing known local/mock states:
  - Notifications page uses `MOCK_NOTIFICATIONS`.
  - Gold price page is placeholder.
  - Profile page reads from local auth store.
  - Dashboard gold ticker is simulated local state.

## Backend Constraints
- Keep Flyway migrations additive and forward-only.
- Keep transaction boundaries in service layer (`@Transactional` on writes).
- Keep business validation in services; controllers should remain thin.

## Change Workflow (Minimum)
1. Read impacted docs first:
- `docs/project-overview.md`
- `docs/frontend-map.md`
- `docs/backend-map.md`
- `docs/api-map.md`
- `docs/known-decisions.md`

2. Implement smallest safe change.
3. Run relevant checks:
- Backend tests: `npm run test:backend`
- Frontend lint/type/build:
  - `npm run lint:frontend`
  - `npm run type-check:frontend`
  - `npm run build:frontend`
4. Update docs if behavior/API/structure changed.

## Dev Commands
- Install deps: `npm install`
- DB up/down: `npm run db:up` / `npm run db:down`
- Backend dev: `npm run dev:backend`
- Backend dev (supabase profile): `npm run dev:backend:supabase`
- Frontend dev: `npm run dev:frontend`
- Frontend helper scripts:
  - `npm run dev:frontend:start`
  - `npm run dev:frontend:status`
  - `npm run dev:frontend:stop`

## Watchouts
- Env variable naming mismatch exists in repo docs vs code:
  - Code reads: `NEXT_PUBLIC_API_BASE_URL`
  - Some docs/examples mention: `NEXT_PUBLIC_API_URL`
- Do not assume both are wired; verify before changing env/config logic.
