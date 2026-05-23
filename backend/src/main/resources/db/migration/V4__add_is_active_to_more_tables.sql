-- V4: Add is_active column to loai_san_pham, loai_dich_vu, nha_cung_cap, nguoi_dung tables
ALTER TABLE loai_san_pham ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE loai_dich_vu ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE nha_cung_cap ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE nguoi_dung ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
