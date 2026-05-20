package com.se104.goldstore.dto.response;

import java.math.BigDecimal;

public class SanPhamResponse {

    private String maSanPham;
    private String tenSanPham;
    private LoaiSanPhamInfo loaiSanPham;
    private DonViTinhInfo donViTinh;
    private String maLoaiSanPham;
    private String maDonViTinh;
    private BigDecimal donGiaMua;
    private BigDecimal donGiaBan;
    private Integer tonKho;

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public LoaiSanPhamInfo getLoaiSanPham() {
        return loaiSanPham;
    }

    public void setLoaiSanPham(LoaiSanPhamInfo loaiSanPham) {
        this.loaiSanPham = loaiSanPham;
    }

    public DonViTinhInfo getDonViTinh() {
        return donViTinh;
    }

    public void setDonViTinh(DonViTinhInfo donViTinh) {
        this.donViTinh = donViTinh;
    }

    public String getMaLoaiSanPham() {
        return maLoaiSanPham;
    }

    public void setMaLoaiSanPham(String maLoaiSanPham) {
        this.maLoaiSanPham = maLoaiSanPham;
    }

    public String getMaDonViTinh() {
        return maDonViTinh;
    }

    public void setMaDonViTinh(String maDonViTinh) {
        this.maDonViTinh = maDonViTinh;
    }

    public BigDecimal getDonGiaMua() {
        return donGiaMua;
    }

    public void setDonGiaMua(BigDecimal donGiaMua) {
        this.donGiaMua = donGiaMua;
    }

    public BigDecimal getDonGiaBan() {
        return donGiaBan;
    }

    public void setDonGiaBan(BigDecimal donGiaBan) {
        this.donGiaBan = donGiaBan;
    }

    public Integer getTonKho() {
        return tonKho;
    }

    public void setTonKho(Integer tonKho) {
        this.tonKho = tonKho;
    }

    public static class LoaiSanPhamInfo {

        private String maLoaiSanPham;
        private String tenLoaiSanPham;

        public String getMaLoaiSanPham() {
            return maLoaiSanPham;
        }

        public void setMaLoaiSanPham(String maLoaiSanPham) {
            this.maLoaiSanPham = maLoaiSanPham;
        }

        public String getTenLoaiSanPham() {
            return tenLoaiSanPham;
        }

        public void setTenLoaiSanPham(String tenLoaiSanPham) {
            this.tenLoaiSanPham = tenLoaiSanPham;
        }
    }

    public static class DonViTinhInfo {

        private String maDonViTinh;
        private String tenDonViTinh;
        private String loaiDonVi;

        public String getMaDonViTinh() {
            return maDonViTinh;
        }

        public void setMaDonViTinh(String maDonViTinh) {
            this.maDonViTinh = maDonViTinh;
        }

        public String getTenDonViTinh() {
            return tenDonViTinh;
        }

        public void setTenDonViTinh(String tenDonViTinh) {
            this.tenDonViTinh = tenDonViTinh;
        }

        public String getLoaiDonVi() {
            return loaiDonVi;
        }

        public void setLoaiDonVi(String loaiDonVi) {
            this.loaiDonVi = loaiDonVi;
        }
    }
}
