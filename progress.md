# SE104.Q21 — Báo Cáo Tiến Độ Dự Án Quản Lý Cửa Hàng Vàng Bạc Đá Quý

> **Cập nhật lần cuối:** 2026-05-26
> **Monorepo:** `backend/` (Spring Boot 4 + Java 21) · `frontend/` (Next.js 16 + React 19 + Tailwind v4)
> **Database:** PostgreSQL 16 (Docker) · Flyway migration V1 (schema) + V2 (seed)

---

## 1. Tổng Quan Tiến Độ

| Tiêu chí | Mức độ |
|---|---:|
| Hoàn thiện cho demo/báo cáo môn học | **97%** |
| Sẵn sàng chạy thực tế nội bộ | **85%** |
| Sẵn sàng production | **55%** |

---

## 2. Tiến Độ Theo Module

| Module | % | Trạng thái |
|---|---:|---|
| **Auth JWT + RBAC** | 95 | ✅ Login/logout/me, JWT filter, seed account, FE gọi API thật |
| **Phân quyền endpoint** | 95 | ✅ `@PreAuthorize` ADMIN/STAFF (22 annotations), method-level security |
| **Quản lý user** | 85 | ✅ API user/nhóm + UI ADMIN quản lý tài khoản + phân quyền chức năng |
| **Danh mục (BM1–BM4)** | 95 | ✅ CRUD NCC/KH/DVT/LoạiDV/LoạiSP + validate QĐ1–QĐ4 |
| **Sản phẩm (BM8/QĐ6/QĐ8)** | 95 | ✅ CRUD + giá bán tự động + tra cứu tương đối + upload ảnh Cloudinary |
| **Phiếu mua (BM5/QĐ5)** | 95 | ✅ Tạo phiếu + tăng tồn kho + cập nhật giá mua/bán + server-side pagination |
| **Phiếu bán (BM6/QĐ6)** | 95 | ✅ Tạo phiếu + giảm tồn kho + chặn vượt tồn (PESSIMISTIC_WRITE) + server-side pagination |
| **Phiếu dịch vụ (BM7/QĐ7/QĐ9)** | 95 | ✅ Tạo phiếu + validate trả trước + giao từng dòng/toàn bộ + server-side pagination |
| **Tra cứu (BM8/BM9)** | 90 | ✅ Tra cứu SP + phiếu DV, filter đa trường, phân trang |
| **Báo cáo (BM10/BM11/BM12)** | 90 | ✅ Generate/view tồn kho, doanh thu SP, doanh thu DV |
| **Thay đổi quy định (QĐ13)** | 90 | ✅ Settings tỉ lệ trả trước + tỉ lệ lợi nhuận |
| **Dashboard UI** | 92 | ✅ 18 trang dashboard, layout hoàn chỉnh, font Inter, Dark/Light/System mode |
| **i18n (VI/EN)** | 90 | ✅ Zero-dependency, 300+ keys, Language Switcher |
| **Unit Testing** | 75 | ✅ 40 tests (21 test files: 16 unit service + 4 unit controller + 1 integration) |
| **Deployment/Docker** | 60 | ✅ Dockerfile BE (multi-stage) + FE + docker-compose.yml 3 services |

---

## 3. Kiến Trúc Hệ Thống

```
[Browser] → [Next.js Frontend :3000] --(JWT Bearer)-→ [Spring Boot API :8080] → [PostgreSQL :5432]
                  ↓                                            ↓
           [I18nProvider VI/EN]                        [Flyway V1+V2 Migration]
           [Dark/Light Theme]                          [Cloudinary Upload]
```

**Stack chi tiết:**
- **Backend:** Java 21, Spring Boot 4, Spring Security JWT, Spring Data JPA, Hibernate, Flyway, PostgreSQL, JUnit 5 + Mockito
- **Frontend:** Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, Zustand, React Hook Form, Zod
- **Infra:** Docker Compose (PostgreSQL 16 + BE + FE), Swagger UI, Cloudinary (image upload)

---

## 4. Thống Kê Codebase (Deep Scan 2026-05-26)

| Thành phần | Số file | Chi tiết |
|---|---:|---|
| Backend Java (`backend/src/main/java`) | 73 | 25 controllers, 18 entities, 15 services, 15 DTOs |
| Backend Test (`backend/src/test/java`) | 21 | 16 unit service + 4 unit controller + 1 integration |
| Frontend (`frontend/src`) | 72 | 18 dashboard pages + 30 components + 8 lib + 3 services |
| Database Migration | 2 | V1 schema + V2 seed |
| Docker | 3 | `Dockerfile` BE (multi-stage) + `Dockerfile` FE + `docker-compose.yml` |

**API Endpoints:** 50+ (auth, danh mục, phiếu, tra cứu, báo cáo, settings, upload)
**Tài khoản seed:** `admin/admin123` (ADMIN), `staff/staff123` (STAFF)
**@PreAuthorize:** 22 annotations (ADMIN/STAFF/PERM-level)
**@Test methods:** 40 test methods across 21 files

---

## 5. Lịch Sử Phát Triển

### 2026-05-26 — Deep Scan & Progress Update
- **Deep Scan:** Quét toàn bộ 73 BE + 72 FE + 21 test files
- **Cập nhật tiến độ:** Deployment tăng 35% → 60% (cả 2 Dockerfile + docker-compose đã có)
- **Xác nhận:** CORS wildcard `*`, FE Dockerfile chạy dev mode, chưa có health check

### 2026-05-22 — Performance Optimization + Theme Toggle + Git Sync

- **Performance Fix (N+1 Select & Server-side Pagination):**
    - Loại bỏ hoàn toàn lỗi N+1 Query trong mapper Service bằng cách sử dụng các đối tượng đã được `JOIN FETCH`.
    - Triển khai **Phân trang phía Server (Server-side Pagination)** cho các module Phiếu bán hàng, Phiếu mua hàng, và Phiếu dịch vụ.
    - Chuyển logic lọc/phân trang từ Client về Server để xử lý mượt mà hàng ngàn bản ghi.
- **Search Improvement:** Mở rộng thanh tìm kiếm cho phép tìm theo tên đối tác/SĐT thay vì chỉ mã số ở tất cả module.
- **UI/UX:** Triển khai Dark/Light/System mode toggle toàn hệ thống.
- **Git:** Đồng bộ và đẩy mã nguồn lên nhánh mới `feat/improved-search-and-delete-logic`.
- **Files Modified:**
    - `PhieuBanHangRepository.java`, `PhieuMuaHangRepository.java`, `PhieuDichVuRepository.java`, `SanPhamRepository.java` (JPA Optimization & Pagination)
    - `PhieuBanHangServiceImpl.java`, `PhieuMuaHangServiceImpl.java`, `PhieuDichVuServiceImpl.java`, `TraCuuServiceImpl.java` (Pagination & N+1 fix)
    - `backend-api.ts`, `purchase-orders/page.tsx`, `orders/page.tsx` (Frontend server-pagination implementation)
    - `layout.tsx`, `header.tsx`, `theme-toggle.tsx` (Theme implementation)

### 2026-05-21 — i18n Multi-Language + Font Fix

- Triển khai i18n zero-dependency (React Context + JSON dictionaries)
- Phủ đa ngôn ngữ VI/EN cho 13 module dashboard + login
- 300+ translation keys tổ chức theo nhóm
- Language Switcher trên login + dashboard header
- Fix font toàn cục → Google Fonts Inter via `next/font/google`

### 2026-05-20 — Frontend Nghiệp Vụ BM1–BM12 + QĐ13

- Triển khai đầy đủ 13 màn hình UI kết nối API backend thật
- API client chung tự gắn JWT Bearer token
- TypeScript types cho request/response (`ApiResponse`, `Page`, DTO)
- Loading/empty/error state, hiển thị lỗi backend cho form

### 2026-05-20 — Backend Nghiệp Vụ Hoàn Chỉnh

- **Seed Data:** Migration V2 — users, đơn vị, loại SP, loại DV, tham số, mẫu NCC/KH/SP
- **Settings QĐ13:** API thay đổi `SERVICE_PREPAYMENT_RATE` + tỉ lệ lợi nhuận
- **Báo cáo BM10/11/12:** Generate/regenerate tồn kho + doanh thu SP + doanh thu DV theo tháng
- **Tra cứu BM8/9:** Tìm kiếm tương đối SP + filter phiếu DV (keyword/status/date range)
- **Phiếu dịch vụ BM7:** Validate trả trước, giao từng dòng/toàn bộ, cập nhật trạng thái
- **Phiếu bán BM6:** Pessimistic write lock, chặn vượt tồn, giá bán QĐ6
- **Phiếu mua BM5:** Transaction tạo phiếu + tăng tồn + cập nhật giá mua/bán
- **Sản phẩm BM8:** CRUD + giá bán tự động QĐ6 + chặn xóa khi có phát sinh
- **Unit Tests:** 32 tests pass — auth, catalog, phiếu mua/bán/DV, báo cáo, settings, phân quyền

### 2026-05-19 — Auth + RBAC + Catalog

- **Auth:** JWT stateless login/logout/me + filter + BCrypt + seed account
- **RBAC:** `@PreAuthorize` ADMIN/STAFF, `SecurityConfig` phân quyền nhóm endpoint
- **Catalog BM1–4:** CRUD 5 module danh mục + validate QĐ1–4–13 + method-level delete security

### 2026-05-15 — Scaffold Backend

- CRUD nền tảng controller/service/dto/repository cho 11 module nghiệp vụ
- Entity JPA mapping 23 bảng, Flyway V1 schema

---

## 6. Vấn Đề Phát Hiện Qua Deep Scan ⚠️

### 🔴 Nghiêm trọng (Cần fix trước khi demo/deploy)

| # | Vấn đề | File | Impact |
|---|---|---|---|
| 1 | **CORS wildcard `*`** — cho phép mọi origin | `CorsConfig.java` | Security: Bất kỳ domain nào cũng gọi API được |
| 2 | **FE Dockerfile chạy `npm run dev`** — dev server trong Docker | `frontend/Dockerfile` | Performance: Không optimize, chậm, hot-reload không cần thiết |
| 3 | **Chưa có health check** cho docker-compose services | `docker-compose.yml` | Reliability: BE có thể start trước khi DB sẵn sàng |

### 🟡 Trung bình (Nên cải thiện)

| # | Vấn đề | Chi tiết |
|---|---|---|
| 4 | **Test coverage thấp** — 40 tests / 73 service files | Chỉ cover ~55% service, controller tests ít (4 files) |
| 5 | **Thiếu global error handler backend** | Chưa thấy `@ControllerAdvice` / `@ExceptionHandler` tập trung |
| 6 | **FE dashboard page.tsx quá lớn** (~53KB) | Nên tách components, khó maintain |
| 7 | **Thiếu validation input FE thống nhất** | Zod schemas rải rác, chưa centralize |

### 🟢 Nhỏ (Tối ưu thêm)

| # | Vấn đề | Chi tiết |
|---|---|---|
| 8 | `mock-data.ts` còn tồn tại trong FE lib | Dữ liệu mock không cần thiết khi đã có API thật |
| 9 | Chưa có rate limiting/throttling | API không giới hạn request |
| 10 | Chưa export báo cáo PDF/Excel | Tính năng UX nâng cao |

---

## 7. Đề Xuất Giải Pháp Cải Thiện

### 🔴 Ưu tiên 1: Security & Docker (Cần làm ngay)

#### 1.1 Fix CORS whitelist
```java
// CorsConfig.java — thay "*" bằng whitelist
corsConfiguration.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "http://frontend:3000"
));
corsConfiguration.setAllowCredentials(true);
```

#### 1.2 Frontend Dockerfile production build
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

#### 1.3 Docker Compose health check + depends_on
```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U gold_store"]
    interval: 5s
    timeout: 3s
    retries: 5

backend:
  depends_on:
    postgres:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/api/health"]
    interval: 10s
    timeout: 5s
    retries: 3

frontend:
  depends_on:
    backend:
      condition: service_healthy
```

---

### 🟡 Ưu tiên 2: Code Quality

#### 2.1 Thêm Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(EntityNotFoundException e) { ... }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(ConstraintViolationException e) { ... }
}
```

#### 2.2 Tách `dashboard/page.tsx` (53KB)
- Tách từng widget thành component riêng (StatsCard, RecentOrders, RevenueChart...)
- Mỗi component < 200 dòng
- Sử dụng lazy loading cho các chart nặng

#### 2.3 Tăng test coverage
- Thêm integration tests cho luồng tồn kho (mua → bán → kiểm tra tồn)
- Thêm controller tests cho các phiếu mua/bán/DV
- Target: 60+ tests, cover 80% service logic

---

### 🟢 Ưu tiên 3: UX & Polish

| # | Cải thiện | Effort | Value |
|---|---|---|---|
| 1 | Export báo cáo PDF/Excel | Medium | ⭐⭐⭐⭐ |
| 2 | Responsive mobile/tablet | Medium | ⭐⭐⭐ |
| 3 | Xóa `mock-data.ts` + `mock-notifications.ts` | Low | ⭐⭐ |
| 4 | Rate limiting với Bucket4j hoặc Spring Cloud Gateway | Medium | ⭐⭐⭐ |
| 5 | Loading skeleton thay vì spinner | Low | ⭐⭐ |

---

## 8. Roadmap Đề Xuất

```
Tuần này (26/05–01/06):
├─ [P0] Fix CORS whitelist
├─ [P0] FE Dockerfile production build
├─ [P0] Docker Compose health checks
├─ [P1] Global Exception Handler
└─ [P1] Tách dashboard/page.tsx

Tuần sau (02/06–08/06):
├─ [P1] Thêm 20+ integration tests
├─ [P2] Export PDF/Excel báo cáo
└─ [P2] Responsive mobile

Trước deadline:
├─ [P2] Rate limiting
├─ [P3] Xóa mock data
└─ [P3] Loading skeletons
```
