# Project Overview

## Project Goal
Build an end-to-end management system for a gold/silver/jewelry store:
- Authentication and role-based access (ADMIN/STAFF)
- Master data management (supplier, customer, unit, product type, service type)
- Product management and pricing rules
- Purchase, sale, and service voucher workflows
- Product/service lookup
- Monthly reports (inventory, product revenue, service revenue)
- Settings/rules update (service prepayment rate)

## Tech Stack

### Backend
- Java 21
- Spring Boot `4.0.6`
- Spring Security (JWT, BCrypt)
- Spring Data JPA + Hibernate
- Flyway migrations
- PostgreSQL
- Springdoc OpenAPI (`/swagger-ui.html`)
- JUnit 5 + Mockito

### Frontend
- Next.js `16.2.4` (App Router)
- React `19.x`
- TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui + Radix + Lucide
- Zustand (auth/toast/local state)
- Framer Motion
- Playwright (e2e setup)

### Infrastructure / Repo
- Monorepo: `backend/` + `frontend/`
- Local DB via `docker-compose.yml` (Postgres 16)
- Utility scripts in `scripts/`

## Directory Structure (High Level)
- `backend/`: API source code and Maven project
- `frontend/`: Next.js application
- `scripts/`: helper scripts (`frontend-start/stop/status`, API test script)
- `docs/`: persistent project knowledge (this folder)
- `docx/`: ad-hoc planning/review notes
- `docker-compose.yml`: local Postgres + optional FE/BE containers

## Runtime Configuration

### Root env examples
- `.env.example`
- `backend/.env.example`
- `frontend/.env.example`

### Important variables
- Backend:
  - `SERVER_PORT`
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
  - `JWT_SECRET`
  - `JWT_EXPIRATION_MS`
  - `AUTH_ADMIN_USERNAME`, `AUTH_ADMIN_PASSWORD`
  - `AUTH_STAFF_USERNAME`, `AUTH_STAFF_PASSWORD`
- Frontend:
  - Code currently reads `NEXT_PUBLIC_API_BASE_URL` (fallback `http://localhost:8080`)
  - Some docs still mention `NEXT_PUBLIC_API_URL` (inconsistency to verify)
- Media upload:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLOUDINARY_UPLOAD_FOLDER`

## How To Run
- Install deps (repo root): `npm install`
- Start database: `npm run db:up`
- Run backend: `npm run dev:backend`
- Run frontend: `npm run dev:frontend`

## Quality Commands Found
- Backend tests: `npm run test:backend`
- Frontend lint: `npm run lint:frontend`
- Frontend type-check: `npm run type-check:frontend`
- Frontend build: `npm run build:frontend`
- Frontend e2e: `npm run test:e2e`

## UI Observation (2026-05-24)
- Frontend endpoint was live at `http://127.0.0.1:3000/login`.
- Observed login screen and dashboard shell:
  - Left icon-based sidebar with grouped menus
  - Header with breadcrumb/title, language switcher, logout
  - Premium card-heavy dashboard visual style with gold accents
- Route guard behavior confirmed:
  - Unauthenticated access redirects to `/login` with `callbackUrl`.

## Current Known Gaps
- Some pages still rely on mock/local state (see `frontend-map.md`).
- Stale UI references to `/dashboard/service-voucher-lookup` still exist while dedicated route file is absent.
- E2E spec selectors/content appear stale compared to current UI text/structure (needs verification).
