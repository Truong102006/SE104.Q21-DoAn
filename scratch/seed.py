import sys
import subprocess

# Auto-install pg8000 if not present
try:
    import pg8000
except ImportError:
    print("Installing pg8000 pure-python postgres driver...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pg8000"])
    import pg8000

print("pg8000 driver is ready.")

# DB Credentials from .env
host = "aws-1-ap-southeast-1.pooler.supabase.com"
port = 5432
database = "postgres"
user = "postgres.lakjykixplwddcrjggty"
password = "gold-store@@"

sql = """
-- 1. Wipe old transactions in exact constraint order
TRUNCATE TABLE ct_bao_cao_ton_kho, bao_cao_ton_kho, 
               ct_bao_cao_doanh_thu_sp, bao_cao_doanh_thu_sp,
               ct_bao_cao_doanh_thu_dv, bao_cao_doanh_thu_dv,
               ct_phieu_dich_vu, phieu_dich_vu, 
               ct_phieu_ban, phieu_ban_hang, 
               ct_phieu_mua, phieu_mua_hang
               CASCADE;

-- 2. Clear old custom customers, suppliers, and products
DELETE FROM khach_hang WHERE ma_khach_hang NOT IN ('KH001', 'KH002');
DELETE FROM nha_cung_cap WHERE ma_nha_cung_cap NOT IN ('NCC001', 'NCC002');
DELETE FROM san_pham WHERE ma_san_pham NOT IN ('SP001', 'SP002', 'SP003', 'SP004');

-- 3. Explicitly seed/restore critical units (don_vi_tinh)
INSERT INTO don_vi_tinh (ma_don_vi_tinh, ten_don_vi_tinh, loai_don_vi, he_so_quy_doi, ghi_chu)
VALUES
    ('GRAM', 'gam', 'Khối lượng', 1, 'Đơn vị khối lượng cơ sở'),
    ('CHI', 'chỉ', 'Khối lượng', 3.75, '1 chỉ = 3,75 gam'),
    ('LUONG', 'lượng', 'Khối lượng', 37.5, '1 lượng = 37,5 gam')
ON CONFLICT (ma_don_vi_tinh) DO UPDATE
SET ten_don_vi_tinh = EXCLUDED.ten_don_vi_tinh,
    loai_don_vi = EXCLUDED.loai_don_vi,
    he_so_quy_doi = EXCLUDED.he_so_quy_doi,
    ghi_chu = EXCLUDED.ghi_chu;

-- 4. Explicitly seed/restore critical product types (loai_san_pham)
INSERT INTO loai_san_pham (ma_loai_san_pham, ten_loai_san_pham, ti_le_loi_nhuan)
VALUES
    ('LSP_24K', 'Vàng 24K', 2),
    ('LSP_18K', 'Vàng 18K', 5),
    ('LSP_KC', 'Kim cương', 10),
    ('LSP_DQ', 'Đá quý', 8)
ON CONFLICT (ma_loai_san_pham) DO UPDATE
SET ten_loai_san_pham = EXCLUDED.ten_loai_san_pham,
    ti_le_loi_nhuan = EXCLUDED.ti_le_loi_nhuan;

-- 5. Explicitly seed/restore critical service types (loai_dich_vu)
INSERT INTO loai_dich_vu (ma_loai_dich_vu, ten_loai_dich_vu, don_gia_dich_vu)
VALUES
    ('CAN_THU', 'Cân thử vàng', 50000),
    ('GIA_CONG', 'Gia công nữ trang', 200000),
    ('LAM_SACH', 'Làm sạch trang sức', 80000)
ON CONFLICT (ma_loai_dich_vu) DO UPDATE
SET ten_loai_dich_vu = EXCLUDED.ten_loai_dich_vu,
    don_gia_dich_vu = EXCLUDED.don_gia_dich_vu;

-- 6. Seed 500 customers with highly realistic Vietnamese full names
INSERT INTO khach_hang (ma_khach_hang, ten_khach_hang, so_dien_thoai_khach_hang, dia_chi_khach_hang, ghi_chu)
SELECT 
    'KH' || LPAD(i::text, 3, '0'),
    (
        ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương']
    )[(i % 15) + 1] || ' ' || (
        ARRAY['Văn', 'Thị', 'Minh', 'Anh', 'Đức', 'Hoàng', 'Khánh', 'Quốc', 'Ngọc', 'Gia', 'Hồng', 'Thanh', 'Tuấn', 'Hải', 'Xuân']
    )[((i * 7) % 15) + 1] || ' ' || (
        ARRAY['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hải', 'Khánh', 'Linh', 'Minh', 'Nam', 'Oanh', 'Phong', 'Quỳnh', 'Sơn', 'Trang', 'Vy', 'Yến', 'Tú', 'Hòa', 'Duy']
    )[((i * 13) % 20) + 1],
    '09' || LPAD((2000000 + i)::text, 8, '0'),
    (
        ARRAY['Quận 1', 'Bình Thạnh', 'Thủ Đức', 'Quận 3', 'Gò Vấp', 'Quận 10', 'Quận 7', 'Tân Bình', 'Phú Nhuận', 'Quận 5']
    )[(i % 10) + 1] || ', TP. Hồ Chí Minh',
    'Khách hàng mẫu hiệu năng'
FROM generate_series(3, 502) AS i
ON CONFLICT (so_dien_thoai_khach_hang) DO NOTHING;

-- 7. Seed 100 suppliers with highly realistic corporate names
INSERT INTO nha_cung_cap (ma_nha_cung_cap, ten_nha_cung_cap, so_dien_thoai, dia_chi, ghi_chu)
SELECT 
    'NCC' || LPAD(i::text, 3, '0'),
    (
        ARRAY['Công ty Vàng Bạc', 'Doanh nghiệp Tư nhân', 'Tập đoàn Đá quý', 'Tổng công ty Trang sức', 'Xưởng Chế tác Vàng']
    )[(i % 5) + 1] || ' ' || (
        ARRAY['Bảo Tín', 'Kim Tín', 'Phú Quý', 'Hưng Thịnh', 'Đại Phát', 'Thành Công', 'Thịnh Vượng', 'An Khang', 'Vạn Lộc', 'Đông Á']
    )[((i * 3) % 10) + 1] || ' ' || (
        ARRAY['Sài Gòn', 'Hà Nội', 'Đại Việt', 'Phương Đông', 'Á Châu', 'Hoàn Cầu', 'VinaGold', 'Đá Quý Việt']
    )[((i * 7) % 8) + 1],
    '08' || LPAD((1000000 + i)::text, 8, '0'),
    (
        ARRAY['Hoàn Kiếm, Hà Nội', 'Quận 1, TP. HCM', 'Hải Châu, Đà Nẵng', 'Ninh Kiều, Cần Thơ', 'Biên Hòa, Đồng Nai']
    )[(i % 5) + 1],
    'Đối tác cung ứng vàng bạc'
FROM generate_series(3, 102) AS i
ON CONFLICT (so_dien_thoai) DO NOTHING;

-- 8. Seed 50 products with highly realistic jewelry catalog descriptions
INSERT INTO san_pham (ma_san_pham, ten_san_pham, ma_loai_san_pham, ma_don_vi_tinh, don_gia_mua, don_gia_ban, ton_kho)
SELECT 
    'SP' || LPAD(i::text, 3, '0'),
    (
        ARRAY['Nhẫn Nam', 'Dây Chuyền Nữ', 'Lắc Tay Thời Trang', 'Vòng Cổ Sang Trọng', 'Bông Tai Quý Phái', 'Mặt Dây Chuyền', 'Vòng Tay Phong Thủy', 'Kiềng Cổ Cưới']
    )[(i % 8) + 1] || ' ' || (
        CASE (i % 4)
            WHEN 0 THEN 'Vàng 24K'
            WHEN 1 THEN 'Vàng 18K Ý'
            WHEN 2 THEN 'Bạch Kim Đính Kim Cương'
            ELSE 'Vàng Hồng Đính Đá Ruby'
        END
    ) || ' ' || (
        ARRAY['Trơn Cổ Điển', 'Họa Tiết Rồng Phượng', 'Đính Ngọc Trai', 'Khắc Chữ Song Hỷ', 'Đính Đá Saphire', 'Giọt Nước Tinh Tế', 'Chạm Khắc Thủ Công', 'Đính Kim Cương Tự Nhiên']
    )[((i * 3) % 8) + 1],
    CASE (i % 4)
        WHEN 0 THEN 'LSP_24K'
        WHEN 1 THEN 'LSP_18K'
        WHEN 2 THEN 'LSP_KC'
        ELSE 'LSP_DQ'
    END,
    CASE (i % 3)
        WHEN 0 THEN 'CHI'
        WHEN 1 THEN 'LUONG'
        ELSE 'GRAM'
    END,
    (100000 + (i * 20000))::numeric,
    (110000 + (i * 21000))::numeric,
    (10 + (i % 50))
FROM generate_series(5, 54) AS i
ON CONFLICT (ma_san_pham) DO NOTHING;

-- 9. Seed 1000 sales orders (phieu_ban_hang)
INSERT INTO phieu_ban_hang (so_phieu_ban, ngay_lap_phieu_ban, ma_khach_hang, tong_tien)
SELECT 
    'PB' || LPAD(i::text, 5, '0'),
    CURRENT_DATE - (i % 30) * INTERVAL '1 day',
    'KH' || LPAD((1 + (i % 500))::text, 3, '0'),
    0
FROM generate_series(1, 1000) AS i;

-- Insert ct_phieu_ban detail items (2 items per sales order)
INSERT INTO ct_phieu_ban (so_phieu_ban, ma_san_pham, so_luong, don_gia, thanh_tien)
SELECT 
    'PB' || LPAD(i::text, 5, '0'),
    'SP' || LPAD((1 + ((i + j) % 50))::text, 3, '0'),
    (1 + (i % 5)),
    don_gia_ban,
    (1 + (i % 5)) * don_gia_ban
FROM generate_series(1, 1000) AS i
CROSS JOIN generate_series(1, 2) AS j
JOIN san_pham ON san_pham.ma_san_pham = 'SP' || LPAD((1 + ((i + j) % 50))::text, 3, '0');

-- Update phieu_ban_hang total sums
UPDATE phieu_ban_hang pbh
SET tong_tien = COALESCE((SELECT SUM(thanh_tien) FROM ct_phieu_ban WHERE so_phieu_ban = pbh.so_phieu_ban), 0);

-- 10. Seed 200 purchase orders (phieu_mua_hang)
INSERT INTO phieu_mua_hang (so_phieu_mua, ngay_lap_phieu_mua, ma_nha_cung_cap, tong_tien)
SELECT 
    'PM' || LPAD(i::text, 5, '0'),
    CURRENT_DATE - (i % 30) * INTERVAL '1 day',
    'NCC' || LPAD((1 + (i % 100))::text, 3, '0'),
    0
FROM generate_series(1, 200) AS i;

-- Insert ct_phieu_mua details (2 items per purchase order)
INSERT INTO ct_phieu_mua (so_phieu_mua, ma_san_pham, so_luong_mua, ma_don_vi_tinh, don_gia, thanh_tien)
SELECT 
    'PM' || LPAD(i::text, 5, '0'),
    'SP' || LPAD((1 + ((i + j) % 50))::text, 3, '0'),
    (10 + (i % 10)),
    ma_don_vi_tinh,
    don_gia_mua,
    (10 + (i % 10)) * don_gia_mua
FROM generate_series(1, 200) AS i
CROSS JOIN generate_series(1, 2) AS j
JOIN san_pham ON san_pham.ma_san_pham = 'SP' || LPAD((1 + ((i + j) % 50))::text, 3, '0');

-- Update phieu_mua_hang total sums
UPDATE phieu_mua_hang pmh
SET tong_tien = COALESCE((SELECT SUM(thanh_tien) FROM ct_phieu_mua WHERE so_phieu_mua = pmh.so_phieu_mua), 0);

-- 11. Seed 1000 service orders (phieu_dich_vu)
INSERT INTO phieu_dich_vu (so_phieu_dich_vu, ngay_lap_phieu_dich_vu, ma_khach_hang, tong_tien_tra_truoc, tong_tien_con_lai, tong_tien, tinh_trang_dich_vu)
SELECT 
    'DV' || LPAD(i::text, 5, '0'),
    CURRENT_DATE - (i % 30) * INTERVAL '1 day',
    'KH' || LPAD((1 + (i % 500))::text, 3, '0'),
    0,
    0,
    0,
    CASE (i % 3)
        WHEN 0 THEN 'Hoàn thành'
        WHEN 1 THEN 'Đã giao'
        ELSE 'Chưa hoàn thành'
    END
FROM generate_series(1, 1000) AS i;

-- Insert ct_phieu_dich_vu details (2 items per service ticket)
INSERT INTO ct_phieu_dich_vu (so_phieu_dich_vu, ma_loai_dich_vu, so_luong_dich_vu, don_gia_duoc_tinh, thanh_tien, tien_tra_truoc, tien_con_lai, ngay_giao, tinh_trang)
SELECT 
    'DV' || LPAD(i::text, 5, '0'),
    CASE (j % 3)
        WHEN 0 THEN 'CAN_THU'
        WHEN 1 THEN 'GIA_CONG'
        ELSE 'LAM_SACH'
    END,
    (1 + (i % 3)),
    don_gia_dich_vu + (i % 5) * 10000,
    (1 + (i % 3)) * (don_gia_dich_vu + (i % 5) * 10000),
    ((1 + (i % 3)) * (don_gia_dich_vu + (i % 5) * 10000)) * 0.6,
    ((1 + (i % 3)) * (don_gia_dich_vu + (i % 5) * 10000)) * 0.4,
    CURRENT_DATE - (i % 30) * INTERVAL '1 day' + INTERVAL '5 days',
    CASE (i % 3)
        WHEN 0 THEN 'Đã hoàn thành'
        WHEN 1 THEN 'Đã giao'
        ELSE 'Chưa giao'
    END
FROM generate_series(1, 1000) AS i
CROSS JOIN generate_series(1, 2) AS j
JOIN loai_dich_vu ON loai_dich_vu.ma_loai_dich_vu = CASE (j % 3) WHEN 0 THEN 'CAN_THU' WHEN 1 THEN 'GIA_CONG' ELSE 'LAM_SACH' END;

-- Update phieu_dich_vu total sums
UPDATE phieu_dich_vu pdv
SET tong_tien = COALESCE((SELECT SUM(thanh_tien) FROM ct_phieu_dich_vu WHERE so_phieu_dich_vu = pdv.so_phieu_dich_vu), 0),
    tong_tien_tra_truoc = COALESCE((SELECT SUM(tien_tra_truoc) FROM ct_phieu_dich_vu WHERE so_phieu_dich_vu = pdv.so_phieu_dich_vu), 0),
    tong_tien_con_lai = COALESCE((SELECT SUM(tien_con_lai) FROM ct_phieu_dich_vu WHERE so_phieu_dich_vu = pdv.so_phieu_dich_vu), 0);
"""

try:
    print("Connecting to Supabase PostgreSQL database...")
    import ssl
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    conn = pg8000.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password,
        ssl_context=ssl_context
    )
    
    print("Connection established successfully!")
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Executing massive performance data seeder script...")
    cursor.execute(sql)
    print("SQL execution complete!")
    
    cursor.close()
    conn.close()
    print("Database seeding completed successfully with 500+ customers, 100+ suppliers, 50+ products, 1000+ sales, and 1000+ service tickets!")

except Exception as e:
    print(f"Error during seeding: {e}", file=sys.stderr)
    sys.exit(1)
