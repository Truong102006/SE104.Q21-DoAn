-- V3: Add is_active column to don_vi_tinh and san_pham tables
ALTER TABLE don_vi_tinh ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE san_pham ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
