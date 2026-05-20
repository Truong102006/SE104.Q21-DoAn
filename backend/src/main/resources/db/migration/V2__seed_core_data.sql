-- Seed core data for authentication and main business flows
-- This migration is idempotent and safe to run multiple times.

-- 1) User groups
INSERT INTO nhom_nguoi_dung (ma_nhom, ten_nhom)
VALUES
    ('ADMIN', 'Quan tri vien'),
    ('STAFF', 'Nhan vien')
ON CONFLICT (ma_nhom) DO UPDATE
SET ten_nhom = EXCLUDED.ten_nhom;

-- 2) Users (BCrypt hash)
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ma_nhom)
VALUES
    ('admin', '$2a$10$9vftsLvBR.sUyUfM6CRIB.QIey2g.3WKUC5o.OuMwYqjdzF0MIOwC', 'ADMIN'),
    ('staff', '$2a$10$N3an6dKwTQfWu14suAj6A.6eulV6FCqT6nfNFS8tozD2MB6veCpDW', 'STAFF')
ON CONFLICT (ten_dang_nhap) DO UPDATE
SET mat_khau = EXCLUDED.mat_khau,
    ma_nhom = EXCLUDED.ma_nhom;

-- 3) Units
INSERT INTO don_vi_tinh (ma_don_vi_tinh, ten_don_vi_tinh, loai_don_vi, he_so_quy_doi, ghi_chu)
VALUES
    ('GRAM', 'gram', 'Khoi luong', 1, 'Don vi co so'),
    ('CHI', 'chi', 'Khoi luong', 3.75, '1 chi = 3.75 gram'),
    ('LUONG', 'luong', 'Khoi luong', 37.5, '1 luong = 37.5 gram')
ON CONFLICT (ma_don_vi_tinh) DO UPDATE
SET ten_don_vi_tinh = EXCLUDED.ten_don_vi_tinh,
    loai_don_vi = EXCLUDED.loai_don_vi,
    he_so_quy_doi = EXCLUDED.he_so_quy_doi,
    ghi_chu = EXCLUDED.ghi_chu;

-- 4) Product types
INSERT INTO loai_san_pham (ma_loai_san_pham, ten_loai_san_pham, ti_le_loi_nhuan)
VALUES
    ('LSP_24K', 'Vang 24K', 2),
    ('LSP_18K', 'Vang 18K', 5),
    ('LSP_DQ', 'Da quy', 10)
ON CONFLICT (ma_loai_san_pham) DO UPDATE
SET ten_loai_san_pham = EXCLUDED.ten_loai_san_pham,
    ti_le_loi_nhuan = EXCLUDED.ti_le_loi_nhuan;

-- 5) Service types
INSERT INTO loai_dich_vu (ma_loai_dich_vu, ten_loai_dich_vu, don_gia_dich_vu)
VALUES
    ('CAN_THU', 'Can thu vang', 50000),
    ('GIA_CONG', 'Gia cong nu trang', 200000)
ON CONFLICT (ma_loai_dich_vu) DO UPDATE
SET ten_loai_dich_vu = EXCLUDED.ten_loai_dich_vu,
    don_gia_dich_vu = EXCLUDED.don_gia_dich_vu;

-- 6) Parameter
INSERT INTO tham_so (ma_tham_so, ten_tham_so, gia_tri)
VALUES
    ('TS_PREPAY_RATE', 'SERVICE_PREPAYMENT_RATE', 50)
ON CONFLICT (ma_tham_so) DO UPDATE
SET ten_tham_so = EXCLUDED.ten_tham_so,
    gia_tri = EXCLUDED.gia_tri;

-- 7) Sample suppliers
INSERT INTO nha_cung_cap (ma_nha_cung_cap, ten_nha_cung_cap, so_dien_thoai, dia_chi, ghi_chu)
SELECT 'NCC001', 'Cong ty vang bac A', '0901111222', 'Quan 1, TP HCM', 'Nha cung cap mau'
WHERE NOT EXISTS (
    SELECT 1 FROM nha_cung_cap WHERE ma_nha_cung_cap = 'NCC001' OR so_dien_thoai = '0901111222'
);

INSERT INTO nha_cung_cap (ma_nha_cung_cap, ten_nha_cung_cap, so_dien_thoai, dia_chi, ghi_chu)
SELECT 'NCC002', 'Cong ty da quy B', '0901111333', 'Ha Noi', 'Nha cung cap mau'
WHERE NOT EXISTS (
    SELECT 1 FROM nha_cung_cap WHERE ma_nha_cung_cap = 'NCC002' OR so_dien_thoai = '0901111333'
);

-- 8) Sample customers
INSERT INTO khach_hang (ma_khach_hang, ten_khach_hang, so_dien_thoai_khach_hang, dia_chi_khach_hang, ghi_chu)
SELECT 'KH001', 'Nguyen Van A', '0902222333', 'Thu Duc, TP HCM', 'Khach hang mau'
WHERE NOT EXISTS (
    SELECT 1 FROM khach_hang WHERE ma_khach_hang = 'KH001' OR so_dien_thoai_khach_hang = '0902222333'
);

INSERT INTO khach_hang (ma_khach_hang, ten_khach_hang, so_dien_thoai_khach_hang, dia_chi_khach_hang, ghi_chu)
SELECT 'KH002', 'Tran Thi B', '0902222444', 'Bien Hoa', 'Khach hang mau'
WHERE NOT EXISTS (
    SELECT 1 FROM khach_hang WHERE ma_khach_hang = 'KH002' OR so_dien_thoai_khach_hang = '0902222444'
);

-- 9) Sample products
INSERT INTO san_pham (ma_san_pham, ten_san_pham, ma_loai_san_pham, ma_don_vi_tinh, don_gia_mua, don_gia_ban, ton_kho)
VALUES
    ('SP001', 'Nhan vang 24K', 'LSP_24K', 'CHI', 1000000, 1020000, 0),
    ('SP002', 'Day chuyen vang 18K', 'LSP_18K', 'CHI', 2000000, 2100000, 0),
    ('SP003', 'Nhan da quy', 'LSP_DQ', 'GRAM', 1500000, 1650000, 0)
ON CONFLICT (ma_san_pham) DO UPDATE
SET ten_san_pham = EXCLUDED.ten_san_pham,
    ma_loai_san_pham = EXCLUDED.ma_loai_san_pham,
    ma_don_vi_tinh = EXCLUDED.ma_don_vi_tinh,
    don_gia_mua = EXCLUDED.don_gia_mua,
    don_gia_ban = EXCLUDED.don_gia_ban;
