import sys
import pg8000
import ssl

host = "aws-1-ap-southeast-1.pooler.supabase.com"
port = 5432
database = "postgres"
user = "postgres.lakjykixplwddcrjggty"
password = "gold-store@@"

try:
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
    conn.autocommit = True
    cursor = conn.cursor()
    
    tables = [
        "don_vi_tinh", "san_pham", "khach_hang", "nha_cung_cap", 
        "loai_san_pham", "loai_dich_vu", "tham_so",
        "phieu_ban_hang", "phieu_mua_hang", "phieu_dich_vu"
    ]
    
    print("--- Database Inventory ---")
    for table in tables:
        cursor.execute(f"SELECT count(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"{table}: {count} records")
        
        if count > 0 and table in ["don_vi_tinh", "san_pham", "khach_hang", "nha_cung_cap", "loai_san_pham", "loai_dich_vu"]:
            if table == "don_vi_tinh":
                cursor.execute("SELECT ma_don_vi_tinh, ten_don_vi_tinh FROM don_vi_tinh ORDER BY ma_don_vi_tinh")
            elif table == "san_pham":
                cursor.execute("SELECT ma_san_pham, ten_san_pham, ma_don_vi_tinh FROM san_pham ORDER BY ma_san_pham")
            elif table == "khach_hang":
                cursor.execute("SELECT ma_khach_hang, ten_khach_hang FROM khach_hang ORDER BY ma_khach_hang")
            elif table == "nha_cung_cap":
                cursor.execute("SELECT ma_nha_cung_cap, ten_nha_cung_cap FROM nha_cung_cap ORDER BY ma_nha_cung_cap")
            elif table == "loai_san_pham":
                cursor.execute("SELECT ma_loai_san_pham, ten_loai_san_pham FROM loai_san_pham ORDER BY ma_loai_san_pham")
            elif table == "loai_dich_vu":
                cursor.execute("SELECT ma_loai_dich_vu, ten_loai_dich_vu FROM loai_dich_vu ORDER BY ma_loai_dich_vu")
            
            rows = cursor.fetchall()
            for r in rows:
                print(f"  * {r[0]} - {r[1]}" + (f" (ĐVT: {r[2]})" if len(r) > 2 else ""))
                
    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
