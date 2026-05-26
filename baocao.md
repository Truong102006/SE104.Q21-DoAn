# BÁO CÁO ĐỒ ÁN MÔN HỌC SE104.Q21
## Hệ Thống Quản Lý Cửa Hàng Vàng Bạc Đá Quý

> **Môn học:** SE104 — Nhập môn Công nghệ Phần mềm
> **Học kỳ:** Q21 — Năm học 2025–2026
> **Công nghệ:** Spring Boot 4 (Java 21) + Next.js 16 (React 19) + PostgreSQL 16

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Công nghệ sử dụng](#3-công-nghệ-sử-dụng)
4. [Thiết kế cơ sở dữ liệu](#4-thiết-kế-cơ-sở-dữ-liệu)
5. [Backend — Thiết kế và triển khai](#5-backend--thiết-kế-và-triển-khai)
6. [Frontend — Thiết kế và triển khai](#6-frontend--thiết-kế-và-triển-khai)
7. [Quy trình hoạt động nghiệp vụ](#7-quy-trình-hoạt-động-nghiệp-vụ)
8. [Bảo mật và phân quyền](#8-bảo-mật-và-phân-quyền)
9. [Kiểm thử](#9-kiểm-thử)
10. [Thống kê mã nguồn](#10-thống-kê-mã-nguồn)
11. [Hướng dẫn cài đặt và chạy](#11-hướng-dẫn-cài-đặt-và-chạy)

---

## 1. Tổng Quan Dự Án

### 1.1. Mục tiêu

Xây dựng hệ thống quản lý toàn diện cho cửa hàng vàng bạc đá quý, bao gồm:

- **Xác thực & phân quyền** người dùng (ADMIN / STAFF)
- **Quản lý danh mục** nền tảng: nhà cung cấp, khách hàng, đơn vị tính, loại sản phẩm, loại dịch vụ
- **Quản lý sản phẩm** với công thức tính giá bán tự động theo tỉ lệ lợi nhuận
- **Lập phiếu nghiệp vụ**: phiếu mua hàng, phiếu bán hàng, phiếu dịch vụ
- **Tra cứu** sản phẩm và phiếu dịch vụ
- **Báo cáo** tồn kho, doanh thu sản phẩm, doanh thu dịch vụ theo tháng
- **Thay đổi quy định** (tỉ lệ trả trước dịch vụ, tỉ lệ lợi nhuận loại sản phẩm)

### 1.2. Phạm vi chức năng theo biểu mẫu / quy định

| Mã | Chức năng | Trạng thái |
|---|---|---|
| BM1–BM4 | CRUD danh mục (NCC, KH, DVT, Loại SP, Loại DV) | ✅ Hoàn thành |
| BM5 / QĐ5 | Phiếu mua hàng + tăng tồn kho | ✅ Hoàn thành |
| BM6 / QĐ6 | Phiếu bán hàng + giảm tồn kho + chặn vượt tồn | ✅ Hoàn thành |
| BM7 / QĐ7 / QĐ9 | Phiếu dịch vụ + trả trước + giao hàng | ✅ Hoàn thành |
| BM8 / BM9 | Tra cứu sản phẩm + phiếu dịch vụ | ✅ Hoàn thành |
| BM10 | Báo cáo tồn kho theo tháng | ✅ Hoàn thành |
| BM11 | Báo cáo doanh thu sản phẩm theo tháng | ✅ Hoàn thành |
| BM12 | Báo cáo doanh thu dịch vụ theo tháng | ✅ Hoàn thành |
| QĐ13 | Thay đổi quy định (prepayment, profit rate) | ✅ Hoàn thành |

---

## 2. Kiến Trúc Hệ Thống

### 2.1. Sơ đồ tổng quan

```
┌─────────────┐     HTTPS/JWT Bearer     ┌───────────────────┐     JDBC      ┌──────────────┐
│  Browser    │ ──────────────────────── │  Spring Boot API  │ ────────────│  PostgreSQL  │
│  (Client)   │      REST JSON           │  Port :8080       │              │  Port :5432  │
└──────┬──────┘                          └────────┬──────────┘              └──────────────┘
       │                                          │
┌──────▼──────┐                          ┌────────▼──────────┐
│  Next.js    │                          │  Flyway Migration │
│  Port :3000 │                          │  V1 → V5 (schema) │
│  App Router │                          └───────────────────┘
└─────────────┘
```

### 2.2. Mô hình kiến trúc

- **Client–Server**: Frontend (Next.js) giao tiếp với Backend (Spring Boot) qua REST API
- **Monorepo**: Toàn bộ mã nguồn frontend + backend trong cùng một repository
- **Stateless Authentication**: JWT token, không lưu session trên server
- **Layered Architecture** (Backend): Controller → Service → Repository → Entity

---

## 3. Công Nghệ Sử Dụng

### 3.1. Backend

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Ngôn ngữ | Java | 21 |
| Framework | Spring Boot | 4.0.6 |
| Bảo mật | Spring Security + JWT | — |
| ORM | Spring Data JPA + Hibernate | — |
| Migration | Flyway | — |
| Database | PostgreSQL | 16 |
| API Docs | Springdoc OpenAPI (Swagger) | — |
| Test | JUnit 5 + Mockito | — |
| Mã hóa mật khẩu | BCrypt | — |

### 3.2. Frontend

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.x |
| Ngôn ngữ | TypeScript (strict mode) | — |
| CSS | Tailwind CSS | v4 |
| Component Library | shadcn/ui + Radix + Lucide Icons | — |
| State Management | Zustand | — |
| Form | React Hook Form + Zod validation | — |
| Animation | Framer Motion | — |
| E2E Testing | Playwright | — |
| Đa ngôn ngữ | i18n tự xây (React Context + JSON) | — |

### 3.3. Hạ tầng

| Thành phần | Công nghệ |
|---|---|
| Container hóa DB | Docker Compose (PostgreSQL 16) |
| Upload hình ảnh | Cloudinary |
| Monorepo scripts | npm workspace scripts |

---

## 4. Thiết Kế Cơ Sở Dữ Liệu

### 4.1. Danh sách bảng (23 bảng)

#### Nhóm Danh mục (6 bảng)

| Bảng | Mô tả | Khóa chính |
|---|---|---|
| `nha_cung_cap` | Nhà cung cấp | `ma_nha_cung_cap` VARCHAR(20) |
| `khach_hang` | Khách hàng | `ma_khach_hang` VARCHAR(20) |
| `don_vi_tinh` | Đơn vị tính (gram, chỉ, lượng) | `ma_don_vi_tinh` VARCHAR(20) |
| `loai_san_pham` | Loại sản phẩm + tỉ lệ lợi nhuận | `ma_loai_san_pham` VARCHAR(20) |
| `loai_dich_vu` | Loại dịch vụ + đơn giá | `ma_loai_dich_vu` VARCHAR(20) |
| `san_pham` | Sản phẩm (giá mua, giá bán, tồn kho) | `ma_san_pham` VARCHAR(20) |

#### Nhóm Phiếu nghiệp vụ (6 bảng)

| Bảng | Mô tả | Khóa chính |
|---|---|---|
| `phieu_mua_hang` | Phiếu mua hàng (header) | `so_phieu_mua` VARCHAR(20) |
| `ct_phieu_mua` | Chi tiết phiếu mua | (`so_phieu_mua`, `ma_san_pham`) |
| `phieu_ban_hang` | Phiếu bán hàng (header) | `so_phieu_ban` VARCHAR(20) |
| `ct_phieu_ban` | Chi tiết phiếu bán | (`so_phieu_ban`, `ma_san_pham`) |
| `phieu_dich_vu` | Phiếu dịch vụ (header) | `so_phieu_dich_vu` VARCHAR(20) |
| `ct_phieu_dich_vu` | Chi tiết phiếu dịch vụ | (`so_phieu_dich_vu`, `ma_loai_dich_vu`) |

#### Nhóm Báo cáo (6 bảng)

| Bảng | Mô tả | Khóa chính |
|---|---|---|
| `bao_cao_ton_kho` | Báo cáo tồn kho (header) | `ma_bao_cao_ton_kho` |
| `ct_bao_cao_ton_kho` | Chi tiết tồn kho (tồn đầu/mua/bán/tồn cuối) | (`ma_bao_cao_ton_kho`, `ma_san_pham`) |
| `bao_cao_doanh_thu_sp` | Báo cáo doanh thu sản phẩm | `ma_bao_cao_doanh_thu_sp` |
| `ct_bao_cao_doanh_thu_sp` | Chi tiết doanh thu SP (doanh thu, tỉ lệ) | (`ma_bao_cao_doanh_thu_sp`, `ma_san_pham`) |
| `bao_cao_doanh_thu_dv` | Báo cáo doanh thu dịch vụ | `ma_bao_cao_doanh_thu_dv` |
| `ct_bao_cao_doanh_thu_dv` | Chi tiết doanh thu DV | (`ma_bao_cao_doanh_thu_dv`, `ma_loai_dich_vu`) |

#### Nhóm Hệ thống & RBAC (5 bảng)

| Bảng | Mô tả | Khóa chính |
|---|---|---|
| `tham_so` | Tham số hệ thống (vd: tỉ lệ trả trước) | `ma_tham_so` VARCHAR(20) |
| `chuc_nang` | Danh sách chức năng hệ thống | `ma_chuc_nang` VARCHAR(20) |
| `nhom_nguoi_dung` | Nhóm người dùng (ADMIN, STAFF) | `ma_nhom` VARCHAR(20) |
| `nguoi_dung` | Người dùng (username, password hash) | `ten_dang_nhap` VARCHAR(50) |
| `phan_quyen` | Bảng phân quyền N–N (nhóm ↔ chức năng) | (`ma_nhom`, `ma_chuc_nang`) |

### 4.2. Sơ đồ quan hệ (ERD tóm tắt)

```
nhom_nguoi_dung ─┐
                 ├── phan_quyen ──── chuc_nang
nguoi_dung ──────┘

nha_cung_cap ──── phieu_mua_hang ──── ct_phieu_mua ──── san_pham
                                                          │
loai_san_pham ─────────────────────────────────────────────┤
don_vi_tinh ───────────────────────────────────────────────┘

khach_hang ──── phieu_ban_hang ──── ct_phieu_ban ──── san_pham

khach_hang ──── phieu_dich_vu ──── ct_phieu_dich_vu ──── loai_dich_vu

san_pham ──── ct_bao_cao_ton_kho ──── bao_cao_ton_kho
san_pham ──── ct_bao_cao_doanh_thu_sp ──── bao_cao_doanh_thu_sp
loai_dich_vu ──── ct_bao_cao_doanh_thu_dv ──── bao_cao_doanh_thu_dv
```

### 4.3. Ràng buộc toàn vẹn đáng chú ý

- **CHECK constraints**: Tất cả giá trị tiền, số lượng đều `>= 0`; số lượng chi tiết phải `> 0`
- **UNIQUE constraints**: Số điện thoại NCC/KH, tên đơn vị tính, tên loại SP/DV, cặp (tháng, năm) báo cáo
- **FOREIGN KEY**: Đầy đủ tham chiếu giữa các bảng master–detail
- **Soft delete**: Cột `is_active` (thêm qua migration V3, V4) cho phép vô hiệu hóa thay vì xóa cứng

### 4.4. Flyway Migration History

| Version | Mô tả |
|---|---|
| V1 | Khởi tạo schema 23 bảng + seed nhóm, chức năng, phân quyền, đơn vị, loại DV, tham số |
| V2 | Seed dữ liệu nền: users, loại SP, NCC/KH/SP mẫu |
| V3 | Thêm `is_active` cho `san_pham`, `don_vi_tinh` |
| V4 | Thêm `is_active` cho các bảng danh mục/auth còn lại |
| V5 | Thêm `image_url`, `created_at` cho `san_pham` |

---

## 5. Backend — Thiết Kế Và Triển Khai

### 5.1. Cấu trúc package

```
com.se104.goldstore/
├── BackendApplication.java          // Entry point
├── common/                          // Utility classes
│   ├── ApiPaths.java                // Hằng số đường dẫn API (/api, /api/v1)
│   ├── CodeGeneratorUtils.java      // Tạo mã tự động cho phiếu/entity
│   ├── PricingUtils.java            // Công thức tính giá bán
│   └── SearchUtils.java             // Chuẩn hóa tìm kiếm
├── config/                          // CORS, JSON config
├── controller/        (25 files)    // REST endpoints
├── dto/               (45 files)    // Request/Response DTO
│   ├── request/                     // Payload gửi lên
│   └── response/                    // Payload trả về
├── entity/            (23 files)    // JPA entities
├── exception/         (5 files)     // Custom exceptions + GlobalExceptionHandler
├── mapper/                          // Object mapping
├── repository/        (23 files)    // Spring Data JPA repositories
├── security/          (8 files)     // JWT, auth filter, config
├── service/           (42 files)    // Business logic
│   ├── interfaces                   // Service interfaces
│   └── impl/                        // Service implementations
└── validation/                      // Custom validators (phone, etc.)
```

### 5.2. Design Patterns áp dụng

| Pattern | Vị trí | Mô tả |
|---|---|---|
| Layered Architecture | Toàn bộ | Controller → Service → Repository → Entity |
| DTO Pattern | `dto/` | Tách biệt payload API với entity nội bộ |
| Repository Pattern | `repository/` | Spring Data JPA auto-generated queries |
| Strategy Pattern | `security/` | JWT filter chain cho xác thực |
| Template Method | `service/impl/` | Base CRUD logic tái sử dụng |
| Builder | `dto/response/` | Builder pattern cho DTO response |

### 5.3. Danh sách Controller (25 controllers)

| Controller | Base Path | Chức năng |
|---|---|---|
| `AuthController` | `/api/auth` | Login / Logout / Me |
| `NhaCungCapController` | `/api/suppliers` | CRUD nhà cung cấp |
| `KhachHangController` | `/api/customers` | CRUD khách hàng |
| `DonViTinhController` | `/api/units` | CRUD đơn vị tính |
| `LoaiSanPhamController` | `/api/product-types` | CRUD loại sản phẩm |
| `LoaiDichVuController` | `/api/service-types` | CRUD loại dịch vụ |
| `SanPhamController` | `/api/products` | CRUD + catalog + search sản phẩm |
| `PhieuMuaHangController` | `/api/purchases` | Tạo/xem phiếu mua |
| `PhieuBanHangController` | `/api/sales` | Tạo/xem phiếu bán |
| `PhieuDichVuController` | `/api/service-tickets` | Tạo/xem/giao phiếu DV |
| `TraCuuController` | `/api/search` | Tra cứu SP + phiếu DV |
| `BaoCaoTonKhoReportController` | `/api/reports/inventory` | Generate/xem BC tồn kho |
| `BaoCaoDoanhThuSanPhamReportController` | `/api/reports/revenue/products` | Generate/xem BC DT SP |
| `BaoCaoDoanhThuDichVuReportController` | `/api/reports/revenue/services` | Generate/xem BC DT DV |
| `SettingsController` | `/api/settings` | Thay đổi quy định |
| `ImageUploadController` | `/api/uploads/images` | Upload hình sản phẩm |
| `NguoiDungController` | `/api/v1/nguoi-dung` | CRUD người dùng |
| `NhomNguoiDungController` | `/api/v1/nhom-nguoi-dung` | Xem nhóm người dùng |
| `HealthController` | `/api/v1/health` | Health check |
| Các controller legacy | `/api/v1/...` | CRUD legacy cho danh mục/báo cáo |

### 5.4. API Response chuẩn

Mọi endpoint trả về cùng envelope format:

```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... },
  "errors": []
}
```

Trường `errors` chứa danh sách `{ field, message }` khi có lỗi validation.

### 5.5. Danh sách JPA Entity (23 entities)

**Danh mục:** `NhaCungCap`, `KhachHang`, `DonViTinh`, `LoaiSanPham`, `LoaiDichVu`, `SanPham`

**Phiếu:** `PhieuMuaHang`, `ChiTietPhieuMua`, `PhieuBanHang`, `ChiTietPhieuBan`, `PhieuDichVu`, `ChiTietPhieuDichVu`

**Báo cáo:** `BaoCaoTonKho`, `ChiTietBaoCaoTonKho`, `BaoCaoDoanhThuSanPham`, `ChiTietBaoCaoDoanhThuSanPham`, `BaoCaoDoanhThuDichVu`, `ChiTietBaoCaoDoanhThuDichVu`

**Hệ thống:** `ThamSo`, `ChucNang`, `NhomNguoiDung`, `NguoiDung`, `PhanQuyen`

---

## 6. Frontend — Thiết Kế Và Triển Khai

### 6.1. Cấu trúc thư mục

```
frontend/src/
├── app/                             // Next.js App Router
│   ├── (auth)/login/                // Trang đăng nhập
│   ├── (dashboard)/dashboard/       // 18 trang dashboard
│   ├── layout.tsx                   // Root layout
│   ├── globals.css                  // Tailwind + custom CSS
│   └── page.tsx                     // Redirect → /dashboard
├── components/
│   ├── ui/                (20 files) // shadcn/ui primitives
│   ├── layout/            (2 files)  // Sidebar + Header
│   ├── dashboard/         (6 files)  // Reusable dashboard components
│   ├── language-switcher.tsx         // Chuyển ngôn ngữ VI/EN
│   └── theme-toggle.tsx              // Dark/Light/System mode
├── services/
│   ├── api-client.ts                // Base HTTP client + JWT injection
│   └── backend-api.ts               // Type-safe API endpoint wrappers
├── stores/                           // Zustand stores
│   ├── auth-store.ts                // JWT/user persistence
│   ├── toast-store.ts               // Toast notifications
│   ├── unit-store.ts                // Legacy unit store
│   └── sales-draft-store.ts         // Catalog → Sales draft handoff
├── types/
│   ├── backend.ts                   // 30+ TypeScript interfaces
│   └── index.ts                     // Shared types
├── i18n/
│   ├── i18n-context.tsx             // React Context provider
│   └── locales/                     // vi.json + en.json (300+ keys)
├── lib/                  (8 files)  // Utils, mock data, helpers
├── hooks/                           // Custom React hooks
└── middleware.ts                    // Auth route guard
```

### 6.2. Danh sách trang (18 routes)

| Route | Chức năng | Quyền |
|---|---|---|
| `/login` | Đăng nhập | Public |
| `/dashboard` | Tổng quan KPIs | ADMIN, STAFF |
| `/dashboard/suppliers` | CRUD nhà cung cấp | ADMIN, STAFF |
| `/dashboard/customers` | CRUD khách hàng | ADMIN, STAFF |
| `/dashboard/units` | CRUD đơn vị tính | ADMIN, STAFF |
| `/dashboard/product-types` | CRUD loại sản phẩm | ADMIN, STAFF |
| `/dashboard/service-types` | CRUD loại dịch vụ | ADMIN, STAFF |
| `/dashboard/products` | CRUD sản phẩm + tra cứu | ADMIN, STAFF |
| `/dashboard/product-catalog` | Catalog grid + tạo phiếu bán | ADMIN, STAFF |
| `/dashboard/purchase-orders` | Phiếu mua hàng | ADMIN, STAFF |
| `/dashboard/orders` | Phiếu bán hàng | ADMIN, STAFF |
| `/dashboard/service-orders` | Phiếu dịch vụ + tra cứu DV | ADMIN, STAFF |
| `/dashboard/reports` | Báo cáo BM10/11/12 | ADMIN |
| `/dashboard/settings` | Thay đổi quy định | ADMIN |
| `/dashboard/staff` | Quản lý tài khoản | ADMIN |
| `/dashboard/profile` | Hồ sơ cá nhân | ADMIN, STAFF |
| `/dashboard/notifications` | Thông báo (mock) | ADMIN, STAFF |
| `/dashboard/gold-prices` | Giá vàng (placeholder) | ADMIN, STAFF |

### 6.3. State Management (Zustand)

| Store | Chức năng |
|---|---|
| `auth-store` | Lưu JWT token, thông tin user, role; persist vào localStorage + cookie |
| `toast-store` | Quản lý thông báo toast in-app |
| `sales-draft-store` | Lưu tạm draft bán hàng từ catalog → chuyển sang trang orders |

### 6.4. API Client Architecture

```
apiRequest<T>(path, options)
    │
    ├── Resolve JWT token (Zustand store → localStorage fallback)
    ├── Build URL = API_BASE_URL + path + query string
    ├── Set headers (Authorization: Bearer, Content-Type)
    ├── fetch() call
    ├── Parse ApiEnvelope<T> response
    └── Throw ApiClientError nếu !success || !response.ok
```

**Type-safe wrappers** trong `backend-api.ts` bao phủ mọi endpoint với TypeScript generics.

### 6.5. Routing Guard (Middleware)

```
Request → middleware.ts
    ├── Static assets (_next, .files) → Pass through
    ├── Public path (/login) + có token → Redirect /dashboard
    ├── Protected path + không token → Redirect /login?callbackUrl=...
    └── Khác → Pass through
```

### 6.6. Đa ngôn ngữ (i18n)

- **Zero-dependency**: React Context + JSON dictionaries, không dùng thư viện bên ngoài
- **300+ translation keys** tổ chức theo nhóm (nav, auth, dashboard, modules...)
- **Language Switcher** trên login + dashboard header
- **Hỗ trợ**: Tiếng Việt (vi) + English (en)

---

## 7. Quy Trình Hoạt Động Nghiệp Vụ

### 7.1. Quy trình đăng nhập & xác thực

```
1. User nhập username/password → POST /api/auth/login
2. Backend verify BCrypt hash → Generate JWT token
3. Frontend lưu token vào Zustand + localStorage + cookie
4. Mọi request API đều gắn header: Authorization: Bearer <token>
5. Backend JwtAuthenticationFilter validate token mỗi request
6. GET /api/auth/me → Trả thông tin user hiện tại
```

### 7.2. Quy trình lập phiếu mua hàng (BM5)

```
1. Chọn nhà cung cấp từ danh mục
2. Thêm sản phẩm + số lượng + đơn giá mua
3. Hệ thống tự tính thành tiền = số lượng × đơn giá
4. POST /api/purchases → Backend trong 1 transaction:
   a. Tạo phiếu mua + chi tiết
   b. Tăng tồn kho sản phẩm (san_pham.ton_kho += số lượng)
   c. Cập nhật giá mua mới cho sản phẩm
   d. Tính lại giá bán = giá mua × (1 + tỉ lệ lợi nhuận)
5. Tổng tiền phiếu = Σ thành tiền các dòng
```

### 7.3. Quy trình lập phiếu bán hàng (BM6)

```
1. Chọn khách hàng từ danh mục
2. Thêm sản phẩm + số lượng bán
3. Hệ thống áp giá bán hiện tại từ sản phẩm
4. POST /api/sales → Backend trong 1 transaction:
   a. Kiểm tra tồn kho đủ (PESSIMISTIC_WRITE lock)
   b. Nếu số lượng bán > tồn kho → Reject (QĐ6)
   c. Giảm tồn kho sản phẩm
   d. Tạo phiếu bán + chi tiết
5. Tổng tiền phiếu = Σ (số lượng × đơn giá bán)
```

### 7.4. Quy trình phiếu dịch vụ (BM7)

```
1. Chọn khách hàng + loại dịch vụ + số lượng
2. Tổng tiền = Σ (số lượng × đơn giá dịch vụ)
3. Tiền trả trước phải ≥ tổng tiền × SERVICE_PREPAYMENT_RATE (QĐ7)
4. POST /api/service-tickets → Tạo phiếu + chi tiết
5. Giao hàng từng dòng:
   PATCH /api/service-tickets/{id}/items/{maLoaiDV}/deliver
6. Giao toàn bộ:
   PATCH /api/service-tickets/{id}/deliver-all
7. Khi tất cả dòng đã giao → Trạng thái = "Hoàn thành"
8. Tiền còn lại = Tổng tiền − Tiền trả trước
```

### 7.5. Quy trình tạo báo cáo

```
1. ADMIN chọn tháng/năm cần báo cáo
2. POST /api/reports/{type}/generate?month=M&year=Y
3. Backend tính toán từ dữ liệu phiếu trong tháng:
   - BM10 (Tồn kho): tồn đầu + mua vào − bán ra = tồn cuối
   - BM11 (DT sản phẩm): Σ thành tiền phiếu bán theo SP + tỉ lệ %
   - BM12 (DT dịch vụ): Σ thành tiền phiếu DV theo loại DV + tỉ lệ %
4. Lưu kết quả vào bảng báo cáo (regenerate nếu đã tồn tại)
5. GET /api/reports/{type} → Xem báo cáo đã generate
```

### 7.6. Công thức tính giá bán (QĐ6/QĐ8)

```
Giá bán = Giá mua × (1 + Tỉ lệ lợi nhuận của loại sản phẩm)

Ví dụ: Giá mua = 5.000.000đ, Tỉ lệ lợi nhuận = 5%
→ Giá bán = 5.000.000 × 1.05 = 5.250.000đ
```

Giá bán tự động cập nhật khi:
- Thay đổi giá mua (qua phiếu mua)
- Thay đổi tỉ lệ lợi nhuận loại sản phẩm (QĐ13)

---

## 8. Bảo Mật Và Phân Quyền

### 8.1. Mô hình bảo mật

| Thành phần | Cơ chế |
|---|---|
| Xác thực | JWT stateless (Bearer token) |
| Mã hóa mật khẩu | BCrypt hash |
| Session | Không lưu server-side (stateless) |
| Token filter | `JwtAuthenticationFilter` — validate mỗi request |
| Error handling | `RestAccessDeniedHandler` (403), `RestAuthenticationEntryPoint` (401) |

### 8.2. Phân quyền (RBAC)

| Chức năng | ADMIN | STAFF |
|---|---|---|
| QL Nhà cung cấp (QL_NCC) | ✅ | ✅ |
| QL Khách hàng (QL_KH) | ✅ | ✅ |
| QL Phiếu mua (QL_PMH) | ✅ | ✅ |
| QL Phiếu bán (QL_PBH) | ✅ | ✅ |
| QL Phiếu dịch vụ (QL_PDV) | ✅ | ✅ |
| Tra cứu (TRA_CUU) | ✅ | ✅ |
| QL Sản phẩm (QL_SP) | ✅ | ❌ |
| QL Báo cáo (QL_BC) | ✅ | ❌ |
| QL Người dùng (QL_ND) | ✅ | ❌ |

### 8.3. Bảo mật theo tầng

1. **URL-level**: `SecurityConfig` → whitelist/restrict theo URL pattern
2. **Method-level**: `@PreAuthorize("hasRole('ADMIN')")` trên các method nhạy cảm (xóa danh mục, settings)
3. **Frontend**: Middleware check cookie `auth-token`, sidebar ẩn menu theo role

### 8.4. Tài khoản seed

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `staff` | `staff123` | STAFF |

---

## 9. Kiểm Thử

### 9.1. Unit Test (Backend)

- **Framework**: JUnit 5 + Mockito
- **Số lượng**: 32 test cases pass
- **Phạm vi**: Auth, catalog CRUD, phiếu mua/bán/DV, báo cáo, settings, phân quyền

| Nhóm test | Mô tả |
|---|---|
| Auth service tests | Login, JWT generation, BCrypt verify |
| Catalog service tests | CRUD NCC, KH, DVT, loại SP, loại DV |
| Voucher service tests | Phiếu mua (tồn kho tăng), phiếu bán (chặn vượt tồn), phiếu DV (validate trả trước) |
| Report service tests | Generate báo cáo tồn kho, doanh thu |
| Settings tests | Đọc/cập nhật tỉ lệ trả trước |
| Controller tests | Auth controller, security trên report endpoint |

### 9.2. Frontend Build Verification

```bash
npm run build:frontend    # TypeScript type-check + Next.js build
npm run lint:frontend     # ESLint check
```

### 9.3. E2E (Setup sẵn)

- **Framework**: Playwright
- **Config**: `frontend/playwright.config.ts`
- **Spec**: `frontend/tests/e2e/main-flows.spec.ts`

---

## 10. Thống Kê Mã Nguồn

| Thành phần | Số file | Chi tiết |
|---|---|---|
| Backend Java (main) | ~179 | 25 controller, 42 service, 23 entity, 23 repository, 45 DTO, 8 security |
| Backend Java (test) | ~20 | Unit tests + integration test |
| Frontend TypeScript | ~76 | 18 pages, 28 components, services, stores, types, i18n |
| Database Migration | 5 | V1 (schema) → V5 (image_url) |
| API Endpoints | 50+ | Auth, danh mục, phiếu, tra cứu, báo cáo, settings |
| TypeScript Interfaces | 30+ | Typed request/response cho mọi API |
| Translation Keys | 300+ | VI + EN |

---

## 11. Hướng Dẫn Cài Đặt Và Chạy

### 11.1. Yêu cầu hệ thống

- Java 21 + Maven
- Node.js 18+ + npm
- Docker (cho PostgreSQL)

### 11.2. Các bước cài đặt

```bash
# 1. Clone repository
git clone <repo-url>
cd SE104.Q21-DoAn

# 2. Tạo file env
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 3. Khởi động PostgreSQL
npm run db:up

# 4. Chạy backend (port 8080)
npm run dev:backend

# 5. Chạy frontend (port 3000)
npm run dev:frontend
```

### 11.3. Biến môi trường quan trọng

| Biến | Giá trị mặc định | Mô tả |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/gold_store` | Connection string DB |
| `SPRING_DATASOURCE_USERNAME` | `gold_store` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `gold_store` | DB password |
| `JWT_SECRET` | (random) | Secret key cho JWT |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | URL backend API |

### 11.4. Lệnh kiểm tra

```bash
npm run test:backend      # Chạy unit test backend
npm run build:frontend    # Build + type-check frontend
npm run lint:frontend     # Lint frontend code
```

### 11.5. Truy cập hệ thống

| URL | Mô tả |
|---|---|
| `http://localhost:3000` | Frontend web app |
| `http://localhost:8080` | Backend API |
| `http://localhost:8080/swagger-ui.html` | Swagger API docs |

---

> **Ghi chú**: Báo cáo này được tạo dựa trên deep scan toàn bộ mã nguồn dự án tính đến ngày 26/05/2026.
