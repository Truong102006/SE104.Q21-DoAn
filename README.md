# Hệ thống quản lý cửa hàng vàng bạc đá quý (SE104)

Monorepo gồm:
- `backend`: Spring Boot REST API + PostgreSQL
- `frontend`: Next.js/React TypeScript

Dự án đã implement các module nghiệp vụ chính theo BM/QĐ: xác thực + phân quyền, danh mục, sản phẩm, phiếu mua/bán/dịch vụ, tra cứu, báo cáo và thay đổi quy định.

## 1. Công nghệ sử dụng

### Backend
- Java 21, Spring Boot 4
- Spring Security (JWT, BCrypt)
- Spring Data JPA, Hibernate
- Flyway migration
- PostgreSQL
- JUnit 5, Mockito

### Frontend
- Next.js 16, React 19, TypeScript
- Tailwind CSS + shadcn/ui
- Zustand, React Hook Form, Zod

## 2. Cấu trúc thư mục

- `backend/`: mã nguồn API
- `frontend/`: mã nguồn web app
- `docker-compose.yml`: PostgreSQL local
- `scripts/`: script tiện ích

## 3. Cấu hình môi trường

### Bước 1: tạo file env

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
```

### Biến quan trọng

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## 4. Cách chạy database PostgreSQL

### Cách A: local bằng Docker

```bash
npm run db:up
```

Mặc định DB theo `.env.example`:
- DB: `gold_store`
- User: `gold_store`
- Password: `gold_store`
- Port: `5432`

### Cách B: Supabase/Postgres cloud

Set env theo thông tin project cloud, ví dụ:

```bash
SPRING_PROFILES_ACTIVE=supabase
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>
SPRING_DATASOURCE_PREPARE_THRESHOLD=0
```

## 5. Cách chạy backend

```bash
npm run dev:backend
```

- API base: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

## 6. Cách chạy frontend

```bash
npm run dev:frontend
```

- App: `http://localhost:3000`

## 7. Cách chạy migration

Flyway chạy tự động khi backend khởi động.

- Migration files:
  - `backend/src/main/resources/db/migration/V1__init_schema.sql`
  - `backend/src/main/resources/db/migration/V2__seed_core_data.sql`

Để test từ DB/schema rỗng:
1. Tạo DB/schema mới rỗng.
2. Trỏ `SPRING_DATASOURCE_URL` vào DB/schema đó.
3. Chạy backend, Flyway sẽ apply V1 -> V2.

## 8. Tài khoản seed

- `admin / admin123` (ADMIN)
- `staff / staff123` (STAFF)

Có thể override bằng env:
- `AUTH_ADMIN_USERNAME`, `AUTH_ADMIN_PASSWORD`
- `AUTH_STAFF_USERNAME`, `AUTH_STAFF_PASSWORD`

## 9. Chức năng đã hoàn thành

- Auth + phân quyền ADMIN/STAFF
- Quản lý danh mục:
  - Nhà cung cấp
  - Khách hàng
  - Đơn vị tính
  - Loại sản phẩm
  - Loại dịch vụ
- Quản lý sản phẩm + công thức giá bán theo tỉ lệ lợi nhuận
- Phiếu mua hàng (tăng tồn kho)
- Phiếu bán hàng (giảm tồn kho, chặn bán vượt tồn)
- Phiếu dịch vụ (trả trước, giao từng dòng/giao toàn bộ, trạng thái hoàn thành)
- Tra cứu sản phẩm, tra cứu phiếu dịch vụ
- Báo cáo tồn kho, doanh thu sản phẩm, doanh thu dịch vụ
- Module thay đổi quy định (settings, prepayment rate, tỉ lệ lợi nhuận)

## 10. Danh sách API chính

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Danh mục
- `GET/POST/PUT/DELETE /api/suppliers`
- `GET/POST/PUT/DELETE /api/customers`
- `GET/POST/PUT/DELETE /api/units`
- `GET/POST/PUT/DELETE /api/product-types`
- `GET/POST/PUT/DELETE /api/service-types`
- `GET/POST/PUT/DELETE /api/products`

### Phiếu
- `POST/GET /api/purchases`
- `GET /api/purchases/{id}`
- `GET /api/purchases/{id}/print-data`
- `POST/GET /api/sales`
- `GET /api/sales/{id}`
- `POST/GET /api/service-tickets`
- `GET /api/service-tickets/{id}`
- `PATCH /api/service-tickets/{id}/items/{maLoaiDichVu}/deliver`
- `PATCH /api/service-tickets/{id}/deliver-all`

### Tra cứu
- `GET /api/search/products`
- `GET /api/search/service-tickets`

### Báo cáo
- `POST /api/reports/inventory/generate`
- `GET /api/reports/inventory`
- `GET /api/reports/inventory/{id}`
- `POST /api/reports/revenue/products/generate`
- `GET /api/reports/revenue/products`
- `POST /api/reports/revenue/services/generate`
- `GET /api/reports/revenue/services`

### Settings
- `GET /api/settings/product-types`
- `GET /api/settings/units`
- `GET /api/settings/service-types`
- `GET /api/settings/service-prepayment-rate`
- `PUT /api/settings/service-prepayment-rate`

## 11. Hướng dẫn demo nghiệp vụ chính

1. Đăng nhập bằng `admin` và `staff`, kiểm tra khác biệt menu/quyền.
2. Tạo danh mục nền: nhà cung cấp, khách hàng, loại sản phẩm, đơn vị tính, loại dịch vụ.
3. Tạo sản phẩm và kiểm tra giá bán tính theo tỉ lệ lợi nhuận.
4. Lập phiếu mua, kiểm tra tồn kho tăng.
5. Lập phiếu bán, kiểm tra tồn kho giảm và chặn vượt tồn.
6. Lập phiếu dịch vụ, kiểm tra rule trả trước tối thiểu.
7. Giao từng dòng và giao toàn bộ phiếu dịch vụ, kiểm tra trạng thái hoàn thành.
8. Tra cứu sản phẩm/phiếu dịch vụ với filter.
9. Generate báo cáo BM10/BM11/BM12.
10. Đổi quy định trong settings (prepayment/profit rate) và kiểm tra giao dịch mới áp dụng quy định mới.

## 12. Lệnh kiểm tra nhanh

```bash
npm run test:backend
npm run build:frontend
npm run lint:frontend
```
