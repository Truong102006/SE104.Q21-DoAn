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
-- Wipe all transactional, report, and catalog tables completely
TRUNCATE TABLE ct_bao_cao_ton_kho, bao_cao_ton_kho, 
               ct_bao_cao_doanh_thu_sp, bao_cao_doanh_thu_sp,
               ct_bao_cao_doanh_thu_dv, bao_cao_doanh_thu_dv,
               ct_phieu_dich_vu, phieu_dich_vu, 
               ct_phieu_ban, phieu_ban_hang, 
               ct_phieu_mua, phieu_mua_hang,
               san_pham, don_vi_tinh, loai_san_pham, loai_dich_vu,
               khach_hang, nha_cung_cap
               CASCADE;
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
    
    print("Clearing all transactional and sample data from the database...")
    cursor.execute(sql)
    print("SQL execution complete!")
    
    cursor.close()
    conn.close()
    print("Database cleared successfully! All transactions, customers, suppliers, and products have been truncated.")

except Exception as e:
    print(f"Error during clearing: {e}", file=sys.stderr)
    sys.exit(1)
