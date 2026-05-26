# API Map

## API Response Shape
Most endpoints return:
- `success: boolean`
- `message: string`
- `data: T`
- `errors?: [{ field, message }]`

## Auth & Public

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | Health check |
| `POST` | `/api/auth/login` | Public | Body: username/password |
| `POST` | `/api/auth/logout` | Public in config | Stateless logout ack |
| `GET` | `/api/auth/me` | JWT | Current principal profile |

## Catalog Endpoints

### Suppliers (new + legacy)
- Base paths: `/api/suppliers`, `/api/v1/nha-cung-cap`
- Methods:
  - `GET /` (`q` optional)
  - `GET /{maNhaCungCap}`
  - `POST /`
  - `PUT /{maNhaCungCap}`
  - `DELETE /{maNhaCungCap}` (ADMIN only)

### Customers (new + legacy)
- Base paths: `/api/customers`, `/api/v1/khach-hang`
- Methods:
  - `GET /` (`q`, `page`, `size` optional)
  - `GET /{maKhachHang}`
  - `POST /`
  - `PUT /{maKhachHang}`
  - `DELETE /{maKhachHang}` (ADMIN only)

### Units (new + legacy)
- Base paths: `/api/units`, `/api/v1/don-vi-tinh`
- Methods:
  - `GET /` (`q` optional)
  - `GET /{maDonViTinh}`
  - `POST /` (ADMIN only)
  - `PUT /{maDonViTinh}` (ADMIN only)
  - `DELETE /{maDonViTinh}` (ADMIN only)

### Product Types (new + legacy)
- Base paths: `/api/product-types`, `/api/v1/loai-san-pham`
- Methods:
  - `GET /` (`q` optional)
  - `GET /{maLoaiSanPham}`
  - `POST /` (ADMIN only)
  - `PUT /{maLoaiSanPham}` (ADMIN only)
  - `DELETE /{maLoaiSanPham}` (ADMIN only)

### Service Types (new + legacy)
- Base paths: `/api/service-types`, `/api/v1/loai-dich-vu`
- Methods:
  - `GET /` (`q` optional)
  - `GET /{maLoaiDichVu}`
  - `POST /` (ADMIN only)
  - `PUT /{maLoaiDichVu}` (ADMIN only)
  - `DELETE /{maLoaiDichVu}` (ADMIN only)

## Product Endpoints (new + legacy)
- Base paths: `/api/products`, `/api/v1/san-pham`
- Methods:
  - `GET /` with query:
    - `keyword` or legacy alias `q`
    - `productTypeId`
    - `page` (default 0)
    - `size` (default 20, max 100)
  - `GET /catalog` with query:
    - `keyword` or legacy alias `q`
    - `productTypeId`
    - `stockStatus`: `IN_STOCK` | `LOW_STOCK` | `OUT_OF_STOCK`
    - `sort`: `newest` | `priceAsc` | `priceDesc` | `stockAsc` | `stockDesc`
    - `page` (default 0)
    - `size` (default 20, max 100)
  - `GET /search?keyword=...`
  - `GET /{maSanPham}`
  - `POST /`
  - `PUT /{maSanPham}`
  - `DELETE /{maSanPham}` (ADMIN only)

## Upload Endpoints
- Base paths: `/api/uploads/images`, `/api/v1/uploads/images`
- Methods:
  - `POST /` (`multipart/form-data`, field: `file`)
  - Returns `imageUrl` (Cloudinary secure URL) and optional `publicId`
  - Requires JWT + permission `QL_SP` (or ADMIN)

## Voucher Endpoints

### Purchase vouchers (new + legacy)
- Base paths: `/api/purchases`, `/api/v1/phieu-mua-hang`
- Methods:
  - `GET /` (`keyword` or legacy `q`, optional `page`, `size`)
  - `GET /{soPhieuMua}`
  - `GET /{soPhieuMua}/print-data`
  - `POST /`

### Sales vouchers (new + legacy)
- Base paths: `/api/sales`, `/api/v1/phieu-ban-hang`
- Methods:
  - `GET /` (`keyword` or legacy `q`, optional `page`, `size`)
  - `GET /{soPhieuBan}`
  - `POST /`

### Service vouchers (new + legacy)
- Base paths: `/api/service-tickets`, `/api/v1/phieu-dich-vu`
- Methods:
  - `GET /` (`keyword` or legacy `q`, optional `page`, `size`)
  - `GET /{soPhieuDichVu}`
  - `POST /`
  - `PATCH /{soPhieuDichVu}/items/{maLoaiDichVu}/deliver` (body optional `ngayGiao`)
  - `PATCH /{soPhieuDichVu}/deliver-all` (body optional `ngayGiao`)

## Lookup Endpoints
- Base path: `/api/search`
- Methods:
  - `GET /products`
    - `keyword`, `page`, `size`
  - `GET /service-tickets`
    - `keyword`, `status`, `fromDate`, `toDate`, `page`, `size`
    - status supports accent-insensitive `Hoan thanh` / `Chua hoan thanh`
  - `GET /drill-down`
    - `type`, `id`, `month`, `year`
    - type currently supports: `product-sale`, `product-purchase`, `service`

## Report Endpoints (ADMIN)

### Current report endpoints
- Inventory:
  - `POST /api/reports/inventory/generate?month=&year=`
  - `GET /api/reports/inventory?month=&year=`
  - `GET /api/reports/inventory/{maBaoCaoTonKho}`
- Product revenue:
  - `POST /api/reports/revenue/products/generate?month=&year=`
  - `GET /api/reports/revenue/products?month=&year=`
- Service revenue:
  - `POST /api/reports/revenue/services/generate?month=&year=`
  - `GET /api/reports/revenue/services?month=&year=`

### Legacy report CRUD still present (`/api/v1/...`)
- `/api/v1/bao-cao-ton-kho`
- `/api/v1/bao-cao-doanh-thu-san-pham`
- `/api/v1/bao-cao-doanh-thu-dich-vu`

Each supports list/get-by-id/create/update/delete in legacy controllers.

## Settings Endpoints (ADMIN)
- Base path: `/api/settings`
- Methods:
  - `GET /product-types` (`q` optional)
  - `GET /units` (`q` optional)
  - `GET /service-types` (`q` optional)
  - `GET /service-prepayment-rate`
  - `PUT /service-prepayment-rate` body `{ value }`

## Admin/RBAC Legacy Endpoints (`/api/v1/...`, ADMIN)
- `/api/v1/chuc-nang` (feature functions)
- `/api/v1/nhom-nguoi-dung` (user groups)
- `/api/v1/nguoi-dung` (users)
- `/api/v1/phan-quyen` (permissions mapping)
- `/api/v1/tham-so` (parameters)

## Frontend-Used Endpoint Notes
- Frontend mostly calls `/api/...`.
- Exception: staff/account management currently uses:
  - `/api/v1/nguoi-dung`
  - `/api/v1/nhom-nguoi-dung`

## Security Notes
- URL-level restrictions configured in `SecurityConfig`.
- Additional method-level `@PreAuthorize` exists on selected catalog/product methods.
- Expect 401 for missing/invalid token and 403 for role violations.
