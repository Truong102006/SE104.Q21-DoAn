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
               ct_phieu_mua, phieu_mua_hang,
               san_pham, loai_san_pham, don_vi_tinh,
               khach_hang, nha_cung_cap, loai_dich_vu
               CASCADE;

-- 2. Explicitly seed/restore critical units (don_vi_tinh)
INSERT INTO don_vi_tinh (ma_don_vi_tinh, ten_don_vi_tinh, loai_don_vi, he_so_quy_doi, ghi_chu)
VALUES
    ('DVT001', 'gam', 'Khối lượng', 1, 'Đơn vị khối lượng cơ sở'),
    ('DVT002', 'chỉ', 'Khối lượng', 3.75, '1 chỉ = 3,75 gam'),
    ('DVT003', 'lượng', 'Khối lượng', 37.5, '1 lượng = 37,5 gam'),
    ('DVT004', 'cái', 'Số lượng', 1, 'Đơn vị tính chiếc/cái bán lẻ'),
    ('DVT005', 'viên', 'Số lượng', 1, 'Đơn vị cho kim cương, đá quý'),
    ('DVT006', 'cặp', 'Số lượng', 2, 'Đơn vị cho bông tai, nhẫn cưới'),
    ('DVT007', 'bộ', 'Số lượng', 1, 'Đơn vị cho bộ trang sức'),
    ('DVT008', 'carat', 'Khối lượng', 0.2, 'Đơn vị đo khối lượng đá quý (1 carat = 0.2 gam)')
ON CONFLICT (ma_don_vi_tinh) DO UPDATE
SET ten_don_vi_tinh = EXCLUDED.ten_don_vi_tinh,
    loai_don_vi = EXCLUDED.loai_don_vi,
    he_so_quy_doi = EXCLUDED.he_so_quy_doi,
    ghi_chu = EXCLUDED.ghi_chu;

-- 3. Explicitly seed/restore critical product types (loai_san_pham) with UOM relocated
INSERT INTO loai_san_pham (ma_loai_san_pham, ten_loai_san_pham, ti_le_loi_nhuan, ma_don_vi_tinh)
VALUES
    ('LSP_24K', 'Vàng 24K', 2, 'DVT002'),
    ('LSP_18K', 'Vàng 18K', 5, 'DVT002'),
    ('LSP_KC', 'Kim cương', 10, 'DVT005'),
    ('LSP_DQ', 'Đá quý', 8, 'DVT005')
ON CONFLICT (ma_loai_san_pham) DO UPDATE
SET ten_loai_san_pham = EXCLUDED.ten_loai_san_pham,
    ti_le_loi_nhuan = EXCLUDED.ti_le_loi_nhuan,
    ma_don_vi_tinh = EXCLUDED.ma_don_vi_tinh;

-- 4. Explicitly seed/restore critical service types (loai_dich_vu)
INSERT INTO loai_dich_vu (ma_loai_dich_vu, ten_loai_dich_vu, don_gia_dich_vu)
VALUES
    ('CAN_THU', 'Cân thử vàng', 50000),
    ('GIA_CONG', 'Gia công nữ trang', 200000),
    ('LAM_SACH', 'Làm sạch trang sức', 80000)
ON CONFLICT (ma_loai_dich_vu) DO UPDATE
SET ten_loai_dich_vu = EXCLUDED.ten_loai_dich_vu,
    don_gia_dich_vu = EXCLUDED.don_gia_dich_vu;

-- 5. Seed core suppliers
INSERT INTO nha_cung_cap (ma_nha_cung_cap, ten_nha_cung_cap, so_dien_thoai, dia_chi, ghi_chu)
VALUES
    ('NCC001', 'Công ty Vàng bạc Ánh Dương', '0901111222', 'Quận 1, TP. Hồ Chí Minh', 'Nhà cung cấp vàng miếng và nữ trang'),
    ('NCC002', 'Công ty Đá quý Minh Châu', '0901111333', 'Hoàn Kiếm, Hà Nội', 'Nhà cung cấp kim cương và đá quý')
ON CONFLICT (ma_nha_cung_cap) DO NOTHING;

-- 6. Seed core customers
INSERT INTO khach_hang (ma_khach_hang, ten_khach_hang, so_dien_thoai_khach_hang, dia_chi_khach_hang, ghi_chu)
VALUES
    ('KH001', 'Nguyễn Minh Anh', '0902222333', 'Thủ Đức, TP. Hồ Chí Minh', 'Khách hàng thân thiết'),
    ('KH002', 'Trần Thu Hà', '0902222444', 'Biên Hòa, Đồng Nai', 'Khách hàng cá nhân')
ON CONFLICT (ma_khach_hang) DO NOTHING;

-- 7. Seed 4 core sample products (UOM column dropped)
INSERT INTO san_pham (ma_san_pham, ten_san_pham, ma_loai_san_pham, don_gia_mua, don_gia_ban, ton_kho)
VALUES
    ('SP001', 'Nhẫn vàng 24K trơn', 'LSP_24K', 1000000, 1020000, 0),
    ('SP002', 'Dây chuyền vàng 18K Ý', 'LSP_18K', 2000000, 2100000, 0),
    ('SP003', 'Nhẫn kim cương nữ', 'LSP_KC', 1500000, 1650000, 0),
    ('SP004', 'Mặt dây chuyền đá ruby', 'LSP_DQ', 1200000, 1296000, 0)
ON CONFLICT (ma_san_pham) DO NOTHING;

-- 8. Seed 50 products with highly realistic jewelry catalog descriptions
INSERT INTO san_pham (ma_san_pham, ten_san_pham, ma_loai_san_pham, don_gia_mua, don_gia_ban, ton_kho)
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
    (100000 + (i * 20000))::numeric,
    (110000 + (i * 21000))::numeric,
    (10 + (i % 50))
FROM generate_series(5, 54) AS i
ON CONFLICT (ma_san_pham) DO NOTHING;
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
    
    print("Executing catalog data seeder script...")
    cursor.execute(sql)
    print("SQL execution complete!")
    
    cursor.close()
    conn.conn_filters = []
    conn.close()
    print("Database seeding completed successfully with clean catalogs, core customers, suppliers, and products!")

except Exception as e:
    print(f"Error during seeding: {e}", file=sys.stderr)
    sys.exit(1)
