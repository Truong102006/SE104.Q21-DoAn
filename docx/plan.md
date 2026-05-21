# Kế Hoạch: Sửa Lỗi Phông Chữ + Thêm Chức Năng Đa Ngôn Ngữ (VI/EN)

> **Ngày tạo:** 2026-05-21
> **Trạng thái:** Chờ duyệt

---

## 1. Phân Tích Hiện Trạng

### 1.1. Lỗi Phông Chữ

Hiện tại `globals.css` khai báo font stack:

```css
--font-sans: "Segoe UI", "Noto Sans", "Helvetica Neue", Arial, sans-serif;
```

**Vấn đề:**
- Không import web font nào (không có `@import url(...)` hay `next/font`).
- Phụ thuộc hoàn toàn vào font hệ thống → hiển thị khác nhau trên Windows/Mac/Linux.
- Trên máy không có "Segoe UI" hoặc "Noto Sans" sẽ rơi về Arial → tiếng Việt có dấu có thể hiển thị xấu hoặc không đồng nhất.
- Chưa dùng `next/font` (API tối ưu của Next.js) để preload/self-host font.

### 1.2. Đa Ngôn Ngữ (i18n)

- **Không có thư viện i18n** nào trong `package.json`.
- Toàn bộ text tiếng Việt đang **hardcoded trực tiếp** trong ~22 file TSX.
- `layout.tsx` gán cố định `lang="vi"`.
- Không có file translation JSON hay mechanism chuyển ngôn ngữ.

### 1.3 Danh Sách Các File Cần Sửa

| Nhóm | File | Nội dung cần dịch |
|------|------|--------------------|
| Layout | `src/app/layout.tsx` | `lang`, metadata title/description |
| Login | `src/app/(auth)/login/page.tsx` | ~15 chuỗi (Đăng nhập, Tên đăng nhập, Mật khẩu, v.v.) |
| Sidebar | `src/components/layout/sidebar.tsx` | 15 label menu |
| Header | `src/components/layout/header.tsx` | 14 page title, nút Logout |
| Dashboard | `src/app/(dashboard)/dashboard/page.tsx` | ~10 chuỗi |
| Management | `src/components/dashboard/management.tsx` | Component dùng chung |
| Suppliers | `dashboard/suppliers/page.tsx` | CRUD labels |
| Customers | `dashboard/customers/page.tsx` | CRUD labels |
| Units | `dashboard/units/page.tsx` | CRUD labels |
| Product Types | `dashboard/product-types/page.tsx` | CRUD labels |
| Service Types | `dashboard/service-types/page.tsx` | CRUD labels |
| Products | `dashboard/products/page.tsx` | CRUD labels |
| Purchase Orders | `dashboard/purchase-orders/page.tsx` | Form labels |
| Orders (Bán) | `dashboard/orders/page.tsx` | Form labels |
| Service Orders | `dashboard/service-orders/page.tsx` | Form labels |
| Service Lookup | `dashboard/service-voucher-lookup/page.tsx` | Search/filter labels |
| Reports | `dashboard/reports/page.tsx` | Report labels |
| Settings | `dashboard/settings/page.tsx` | Setting labels |
| Staff | `dashboard/staff/page.tsx` | User mgmt labels |
| Profile | `dashboard/profile/page.tsx` | Profile labels |
| Other pages | `categories/`, `services/`, `notifications/`, `gold-prices/` | Misc labels |

---

## 2. Giải Pháp Đề Xuất

### 2.1. Sửa Lỗi Phông Chữ

**Phương án: Dùng `next/font/google` (Khuyến nghị của Next.js)**

- Import font **Inter** (hỗ trợ tốt tiếng Việt, nhiều weight, phổ biến nhất cho web app hiện đại).
- Fallback font **Noto Sans** cho Vietnamese diacritics đầy đủ.
- Dùng `next/font` để self-host, tránh request bên ngoài, tối ưu FOIT/FOUT.

```tsx
// layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});
```

**File cần sửa:**
1. `frontend/src/app/layout.tsx` — import font, gắn CSS variable
2. `frontend/src/app/globals.css` — cập nhật `--font-sans` thành CSS variable từ `next/font`

---

### 2.2. Thêm Chức Năng Đa Ngôn Ngữ VI/EN

**Phương án: Dùng React Context + JSON dictionaries (Nhẹ, không cần thêm library)**

> Lý do chọn: Dự án có quy mô vừa (~20 pages), không cần SSR i18n phức tạp (next-intl/i18next). Context + JSON đủ mạnh, zero-dependency, dễ maintain.

#### 2.2.1. Kiến Trúc i18n

```
frontend/src/
├── i18n/
│   ├── locales/
│   │   ├── vi.json          # Từ điển tiếng Việt
│   │   └── en.json          # Từ điển tiếng Anh
│   ├── i18n-context.tsx     # React Context + Provider
│   └── use-translation.ts   # Hook useTranslation()
```

#### 2.2.2. Cấu Trúc File Từ Điển (JSON)

```json
// vi.json
{
  "common": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "add": "Thêm",
    "search": "Tìm kiếm",
    "loading": "Đang tải...",
    "noData": "Không có dữ liệu",
    "confirm": "Xác nhận",
    "back": "Quay lại",
    "actions": "Thao tác"
  },
  "auth": {
    "title": "Đăng nhập",
    "subtitle": "Nhập thông tin tài khoản để truy cập hệ thống",
    "username": "Tên đăng nhập",
    "usernamePlaceholder": "Nhập tên đăng nhập",
    "password": "Mật khẩu",
    "passwordPlaceholder": "Nhập mật khẩu",
    "loginButton": "Đăng nhập",
    "loggingIn": "Đang đăng nhập...",
    "showPassword": "Hiện mật khẩu",
    "hidePassword": "Ẩn mật khẩu",
    "demoAccounts": "Tài khoản demo",
    "staff": "Nhân viên",
    "systemTitle": "Hệ thống quản lý cửa hàng",
    "systemSubtitle": "Vàng · Bạc · Đá Quý",
    "initLoading": "Đang khởi tạo trang đăng nhập...",
    "errorDefault": "Đã xảy ra lỗi"
  },
  "nav": {
    "dashboard": "Dashboard",
    "suppliers": "Nhà cung cấp",
    "customers": "Khách hàng",
    "units": "Đơn vị tính",
    "productTypes": "Loại sản phẩm",
    "serviceTypes": "Loại dịch vụ",
    "products": "Sản phẩm",
    "purchaseOrders": "Lập phiếu mua",
    "salesOrders": "Lập phiếu bán",
    "serviceOrders": "Lập phiếu dịch vụ",
    "productSearch": "Tra cứu sản phẩm",
    "serviceSearch": "Tra cứu phiếu dịch vụ",
    "accounts": "Quản lý tài khoản",
    "reports": "Báo cáo",
    "settings": "Thay đổi quy định"
  },
  "dashboard": {
    "title": "Tổng quan vận hành",
    "description": "Số liệu nhanh theo thời gian thực từ hệ thống",
    "productCount": "Số sản phẩm",
    "totalStock": "Tổng tồn kho",
    "monthRevenue": "Doanh thu tháng nay",
    "pendingService": "Phiếu dịch vụ chưa hoàn thành",
    "note": "Ghi chú",
    "noteContent": "Dashboard đang lấy doanh thu từ các phiếu bán trong tháng hiện tại và trạng thái phiếu dịch vụ từ backend.",
    "loadingTitle": "Đang tải dữ liệu",
    "loadingDesc": "Hệ thống đang đồng bộ số liệu tổng quan",
    "loadError": "Không tải được dashboard"
  },
  "meta": {
    "title": "Gold Store - Quản lý cửa hàng vàng bạc đá quý",
    "description": "Hệ thống quản lý cửa hàng vàng bạc đá quý - quản lý sản phẩm, đơn hàng, khách hàng và giá vàng."
  }
}
```

```json
// en.json (cùng key, giá trị tiếng Anh)
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "save": "Save",
    "cancel": "Cancel",
    // ...
  },
  "auth": {
    "title": "Login",
    "subtitle": "Enter your credentials to access the system",
    // ...
  }
}
```

#### 2.2.3. React Context & Hook

```tsx
// i18n-context.tsx
"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import vi from "./locales/vi.json";
import en from "./locales/en.json";

type Locale = "vi" | "en";
type Translations = typeof vi;

const dictionaries: Record<Locale, Translations> = { vi, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("locale") as Locale) || "vi";
    }
    return "vi";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key: string): string => {
    const keys = key.split(".");
    let result: unknown = dictionaries[locale];
    for (const k of keys) {
      result = (result as Record<string, unknown>)?.[k];
    }
    return (result as string) ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
```

#### 2.2.4. Language Switcher Component trên Trang Login

Thêm một **dropdown chọn ngôn ngữ** (VI 🇻🇳 / EN 🇬🇧) ở **góc trên bên phải** của trang Login. Khi chuyển ngôn ngữ:
- Toàn bộ text trên login page cập nhật ngay lập tức.
- Lưu lựa chọn vào `localStorage` → giữ nguyên khi reload.
- Sau khi đăng nhập, dashboard và các trang khác cũng dùng ngôn ngữ đã chọn.

```
┌──────────────────────────────────────────────────┐
│                                   [🇻🇳 VI ▾]     │  ← Language Switcher
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │          Gold Store                      │    │
│  │   Hệ thống quản lý cửa hàng             │    │
│  │   Vàng · Bạc · Đá Quý                   │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  Đăng nhập                               │    │
│  │  Nhập thông tin tài khoản...             │    │
│  │                                          │    │
│  │  [Tên đăng nhập]                         │    │
│  │  [Mật khẩu            👁]                │    │
│  │  [     Đăng nhập      ]                  │    │
│  │                                          │    │
│  │  Tài khoản demo                          │    │
│  │  [Admin]  [Nhân viên]                    │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

---

## 3. Kế Hoạch Thực Hiện Chi Tiết

### Phase 1: Sửa Lỗi Phông Chữ (Ước lượng: 15 phút)

| Bước | File | Thay đổi |
|------|------|----------|
| 1.1 | `frontend/src/app/layout.tsx` | Import `Inter` từ `next/font/google` với `subsets: ["latin", "vietnamese"]`, gắn `className` CSS variable vào `<body>` |
| 1.2 | `frontend/src/app/globals.css` | Cập nhật `--font-sans` để dùng CSS variable `var(--font-inter)` thay vì chuỗi font cố định, giữ fallback |

### Phase 2: Xây Dựng Hệ Thống i18n (Ước lượng: 30 phút)

| Bước | File | Thay đổi |
|------|------|----------|
| 2.1 | `[NEW] frontend/src/i18n/locales/vi.json` | Tạo từ điển tiếng Việt đầy đủ tất cả nhóm: common, auth, nav, dashboard, suppliers, customers, units, productTypes, serviceTypes, products, purchaseOrders, salesOrders, serviceOrders, serviceLookup, reports, settings, staff, meta |
| 2.2 | `[NEW] frontend/src/i18n/locales/en.json` | Tạo từ điển tiếng Anh tương ứng |
| 2.3 | `[NEW] frontend/src/i18n/i18n-context.tsx` | React Context Provider + hook `useTranslation()` |
| 2.4 | `frontend/src/app/layout.tsx` | Wrap app trong `<I18nProvider>` |

### Phase 3: Language Switcher + Login Page (Ước lượng: 20 phút)

| Bước | File | Thay đổi |
|------|------|----------|
| 3.1 | `[NEW] frontend/src/components/language-switcher.tsx` | Component chọn ngôn ngữ (dropdown/toggle VI/EN), hiển thị cờ quốc gia |
| 3.2 | `frontend/src/app/(auth)/login/page.tsx` | Thêm `LanguageSwitcher` ở góc phải trên, thay toàn bộ text hardcoded bằng `t("auth.xxx")` |

### Phase 4: Dịch Toàn Bộ Dashboard + Các Trang (Ước lượng: 45 phút)

| Bước | File | Thay đổi |
|------|------|----------|
| 4.1 | `frontend/src/components/layout/sidebar.tsx` | Thay label menu bằng `t("nav.xxx")` |
| 4.2 | `frontend/src/components/layout/header.tsx` | Thay PAGE_TITLES bằng function dùng translation, thay "Logout" bằng `t("common.logout")` |
| 4.3 | `frontend/src/app/(dashboard)/dashboard/page.tsx` | Thay text hardcoded bằng `t("dashboard.xxx")` |
| 4.4 | Các page CRUD | Thay labels cho suppliers, customers, units, product-types, service-types, products (mỗi file có ~10-20 chuỗi) |
| 4.5 | Các page phiếu | Thay labels cho purchase-orders, orders, service-orders |
| 4.6 | Các page tra cứu + báo cáo + settings | Thay labels cho service-voucher-lookup, reports, settings, staff |
| 4.7 | `frontend/src/components/dashboard/management.tsx` | Cập nhật component dùng chung |

### Phase 5: Thêm Language Switcher Vào Header Dashboard (Ước lượng: 10 phút)

| Bước | File | Thay đổi |
|------|------|----------|
| 5.1 | `frontend/src/components/layout/header.tsx` | Thêm `<LanguageSwitcher />` cạnh nút Logout để user chuyển ngôn ngữ bất cứ lúc nào |

---

## 4. Quy Tắc Translation Key

Để đảm bảo nhất quán:

| Namespace | Mô tả | Ví dụ |
|-----------|--------|-------|
| `common` | Từ dùng chung toàn app | `common.save`, `common.delete` |
| `auth` | Chỉ trang đăng nhập | `auth.title`, `auth.username` |
| `nav` | Menu sidebar + header | `nav.suppliers`, `nav.reports` |
| `dashboard` | Trang tổng quan | `dashboard.title`, `dashboard.productCount` |
| `suppliers` | Trang nhà cung cấp | `suppliers.name`, `suppliers.phone` |
| `customers` | Trang khách hàng | `customers.name`, `customers.phone` |
| `products` | Trang sản phẩm | `products.name`, `products.price` |
| `meta` | SEO metadata | `meta.title`, `meta.description` |

---

## 5. Kế Hoạch Xác Minh (Verification)

### 5.1. Kiểm Tra Tự Động

```bash
# Chạy build để đảm bảo không lỗi TypeScript
npm run build:frontend

# Chạy lint
npm run lint:frontend

# Chạy type-check
npm --prefix frontend run type-check
```

### 5.2. Kiểm Tra Trực Quan (Browser)

1. **Mở trang Login** (`http://localhost:3000/login`)
   - Xác nhận font Inter hiển thị đúng (kiểm tra DevTools → Computed → `font-family`).
   - Xác nhận tiếng Việt có dấu hiển thị đẹp, đều, không bị fallback font.
   - Nhấn nút chuyển ngôn ngữ sang **EN** → toàn bộ text trên login page chuyển sang tiếng Anh.
   - Nhấn chuyển lại **VI** → text trở về tiếng Việt.
   - Reload trang → ngôn ngữ đã chọn được giữ nguyên (localStorage).

2. **Đăng nhập và kiểm tra Dashboard**
   - Đăng nhập với tài khoản `admin/admin123`.
   - Kiểm tra sidebar menu, header title, dashboard cards hiển thị đúng ngôn ngữ đã chọn.
   - Chuyển ngôn ngữ trên header → toàn bộ UI cập nhật ngay lập tức.

3. **Kiểm tra các trang khác**
   - Duyệt qua 2-3 trang CRUD (suppliers, products) → xác nhận labels đã được dịch.
   - Duyệt trang Reports, Settings → xác nhận labels đã được dịch.

---

## 6. Rủi Ro & Lưu Ý

| Rủi ro | Giải pháp |
|--------|-----------|
| Metadata SEO (`<title>`, `<meta>`) không đổi theo ngôn ngữ (vì dùng Next.js `export const metadata` tĩnh) | Phase đầu giữ metadata tiếng Việt. Nếu cần dynamic metadata thì chuyển sang `generateMetadata()` ở phase sau |
| Dữ liệu từ backend (tên sản phẩm, tên khách hàng...) vẫn tiếng Việt | Chấp nhận — đây là dữ liệu user input, không cần dịch |
| Một số component shadcn/ui có text mặc định tiếng Anh | Sẽ override thông qua props |

---

## 7. Tóm Tắt Thay Đổi

| Loại | Số file |
|------|---------|
| File mới (`[NEW]`) | 4 files (vi.json, en.json, i18n-context.tsx, language-switcher.tsx) |
| File sửa | ~22 files (layout, login, sidebar, header, dashboard, 15+ pages) |
| Thư viện mới | 0 (không cần cài thêm package) |
| Breaking changes | Không |
