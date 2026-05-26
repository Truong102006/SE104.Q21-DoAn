# Backend Map

## Backend Architecture
- Framework: Spring Boot 4 (`backend/src/main/java/com/se104/goldstore`)
- Pattern: Controller -> Service -> Repository -> Entity
- Persistence: PostgreSQL + Spring Data JPA
- Schema lifecycle: Flyway migrations (`V1__init_schema.sql` -> `V4__add_is_active_to_more_tables.sql`)
- API contract: `ApiResponse<T>` envelope

## Package Structure
- `common/`
  - `ApiPaths`: centralized constants for `/api` and `/api/v1` paths
  - `CodeGeneratorUtils`: code generation for voucher/entity IDs
  - `PricingUtils`: selling price formula
  - `SearchUtils`: search normalization helpers
- `config/`
  - CORS and JSON configuration
- `controller/`
  - REST endpoints by module
- `dto/`
  - `request/` and `response/` payloads
- `entity/`
  - JPA entities for catalog, vouchers, reports, auth/rbac
- `exception/`
  - Business/auth/not-found exceptions + global exception handling
- `repository/`
  - Spring Data repositories + custom query methods
- `security/`
  - JWT service/filter, user details service, security config, auth seeding
- `service/` and `service/impl/`
  - Business logic and transaction handling
- `validation/`
  - custom validators (e.g., phone)

## Domain Modules

### 1. Auth & RBAC
- Login/logout/me in `AuthController`
- JWT token generation and validation
- Role hierarchy: `ADMIN`, `STAFF`
- Seed users/groups initialized by `AuthSeedDataInitializer`

### 2. Catalog Management
- Suppliers (`NhaCungCap`)
- Customers (`KhachHang`)
- Units (`DonViTinh`)
- Product types (`LoaiSanPham`)
- Service types (`LoaiDichVu`)

### 3. Product Management
- Product CRUD (`SanPham`)
- Selling price computed from purchase price + profit rate
- Unit compatibility checks by product type
- Product deletion blocked if referenced by vouchers/reports

### 4. Voucher Flows
- Purchase vouchers (`PhieuMuaHang` + details)
  - Increase stock
  - Update product purchase/selling price
- Sales vouchers (`PhieuBanHang` + details)
  - Decrease stock
  - Prevent overselling
- Service vouchers (`PhieuDichVu` + details)
  - Validate prepayment minimum
  - Deliver per item or all items
  - Recalculate remaining amount and ticket status

### 5. Lookup & Reports
- Product lookup and service-ticket lookup with filters/paging
- Report drill-down lookup endpoint for product sale/purchase and service details by month/year
- Monthly reports:
  - Inventory (`BM10`)
  - Product revenue (`BM11`)
  - Service revenue (`BM12`)

### 6. Settings
- Settings API for:
  - Product type list
  - Unit list
  - Service type list
  - Service prepayment rate (`SERVICE_PREPAYMENT_RATE`)

## Security Model
- Stateless JWT via `Authorization: Bearer ...`
- Global URL pattern restrictions in `SecurityConfig`
- Additional method-level restrictions with `@PreAuthorize`
- Public endpoints:
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/v1/health`
  - Swagger endpoints

## Data Model (Flyway V1 Tables)
- Core catalog: `nha_cung_cap`, `khach_hang`, `don_vi_tinh`, `loai_dich_vu`, `loai_san_pham`, `san_pham`
- Vouchers: `phieu_mua_hang`, `ct_phieu_mua`, `phieu_ban_hang`, `ct_phieu_ban`, `phieu_dich_vu`, `ct_phieu_dich_vu`
- Settings: `tham_so`
- Reports: `bao_cao_ton_kho`, `ct_bao_cao_ton_kho`, `bao_cao_doanh_thu_sp`, `ct_bao_cao_doanh_thu_sp`, `bao_cao_doanh_thu_dv`, `ct_bao_cao_doanh_thu_dv`
- RBAC: `chuc_nang`, `nhom_nguoi_dung`, `nguoi_dung`, `phan_quyen`

## Seed Data (Flyway V2)
- Groups: ADMIN, STAFF
- Users: `admin/admin123`, `staff/staff123` (bcrypt in DB)
- Units, product types, service types, default `SERVICE_PREPAYMENT_RATE`
- Sample suppliers/customers/products

## Testing Map
- Unit tests in `backend/src/test/java/com/se104/goldstore/unit`
  - Service tests: auth, catalog, vouchers, lookup, reports, settings
  - Controller tests: auth, security on report endpoint, sale controller
- Integration tests:
  - `backend/src/test/java/com/se104/goldstore/integration/CustomerSearchIntegrationTest.java`
  - currently profile-specific (`@ActiveProfiles("supabase")`) and focused on repository search behavior

## Build/Run
- Dev run: `mvn -f backend/pom.xml spring-boot:run`
- Tests: `mvn -f backend/pom.xml test`
- Docker image: `backend/Dockerfile` (Maven build stage + JRE runtime stage)
