# Kế Hoạch: Inline Quick-Create — Tạo Nhanh Tại Chỗ Trong Phiếu Mua Hàng

> **Ngày tạo:** 2026-05-27 · **Cập nhật:** 2026-05-27 (v2 — theo review)
> **Trạng thái:** Chờ duyệt lần 2
> **Scope:** Frontend-only (Backend API đã đầy đủ, không cần sửa)

---

## 1. Database & Entity Design (Backend)

**Kết luận: KHÔNG cần thay đổi gì.**

Các bảng và API đã đủ:

| Entity | POST API | Request DTO | Required Fields |
|---|---|---|---|
| `LoaiSanPham` | `POST /api/loai-san-pham` | `LoaiSanPhamRequest` | `tenLoaiSanPham`, `tiLeLoiNhuan` |
| `DonViTinh` | `POST /api/don-vi-tinh` | `DonViTinhRequest` | `tenDonViTinh` |
| `SanPham` | `POST /api/san-pham` | `SanPhamRequest` | `tenSanPham`, `maLoaiSanPham`, `maDonViTinh`, `donGiaMua` |

Frontend `backendApi` service (`backend-api.ts`) đã có sẵn `.create()` cho cả 3 module → gọi trực tiếp.

---

## 2. API Design & Transaction Strategy

### Chiến lược: **Gọi API riêng rẽ, map ID vào phiếu mua** ✅

> **Tại sao không gộp vào payload Create Purchase Order?**
> - Backend `PhieuMuaHangRequest` chỉ nhận `maSanPham` (ID). Sửa backend = phá vỡ contract hiện tại.
> - Gộp phức tạp transaction: phải tạo danh mục → rollback nếu phiếu lỗi → logic rối.
> - API riêng rẽ = đơn giản, tái sử dụng, và **các danh mục mới sống độc lập khỏi phiếu**.

### Luồng xử lý (Sequence)

```
User gõ "Vàng 9999" vào Combobox Sản phẩm
        ↓ (không match)
Dropdown hiện: [+ Thêm mới "Vàng 9999"]
        ↓ (user click)
FE gọi POST /api/san-pham { tenSanPham, maLoaiSanPham, maDonViTinh, donGiaMua: 0 }
        ↓ (201 OK → trả về SanPhamResponse với maSanPham)
FE cập nhật products state → Combobox tự động chọn sản phẩm vừa tạo
        ↓ (user tiếp tục nhập số lượng, đơn giá)
User submit → POST /api/phieu-mua-hang (dùng maSanPham vừa có)
```

### Xử lý rác data

- **Không có rác**: Danh mục tạo ra là data hợp lệ (đơn vị tính, loại SP tồn tại độc lập).
- Nếu user tạo danh mục nhưng hủy phiếu → danh mục vẫn hữu ích cho lần sau.
- Nếu cần strict → thêm `isActive: false` khi quick-create, chỉ activate khi phiếu submit thành công. **Khuyến nghị: KHÔNG cần**, vì danh mục là master data.

---

## 3. Frontend Implementation

### 3.1. Nâng cấp Combobox — Thêm prop `onCreateNew`

**File:** `frontend/src/components/ui/combobox.tsx`

Thêm props mới:

```typescript
interface ComboboxProps {
  // ... props hiện tại giữ nguyên
  onCreateNew?: (searchQuery: string) => Promise<ComboboxOption | null>;
  createLabel?: string;       // mặc định: "Thêm mới"
  creating?: boolean;         // hiện loading state khi đang tạo
}
```

**Logic bổ sung trong dropdown:**

```
Điều kiện hiện nút "+ Thêm mới":
  1. onCreateNew được truyền (prop != undefined)
  2. searchQuery.trim() !== ""
  3. Không có option nào match chính xác searchQuery
  4. creating === false

Khi user click "+ Thêm mới":
  1. Gọi onCreateNew(searchQuery)
  2. Nếu trả về ComboboxOption:
     → onValueChange(option.value)
     → setSearchQuery(option.label)
     → setIsOpen(false)
```

**Vị trí render:** Sau danh sách filtered options (hoặc thay thế "Không tìm thấy kết quả").

```tsx
{/* Trong dropdown, sau filteredOptions.map() */}
{onCreateNew && searchQuery.trim() && !exactMatch && (
  <div
    onMouseDown={async (e) => {
      e.preventDefault();
      const result = await onCreateNew(searchQuery.trim());
      if (result) {
        onValueChange(result.value);
        setSearchQuery(result.label);
        setIsOpen(false);
      }
    }}
    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
               text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30
               border-t border-border/60 font-medium"
  >
    <Plus className="h-4 w-4" />
    {createLabel ?? "Thêm mới"} "{searchQuery.trim()}"
  </div>
)}
```

### 3.2. Tích hợp vào PurchaseOrdersPage — Chiến lược 2 tầng

**File:** `frontend/src/app/(dashboard)/dashboard/purchase-orders/page.tsx`

> ⚠️ **Nguyên tắc nghiệp vụ:** Trong ngành vàng bạc đá quý, **Giá cả + Tồn kho + Tỷ lệ lợi nhuận** phụ thuộc trực tiếp vào Loại SP và Đơn vị tính. Tuyệt đối KHÔNG dùng giá trị mặc định khi tạo sản phẩm.

#### Tầng 1: Inline 1-hit — Đơn vị tính & Loại sản phẩm

Chỉ cần 1 trường tên → tạo ngay trong Combobox, không cần Dialog.

**A. Combobox Đơn vị tính:**

```tsx
<Combobox
  value={item.maDonViTinh}
  onValueChange={(v) => updateItem(index, { maDonViTinh: v })}
  options={unitOptions}
  onCreateNew={async (name) => {
    const created = await backendApi.units.create({ tenDonViTinh: name });
    setUnits(prev => [...prev, created]);
    return { value: created.maDonViTinh, label: created.tenDonViTinh };
  }}
/>
```

**B. Combobox Loại sản phẩm** (trong Dialog tạo SP, xem tầng 2):

```tsx
<Combobox
  value={newProduct.maLoaiSanPham}
  onValueChange={(v) => setNewProduct(prev => ({ ...prev, maLoaiSanPham: v }))}
  options={productTypeOptions}
  onCreateNew={async (name) => {
    const created = await backendApi.productTypes.create({
      tenLoaiSanPham: name,
      tiLeLoiNhuan: 0.05, // mặc định 5%, user chỉnh sau
    });
    setProductTypes(prev => [...prev, created]);
    return { value: created.maLoaiSanPham, label: created.tenLoaiSanPham };
  }}
/>
```

---

#### Tầng 2: Dialog — Sản phẩm (bắt buộc chọn Loại SP + Đơn vị)

Khi user bấm `+ Thêm mới "Vàng SJC Test"` trên Combobox Sản phẩm → **mở Dialog** thay vì tạo ngay.

**Component mới:** `QuickCreateProductDialog`

```tsx
// Luồng:
// 1. User gõ tên SP mới → click "+ Thêm mới"
// 2. onCreateNew KHÔNG gọi API, mà mở Dialog
// 3. Dialog pre-fill tên SP, bắt buộc chọn Loại SP + Đơn vị
// 4. User bấm Lưu → gọi API → đóng Dialog → auto-fill vào row

interface QuickCreateProductDialogProps {
  open: boolean;
  defaultName: string;
  productTypes: ProductTypeResponse[];
  units: UnitResponse[];
  onCreated: (product: ProductResponse) => void;
  onClose: () => void;
  // Truyền thêm để Loại SP + Đơn vị cũng quick-create được
  onProductTypeCreated: (pt: ProductTypeResponse) => void;
  onUnitCreated: (u: UnitResponse) => void;
}
```

**Layout Dialog:**

```
┌───────────────────────────────────────────┐
│  ✨ Tạo nhanh sản phẩm                   │
│                                           │
│  Tên sản phẩm                             │
│  ┌─────────────────────────────────────┐  │
│  │ Vàng SJC Test (pre-filled)          │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Loại sản phẩm *              (required)  │
│  ┌──────────────────────────────── ▾──┐   │
│  │ Chọn loại SP... (có Quick-Create) │   │
│  └────────────────────────────────────┘   │
│                                           │
│  Đơn vị tính *                (required)  │
│  ┌──────────────────────────────── ▾──┐   │
│  │ Chọn đơn vị... (có Quick-Create)  │   │
│  └────────────────────────────────────┘   │
│                                           │
│  Đơn giá mua (₫)             (optional)   │
│  ┌─────────────────────────────────────┐  │
│  │ 0                                   │  │
│  └─────────────────────────────────────┘  │
│                                           │
│           [Hủy]    [💾 Lưu sản phẩm]     │
└───────────────────────────────────────────┘
```

**Tích hợp vào Combobox Sản phẩm (purchase-orders/page.tsx):**

```tsx
// State cho Dialog
const [quickCreateOpen, setQuickCreateOpen] = useState(false);
const [quickCreateName, setQuickCreateName] = useState("");
const [quickCreateTargetIndex, setQuickCreateTargetIndex] = useState(-1);

// Combobox Sản phẩm
<Combobox
  value={item.maSanPham || ""}
  onValueChange={(value) => onProductChange(index, value)}
  options={productOptions}
  onCreateNew={async (name) => {
    // KHÔNG gọi API ở đây — mở Dialog
    setQuickCreateName(name);
    setQuickCreateTargetIndex(index);
    setQuickCreateOpen(true);
    return null; // Combobox không chọn gì, chờ Dialog xử lý
  }}
/>

// Dialog (render 1 lần ở cuối page)
<QuickCreateProductDialog
  open={quickCreateOpen}
  defaultName={quickCreateName}
  productTypes={productTypes}
  units={units}
  onCreated={(product) => {
    setProducts(prev => [...prev, product]);
    onProductChange(quickCreateTargetIndex, product.maSanPham);
    setQuickCreateOpen(false);
  }}
  onClose={() => setQuickCreateOpen(false)}
  onProductTypeCreated={(pt) => setProductTypes(prev => [...prev, pt])}
  onUnitCreated={(u) => setUnits(prev => [...prev, u])}
/>
```

### 3.3. State Management — Đồng bộ tức thì

**Không cần Zustand hay React Query thêm.** Cách hiện tại đã đủ:

```
products, units, suppliers = useState<T[]>([])
                                   ↓
Khi quick-create thành công:
  setProducts(prev => [...prev, newProduct])
                                   ↓
Combobox.options re-render → item mới xuất hiện ngay
```

**Đồng bộ cross-page:** Các trang khác (Phiếu Bán, Tra cứu) gọi `loadData()` khi mount → tự động fetch data mới nhất từ API. **Không cần invalidation mechanism.**

---

## 4. Step-by-step Action Plan

### Phase 1: Nâng cấp Combobox (Core)

| Step | File | Thay đổi | Effort |
|------|------|----------|--------|
| 1.1 | `combobox.tsx` | Thêm props `onCreateNew`, `createLabel`, `creating` vào `ComboboxProps` | 5 min |
| 1.2 | `combobox.tsx` | Thêm `exactMatch` check vào `useMemo` | 3 min |
| 1.3 | `combobox.tsx` | Render nút `+ Thêm mới "..."` cuối dropdown | 10 min |
| 1.4 | `combobox.tsx` | Handle Enter key → nếu `highlightedIndex` ở nút Create → gọi `onCreateNew` | 5 min |
| 1.5 | `combobox.tsx` | Loading state: disable nút khi `creating === true` | 3 min |

### Phase 2: QuickCreateProductDialog + Tích hợp Purchase Orders

| Step | File | Thay đổi | Effort |
|------|------|----------|--------|
| 2.1 | `purchase-orders/page.tsx` | Thêm state `productTypes` + fetch `backendApi.productTypes.list()` trong `loadData` | 5 min |
| 2.2 | **[NEW]** `components/dashboard/quick-create-product-dialog.tsx` | Dialog: tên SP (pre-fill), Combobox Loại SP (có quick-create), Combobox Đơn vị (có quick-create), Input đơn giá mua, nút Lưu/Hủy | **20 min** |
| 2.3 | `purchase-orders/page.tsx` | Thêm `onCreateNew` cho Combobox Sản phẩm → mở Dialog (không gọi API trực tiếp) | 10 min |
| 2.4 | `purchase-orders/page.tsx` | Thêm `onCreateNew` cho cột Đơn vị tính (inline 1-hit, chuyển từ text → Combobox) | 10 min |
| 2.5 | `purchase-orders/page.tsx` | Toast success khi tạo nhanh thành công | 3 min |

### Phase 3: Polish & Edge Cases

| Step | Nội dung | Effort |
|------|----------|--------|
| 3.1 | i18n: Thêm translation keys cho Quick-Create labels | 5 min |
| 3.2 | Error handling: nếu API create lỗi (trùng tên,...) → hiện toast error, không chọn | 5 min |
| 3.3 | Loading spinner trên nút "+ Thêm mới" khi đang gọi API | 3 min |
| 3.4 | Keyboard: ArrowDown/Up tính thêm nút Create, Enter trên nút Create = trigger | 5 min |

**Tổng effort ước lượng:** ~90 phút

---

## 5. Files Tổng Kết

| Loại | File | Nội dung |
|------|------|----------|
| **MODIFY** | `frontend/src/components/ui/combobox.tsx` | Thêm `onCreateNew` prop + render logic |
| **[NEW]** | `frontend/src/components/dashboard/quick-create-product-dialog.tsx` | Dialog tạo nhanh SP: tên, loại SP, đơn vị, đơn giá mua |
| **MODIFY** | `frontend/src/app/(dashboard)/dashboard/purchase-orders/page.tsx` | Tích hợp Dialog + inline quick-create cho Đơn vị |
| **MODIFY** | `frontend/src/i18n/locales/vi.json` | Thêm keys: `common.createNew`, `quickCreate.*` |
| **MODIFY** | `frontend/src/i18n/locales/en.json` | Tương ứng EN |

**Backend: 0 file cần sửa.**

---

## 6. Verification Plan

### Kiểm tra trực quan (Browser — Manual)

1. **Mở** `http://localhost:3000/dashboard/purchase-orders`
2. **Test Quick-Create Sản phẩm:**
   - Click Combobox "Sản phẩm" → gõ tên chưa tồn tại (ví dụ: "Vàng SJC Test")
   - Xác nhận dropdown hiện `+ Thêm mới "Vàng SJC Test"`
   - Click nút → đợi loading → Combobox tự chọn sản phẩm mới
   - Kiểm tra đơn vị tính + loại SP auto-fill
3. **Test Quick-Create Đơn vị tính (nếu có):**
   - Tương tự bước 2, gõ đơn vị mới
4. **Test đồng bộ cross-page:**
   - Mở tab "Phiếu Bán Hàng" → xác nhận sản phẩm vừa tạo xuất hiện trong dropdown
5. **Test edge cases:**
   - Gõ tên đã tồn tại → KHÔNG hiện nút "Thêm mới"
   - Quick-create rồi xóa text → dropdown quay lại danh sách đầy đủ
   - API lỗi (ví dụ: trùng tên) → toast error, không crash
6. **Test submit phiếu mua:** Tạo nhanh SP → điền đầy đủ → submit → phiếu tạo thành công

### Kiểm tra build

```bash
cd frontend && npm run build
```

Đảm bảo TypeScript không lỗi sau khi thêm props mới vào Combobox.
