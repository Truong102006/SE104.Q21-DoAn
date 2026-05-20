## 0. Cập Nhật 2026-05-20 (Module Sản Phẩm BM8 + QĐ6 + QĐ8)

- Đã implement module quản lý sản phẩm theo BM8 với route mới:
  - `GET /api/products` hỗ trợ `keyword`, `productTypeId`, `page`, `size`
  - `GET /api/products/{id}`
  - `POST /api/products`
  - `PUT /api/products/{id}`
  - `DELETE /api/products/{id}`
  - `GET /api/products/search?keyword=...`
  - Vẫn giữ tương thích route legacy `/api/v1/san-pham`.
- Đã bổ sung rule nghiệp vụ:
  - QĐ6: tự động tính `donGiaBan = donGiaMua + donGiaMua * tiLeLoiNhuan / 100` (BigDecimal, làm tròn 2 chữ số thập phân).
  - QĐ8: tìm kiếm tương đối theo mã/tên/loại sản phẩm.
  - `tonKho` mặc định `0` khi tạo và không cho chỉnh trực tiếp (chỉ cập nhật qua phiếu mua/bán).
  - Chặn xóa sản phẩm nếu đã phát sinh `ct_phieu_mua`, `ct_phieu_ban`, `ct_bao_cao_ton_kho`, `ct_bao_cao_doanh_thu_sp`.
  - Thêm rule đơn vị tính phù hợp trong cùng loại sản phẩm (dựa trên `loaiDonVi` của đơn vị tính đã tồn tại trong loại).
- Đã bổ sung tính nhất quán giá bán khi thay đổi tỷ lệ lợi nhuận loại sản phẩm:
  - Khi update `LoaiSanPham.tiLeLoiNhuan`, backend tự động cập nhật lại `donGiaBan` cho tất cả sản phẩm thuộc loại đó.
- Đã cập nhật response sản phẩm sang DTO nghiệp vụ:
  - Trả về `loaiSanPham`, `donViTinh` (object thông tin) cùng các trường giá/tồn kho.
- Đã bổ sung test cho công thức tính giá:
  - `SanPhamServiceImplTest` (create/update tính `donGiaBan` đúng công thức).
  - `LoaiSanPhamServiceImplTest` (đổi tỷ lệ lợi nhuận cập nhật lại giá bán sản phẩm).
- Kết quả xác minh:
  - `cd backend && ./mvnw test` => `BUILD SUCCESS` (9 tests pass).

### Danh sách file đã cập nhật (2026-05-20)

- `backend/src/main/java/com/se104/goldstore/common/ApiPaths.java`
- `backend/src/main/java/com/se104/goldstore/common/PricingUtils.java` (mới)
- `backend/src/main/java/com/se104/goldstore/controller/SanPhamController.java`
- `backend/src/main/java/com/se104/goldstore/dto/request/SanPhamRequest.java`
- `backend/src/main/java/com/se104/goldstore/dto/response/SanPhamResponse.java`
- `backend/src/main/java/com/se104/goldstore/repository/SanPhamRepository.java`
- `backend/src/main/java/com/se104/goldstore/repository/ChiTietPhieuMuaRepository.java`
- `backend/src/main/java/com/se104/goldstore/repository/ChiTietPhieuBanRepository.java`
- `backend/src/main/java/com/se104/goldstore/repository/ChiTietBaoCaoTonKhoRepository.java`
- `backend/src/main/java/com/se104/goldstore/repository/ChiTietBaoCaoDoanhThuSanPhamRepository.java`
- `backend/src/main/java/com/se104/goldstore/service/SanPhamService.java`
- `backend/src/main/java/com/se104/goldstore/service/impl/SanPhamServiceImpl.java`
- `backend/src/main/java/com/se104/goldstore/service/impl/LoaiSanPhamServiceImpl.java`
- `backend/src/test/java/com/se104/goldstore/unit/service/SanPhamServiceImplTest.java` (mới)
- `backend/src/test/java/com/se104/goldstore/unit/service/LoaiSanPhamServiceImplTest.java` (mới)
- `progress.md`

## 0. Cập Nhật 2026-05-19 (Catalog BM1-BM4 + QĐ1-QĐ4-QĐ13)

- Đã hoàn thiện 5 module danh mục với route song song:
  - Legacy: `/api/v1/nha-cung-cap`, `/api/v1/khach-hang`, `/api/v1/don-vi-tinh`, `/api/v1/loai-dich-vu`, `/api/v1/loai-san-pham`
  - New theo BM: `/api/suppliers`, `/api/customers`, `/api/units`, `/api/service-types`, `/api/product-types`
- Đã cập nhật rule nghiệp vụ:
  - QĐ1 (Nhà cung cấp): tên không trùng, số điện thoại 10 chữ số, không trùng SDT.
  - QĐ2 (Khách hàng): chặn trùng cặp tên + SDT, chặn trùng SDT theo schema.
  - QĐ3 (Đơn vị tính): tên không trùng, hệ số quy đổi >= 0 (Hibernate Validator), chặn xóa khi đã được sử dụng.
  - QĐ4 (Loại dịch vụ): tên không trùng, đơn giá >= 0, chặn xóa khi đã phát sinh phiếu dịch vụ.
  - QĐ13 (Loại sản phẩm): tỷ lệ lợi nhuận >= 0, chặn xóa khi đã có sản phẩm thuộc loại.
- Đã bổ sung phân quyền delete chặt hơn:
  - `DELETE` 5 module danh mục yêu cầu `ADMIN` (method-level security).
  - `STAFF` và `ADMIN` vẫn được xem/thêm/sửa theo `SecurityConfig`.
- Đã bổ sung test unit cho rule trùng tên/trùng SDT:
  - `KhachHangServiceImplTest` (2 test)
  - `NhaCungCapServiceImplTest` (2 test)
- Kết quả xác minh:
  - `cd backend && ./mvnw test` => `BUILD SUCCESS` (6 tests pass).

### Danh sách file đã cập nhật (2026-05-19 - Catalog BM1-BM4 + QĐ1-QĐ4-QĐ13)

- `backend/src/main/java/com/se104/goldstore/common/ApiPaths.java` `(+6 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/DonViTinhController.java` `(+3 -1)`
- `backend/src/main/java/com/se104/goldstore/controller/KhachHangController.java` `(+3 -1)`
- `backend/src/main/java/com/se104/goldstore/controller/LoaiDichVuController.java` `(+3 -1)`
- `backend/src/main/java/com/se104/goldstore/controller/LoaiSanPhamController.java` `(+3 -1)`
- `backend/src/main/java/com/se104/goldstore/controller/NhaCungCapController.java` `(+3 -1)`
- `backend/src/main/java/com/se104/goldstore/dto/request/KhachHangRequest.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/NhaCungCapRequest.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/ChiTietPhieuDichVuRepository.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/ChiTietPhieuMuaRepository.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/KhachHangRepository.java` `(+10 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/NhaCungCapRepository.java` `(+4 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhieuBanHangRepository.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhieuDichVuRepository.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhieuMuaHangRepository.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/security/SecurityConfig.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/DonViTinhServiceImpl.java` `(+26 -6)`
- `backend/src/main/java/com/se104/goldstore/service/impl/KhachHangServiceImpl.java` `(+51 -14)`
- `backend/src/main/java/com/se104/goldstore/service/impl/LoaiDichVuServiceImpl.java` `(+10 -1)`
- `backend/src/main/java/com/se104/goldstore/service/impl/LoaiSanPhamServiceImpl.java` `(+10 -1)`
- `backend/src/main/java/com/se104/goldstore/service/impl/NhaCungCapServiceImpl.java` `(+31 -9)`
- `backend/src/test/java/com/se104/goldstore/unit/service/KhachHangServiceImplTest.java` `(+60 -0)`
- `backend/src/test/java/com/se104/goldstore/unit/service/NhaCungCapServiceImplTest.java` `(+54 -0)`
- `progress.md` `(+22 -1)`

## 0. Cập Nhật 2026-05-19 (Auth + RBAC)

- Backend đã implement Spring Security + JWT stateless:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Đã thêm JWT filter + auth entrypoint/denied handler + `SecurityConfig` phân quyền theo nhóm:
  - `ADMIN` only cho nhóm endpoint quản trị và báo cáo.
  - `ADMIN/STAFF` cho nhóm endpoint nghiệp vụ.
- Tài khoản đang dùng bảng `nguoi_dung`:
  - `ten_dang_nhap = username`
  - `ma_nhom = group code`
  - `mat_khau` được hash BCrypt
- Đã bổ sung seed account (có thể override bằng env):
  - `admin/admin123`
  - `staff/staff123`
  - Có migration plaintext password sang BCrypt nếu gặp dữ liệu cũ.
- Đã bổ sung test endpoint auth:
  - File test: `backend/src/test/java/com/se104/goldstore/unit/controller/AuthControllerTest.java`
  - Đã verify login và me pass.
- Frontend đã bỏ mock auth, đã gọi API thật:
  - Login gọi `/api/auth/login`
  - Dashboard gọi `/api/auth/me` với header `Authorization: Bearer <token>`
  - Logout gọi `/api/auth/logout` với Bearer token
  - Menu role đã cập nhật theo context `ADMIN/STAFF` từ backend.
- Kết quả verify:
  - `cd backend && ./mvnw test` => `BUILD SUCCESS` (2 tests pass)
  - `cd frontend && npm run type-check` => `SUCCESS`

### Danh sách file đã cập nhật (2026-05-19 - Auth + RBAC)

- `backend/src/main/java/com/se104/goldstore/controller/AuthController.java` `(+46 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/AuthLoginRequest.java` `(+28 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/AuthLoginResponse.java` `(+62 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/AuthMeResponse.java` `(+44 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhanQuyenRepository.java` `(+2 -0)`
- `backend/src/main/java/com/se104/goldstore/security/AuthSeedDataInitializer.java` `(+106 -0)`
- `backend/src/main/java/com/se104/goldstore/security/AuthUserDetailsService.java` `(+81 -0)`
- `backend/src/main/java/com/se104/goldstore/security/AuthUserPrincipal.java` `(+79 -0)`
- `backend/src/main/java/com/se104/goldstore/security/JwtAuthenticationFilter.java` `(+71 -0)`
- `backend/src/main/java/com/se104/goldstore/security/JwtService.java` `(+76 -0)`
- `backend/src/main/java/com/se104/goldstore/security/RestAccessDeniedHandler.java` `(+38 -0)`
- `backend/src/main/java/com/se104/goldstore/security/RestAuthenticationEntryPoint.java` `(+38 -0)`
- `backend/src/main/java/com/se104/goldstore/security/SecurityConfig.java` `(+97 -2)`
- `backend/src/main/java/com/se104/goldstore/service/AuthService.java` `(+14 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/AuthServiceImpl.java` `(+98 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/NguoiDungServiceImpl.java` `(+8 -4)`
- `backend/src/main/resources/application.yml` `(+7 -0)`
- `backend/src/test/java/com/se104/goldstore/unit/controller/AuthControllerTest.java` `(+86 -0)`
- `frontend/src/app/(auth)/login/page.tsx` `(+2 -2)`
- `frontend/src/app/(dashboard)/layout.tsx` `(+26 -1)`
- `frontend/src/components/layout/header.tsx` `(+14 -7)`
- `frontend/src/components/layout/sidebar.tsx` `(+3 -3)`
- `frontend/src/services/auth-service.ts` `(+96 -0)`
- `frontend/src/types/index.ts` `(+3 -0)`
- `progress.md` `(+29 -0)`

### Danh sách file đã cập nhật

- Đã bổ sung truy vết và liệt kê file cho các mốc `2026-05-19` và `2026-05-15`.
- Từ nay, mỗi update mới sẽ kèm danh sách file đã chỉnh theo format `(+/-)` để dễ review.
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

### Danh sách file đã cập nhật (2026-05-15 - Scaffold nền tảng backend)

- `backend/src/main/java/com/se104/goldstore/common/ApiPaths.java` `(+11 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/BaoCaoDoanhThuDichVuController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/BaoCaoDoanhThuSanPhamController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/BaoCaoTonKhoController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/ChucNangController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/NguoiDungController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/NhomNguoiDungController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/PhanQuyenController.java` `(+58 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/PhieuBanHangController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/PhieuDichVuController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/PhieuMuaHangController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/controller/ThamSoController.java` `(+61 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/BaoCaoDoanhThuDichVuRequest.java` `(+52 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/BaoCaoDoanhThuSanPhamRequest.java` `(+52 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/BaoCaoTonKhoRequest.java` `(+38 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/ChucNangRequest.java` `(+37 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/NguoiDungRequest.java` `(+37 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/NhomNguoiDungRequest.java` `(+27 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/PhanQuyenRequest.java` `(+28 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/PhieuBanHangRequest.java` `(+54 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/PhieuDichVuRequest.java` `(+89 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/PhieuMuaHangRequest.java` `(+54 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/request/ThamSoRequest.java` `(+38 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/BaoCaoDoanhThuDichVuResponse.java` `(+43 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/BaoCaoDoanhThuSanPhamResponse.java` `(+43 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/BaoCaoTonKhoResponse.java` `(+32 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/ChucNangResponse.java` `(+32 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/NguoiDungResponse.java` `(+23 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/NhomNguoiDungResponse.java` `(+23 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/PhanQuyenResponse.java` `(+23 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/PhieuBanHangResponse.java` `(+44 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/PhieuDichVuResponse.java` `(+71 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/PhieuMuaHangResponse.java` `(+44 -0)`
- `backend/src/main/java/com/se104/goldstore/dto/response/ThamSoResponse.java` `(+34 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/BaoCaoDoanhThuDichVuRepository.java` `(+10 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/BaoCaoDoanhThuSanPhamRepository.java` `(+10 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/BaoCaoTonKhoRepository.java` `(+10 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/ChucNangRepository.java` `(+10 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/NguoiDungRepository.java` `(+3 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/NhomNguoiDungRepository.java` `(+10 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhanQuyenRepository.java` `(+5 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhieuBanHangRepository.java` `(+6 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhieuDichVuRepository.java` `(+6 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/PhieuMuaHangRepository.java` `(+6 -0)`
- `backend/src/main/java/com/se104/goldstore/repository/ThamSoRepository.java` `(+10 -0)`
- `backend/src/main/java/com/se104/goldstore/service/BaoCaoDoanhThuDichVuService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/BaoCaoDoanhThuSanPhamService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/BaoCaoTonKhoService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/ChucNangService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/NguoiDungService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/NhomNguoiDungService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/PhanQuyenService.java` `(+16 -0)`
- `backend/src/main/java/com/se104/goldstore/service/PhieuBanHangService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/PhieuDichVuService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/PhieuMuaHangService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/ThamSoService.java` `(+18 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/BaoCaoDoanhThuDichVuServiceImpl.java` `(+124 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/BaoCaoDoanhThuSanPhamServiceImpl.java` `(+124 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/BaoCaoTonKhoServiceImpl.java` `(+121 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/ChucNangServiceImpl.java` `(+119 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/NguoiDungServiceImpl.java` `(+116 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/NhomNguoiDungServiceImpl.java` `(+109 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/PhanQuyenServiceImpl.java` `(+102 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/PhieuBanHangServiceImpl.java` `(+123 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/PhieuDichVuServiceImpl.java` `(+132 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/PhieuMuaHangServiceImpl.java` `(+123 -0)`
- `backend/src/main/java/com/se104/goldstore/service/impl/ThamSoServiceImpl.java` `(+112 -0)`
- `progress.md` `(+17 -0)`

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






