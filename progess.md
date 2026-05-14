# Project Progess - SE104 Gold Store

Cap nhat lan cuoi: 2026-05-14

## 1) Tong quan hien tai

Du an da vuot qua muc scaffold co ban. Hien tai da co:
- Monorepo chay duoc voi `frontend` (Next.js) + `backend` (Spring Boot) + `docker-compose` cho PostgreSQL.
- Backend da co migration SQL, entity/repository day du, va API CRUD cho 6 nhom danh muc chinh.
- Frontend da co luong dang nhap demo, route guard, dashboard layout, sidebar theo role, va trang san pham dung mock data.

## 2) Backend da lam duoc

- Da co schema Flyway trong file `backend/src/main/resources/db/migration/V1__init_schema.sql` (bao gom bang nghiep vu + bang phan quyen + du lieu seed co ban).
- Da co 23 entity JPA va 23 repository.
- Da co 7 controller, 31 API method.
- Da co CRUD + tim kiem (query `q`) cho cac module:
- `nha-cung-cap`
- `khach-hang`
- `don-vi-tinh`
- `loai-dich-vu`
- `loai-san-pham`
- `san-pham`
- Da co validation request (`@NotBlank`, `@DecimalMin`, `@Min`, ...), validate so dien thoai, sinh ma tu dong theo prefix (VD: `NCC`, `KH`, `SP`...).
- Da co `GlobalExceptionHandler`, format response chung `ApiResponse`, endpoint health check `GET /api/v1/health`.
- Da co CORS config va Security config stateless.

## 3) Frontend da lam duoc

- Da co auth state voi Zustand (`auth-store`), cookie + localStorage hydration.
- Da co middleware route guard:
- Chua login vao route bao ve -> redirect `/login`
- Da login vao `/login` -> redirect `/dashboard`
- Da co trang:
- `/login` (dang nhap demo bang mock user)
- `/dashboard`
- `/dashboard/products`
- Da co layout dashboard:
- Sidebar role-based (ADMIN/STAFF)
- Header + dropdown user + notification UI
- Da co 12 UI components trong `frontend/src/components/ui`.
- Da co type system va mock data cho user, product, category, gold price.

## 4) Ha tang va dev workflow

- Script root da co: `dev:frontend`, `dev:backend`, `db:up`, `db:down`, `test:backend`, `test:e2e`.
- Swagger UI san sang qua backend (`/swagger-ui.html`).
- Frontend va backend deu co file env mau.

## 5) Phan chua hoan thanh / can tiep tuc

- Chua ket noi frontend vao API that (hien dang dung `mock-data.ts`).
- Chua co man hinh cho cac muc sidebar con lai (`categories`, `orders`, `customers`, `suppliers`, `purchase-orders`, `gold-prices`, `staff`).
- Chua co auth backend that (JWT login/refresh, phan quyen endpoint-level).
- Chua co API nghiep vu giao dich (phieu mua, phieu ban, phieu dich vu, bao cao...) o layer service/controller.
- Chua co test case that:
- Backend test folder moi co `.gitkeep`
- Frontend e2e moi co `.gitkeep`

## 6) Quy uoc cap nhat file nay

Khi co them code moi, file nay se duoc cap nhat theo 3 muc:
- Da them gi (feature/module/API/page)
- Anh huong den phan nao (backend/frontend/db)
- Trang thai test/lint lien quan

## 7) Nhat ky cap nhat

- 2026-05-14: Tao file `progess.md`, tong hop lai trang thai thuc te cua codebase tu source hien tai.

