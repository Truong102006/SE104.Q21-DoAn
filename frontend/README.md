# Frontend - He thong quan ly cua hang vang bac da quy

Ung dung web duoc xay dung bang Next.js + React + TypeScript, ket noi voi backend Spring Boot de quan ly danh muc, san pham, phieu mua/ban/dich vu, tra cuu va bao cao.

## 1. Cong nghe su dung

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix UI + Lucide
- React Hook Form + Zod
- Zustand
- TanStack Table
- Framer Motion

## 2. Cau truc thu muc chinh

- `src/app/(auth)`: man hinh dang nhap
- `src/app/(dashboard)`: layout dashboard va cac module nghiep vu
- `src/components`: component dung chung
- `src/lib`: api client, helper, constants
- `src/types`: dinh nghia kieu request/response

## 3. Cau hinh env frontend

Tao file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Neu backend chay domain khac thi thay doi `NEXT_PUBLIC_API_URL` tuong ung.

## 4. Cach chay frontend

Tu root monorepo:

```bash
npm install
npm run dev:frontend
```

Hoac chay truc tiep trong thu muc `frontend`:

```bash
npm install
npm run dev
```

App mac dinh: `http://localhost:3000`.

## 5. Cach chay backend de frontend ket noi

Tu root monorepo:

```bash
npm run dev:backend
```

API backend mac dinh: `http://localhost:8080`.

## 6. Database va migration (backend)

Frontend phu thuoc du lieu backend, vi vay can backend migration xong truoc khi demo:

```bash
npm run db:up
npm run dev:backend
```

Flyway se tu dong chay migration khi backend start.

## 7. Tai khoan seed

- `admin / admin123` (ADMIN)
- `staff / staff123` (STAFF)

## 8. Chuc nang frontend da hoan thanh

- Dang nhap, luu JWT va goi `/api/auth/me`
- Layout chinh: sidebar, header, logout
- Hien thi menu theo role ADMIN/STAFF
- Dashboard thong ke nhanh
- CRUD danh muc: nha cung cap, khach hang, don vi tinh, loai san pham, loai dich vu
- Quan ly san pham + tim kiem tuong doi
- Lap phieu mua, phieu ban, phieu dich vu
- Tra cuu phieu dich vu theo keyword/status/khoang ngay
- Bao cao ton kho, doanh thu san pham, doanh thu dich vu
- Trang settings thay doi quy dinh (ti le tra truoc)
- Loading / empty / error state va hien thi loi validate tu backend

## 9. API chinh frontend dang dung

- Auth: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- Danh muc: `/api/suppliers`, `/api/customers`, `/api/units`, `/api/product-types`, `/api/service-types`
- San pham: `/api/products`, `/api/search/products`
- Phieu mua: `/api/purchases`, `/api/purchases/{id}`, `/api/purchases/{id}/print-data`
- Phieu ban: `/api/sales`, `/api/sales/{id}`
- Phieu dich vu: `/api/service-tickets`, `/api/service-tickets/{id}`, deliver item, deliver all
- Tra cuu: `/api/search/service-tickets`
- Bao cao: `/api/reports/inventory`, `/api/reports/revenue/products`, `/api/reports/revenue/services`
- Settings: `/api/settings/service-prepayment-rate`

## 10. Kiem tra chat luong frontend

Tu root monorepo:

```bash
npm run lint:frontend
npm run build:frontend
```

## 11. Thu tu demo nghiep vu goi y

1. Dang nhap role STAFF -> tao danh muc co ban -> tao san pham.
2. Lap phieu mua de tang ton kho.
3. Lap phieu ban de giam ton kho va kiem tra chan vuot ton.
4. Lap phieu dich vu, thu nghiem quy dinh tra truoc toi thieu.
5. Giao tung dong/giao toan bo phieu dich vu.
6. Dang nhap ADMIN -> generate va xem bao cao BM10/BM11/BM12.
7. Doi quy dinh trong settings -> tao giao dich moi de xac nhan quy dinh moi co hieu luc.

## 12. Tai lieu bo sung

- Root README: `../README.md` (chi tiet backend, migration, docker postgres, danh sach API day du).
