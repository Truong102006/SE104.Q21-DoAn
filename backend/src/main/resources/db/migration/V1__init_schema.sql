CREATE TABLE nha_cung_cap (
    ma_nha_cung_cap VARCHAR(20) PRIMARY KEY,
    ten_nha_cung_cap VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(10) NOT NULL UNIQUE,
    dia_chi VARCHAR(255),
    ghi_chu TEXT
);

CREATE TABLE khach_hang (
    ma_khach_hang VARCHAR(20) PRIMARY KEY,
    ten_khach_hang VARCHAR(255) NOT NULL,
    so_dien_thoai_khach_hang VARCHAR(10) NOT NULL UNIQUE,
    dia_chi_khach_hang VARCHAR(255),
    ghi_chu TEXT
);

CREATE TABLE don_vi_tinh (
    ma_don_vi_tinh VARCHAR(20) PRIMARY KEY,
    ten_don_vi_tinh VARCHAR(50) NOT NULL UNIQUE,
    loai_don_vi VARCHAR(50),
    he_so_quy_doi NUMERIC,
    ghi_chu TEXT
);

CREATE TABLE loai_dich_vu (
    ma_loai_dich_vu VARCHAR(20) PRIMARY KEY,
    ten_loai_dich_vu VARCHAR(255) NOT NULL UNIQUE,
    don_gia_dich_vu NUMERIC(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT ck_loai_dich_vu_don_gia_non_negative CHECK (don_gia_dich_vu >= 0)
);

CREATE TABLE loai_san_pham (
    ma_loai_san_pham VARCHAR(20) PRIMARY KEY,
    ten_loai_san_pham VARCHAR(255) NOT NULL UNIQUE,
    ti_le_loi_nhuan NUMERIC(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT ck_loai_san_pham_ti_le_loi_nhuan_non_negative CHECK (ti_le_loi_nhuan >= 0)
);

CREATE TABLE san_pham (
    ma_san_pham VARCHAR(20) PRIMARY KEY,
    ten_san_pham VARCHAR(255) NOT NULL,
    ma_loai_san_pham VARCHAR(20) NOT NULL,
    ma_don_vi_tinh VARCHAR(20) NOT NULL,
    don_gia_mua NUMERIC(18,2) NOT NULL DEFAULT 0,
    don_gia_ban NUMERIC(18,2) NOT NULL DEFAULT 0,
    ton_kho INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_san_pham_loai_san_pham FOREIGN KEY (ma_loai_san_pham) REFERENCES loai_san_pham(ma_loai_san_pham),
    CONSTRAINT fk_san_pham_don_vi_tinh FOREIGN KEY (ma_don_vi_tinh) REFERENCES don_vi_tinh(ma_don_vi_tinh),
    CONSTRAINT ck_san_pham_don_gia_mua_non_negative CHECK (don_gia_mua >= 0),
    CONSTRAINT ck_san_pham_don_gia_ban_non_negative CHECK (don_gia_ban >= 0),
    CONSTRAINT ck_san_pham_ton_kho_non_negative CHECK (ton_kho >= 0)
);

CREATE TABLE phieu_mua_hang (
    so_phieu_mua VARCHAR(20) PRIMARY KEY,
    ngay_lap_phieu_mua DATE NOT NULL,
    ma_nha_cung_cap VARCHAR(20) NOT NULL,
    tong_tien NUMERIC(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_phieu_mua_hang_nha_cung_cap FOREIGN KEY (ma_nha_cung_cap) REFERENCES nha_cung_cap(ma_nha_cung_cap),
    CONSTRAINT ck_phieu_mua_hang_tong_tien_non_negative CHECK (tong_tien >= 0)
);

CREATE TABLE ct_phieu_mua (
    so_phieu_mua VARCHAR(20) NOT NULL,
    ma_san_pham VARCHAR(20) NOT NULL,
    so_luong_mua INT NOT NULL,
    ma_don_vi_tinh VARCHAR(20) NOT NULL,
    don_gia NUMERIC(18,2) NOT NULL,
    thanh_tien NUMERIC(18,2) NOT NULL,
    CONSTRAINT pk_ct_phieu_mua PRIMARY KEY (so_phieu_mua, ma_san_pham),
    CONSTRAINT fk_ct_phieu_mua_phieu_mua_hang FOREIGN KEY (so_phieu_mua) REFERENCES phieu_mua_hang(so_phieu_mua),
    CONSTRAINT fk_ct_phieu_mua_san_pham FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham),
    CONSTRAINT fk_ct_phieu_mua_don_vi_tinh FOREIGN KEY (ma_don_vi_tinh) REFERENCES don_vi_tinh(ma_don_vi_tinh),
    CONSTRAINT ck_ct_phieu_mua_so_luong_mua_positive CHECK (so_luong_mua > 0),
    CONSTRAINT ck_ct_phieu_mua_don_gia_non_negative CHECK (don_gia >= 0),
    CONSTRAINT ck_ct_phieu_mua_thanh_tien_non_negative CHECK (thanh_tien >= 0)
);

CREATE TABLE phieu_ban_hang (
    so_phieu_ban VARCHAR(20) PRIMARY KEY,
    ngay_lap_phieu_ban DATE NOT NULL,
    ma_khach_hang VARCHAR(20) NOT NULL,
    tong_tien NUMERIC(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_phieu_ban_hang_khach_hang FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    CONSTRAINT ck_phieu_ban_hang_tong_tien_non_negative CHECK (tong_tien >= 0)
);

CREATE TABLE ct_phieu_ban (
    so_phieu_ban VARCHAR(20) NOT NULL,
    ma_san_pham VARCHAR(20) NOT NULL,
    so_luong INT NOT NULL,
    don_gia NUMERIC(18,2) NOT NULL,
    thanh_tien NUMERIC(18,2) NOT NULL,
    CONSTRAINT pk_ct_phieu_ban PRIMARY KEY (so_phieu_ban, ma_san_pham),
    CONSTRAINT fk_ct_phieu_ban_phieu_ban_hang FOREIGN KEY (so_phieu_ban) REFERENCES phieu_ban_hang(so_phieu_ban),
    CONSTRAINT fk_ct_phieu_ban_san_pham FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham),
    CONSTRAINT ck_ct_phieu_ban_so_luong_positive CHECK (so_luong > 0),
    CONSTRAINT ck_ct_phieu_ban_don_gia_non_negative CHECK (don_gia >= 0),
    CONSTRAINT ck_ct_phieu_ban_thanh_tien_non_negative CHECK (thanh_tien >= 0)
);

CREATE TABLE phieu_dich_vu (
    so_phieu_dich_vu VARCHAR(20) PRIMARY KEY,
    ngay_lap_phieu_dich_vu DATE NOT NULL,
    ma_khach_hang VARCHAR(20) NOT NULL,
    tong_tien_tra_truoc NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_tien_con_lai NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_tien NUMERIC(18,2) NOT NULL DEFAULT 0,
    tinh_trang_dich_vu VARCHAR(50) NOT NULL DEFAULT 'Chua hoan thanh',
    CONSTRAINT fk_phieu_dich_vu_khach_hang FOREIGN KEY (ma_khach_hang) REFERENCES khach_hang(ma_khach_hang),
    CONSTRAINT ck_phieu_dich_vu_tong_tien_tra_truoc_non_negative CHECK (tong_tien_tra_truoc >= 0),
    CONSTRAINT ck_phieu_dich_vu_tong_tien_con_lai_non_negative CHECK (tong_tien_con_lai >= 0),
    CONSTRAINT ck_phieu_dich_vu_tong_tien_non_negative CHECK (tong_tien >= 0)
);

CREATE TABLE ct_phieu_dich_vu (
    so_phieu_dich_vu VARCHAR(20) NOT NULL,
    ma_loai_dich_vu VARCHAR(20) NOT NULL,
    so_luong_dich_vu INT NOT NULL,
    don_gia_duoc_tinh NUMERIC(18,2) NOT NULL,
    thanh_tien NUMERIC(18,2) NOT NULL,
    tien_tra_truoc NUMERIC(18,2) NOT NULL DEFAULT 0,
    tien_con_lai NUMERIC(18,2) NOT NULL DEFAULT 0,
    ngay_giao DATE,
    tinh_trang VARCHAR(50) NOT NULL DEFAULT 'Chua giao',
    CONSTRAINT pk_ct_phieu_dich_vu PRIMARY KEY (so_phieu_dich_vu, ma_loai_dich_vu),
    CONSTRAINT fk_ct_phieu_dich_vu_phieu_dich_vu FOREIGN KEY (so_phieu_dich_vu) REFERENCES phieu_dich_vu(so_phieu_dich_vu),
    CONSTRAINT fk_ct_phieu_dich_vu_loai_dich_vu FOREIGN KEY (ma_loai_dich_vu) REFERENCES loai_dich_vu(ma_loai_dich_vu),
    CONSTRAINT ck_ct_phieu_dich_vu_so_luong_positive CHECK (so_luong_dich_vu > 0),
    CONSTRAINT ck_ct_phieu_dich_vu_don_gia_non_negative CHECK (don_gia_duoc_tinh >= 0),
    CONSTRAINT ck_ct_phieu_dich_vu_thanh_tien_non_negative CHECK (thanh_tien >= 0),
    CONSTRAINT ck_ct_phieu_dich_vu_tien_tra_truoc_non_negative CHECK (tien_tra_truoc >= 0),
    CONSTRAINT ck_ct_phieu_dich_vu_tien_con_lai_non_negative CHECK (tien_con_lai >= 0)
);

CREATE TABLE tham_so (
    ma_tham_so VARCHAR(20) PRIMARY KEY,
    ten_tham_so VARCHAR(255) UNIQUE,
    gia_tri NUMERIC(18,4)
);

CREATE TABLE bao_cao_ton_kho (
    ma_bao_cao_ton_kho VARCHAR(20) PRIMARY KEY,
    thang INT NOT NULL,
    nam INT NOT NULL,
    CONSTRAINT uq_bao_cao_ton_kho_thang_nam UNIQUE (thang, nam),
    CONSTRAINT ck_bao_cao_ton_kho_thang_valid CHECK (thang BETWEEN 1 AND 12),
    CONSTRAINT ck_bao_cao_ton_kho_nam_valid CHECK (nam > 0)
);

CREATE TABLE ct_bao_cao_ton_kho (
    ma_bao_cao_ton_kho VARCHAR(20) NOT NULL,
    ma_san_pham VARCHAR(20) NOT NULL,
    ton_dau INT NOT NULL DEFAULT 0,
    so_luong_mua_vao INT NOT NULL DEFAULT 0,
    so_luong_ban_ra INT NOT NULL DEFAULT 0,
    ton_cuoi INT NOT NULL DEFAULT 0,
    CONSTRAINT pk_ct_bao_cao_ton_kho PRIMARY KEY (ma_bao_cao_ton_kho, ma_san_pham),
    CONSTRAINT fk_ct_bao_cao_ton_kho_bao_cao FOREIGN KEY (ma_bao_cao_ton_kho) REFERENCES bao_cao_ton_kho(ma_bao_cao_ton_kho),
    CONSTRAINT fk_ct_bao_cao_ton_kho_san_pham FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham),
    CONSTRAINT ck_ct_bao_cao_ton_kho_ton_dau_non_negative CHECK (ton_dau >= 0),
    CONSTRAINT ck_ct_bao_cao_ton_kho_mua_vao_non_negative CHECK (so_luong_mua_vao >= 0),
    CONSTRAINT ck_ct_bao_cao_ton_kho_ban_ra_non_negative CHECK (so_luong_ban_ra >= 0),
    CONSTRAINT ck_ct_bao_cao_ton_kho_ton_cuoi_non_negative CHECK (ton_cuoi >= 0)
);

CREATE TABLE bao_cao_doanh_thu_sp (
    ma_bao_cao_doanh_thu_sp VARCHAR(20) PRIMARY KEY,
    thang INT NOT NULL,
    nam INT NOT NULL,
    tong_doanh_thu_san_pham NUMERIC(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT uq_bao_cao_doanh_thu_sp_thang_nam UNIQUE (thang, nam),
    CONSTRAINT ck_bao_cao_doanh_thu_sp_thang_valid CHECK (thang BETWEEN 1 AND 12),
    CONSTRAINT ck_bao_cao_doanh_thu_sp_nam_valid CHECK (nam > 0),
    CONSTRAINT ck_bao_cao_doanh_thu_sp_tong_non_negative CHECK (tong_doanh_thu_san_pham >= 0)
);

CREATE TABLE ct_bao_cao_doanh_thu_sp (
    ma_bao_cao_doanh_thu_sp VARCHAR(20) NOT NULL,
    ma_san_pham VARCHAR(20) NOT NULL,
    doanh_thu_san_pham NUMERIC(18,2) NOT NULL DEFAULT 0,
    ti_le_san_pham NUMERIC(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT pk_ct_bao_cao_doanh_thu_sp PRIMARY KEY (ma_bao_cao_doanh_thu_sp, ma_san_pham),
    CONSTRAINT fk_ct_bao_cao_doanh_thu_sp_bao_cao FOREIGN KEY (ma_bao_cao_doanh_thu_sp) REFERENCES bao_cao_doanh_thu_sp(ma_bao_cao_doanh_thu_sp),
    CONSTRAINT fk_ct_bao_cao_doanh_thu_sp_san_pham FOREIGN KEY (ma_san_pham) REFERENCES san_pham(ma_san_pham),
    CONSTRAINT ck_ct_bao_cao_doanh_thu_sp_doanh_thu_non_negative CHECK (doanh_thu_san_pham >= 0),
    CONSTRAINT ck_ct_bao_cao_doanh_thu_sp_ti_le_non_negative CHECK (ti_le_san_pham >= 0)
);

CREATE TABLE bao_cao_doanh_thu_dv (
    ma_bao_cao_doanh_thu_dv VARCHAR(20) PRIMARY KEY,
    thang INT NOT NULL,
    nam INT NOT NULL,
    tong_doanh_thu_dich_vu NUMERIC(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT uq_bao_cao_doanh_thu_dv_thang_nam UNIQUE (thang, nam),
    CONSTRAINT ck_bao_cao_doanh_thu_dv_thang_valid CHECK (thang BETWEEN 1 AND 12),
    CONSTRAINT ck_bao_cao_doanh_thu_dv_nam_valid CHECK (nam > 0),
    CONSTRAINT ck_bao_cao_doanh_thu_dv_tong_non_negative CHECK (tong_doanh_thu_dich_vu >= 0)
);

CREATE TABLE ct_bao_cao_doanh_thu_dv (
    ma_bao_cao_doanh_thu_dv VARCHAR(20) NOT NULL,
    ma_loai_dich_vu VARCHAR(20) NOT NULL,
    doanh_thu_dich_vu NUMERIC(18,2) NOT NULL DEFAULT 0,
    ti_le_dich_vu NUMERIC(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT pk_ct_bao_cao_doanh_thu_dv PRIMARY KEY (ma_bao_cao_doanh_thu_dv, ma_loai_dich_vu),
    CONSTRAINT fk_ct_bao_cao_doanh_thu_dv_bao_cao FOREIGN KEY (ma_bao_cao_doanh_thu_dv) REFERENCES bao_cao_doanh_thu_dv(ma_bao_cao_doanh_thu_dv),
    CONSTRAINT fk_ct_bao_cao_doanh_thu_dv_loai_dich_vu FOREIGN KEY (ma_loai_dich_vu) REFERENCES loai_dich_vu(ma_loai_dich_vu),
    CONSTRAINT ck_ct_bao_cao_doanh_thu_dv_doanh_thu_non_negative CHECK (doanh_thu_dich_vu >= 0),
    CONSTRAINT ck_ct_bao_cao_doanh_thu_dv_ti_le_non_negative CHECK (ti_le_dich_vu >= 0)
);

CREATE TABLE chuc_nang (
    ma_chuc_nang VARCHAR(20) PRIMARY KEY,
    ten_chuc_nang VARCHAR(255) NOT NULL,
    ten_man_hinh_load VARCHAR(255)
);

CREATE TABLE nhom_nguoi_dung (
    ma_nhom VARCHAR(20) PRIMARY KEY,
    ten_nhom VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE nguoi_dung (
    ten_dang_nhap VARCHAR(50) PRIMARY KEY,
    mat_khau VARCHAR(255) NOT NULL,
    ma_nhom VARCHAR(20),
    CONSTRAINT fk_nguoi_dung_nhom_nguoi_dung FOREIGN KEY (ma_nhom) REFERENCES nhom_nguoi_dung(ma_nhom)
);

CREATE TABLE phan_quyen (
    ma_nhom VARCHAR(20) NOT NULL,
    ma_chuc_nang VARCHAR(20) NOT NULL,
    CONSTRAINT pk_phan_quyen PRIMARY KEY (ma_nhom, ma_chuc_nang),
    CONSTRAINT fk_phan_quyen_nhom_nguoi_dung FOREIGN KEY (ma_nhom) REFERENCES nhom_nguoi_dung(ma_nhom),
    CONSTRAINT fk_phan_quyen_chuc_nang FOREIGN KEY (ma_chuc_nang) REFERENCES chuc_nang(ma_chuc_nang)
);

INSERT INTO nhom_nguoi_dung (ma_nhom, ten_nhom)
VALUES
    ('ADMIN', 'Quan tri vien'),
    ('STAFF', 'Nhan vien');

INSERT INTO chuc_nang (ma_chuc_nang, ten_chuc_nang, ten_man_hinh_load)
VALUES
    ('QL_NCC', 'Quan ly nha cung cap', 'NhaCungCap'),
    ('QL_KH', 'Quan ly khach hang', 'KhachHang'),
    ('QL_PMH', 'Quan ly phieu mua hang', 'PhieuMuaHang'),
    ('QL_PBH', 'Quan ly phieu ban hang', 'PhieuBanHang'),
    ('QL_PDV', 'Quan ly phieu dich vu', 'PhieuDichVu'),
    ('TRA_CUU', 'Tra cuu', 'TraCuu'),
    ('QL_SP', 'Quan ly san pham', 'SanPham'),
    ('QL_BC', 'Quan ly bao cao', 'BaoCao'),
    ('QL_ND', 'Quan ly nguoi dung', 'NguoiDung');

INSERT INTO phan_quyen (ma_nhom, ma_chuc_nang)
SELECT 'ADMIN', ma_chuc_nang
FROM chuc_nang;

INSERT INTO phan_quyen (ma_nhom, ma_chuc_nang)
VALUES
    ('STAFF', 'QL_NCC'),
    ('STAFF', 'QL_KH'),
    ('STAFF', 'QL_PMH'),
    ('STAFF', 'QL_PBH'),
    ('STAFF', 'QL_PDV'),
    ('STAFF', 'TRA_CUU');

INSERT INTO tham_so (ma_tham_so, ten_tham_so, gia_tri)
VALUES ('TS_PREPAY_RATE', 'SERVICE_PREPAYMENT_RATE', 50)
ON CONFLICT (ma_tham_so) DO NOTHING;

INSERT INTO don_vi_tinh (ma_don_vi_tinh, ten_don_vi_tinh, loai_don_vi, he_so_quy_doi, ghi_chu)
VALUES
    ('GRAM', 'gram', 'Khoi luong', 1, 'Don vi co so gram'),
    ('CHI', 'chi', 'Khoi luong', 3.75, '1 chi = 3.75 gram'),
    ('LUONG', 'luong', 'Khoi luong', 37.5, '1 luong = 37.5 gram')
ON CONFLICT (ma_don_vi_tinh) DO NOTHING;

INSERT INTO loai_dich_vu (ma_loai_dich_vu, ten_loai_dich_vu, don_gia_dich_vu)
VALUES
    ('CAN_THU', 'Can thu vang', 50000),
    ('GIA_CONG', 'Gia cong nu trang', 300000)
ON CONFLICT (ma_loai_dich_vu) DO NOTHING;
