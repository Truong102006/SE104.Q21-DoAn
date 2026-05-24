# SE104.Q21 — Báo Cáo Tiến Độ Dự Án Quản Lý Cửa Hàng Vàng Bạc Đá Quý

> **Cập nhật lần cuối:** 2026-05-22
> **Monorepo:** `backend/` (Spring Boot 4 + Java 21) · `frontend/` (Next.js 16 + React 19 + Tailwind v4)
> **Database:** PostgreSQL 16 (Docker) · Flyway migration V1 (schema) + V2 (seed)

---

## 1. Tổng Quan Tiến Độ

| Tiêu chí | Mức độ |
|---|---:|
| Hoàn thiện cho demo/báo cáo môn học | **95%** |
| Sẵn sàng chạy thực tế nội bộ | **80%** |
| Sẵn sàng production | **45%** |

---

## 2. Tiến Độ Theo Module

| Module | % | Trạng thái |
|---|---:|---|
| **Auth JWT + RBAC** | 95 | ✅ Login/logout/me, JWT filter, seed account, FE gọi API thật |
| **Phân quyền endpoint** | 90 | ✅ `@PreAuthorize` ADMIN/STAFF, method-level security |
| **Quản lý user** | 80 | ✅ API user/nhóm + UI ADMIN quản lý tài khoản |
| **Danh mục (BM1–BM4)** | 95 | ✅ CRUD NCC/KH/DVT/LoạiDV/LoạiSP + validate QĐ1–QĐ4 |
| **Sản phẩm (BM8/QĐ6/QĐ8)** | 95 | ✅ CRUD + giá bán tự động + tra cứu tương đối |
| **Phiếu mua (BM5/QĐ5)** | 95 | ✅ Tạo phiếu + tăng tồn kho + cập nhật giá mua/bán |
| **Phiếu bán (BM6/QĐ6)** | 95 | ✅ Tạo phiếu + giảm tồn kho + chặn vượt tồn (PESSIMISTIC_WRITE) |
| **Phiếu dịch vụ (BM7/QĐ7/QĐ9)** | 95 | ✅ Tạo phiếu + validate trả trước + giao từng dòng/toàn bộ |
| **Tra cứu (BM8/BM9)** | 90 | ✅ Tra cứu SP + phiếu DV, filter, phân trang |
| **Báo cáo (BM10/BM11/BM12)** | 90 | ✅ Generate/view tồn kho, doanh thu SP, doanh thu DV |
| **Thay đổi quy định (QĐ13)** | 90 | ✅ Settings tỉ lệ trả trước + tỉ lệ lợi nhuận |
| **Dashboard UI** | 90 | ✅ 13 module đầy đủ, layout hoàn chỉnh, font Inter |
| **i18n (VI/EN)** | 90 | ✅ Zero-dependency, 300+ keys, Language Switcher |
| **Unit Testing** | 70 | ✅ 32 tests pass (auth, catalog, phiếu, báo cáo, settings) |
| **Deployment/Docker** | 35 | ⚠️ Docker PostgreSQL OK, chưa Dockerfile cho BE/FE |

---

## 3. Kiến Trúc Hệ Thống

```
[Browser] → [Next.js Frontend :3000] --(JWT Bearer)-→ [Spring Boot API :8080] → [PostgreSQL :5432]
                  ↓                                            ↓
           [I18nProvider VI/EN]                        [Flyway V1+V2 Migration]
```

**Stack chi tiết:**
- **Backend:** Java 21, Spring Boot 4, Spring Security JWT, Spring Data JPA, Hibernate, Flyway, PostgreSQL, JUnit 5 + Mockito
- **Frontend:** Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, Zustand, React Hook Form, Zod
- **Infra:** Docker Compose (PostgreSQL 16), Swagger UI

---

## 4. Thống Kê Codebase

| Thành phần | Số file |
|---|---:|
| Backend Java (`backend/src/main/java`) | 188 |
| Backend Test (`backend/src/test/java`) | 20 |
| Frontend (`frontend/src`) | 70 |
| Database Migration | 2 (V1 schema + V2 seed) |

**API Endpoints:** 50+ (auth, danh mục, phiếu, tra cứu, báo cáo, settings)
**Tài khoản seed:** `admin/admin123` (ADMIN), `staff/staff123` (STAFF)

---

## 5. Lịch Sử Phát Triển

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

## 6. Đề Xuất Ưu Tiên Tiếp Theo

### Ưu tiên 1: Deploy
1. Dockerfile cho backend + frontend
2. `docker-compose.yml` full stack (DB + BE + FE) chạy 1 lệnh
3. Siết CORS theo whitelist origin

### Ưu tiên 2: Chất lượng
1. E2E test Playwright (login → CRUD → phiếu → báo cáo)
2. Integration test luồng tồn kho end-to-end
3. Rate limiting / throttling API

### Ưu tiên 3: UX
1. Export báo cáo PDF/Excel
2. Responsive mobile/tablet
3. Dark mode theme
