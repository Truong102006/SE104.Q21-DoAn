# Web quan ly cua hang vang bac da quy

Monorepo scaffold cho do an SE104, gom frontend Next.js va backend Spring Boot. Du an hien chi co setup ky thuat, chua co logic nghiep vu.

## Cau truc

- `frontend`: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion, React Hook Form, Zod, TanStack Table, Playwright.
- `backend`: Spring Boot, Java 21, Maven, REST API, Spring Security, JWT, BCrypt, Jakarta Validation, MapStruct, Springdoc OpenAPI, Spring Data JPA, Flyway, PostgreSQL, HikariCP, JUnit 5, Mockito.
- `docker-compose.yml`: PostgreSQL local cho phat trien.

## Yeu cau moi truong

- Node.js 20.19+ hoac 22.13+ duoc khuyen nghi cho toolchain frontend hien tai.
- Java 21.
- Maven 3.9+ hoac Maven Wrapper trong `backend`.
- Docker Desktop neu muon chay PostgreSQL bang compose.

## Chay local

1. Tao file env neu can tuy bien:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

`backend/.env.example` la file tham khao. Spring Boot doc truc tiep bien moi truong, nen co the dung gia tri mac dinh trong `application.yml` hoac set env vars khi chay.

2. Chay PostgreSQL:

```bash
npm run db:up
```

3. Chay backend:

```bash
npm run dev:backend
```

Swagger UI mac dinh o `http://localhost:8080/swagger-ui.html`.

4. Chay frontend:

```bash
npm run dev:frontend
```

Frontend mac dinh o `http://localhost:3000`.

## Chay backend voi Supabase Postgres

1. Trong Supabase Dashboard, mo project va bam `Connect`, copy thong tin ket noi Postgres.

2. Set env vars cho backend (co the trong `.env` hoac env he thong):

```bash
SPRING_PROFILES_ACTIVE=supabase
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.<project_ref>
SPRING_DATASOURCE_PASSWORD=<db_password>
SPRING_DATASOURCE_PREPARE_THRESHOLD=0
```

3. Chay backend voi profile Supabase:

```bash
npm run dev:backend:supabase
```

Luu y:
- Backend Spring Boot ket noi truc tiep PostgreSQL nen KHONG can `SUPABASE_ANON_KEY` hoac `SUPABASE_SERVICE_ROLE_KEY`.
- Nen dung `Direct connection` hoac `Session pooler (port 5432)` cho app backend lau dai.
- Migration Flyway se tu dong tao schema tren database Supabase khi backend start lan dau.

## Kiem tra

```bash
npm run lint:frontend
npm run type-check:frontend
npm run build:frontend
npm run test:backend
```

Playwright da duoc cau hinh, nhung chua co test case. Lan dau chay E2E can cai browser:

```bash
npm --prefix frontend exec playwright install
```
