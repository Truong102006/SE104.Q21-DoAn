## 0. Update 2026-05-19 (Auth + RBAC)

- Backend da implement Spring Security + JWT stateless:
  - POST /api/auth/login
  - POST /api/auth/logout
  - GET /api/auth/me
- Da them JWT filter + auth entrypoint/denied handler + SecurityConfig phan quyen theo nhom:
  - ADMIN only cho nhom endpoint quan tri va bao cao.
  - ADMIN/STAFF cho nhom endpoint nghiep vu.
- Tai khoan dang dung bang nguoi_dung:
  - ten_dang_nhap = username
  - ma_nhom = group code
  - mat_khau duoc hash BCrypt
- Da bo sung seed account (co the override bang env):
  - admin/admin123
  - staff/staff123
  - Co migration plaintext password sang BCrypt neu gap du lieu cu.
- Da bo sung test endpoint auth:
  - File test: backend/src/test/java/com/se104/goldstore/unit/controller/AuthControllerTest.java
  - Da verify login va me pass.
- Frontend da bo mock auth, da goi API that:
  - Login goi /api/auth/login
  - Dashboard goi /api/auth/me voi header Authorization: Bearer <token>
  - Logout goi /api/auth/logout voi Bearer token
  - Menu role da cap nhat theo ADMIN/STAFF context tu backend.
- Ket qua verify:
  - cd backend && ./mvnw test => BUILD SUCCESS (2 tests pass)
  - cd frontend && npm run type-check => SUCCESS
## 0. Cập Nhật Mới Nhất (2026-05-15)

- Backend đã bổ sung thêm nền tảng CRUD + service + dto + controller cho các module:
  - `phieu-mua-hang`, `phieu-ban-hang`, `phieu-dich-vu`
  - `tham-so`
  - `bao-cao-ton-kho`, `bao-cao-doanh-thu-san-pham`, `bao-cao-doanh-thu-dich-vu`
  - `chuc-nang`, `nhom-nguoi-dung`, `nguoi-dung`, `phan-quyen`
- Đã cập nhật `ApiPaths` để mở route cho các module trên.
- Đã bổ sung repository method phục vụ:
  - search keyword
  - validate duplicate nghiệp vụ
  - generate mã tự động (PM/PB/DV và một số mã báo cáo/quản trị)
- Trạng thái build/test backend:
  - Lệnh đã chạy: `cd backend && ./mvnw test`
  - Kết quả: `BUILD SUCCESS` (lần gần nhất trong ngày 2026-05-15)

---
# SE104.Q21 - Web Quản Lý Cửa Hàng Vàng Bạc Đá Quý - Báo Cáo Tiến Độ Tổng Thể

> **Ngày cập nhật:** 2026-05-15  
> **Phương pháp:** Deep scan toàn bộ source code (`frontend`, `backend`, `database/migration`, `config/env`, `docs`, `tests`, `deployment/docker`, script chạy build/lint/test)

---

## 1. Tổng Quan Dự Án

Dự án là một hệ thống quản lý cửa hàng vàng bạc đá quý theo mô hình web app fullstack.

- Dự án dùng để làm gì: quản lý danh mục sản phẩm/dịch vụ, nhà cung cấp, khách hàng, phiếu giao dịch và báo cáo tồn kho/doanh thu.
- Người dùng chính: quản trị viên cửa hàng (ADMIN) và nhân viên (STAFF).
- Chức năng chính hiện thấy trong source:
- Backend: CRUD cho 6 module nền (`nha-cung-cap`, `khach-hang`, `don-vi-tinh`, `loai-dich-vu`, `loai-san-pham`, `san-pham`) + health check.
- Frontend: login demo, dashboard, bảng sản phẩm có role-based UI.
- Kiến trúc: monorepo tách `frontend` (Next.js) và `backend` (Spring Boot), DB PostgreSQL qua Docker Compose.

### Kiến trúc hệ thống

```text
[Next.js Frontend]
       |
       | (HTTP, hiện tại UI chủ yếu dùng mock data)
       v
[Spring Boot REST API] ----> [PostgreSQL]
       |                           ^
       |                           |
       +----> [Flyway Migration] --+

Ghi chú:
- Auth backend JWT chưa triển khai thực thi.
- Frontend đang có auth giả lập bằng cookie/localStorage phía client.
```

### Các thành phần triển khai

- Frontend: `frontend/` - Next.js App Router, UI dashboard, auth store, middleware route guard.
- Backend: `backend/` - Spring Boot REST, JPA entity/repository, service/controller cho một phần nghiệp vụ.
- Database: PostgreSQL, schema trong `backend/src/main/resources/db/migration/V1__init_schema.sql`.
- Dịch vụ ngoài: chưa thấy tích hợp payment/email/storage/cloud từ source code hiện tại.

---

## 2. Công Nghệ Sử Dụng

### 2.1. Frontend

| Hạng mục | Công nghệ | Phiên bản/Ghi chú |
|---|---|---|
| Ngôn ngữ | TypeScript | `strict: true` trong `frontend/tsconfig.json` |
| UI Framework | Next.js + React + Tailwind CSS + shadcn/ui | Next `16.2.4`, React `19.2.5`, Tailwind v4 |
| State Management | Zustand | `frontend/src/stores/auth-store.ts` |
| Routing | Next.js App Router | Route groups `(auth)`, `(dashboard)` |
| API Client | Chưa triển khai | Không thấy `fetch/axios` call trong `frontend/src` |
| Build Tool | Next build (Turbopack), tsc, eslint | `npm --prefix frontend run build/type-check/lint` chạy được |

### 2.2. Backend

| Hạng mục | Công nghệ | Phiên bản/Ghi chú |
|---|---|---|
| Framework | Spring Boot Web MVC | Parent `spring-boot-starter-parent:4.0.6` (`backend/pom.xml`) |
| Ngôn ngữ | Java | Java 21 |
| Build Tool | Maven | `mvn -f backend/pom.xml test` build success |
| ORM/Database Access | Spring Data JPA + Hibernate + Flyway + PostgreSQL | `ddl-auto: validate`, Flyway enabled (`application.yml`) |
| Security/Auth | Spring Security + JWT deps | Security hiện `anyRequest().permitAll()`; JWT library chưa được wire vào flow auth |
| Validation | Jakarta Validation + custom validator | `@Valid`, constraint annotations, `PhoneValidator.validateOrThrow` |
| API Docs | Springdoc OpenAPI | Swagger UI `/swagger-ui.html` |

Backend cung cấp các API chính:

- `GET /api/v1/health` — Health check (`HealthController.health`)
- `GET /api/v1/nha-cung-cap` — Danh sách NCC (+ query `q`)  
- `GET /api/v1/nha-cung-cap/{maNhaCungCap}` — Chi tiết NCC  
- `POST /api/v1/nha-cung-cap` — Tạo NCC  
- `PUT /api/v1/nha-cung-cap/{maNhaCungCap}` — Cập nhật NCC  
- `DELETE /api/v1/nha-cung-cap/{maNhaCungCap}` — Xóa NCC  
- `GET /api/v1/khach-hang`, `GET /{maKhachHang}`, `POST`, `PUT`, `DELETE` — CRUD khách hàng  
- `GET /api/v1/don-vi-tinh`, `GET /{maDonViTinh}`, `POST`, `PUT`, `DELETE` — CRUD đơn vị tính  
- `GET /api/v1/loai-dich-vu`, `GET /{maLoaiDichVu}`, `POST`, `PUT`, `DELETE` — CRUD loại dịch vụ  
- `GET /api/v1/loai-san-pham`, `GET /{maLoaiSanPham}`, `POST`, `PUT`, `DELETE` — CRUD loại sản phẩm  
- `GET /api/v1/san-pham`, `GET /{maSanPham}`, `POST`, `PUT`, `DELETE` — CRUD sản phẩm

### 2.3. Database

| Hạng mục | Chi tiết |
|---|---|
| Loại database | PostgreSQL 16 (Docker image `postgres:16-alpine`) |
| Schema/Migration | Flyway `V1__init_schema.sql` |
| Số bảng | 23 bảng (theo `CREATE TABLE` trong migration) |
| Bảng chính | `san_pham`, `loai_san_pham`, `khach_hang`, `nha_cung_cap`, `phieu_mua_hang`, `phieu_ban_hang`, `phieu_dich_vu`, `bao_cao_*`, `nguoi_dung`, `nhom_nguoi_dung`, `phan_quyen` |
| Quan hệ chính | FK giữa giao dịch-chi tiết, sản phẩm-loại/đơn vị, user-nhóm, nhóm-chức năng |

### 2.4. Dịch vụ bên thứ ba

| Dịch vụ | Mục đích | Ghi chú |
|---|---|---|
| PostgreSQL (Docker) | Lưu trữ dữ liệu | Qua `docker-compose.yml` |
| Swagger UI | Khám phá API | Từ Springdoc |
| Khác (email/payment/storage/cloud) | Chưa xác định từ source code | Không thấy SDK/integration rõ ràng |

---

## 3. Tiến Độ Theo Module

| Module | Tiến độ | Trạng thái |
|---|---:|---|
| Authentication (tổng thể FE+BE) | 35% | ⚠️ FE có auth giả lập (`useAuthStore`, `middleware`), BE chưa có login/JWT filter |
| Authorization/RBAC | 25% | ❌ UI có role-based hiển thị; backend chưa enforce quyền truy cập API |
| User Management | 15% | ❌ Có entity/repository (`NguoiDung`, `NhomNguoiDung`, `PhanQuyen`) nhưng chưa có API/service vận hành |
| Master Data CRUD (NCC/KH/DVT/Loại DV/Loại SP/SP) | 70% | ✅ Backend CRUD khá đầy đủ, thiếu pagination + FE chưa nối API thật |
| Dashboard/Admin UI | 50% | ⚠️ Có layout, dashboard, products; nhiều route sidebar chưa có page thật |
| Giao dịch (phiếu mua/bán/dịch vụ) | 20% | ❌ Có schema + entity + repository, chưa có service/controller/UI |
| Báo cáo/Thống kê | 20% | ❌ Có schema + entity + repository, chưa có API/UI |
| Backend API tổng thể | 55% | ⚠️ Có 31 endpoint cho nhóm nền, thiếu auth và nhóm nghiệp vụ lõi |
| Database | 80% | ✅ Schema khá đầy đủ và có seed cơ bản, cần kiểm chứng bằng integration test |
| Testing | 10% | ❌ Chưa có test case thực tế (chỉ `.gitkeep`) |
| Deployment/Docker | 35% | ⚠️ Mới docker hóa PostgreSQL, chưa có Dockerfile/app deployment flow |

---

## 4. Phân Tích Chi Tiết Từng Module

### 4.1. ⚠️ Authentication / Authorization — 35%

Đã hoàn thành:
- Frontend có auth state và route guard:
- `frontend/src/stores/auth-store.ts` (`login`, `logout`, `hydrate`, `isAuthenticated`, `isAdmin`)
- `frontend/src/middleware.ts` (`middleware`) redirect theo cookie `auth-token`
- Root route redirect theo cookie trong `frontend/src/app/page.tsx`

Còn thiếu / vấn đề:
- Chưa có backend login endpoint, JWT generation/verification/filter.
- `SecurityConfig` cho phép toàn bộ request (`anyRequest().permitAll()`), chưa có `@PreAuthorize`.
- FE auth chỉ dựa trên cookie existence, không xác thực chữ ký/hết hạn token từ server.

File liên quan:
- `frontend/src/stores/auth-store.ts`
- `frontend/src/middleware.ts`
- `frontend/src/app/page.tsx`
- `backend/src/main/java/com/se104/goldstore/security/SecurityConfig.java`

### 4.2. ❌ User / Profile / Phân quyền hệ thống — 15%

Đã hoàn thành:
- Có mô hình dữ liệu người dùng/nhóm/quyền ở DB + entity:
- `NguoiDung`, `NhomNguoiDung`, `PhanQuyen`
- Migration có seed nhóm `ADMIN`, `STAFF` và bảng `chuc_nang`, `phan_quyen`.

Còn thiếu / vấn đề:
- Không có controller/service cho user, role assignment, login profile.
- Chưa xác định rõ luồng đổi mật khẩu/khóa user từ source code.

File liên quan:
- `backend/src/main/java/com/se104/goldstore/entity/NguoiDung.java`
- `backend/src/main/java/com/se104/goldstore/entity/NhomNguoiDung.java`
- `backend/src/main/java/com/se104/goldstore/entity/PhanQuyen.java`
- `backend/src/main/resources/db/migration/V1__init_schema.sql`

### 4.3. ⚠️ Dashboard / Home — 50%

Đã hoàn thành:
- Dashboard layout hoàn chỉnh (`(dashboard)/layout.tsx`) với Sidebar + Header.
- Trang dashboard có card thống kê và khối giá vàng.
- Có hiển thị khác nhau theo role UI (ADMIN/STAFF).

Còn thiếu / vấn đề:
- Dữ liệu dashboard đang hardcoded từ `MOCK_*`.
- Route trong sidebar nhiều mục chưa có page tương ứng: `categories`, `orders`, `customers`, `suppliers`, `purchase-orders`, `gold-prices`, `staff`.

File liên quan:
- `frontend/src/app/(dashboard)/layout.tsx`
- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `frontend/src/components/layout/sidebar.tsx`
- `frontend/src/lib/mock-data.ts`

### 4.4. ⚠️ CRUD nghiệp vụ chính (danh mục nền) — 70%

Đã hoàn thành:
- Backend CRUD đầy đủ cho 6 module nền:
- `NhaCungCapController`, `KhachHangController`, `DonViTinhController`, `LoaiDichVuController`, `LoaiSanPhamController`, `SanPhamController`
- Service có validate unique/reference + generate mã tự động (`CodeGeneratorUtils.generateNextCode`)
- Chuẩn response chung `ApiResponse.success/failure`, có `GlobalExceptionHandler`.

Còn thiếu / vấn đề:
- Frontend mới có page products, các module CRUD còn lại chưa có UI thật.
- Chưa có pagination/sorting backend cho list endpoint (hiện trả full list).

File liên quan:
- `backend/src/main/java/com/se104/goldstore/controller/*.java`
- `backend/src/main/java/com/se104/goldstore/service/impl/*.java`
- `backend/src/main/java/com/se104/goldstore/common/CodeGeneratorUtils.java`
- `backend/src/main/java/com/se104/goldstore/common/SearchUtils.java`

### 4.5. ⚠️ Search / Filter / Pagination — 45%

Đã hoàn thành:
- Backend có search keyword `q` cho 6 module qua `findBy...ContainingIgnoreCase`.
- Frontend products có search + category filter + pagination UI client-side.

Còn thiếu / vấn đề:
- Pagination backend chưa có (`Pageable` chưa dùng).
- Filter hiện tại ở frontend chạy trên mock data, chưa qua API.

File liên quan:
- `backend/src/main/java/com/se104/goldstore/service/impl/*ServiceImpl.java` (`getAll(String keyword)`)
- `frontend/src/app/(dashboard)/dashboard/products/page.tsx`

### 4.6. ❌ Upload file / image — 0%

Đã hoàn thành:
- Chưa thấy từ source code.

Còn thiếu / vấn đề:
- Không có endpoint upload, không có storage integration.
- Chưa xác định từ source code có kế hoạch media management.

File liên quan:
- Chưa xác định từ source code

### 4.7. ❌ Notification / Email — 0%

Đã hoàn thành:
- Chưa có tích hợp email/notification backend.
- Frontend chỉ có icon/badge notification UI tĩnh trong header.

Còn thiếu / vấn đề:
- Không có queue/email service, không có notification API.

File liên quan:
- `frontend/src/components/layout/header.tsx`

### 4.8. ❌ Payment — 0%

Đã hoàn thành:
- Chưa thấy tích hợp cổng thanh toán trong source code.

Còn thiếu / vấn đề:
- Không có payment service/API.

File liên quan:
- Chưa xác định từ source code

### 4.9. ❌ Admin features nâng cao / Reports / Statistics — 20%

Đã hoàn thành:
- DB + entity + repository đã có cho báo cáo tồn kho/doanh thu.

Còn thiếu / vấn đề:
- Chưa có service/controller/report job/UI.
- Chưa có luồng tính toán report tự động từ giao dịch.

File liên quan:
- `backend/src/main/java/com/se104/goldstore/entity/BaoCao*`
- `backend/src/main/java/com/se104/goldstore/repository/BaoCao*Repository.java`

### 4.10. ✅ Database / Migration — 80%

Đã hoàn thành:
- Migration chính đã dựng schema khá đầy đủ với FK + check constraints + seed dữ liệu nền.
- `spring.jpa.hibernate.ddl-auto=validate` giúp ép đồng bộ schema-mapping khi chạy.

Còn thiếu / vấn đề:
- Mới 1 migration lớn; chưa thấy migration incremental tiếp theo.
- Chưa có test migration rollback/forward trong pipeline.

File liên quan:
- `backend/src/main/resources/db/migration/V1__init_schema.sql`
- `backend/src/main/resources/application.yml`

### 4.11. ❌ Testing — 10%

Đã hoàn thành:
- Cấu hình chạy test có sẵn (`mvn test`, Playwright config).
- Build/test command chạy thành công ở mức cấu hình.

Còn thiếu / vấn đề:
- Không có test case thực (`backend/src/test` và `frontend/tests/e2e` chỉ có `.gitkeep`).
- `playwright test --list` báo `No tests found`.

File liên quan:
- `frontend/playwright.config.ts`
- `backend/src/test/.../.gitkeep`
- `frontend/tests/e2e/.gitkeep`

### 4.12. ⚠️ Deployment / Docker — 35%

Đã hoàn thành:
- Có Docker Compose cho PostgreSQL với volume + healthcheck.
- Script root hỗ trợ `db:up`, `db:down`.

Còn thiếu / vấn đề:
- Không có Dockerfile cho backend/frontend.
- Chưa có pipeline deploy CI/CD trong source hiện tại.

File liên quan:
- `docker-compose.yml`
- `package.json` (scripts root)

### 4.13. 🔴 Security — 25%

Đã hoàn thành:
- Có `GlobalExceptionHandler`, input validation cơ bản, check FK/reference ở service.

Còn thiếu / vấn đề:
- API công khai toàn bộ (không auth).
- CORS mở rộng `*`.
- Token FE không HttpOnly và không có server-side verification.
- Chưa thấy rate limiting/audit logging/security monitoring.

File liên quan:
- `backend/src/main/java/com/se104/goldstore/security/SecurityConfig.java`
- `backend/src/main/java/com/se104/goldstore/config/CorsConfig.java`
- `frontend/src/stores/auth-store.ts`
- `frontend/src/middleware.ts`

---

## 5. Đánh Giá Backend

### 5.1. Cấu trúc backend

| Package/Folder | Số file | Chức năng |
|---|---:|---|
| `controller` | 7 | REST endpoint cho health + 6 module CRUD |
| `service` (interface) | 6 | Khai báo contract nghiệp vụ |
| `service/impl` | 6 | Xử lý nghiệp vụ CRUD, validation, generate code |
| `repository` | 23 | Truy cập dữ liệu JPA |
| `dto/request` | 6 | Input model + constraint validation |
| `dto/response` | 8 | Output model + API envelope |
| `entity` | 23 | JPA mapping các bảng |
| `config` + `security` | 2 | CORS + security filter chain |
| `exception` | 5 | Exception domain + global handler |
| `validation` | 1 | `PhoneValidator` |
| `common` | 3 | API path constants, search normalize, generate mã |
| `mapper` | 0 | Chưa triển khai (dù có dependency MapStruct) |

### 5.2. Điểm mạnh

- Chia tầng khá rõ ràng controller/service/repository, controller mỏng.
- Service dùng `@Transactional` hợp lý cho thao tác ghi.
- Validation request có dùng `@Valid` + Jakarta constraints.
- Có custom business exception và global exception handler.
- Chuẩn response thống nhất qua `ApiResponse`.
- Migration DB tương đối đầy đủ và mapping entity bám sát schema.

### 5.3. Còn thiếu

- API chưa implement cho phần lõi giao dịch và báo cáo dù entity/repository đã có.
- Chưa có authentication/authorization thực tế; toàn bộ API đang mở.
- Chưa có pagination/sort cho list API.
- Chưa có test unit/integration/controller.
- Chưa dùng MapStruct dù đã khai báo dependency.
- Chưa có endpoint quản trị người dùng/quyền.

---

## 6. Các Vấn Đề Bảo Mật & Rủi Ro

### 🔴 Critical

| # | Vấn đề | Vị trí | Ảnh hưởng |
|---:|---|---|---|
| 1 | API backend không yêu cầu xác thực | `backend/src/main/java/com/se104/goldstore/security/SecurityConfig.java` (`anyRequest().permitAll()`) | Truy cập/sửa/xóa dữ liệu trái phép qua API |
| 2 | Không có phân quyền endpoint-level | Không thấy `@PreAuthorize/@Secured` trong controller/service | Không chặn thao tác nhạy cảm theo role |
| 3 | Cơ chế auth frontend chỉ dựa trên cookie client-side | `frontend/src/stores/auth-store.ts`, `frontend/src/middleware.ts` | Có thể giả mạo cookie để vượt UI guard; không đủ cho bảo mật thực tế |

### 🟡 Warning

| # | Vấn đề | Vị trí | Ghi chú |
|---:|---|---|---|
| 1 | CORS mở rộng `*` | `backend/src/main/java/com/se104/goldstore/config/CorsConfig.java` | Nên giới hạn origin theo môi trường |
| 2 | Chưa có rate limiting/throttling | Chưa thấy trong backend config/filter | Dễ bị abuse API |
| 3 | Chưa có test bảo mật và test chức năng | `backend/src/test`, `frontend/tests/e2e` | Rủi ro regression cao |
| 4 | Dùng dữ liệu mock/hardcoded cho login và dashboard | `frontend/src/lib/mock-data.ts`, `login/page.tsx` | Không phản ánh dữ liệu thực, khó kiểm chứng end-to-end |
| 5 | Chưa có pagination backend | Các `getAll` trong `*ServiceImpl` | Nguy cơ chậm khi dữ liệu lớn |
| 6 | `middleware.ts` đã deprecated ở Next.js 16 | Kết quả `next build` | Cần migrate sang `proxy.ts` |
| 7 | Cần duy trì một nguồn tài liệu tiến độ duy nhất | `progress.md` | Tránh phân mảnh nội dung và mâu thuẫn trạng thái |
| 8 | Dependency frontend có local self-link | `frontend/package.json` (`gold-jewelry-store-management: file:..`) | Cần kiểm chứng mục đích, tránh rủi ro build/publish |

Ghi chú secret:
- Không phát hiện secret/API key thật trong **file tracked** của snapshot hiện tại.
- File `.env` local tồn tại ở root nhưng không được track theo `git ls-files`; cần duy trì quy tắc không commit secret.
- Khuyến nghị: dùng `.env.example` cho template, biến môi trường runtime/CI secret manager/GitHub Secrets cho giá trị thật.

---

## 7. Tổng Số File Source Code

| Thành phần | Số file | Ghi chú |
|---|---:|---|
| Frontend | 26 | `frontend/src` (`.ts/.tsx/.css`), gồm 12 UI component |
| Backend | 91 | `backend/src/main/java` |
| Database/Migration | 1 | `V1__init_schema.sql` (không tính `.gitkeep`) |
| Config/Deployment | 13 | `docker-compose`, env example, tsconfig/eslint/next/pom/package |
| Tests | 0 | Không có test case thực (chỉ `.gitkeep`) |
| Docs | 3 | `README.md`, `frontend/README.md`, `progress.md` |

---

## 8. Tổng Kết: Hoàn Thiện vs Thiếu Sót

### ✅ Đã hoàn thiện tốt (>75%)

- Schema DB nền và migration chính đã đầy đủ nhiều thực thể.
- CRUD backend cho 6 module master data chạy được và có validation/exception handling.
- Frontend build/type-check pass, có layout dashboard và bảng sản phẩm có role-based UI.

### ⚠️ Cần hoàn thiện thêm (40-75%)

- Dashboard và module sản phẩm frontend hiện hoạt động ở mức mock data.
- Kiến trúc backend tách lớp tốt nhưng mới phủ một phần nghiệp vụ.
- Hạ tầng local dev tốt (scripts + docker postgres), chưa thành deployment hoàn chỉnh.

### ❌ Chưa triển khai hoặc còn yếu (<40%)

- Auth backend (login/JWT/filter/refresh), phân quyền endpoint-level.
- Module giao dịch (phiếu mua/bán/dịch vụ) ở tầng API/service/UI.
- Module báo cáo ở tầng API/UI.
- Toàn bộ test unit/integration/e2e thực tế.

### 📊 Ước lượng tổng thể

| Tiêu chí | Mức độ |
|---|---:|
| Hoàn thiện cho demo/báo cáo môn học | 65% |
| Sẵn sàng chạy thực tế nội bộ | 40% |
| Sẵn sàng production | 20% |

Giải thích ngắn:
- Điểm mạnh hiện tại là nền tảng dữ liệu + CRUD danh mục + UI skeleton khá rõ.
- Điểm nghẽn lớn là bảo mật/auth và thiếu end-to-end flow thật (API thật + test + vận hành).

---

## 9. Đề Xuất Ưu Tiên

### Ưu tiên 1: Sửa lỗi nghiêm trọng

1. Đóng toàn bộ API bằng auth thật: triển khai login JWT, filter xác thực, bỏ `anyRequest().permitAll()`.
2. Áp RBAC ở backend (`@PreAuthorize` hoặc policy ở service layer) cho endpoint nhạy cảm.
3. Siết CORS theo whitelist origin theo môi trường.

### Ưu tiên 2: Hoàn thiện module có sẵn

1. Nối frontend products/dashboard sang API backend thật (thay `mock-data.ts`).
2. Bổ sung pagination/sort/filter backend cho endpoint list.
3. Chuẩn hóa xử lý `callbackUrl` sau login thay vì redirect cứng `/dashboard`.

### Ưu tiên 3: Bổ sung module còn thiếu

1. Xây API + UI cho `orders`, `purchase-orders`, `service tickets`.
2. Xây API + UI cho `customers`, `suppliers`, `categories` còn thiếu ở frontend.
3. Triển khai module report API/UI dựa trên bảng `bao_cao_*`.

### Ưu tiên 4: Chất lượng code và triển khai

1. Thêm unit test/integration test cho service/controller chính.
2. Thêm e2e test cho luồng login -> dashboard -> CRUD sản phẩm.
3. Chuẩn hóa response/error và logging.
4. Rà soát dependency chưa dùng (MapStruct/JWT chưa wire) và dependency local-link frontend.
5. Bổ sung Dockerfile/backend+frontend và tài liệu deploy tối thiểu.


