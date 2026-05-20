package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PhieuMuaHangResponse {

    private String soPhieuMua;
    private LocalDate ngayLapPhieuMua;
    private String maNhaCungCap;
    private BigDecimal tongTien;
    private NhaCungCapInfo nhaCungCap;
    private List<ItemResponse> items;

    public String getSoPhieuMua() {
        return soPhieuMua;
    }

    public void setSoPhieuMua(String soPhieuMua) {
        this.soPhieuMua = soPhieuMua;
    }

    public LocalDate getNgayLapPhieuMua() {
        return ngayLapPhieuMua;
    }

    public void setNgayLapPhieuMua(LocalDate ngayLapPhieuMua) {
        this.ngayLapPhieuMua = ngayLapPhieuMua;
    }

    public String getMaNhaCungCap() {
        return maNhaCungCap;
    }

    public void setMaNhaCungCap(String maNhaCungCap) {
        this.maNhaCungCap = maNhaCungCap;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public NhaCungCapInfo getNhaCungCap() {
        return nhaCungCap;
    }

    public void setNhaCungCap(NhaCungCapInfo nhaCungCap) {
        this.nhaCungCap = nhaCungCap;
    }

    public List<ItemResponse> getItems() {
        return items;
    }

    public void setItems(List<ItemResponse> items) {
        this.items = items;
    }

    public static class NhaCungCapInfo {

        private String maNhaCungCap;
        private String tenNhaCungCap;
        private String soDienThoai;
        private String diaChi;

        public String getMaNhaCungCap() {
            return maNhaCungCap;
        }

        public void setMaNhaCungCap(String maNhaCungCap) {
            this.maNhaCungCap = maNhaCungCap;
        }

        public String getTenNhaCungCap() {
            return tenNhaCungCap;
        }

        public void setTenNhaCungCap(String tenNhaCungCap) {
            this.tenNhaCungCap = tenNhaCungCap;
        }

        public String getSoDienThoai() {
            return soDienThoai;
        }

        public void setSoDienThoai(String soDienThoai) {
            this.soDienThoai = soDienThoai;
        }

        public String getDiaChi() {
            return diaChi;
        }

        public void setDiaChi(String diaChi) {
            this.diaChi = diaChi;
        }
    }

    public static class ItemResponse {

        private String maSanPham;
        private String tenSanPham;
        private String maLoaiSanPham;
        private String tenLoaiSanPham;
        private Integer soLuongMua;
        private String maDonViTinh;
        private String tenDonViTinh;
        private BigDecimal donGia;
        private BigDecimal thanhTien;

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

        public Integer getSoLuongMua() {
            return soLuongMua;
        }

        public void setSoLuongMua(Integer soLuongMua) {
            this.soLuongMua = soLuongMua;
        }

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

        public BigDecimal getDonGia() {
            return donGia;
        }

        public void setDonGia(BigDecimal donGia) {
            this.donGia = donGia;
        }

        public BigDecimal getThanhTien() {
            return thanhTien;
        }

        public void setThanhTien(BigDecimal thanhTien) {
            this.thanhTien = thanhTien;
        }
    }
}
