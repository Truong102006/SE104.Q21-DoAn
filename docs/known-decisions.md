# Known Decisions

## Purpose
Capture decisions already encoded in code so future changes do not accidentally break business or architecture assumptions.

## Decision 1: Keep Dual API Namespace (`/api` + `/api/v1`)
- Status: Active
- Evidence: many controllers mapped with two base paths.
- Why:
  - preserve compatibility with earlier clients/scripts
  - allow gradual migration
- Implication:
  - avoid removing legacy paths without full impact analysis
  - frontend currently still uses `/api/v1/nguoi-dung` and `/api/v1/nhom-nguoi-dung`

## Decision 2: Uniform API Envelope
- Status: Active
- Evidence: controllers return `ApiResponse.success(...)`, errors normalized in `GlobalExceptionHandler`.
- Why:
  - consistent FE parsing and error handling
- Implication:
  - new endpoints should follow same envelope, not raw objects

## Decision 3: JWT Stateless Auth
- Status: Active
- Evidence:
  - `SecurityConfig` uses stateless sessions
  - `JwtAuthenticationFilter` reads Bearer token
- Why:
  - simple horizontal scaling and decoupled clients
- Implication:
  - logout is client-side token removal semantics
  - frontend persistence behavior (localStorage + cookie) is critical for guard flow

## Decision 4: Product Selling Price Is Backend-Derived
- Status: Active
- Evidence: `PricingUtils.calculateSellingPrice`, used in product/purchase/sale services.
- Why:
  - single source of truth for pricing rule (profit-rate based)
- Implication:
  - do not trust FE `donGiaBan` calculations as authoritative

## Decision 5: Stock Changes Only Through Vouchers
- Status: Active
- Evidence:
  - product service blocks manual stock edits
  - purchase increases stock, sale decreases stock
- Why:
  - preserve auditable inventory movements
- Implication:
  - never add direct stock mutation in product CRUD paths

## Decision 6: Oversell Protection in Sales Flow
- Status: Active
- Evidence: sales service validates quantity <= current stock; repository lock path used for update flow.
- Why:
  - prevent negative stock and race-condition sales
- Implication:
  - concurrency behavior in sale flow is business-critical

## Decision 7: Service Ticket Prepayment Is Rule-Driven
- Status: Active
- Evidence:
  - prepayment rate from setting `SERVICE_PREPAYMENT_RATE`
  - per-line minimum prepayment enforced in service creation
- Why:
  - reflects business regulation (QD13-driven)
- Implication:
  - settings changes affect future service vouchers
  - keep validation in backend even if FE pre-validates

## Decision 8: Delivery Workflow Updates Ticket Financials/Status
- Status: Active
- Evidence:
  - deliver item/all sets line delivered and recomputes totals + ticket status
- Why:
  - ensure financial state and status remain coherent
- Implication:
  - any new delivery operation must preserve recalculation logic

## Decision 9: Report Generation by Month/Year
- Status: Active
- Evidence:
  - report controllers accept `month`, `year`
  - generate/get flows separated
- Why:
  - monthly accounting/reporting model
- Implication:
  - report APIs should remain deterministic by period keys

## Decision 10: Role Controls Are Layered
- Status: Active
- Evidence:
  - URL-pattern controls in `SecurityConfig`
  - method-level `@PreAuthorize` on sensitive operations
- Why:
  - defense-in-depth for authorization
- Implication:
  - maintain both layers when introducing new sensitive endpoints

## Decision 11: Frontend Has Intentional Mixed Real/Mock State (Current)
- Status: Active but transitional
- Evidence:
  - notifications uses `MOCK_NOTIFICATIONS`
  - gold-prices page is placeholder
  - profile data sourced from auth-store local state
  - dashboard gold ticker simulated in UI
- Why:
  - phased delivery; prioritize core business modules first
- Implication:
  - do not assume all pages are backend-backed
  - document source of truth per page before refactors

## Decision 12: Project Uses Localized UI (VI/EN)
- Status: Active
- Evidence: i18n context and locale JSON dictionaries.
- Why:
  - support bilingual usage and demo needs
- Implication:
  - preserve key-based translation workflow, avoid hardcoding strings in new UI logic

## Decision 13: Service Ticket Lookup Is Embedded In Service Orders Page
- Status: Active
- Evidence:
  - `frontend/src/app/(dashboard)/dashboard/service-orders/page.tsx` calls `backendApi.search.serviceTickets(...)`
  - no dedicated `service-voucher-lookup` route file currently exists under dashboard routes
- Why:
  - consolidate create/deliver/lookup flow for service vouchers in one module
- Implication:
  - avoid introducing new parallel lookup UX without clear reason
  - stale links to `/dashboard/service-voucher-lookup` should be considered cleanup candidates

## Open Items Needing Verification
1. Env variable naming mismatch:
- FE code reads `NEXT_PUBLIC_API_BASE_URL`, while docs/examples mention `NEXT_PUBLIC_API_URL`.

2. E2E stability:
- current Playwright spec appears not aligned with latest labels/flow; update may be required.

3. Legacy endpoint deprecation plan:
- `/api/v1/...` surface is still broad; formal deprecation timeline not yet documented.
