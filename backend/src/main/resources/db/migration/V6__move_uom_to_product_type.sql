-- Migration V4: Relocate ma_don_vi_tinh from san_pham to loai_san_pham
-- 1. Add ma_don_vi_tinh to loai_san_pham (nullable first for safety)
ALTER TABLE loai_san_pham ADD COLUMN ma_don_vi_tinh VARCHAR(20);

-- 2. Assign a default UOM if there are any existing product types
UPDATE loai_san_pham SET ma_don_vi_tinh = (SELECT ma_don_vi_tinh FROM don_vi_tinh ORDER BY ma_don_vi_tinh LIMIT 1) WHERE ma_don_vi_tinh IS NULL;

-- 3. Set NOT NULL constraint once populated
ALTER TABLE loai_san_pham ALTER COLUMN ma_don_vi_tinh SET NOT NULL;

-- 4. Add foreign key constraint to loai_san_pham
ALTER TABLE loai_san_pham ADD CONSTRAINT fk_loai_san_pham_don_vi_tinh FOREIGN KEY (ma_don_vi_tinh) REFERENCES don_vi_tinh(ma_don_vi_tinh);

-- 5. Drop UOM constraint and column from san_pham
ALTER TABLE san_pham DROP CONSTRAINT fk_san_pham_don_vi_tinh;
ALTER TABLE san_pham DROP COLUMN ma_don_vi_tinh;
