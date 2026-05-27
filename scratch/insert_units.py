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
-- Seed realistic piece-based and carat units of measure into don_vi_tinh table
INSERT INTO don_vi_tinh (ma_don_vi_tinh, ten_don_vi_tinh, loai_don_vi, he_so_quy_doi, ghi_chu, is_active)
VALUES
    ('DVT004', 'cái', 'Số lượng', 1.0, 'Đơn vị tính chiếc/cái bán lẻ', true),
    ('DVT005', 'viên', 'Số lượng', 1.0, 'Đơn vị cho kim cương, đá quý', true),
    ('DVT006', 'cặp', 'Số lượng', 2.0, 'Đơn vị cho bông tai, nhẫn cưới', true),
    ('DVT007', 'bộ', 'Số lượng', 1.0, 'Đơn vị cho bộ trang sức', true),
    ('DVT008', 'carat', 'Khối lượng', 0.2, 'Đơn vị đo khối lượng đá quý (1 carat = 0.2 gam)', true)
ON CONFLICT (ma_don_vi_tinh) DO UPDATE
SET ten_don_vi_tinh = EXCLUDED.ten_don_vi_tinh,
    loai_don_vi = EXCLUDED.loai_don_vi,
    he_so_quy_doi = EXCLUDED.he_so_quy_doi,
    ghi_chu = EXCLUDED.ghi_chu,
    is_active = EXCLUDED.is_active;
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
    
    print("Seeding realistic units of measure into database...")
    cursor.execute(sql)
    print("SQL execution complete!")
    
    cursor.close()
    conn.close()
    print("Standard, realistic units of measure (cai, vien, cap, bo, carat) have been successfully added to the database!")

except Exception as e:
    print(f"Error during seeding: {e}", file=sys.stderr)
    sys.exit(1)
