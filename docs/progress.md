# 📊 Tiến Độ Dự Án — Web Quản Lý Cửa Hàng Vàng Bạc Đá Quý

> **Mã đồ án:** SE104.Q21  
> **Ngày cập nhật:** 2026-05-08  
> **Nhánh chính:** `dev` (active) · `main` (production)  
> **Tác giả:** truong1110 <quangtruongto2k6@gmail.com>

---

## 1. Tổng Quan Dự Án

| Hạng mục | Chi tiết |
|---|---|
| **Tên dự án** | Web Quản Lý Cửa Hàng Vàng Bạc Đá Quý |
| **Kiến trúc** | Monorepo — Frontend + Backend + Docker |
| **Frontend** | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (radix-nova) · Zustand · Framer Motion |
| **Backend** | Spring Boot 4.0.6 · Java 21 · Maven · Spring Security · JWT (jjwt 0.12.6) · Spring Data JPA · Flyway · PostgreSQL |
| **Database** | PostgreSQL 16 (Docker Alpine) |
| **Testing** | Playwright (E2E) · JUnit 5 · Mockito 5.18 |
| **API Docs** | Springdoc OpenAPI (Swagger UI) |
| **Design System** | UI/UX Pro Max v2.5 — Liquid Glass + Premium black/gold |

---

## 2. Lịch Sử Phát Triển

### Git Commits
| # | Hash | Ngày | Nội dung |
|---|---|---|---|
| 1 | `f62fee6` | 2026-05-05 | `chore: initial project scaffold` — Khởi tạo cấu trúc monorepo |
| 2 | `5b56b9b` | 2026-05-05 | `chore: prepare PR branch for initial upload` — Chuẩn bị PR |
| 3 | `9ebec72` | 2026-05-05 | `merge: pr upload-project into dev` — Merge vào nhánh `dev` |

### Nhật Ký Phát Triển

| Ngày | Phiên | Nội dung |
|---|---|---|
| 2026-05-08 | #1 (10:51) | Deep scan dự án, tạo `docs/progress.md` ban đầu |
| 2026-05-08 | #2 (11:18) | Đọc và nắm bắt UI/UX Pro Max Skill (67 styles, 161 palettes, 99 UX rules) |
| 2026-05-08 | #3 (11:23) | **Frontend Architecture** — Triển khai toàn bộ core UI (chi tiết bên dưới) |

---

## 3. Cấu Trúc Thư Mục Hiện Tại

```
SE104.Q21-DoAn/
├── .editorconfig                  # Cấu hình editor (UTF-8, spaces, LF)
├── .env.example                   # Biến môi trường mẫu (root)
├── .gitignore                     # Ignore rules cho toàn bộ monorepo
├── README.md                      # Hướng dẫn chạy dự án
├── docker-compose.yml             # PostgreSQL 16 Alpine container
├── package.json                   # Monorepo scripts
├── docs/
│   └── progress.md                ✅ Tài liệu tiến độ (file này)
│
├── backend/
│   ├── .env.example
│   ├── pom.xml                    ✅ Đầy đủ dependencies
│   ├── mvnw / mvnw.cmd
│   └── src/
│       ├── main/
│       │   ├── java/com/se104/goldstore/
│       │   │   ├── BackendApplication.java    ✅ Entry point
│       │   │   ├── common/ApiPaths.java       ⬜ File rỗng
│       │   │   ├── config/                    ⬜ Chỉ có .gitkeep
│       │   │   ├── controller/                ⬜ HealthController rỗng
│       │   │   ├── dto/request/ & response/   ⬜ Chỉ có .gitkeep
│       │   │   ├── entity/                    ⬜ Chỉ có .gitkeep
│       │   │   ├── exception/                 ⬜ Chỉ có .gitkeep
│       │   │   ├── mapper/                    ⬜ Chỉ có .gitkeep
│       │   │   ├── repository/                ⬜ Chỉ có .gitkeep
│       │   │   ├── security/
│       │   │   │   └── SecurityConfig.java    ✅ Stateless + CSRF off
│       │   │   ├── service/impl/              ⬜ Chỉ có .gitkeep
│       │   │   └── validation/                ⬜ Chỉ có .gitkeep
│       │   └── resources/
│       │       ├── application.yml            ✅ PostgreSQL/JWT/Flyway config
│       │       └── db/migration/
│       │           └── V1_init_schema.sql     ⬜ File rỗng
│       └── test/                              ⬜ Không có test
│
└── frontend/
    ├── .env.example
    ├── package.json                ✅ + zustand dependency (MỚI)
    ├── components.json             ✅ shadcn/ui radix-nova config
    ├── playwright.config.ts
    └── src/
        ├── middleware.ts              ✅ MỚI — Auth route guard (edge)
        ├── app/
        │   ├── layout.tsx             ✅ CẬP NHẬT — + TooltipProvider
        │   ├── page.tsx               ✅ CẬP NHẬT — Auth redirect logic
        │   ├── globals.css            ✅ CẬP NHẬT — Luxury gold theme
        │   ├── favicon.ico
        │   ├── (auth)/
        │   │   └── login/
        │   │       └── page.tsx       ✅ MỚI — Login page premium UI
        │   └── (dashboard)/
        │       ├── layout.tsx         ✅ MỚI — Sidebar + Header wrapper
        │       └── dashboard/
        │           ├── page.tsx       ✅ MỚI — Stats + gold prices
        │           └── products/
        │               └── page.tsx   ✅ MỚI — Products table + RBAC
        ├── components/
        │   ├── layout/
        │   │   ├── sidebar.tsx        ✅ MỚI — Dynamic role-based sidebar
        │   │   └── header.tsx         ✅ MỚI — Search + user dropdown
        │   └── ui/                    ✅ MỚI — 12 shadcn components
        │       ├── avatar.tsx         ├── badge.tsx
        │       ├── button.tsx         ├── card.tsx
        │       ├── dropdown-menu.tsx  ├── input.tsx
        │       ├── label.tsx          ├── separator.tsx
        │       ├── sheet.tsx          ├── skeleton.tsx
        │       ├── table.tsx          └── tooltip.tsx
        ├── stores/
        │   └── auth-store.ts          ✅ MỚI — Zustand + cookie/localStorage
        ├── lib/
        │   ├── utils.ts               ✅ cn() utility
        │   └── mock-data.ts           ✅ MỚI — Vietnamese jewelry data
        ├── types/
        │   └── index.ts               ✅ MỚI — All entity types
        ├── features/                  ⬜ .gitkeep
        ├── hooks/                     ⬜ .gitkeep
        └── services/                  ⬜ .gitkeep
    └── tests/e2e/                     ⬜ .gitkeep
```

**Chú thích:** ✅ = Đã triển khai · ⬜ = Scaffold · MỚI = Tạo mới phiên 08/05 · CẬP NHẬT = Sửa đổi phiên 08/05

---

## 4. Chi Tiết Phiên Phát Triển 08/05/2026 — Frontend Architecture

### 4.1 Design System (UI/UX Pro Max v2.5)

Chạy `python3 search.py "jewelry store management dashboard luxury gold" --design-system` để sinh design system:

| Thuộc tính | Giá trị |
|---|---|
| **Style** | Liquid Glass — Premium SaaS, high-end e-commerce |
| **Colors** | Primary `#1C1917`, Accent/CTA `#A16207` (gold), BG `#FAFAF9`, Destructive `#DC2626` |
| **Typography** | Cormorant / Montserrat (luxury mood) — hiện dùng Geist Sans |
| **Sidebar** | Dark charcoal `oklch(0.14 0.01 60)` với gold active states |
| **Effects** | Morphing, fluid animations 400-600ms, dynamic blur |
| **Avoid** | Vibrant & Block-based, Playful colors |

### 4.2 Dependencies Đã Cài

| Package | Phiên bản | Mục đích |
|---|---|---|
| `zustand` | latest | State management (auth store) |
| 12x shadcn/ui components | radix-nova | UI component library |

### 4.3 Files Đã Tạo/Cập Nhật (13 files)

#### Auth System
| File | Dòng code | Chức năng |
|---|---|---|
| `stores/auth-store.ts` | ~85 | Zustand store: JWT token + user + role. Dual persist: cookie (cho middleware) + localStorage (cho hydration). Methods: `login()`, `logout()`, `hydrate()`, `isAdmin()`, `hasRole()` |
| `middleware.ts` | ~48 | Next.js edge middleware: kiểm tra cookie `auth-token`, redirect `/login` nếu chưa auth, redirect `/dashboard` nếu đã auth mà vào login |
| `types/index.ts` | ~118 | TypeScript types cho User, Product, Order, Customer, Supplier, GoldPrice, NavItem, NavGroup |

#### Login Page
| File | Dòng code | Chức năng |
|---|---|---|
| `(auth)/login/page.tsx` | ~190 | Split-screen layout: bên trái dark brand showcase (gold accents, stats decoration), bên phải form đăng nhập. Có: password toggle, loading spinner, error alert, 2 nút demo (Admin/Staff) |

#### Dashboard Layout
| File | Dòng code | Chức năng |
|---|---|---|
| `components/layout/sidebar.tsx` | ~200 | **Dynamic Sidebar**: 5 nhóm menu (Tổng quan, Quản lý bán hàng, Quản lý kho, Thông tin thị trường, Hệ thống). Lọc theo role — STAFF ẩn: Nhà cung cấp, Nhập hàng, Nhân viên. Collapsible với tooltip khi thu gọn |
| `components/layout/header.tsx` | ~130 | Top header: search bar, role badge (gold cho Admin), notification bell (badge count), user avatar dropdown (Hồ sơ, Cài đặt, Đăng xuất). Mobile: Sheet sidebar trigger |
| `(dashboard)/layout.tsx` | ~65 | Layout wrapper: auth hydration, redirect nếu chưa login, loading spinner, sidebar + header + main content area với smooth margin transition |

#### Pages
| File | Dòng code | Chức năng |
|---|---|---|
| `(dashboard)/dashboard/page.tsx` | ~110 | Dashboard home: 4 stat cards (ADMIN) / 3 stat cards (STAFF — ẩn Doanh thu). Gold prices ticker 3 loại vàng. Shimmer effect trên cards |
| `(dashboard)/dashboard/products/page.tsx` | ~250 | **Products table**: Search + category filter dropdown + pagination. ADMIN thấy 10 cột (bao gồm Giá vốn + Lợi nhuận + % + Edit/Delete). STAFF thấy 8 cột (ẩn Giá vốn, Lợi nhuận, chỉ có View) |

#### Theme & Config
| File | Dòng code | Chức năng |
|---|---|---|
| `globals.css` | ~195 | Luxury gold theme: oklch colors, `--gold` brand token, dark sidebar tokens, light/dark mode, `.text-gold-gradient`, `.shimmer-gold` utility |
| `layout.tsx` (root) | ~34 | Thêm `TooltipProvider` wrapper, cập nhật metadata title/description |
| `page.tsx` (root) | ~15 | Server component: đọc cookie → redirect `/dashboard` hoặc `/login` |
| `lib/mock-data.ts` | ~175 | 2 demo users (admin/staff), 5 categories, 8 products (jewelry VN), 3 gold prices, `formatVND()`, `mockLogin()` |

### 4.4 RBAC — Kết Quả Kiểm Chứng

| Tính năng | ADMIN ✅ | STAFF ❌ |
|---|---|---|
| Sidebar — Nhà cung cấp, Nhập hàng | Hiển thị | Ẩn hoàn toàn |
| Sidebar — Nhân viên | Hiển thị | Ẩn hoàn toàn |
| Dashboard — Card "Doanh thu tháng" | Hiển thị (1.250.000.000₫) | Ẩn |
| Products — Cột "Giá vốn" | Hiển thị | Ẩn |
| Products — Cột "Lợi nhuận" | Hiển thị (số + %) | Ẩn |
| Products — Nút "Thêm sản phẩm" | Hiển thị (gold button) | Ẩn |
| Products — Actions Edit/Delete | Hiển thị | Chỉ "Xem chi tiết" |
| Header — Role badge | "Admin" (gold border) | "Nhân viên" (gray border) |

### 4.5 Build Status

```
✅ next build — Compiled successfully
✅ TypeScript — No errors
✅ Routes generated: /, /login, /dashboard, /dashboard/products
⚠️ middleware.ts deprecated in Next.js 16 (khuyến nghị chuyển sang proxy.ts)
```

---

## 5. Phân Tích Chi Tiết Theo Module

### 5.1 Backend — Spring Boot (Chưa thay đổi)

#### Đã hoàn thành ✅
| File | Mô tả |
|---|---|
| `BackendApplication.java` | Entry point — `@SpringBootApplication` |
| `SecurityConfig.java` | Spring Security: stateless, CSRF disabled, permitAll |
| `application.yml` | PostgreSQL/HikariCP, JPA validate, Flyway, Swagger, JWT config |
| `pom.xml` | 14 dependencies đầy đủ |

#### Chưa triển khai ⬜
| Package | Mục đích |
|---|---|
| `entity/` | JPA Entities (User, Product, Order, ...) |
| `repository/` | Spring Data JPA Repositories |
| `service/impl/` | Business logic layer |
| `controller/` | REST API endpoints |
| `dto/request/` + `dto/response/` | Data Transfer Objects |
| `mapper/` | MapStruct mappers |
| `exception/` | Custom exceptions + Global handler |
| `V1_init_schema.sql` | Flyway migration schema |

### 5.2 Frontend — Next.js (Đã triển khai core)

#### Đã hoàn thành ✅
| Module | Files | Trạng thái |
|---|---|---|
| **Auth Store** | `stores/auth-store.ts` | ✅ Zustand + cookie + localStorage |
| **Route Guard** | `middleware.ts` | ✅ Edge middleware |
| **Type System** | `types/index.ts` | ✅ Tất cả entity types |
| **Login Page** | `(auth)/login/page.tsx` | ✅ Premium split-screen UI |
| **Dashboard Layout** | `(dashboard)/layout.tsx` | ✅ Sidebar + Header wrapper |
| **Sidebar** | `components/layout/sidebar.tsx` | ✅ Role-based, collapsible |
| **Header** | `components/layout/header.tsx` | ✅ Search + dropdown + notifications |
| **Dashboard Home** | `dashboard/page.tsx` | ✅ Stats + gold prices |
| **Products Table** | `dashboard/products/page.tsx` | ✅ RBAC columns + filter + pagination |
| **Design Theme** | `globals.css` | ✅ Luxury gold theme (oklch) |
| **Mock Data** | `lib/mock-data.ts` | ✅ Vietnamese jewelry data |
| **UI Components** | `components/ui/` (12 files) | ✅ shadcn/ui radix-nova |

#### Chưa triển khai ⬜
| Module | Mục đích |
|---|---|
| API client service | `services/api.ts` — Axios/fetch wrapper kết nối backend |
| Trang Danh mục | `/dashboard/categories` |
| Trang Đơn hàng | `/dashboard/orders` |
| Trang Khách hàng | `/dashboard/customers` |
| Trang Nhà cung cấp | `/dashboard/suppliers` (ADMIN) |
| Trang Nhập hàng | `/dashboard/purchase-orders` (ADMIN) |
| Trang Giá vàng | `/dashboard/gold-prices` |
| Trang Nhân viên | `/dashboard/staff` (ADMIN) |
| CRUD dialogs | Thêm/Sửa/Xóa cho mỗi entity |
| E2E tests | Playwright test cases |

### 5.3 Infrastructure

| Thành phần | Trạng thái |
|---|---|
| Docker Compose (PostgreSQL) | ✅ PostgreSQL 16 Alpine |
| Monorepo scripts | ✅ dev:frontend/backend, db:up/down |
| `.env.example` files | ✅ Root + backend + frontend |
| Git branching | ✅ main ← dev |
| UI/UX Pro Max Skill | ✅ Đã đọc và tuân thủ |

---

## 6. Đánh Giá Tổng Thể

### 🟢 Điểm mạnh
- **Kiến trúc rõ ràng:** Monorepo scaffold + frontend architecture hoàn chỉnh
- **RBAC hoạt động:** Admin/Staff phân quyền đúng trên sidebar, dashboard stats, table columns, action buttons
- **Design premium:** Luxury gold theme, dark sidebar, oklch colors, shimmer effects
- **Auth system:** JWT cookie + localStorage, edge middleware, Zustand store
- **UI foundation:** 12 shadcn components, role-based sidebar, responsive layout
- **Tuân thủ UI/UX Pro Max:** No emoji icons, cursor-pointer, contrast ≥4.5:1, Lucide icons, semantic tokens

### 🟡 Giai đoạn hiện tại
- **Phase:** Frontend Architecture — Core UI hoàn thành
- **Tiến độ tổng thể:** ~25-30%
- **Frontend:** ~60% architecture, ~15% pages
- **Backend:** ~10% (chỉ scaffold)

### 🔴 Cần triển khai tiếp
- Backend: Database schema + Entities + APIs (ưu tiên cao nhất)
- Frontend: Các trang còn lại (7 trang chưa có)
- Frontend: CRUD dialogs cho mỗi entity
- Frontend: Kết nối API thật thay mock data
- Testing: E2E + Unit tests

---

## 7. Lộ Trình Phát Triển

### Phase 1: Database & Backend Core 🎯 _Ưu tiên cao — CHƯA BẮT ĐẦU_
- [ ] Thiết kế database schema (Flyway `V1__init_schema.sql`)
  - Bảng `users`, `categories`, `products`, `customers`
  - Bảng `orders` + `order_items`
  - Bảng `suppliers`, `purchase_orders` + `purchase_order_items`
  - Bảng `gold_prices`
- [ ] Tạo JPA Entities, Repositories, DTOs, MapStruct Mappers

### Phase 2: Backend Authentication & Authorization 🔐 _CHƯA BẮT ĐẦU_
- [ ] JWT flow (login, refresh token), `JwtTokenProvider`, `JwtAuthenticationFilter`
- [ ] Spring Security RBAC (ADMIN/STAFF), BCrypt password encoding
- [ ] Global Exception Handler (`@ControllerAdvice`)

### Phase 3: Backend Business APIs 📡 _CHƯA BẮT ĐẦU_
- [ ] CRUD: Products, Customers, Suppliers, Categories
- [ ] Orders + Purchase Orders Management
- [ ] Gold Price Management, Reports & Statistics

### Phase 4: Frontend — Core UI Architecture ✅ _HOÀN THÀNH 08/05_
- [x] Cài đặt Zustand + 12 shadcn/ui components
- [x] Auth Store (JWT cookie + localStorage + edge middleware)
- [x] Trang Login (premium split-screen, demo buttons)
- [x] Dashboard Layout (sidebar + header + content wrapper)
- [x] Dynamic Sidebar (role-based, collapsible, tooltips)
- [x] Dashboard Home (role-aware stats + gold prices)
- [x] Products Table (RBAC columns, search, filter, pagination)
- [x] Luxury Gold Theme (oklch, dark sidebar, shimmer effects)

### Phase 5: Frontend — Remaining Pages 📄 _CHƯA BẮT ĐẦU_
- [ ] Trang Danh mục, Đơn hàng, Khách hàng
- [ ] Trang Nhà cung cấp, Nhập hàng (ADMIN)
- [ ] Trang Giá vàng, Nhân viên (ADMIN)
- [ ] CRUD dialogs (Form + Zod validation)
- [ ] Kết nối API thật (thay mock data)

### Phase 6: Testing & Polish 🧪 _CHƯA BẮT ĐẦU_
- [ ] Unit tests (JUnit 5 + Mockito)
- [ ] E2E tests (Playwright)
- [ ] Responsive optimization, Performance tuning

---

## 8. Thống Kê Mã Nguồn

| Metric | Giá trị |
|---|---|
| **Tổng files có code (frontend)** | 27 files |
| **Tổng dòng code (frontend)** | ~2,692 dòng |
| **Tổng dung lượng (frontend src)** | ~119.7 KB |
| **Files tự viết (không shadcn)** | 15 files |
| **shadcn/ui components** | 12 components |
| **Tổng files có code (backend)** | 3 files (~86 dòng) |
| **Dependencies frontend** | 14 packages (deps) + 6 (devDeps) |
| **Dependencies backend** | 14 Maven dependencies |
| **Tổng commits** | 3 |

---

## 9. Ghi Chú Kỹ Thuật

### Cấu hình đáng chú ý
- **JPA ddl-auto = `validate`** → Phải dùng Flyway migration, Hibernate chỉ kiểm tra
- **Security hiện tại = `permitAll()`** → Cần thay đổi khi triển khai auth backend
- **CORS chưa cấu hình** → Cần thêm khi frontend kết nối backend
- **JWT secret mặc định** → Phải đổi trước khi deploy
- **Next.js 16 deprecated `middleware.ts`** → Cần migrate sang `proxy.ts` trong tương lai
- **Mock data** → Tất cả dữ liệu hiện tại là mock, cần thay bằng API calls

### Tài khoản Demo
| Username | Password | Role | Quyền |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | Full access |
| `staff` | `staff123` | STAFF | Restricted (ẩn giá vốn, nhà cung cấp, nhân viên) |

### Chạy Dev
```bash
cd frontend && npm run dev
# → http://localhost:3000
```

---

> _Cập nhật lần cuối: 2026-05-08 11:48 — Phiên Frontend Architecture_  
> _Cập nhật tiếp khi hoàn thành backend hoặc thêm pages mới_
