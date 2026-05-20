package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PhieuBanHangResponse {

    private String soPhieuBan;
    private LocalDate ngayLapPhieuBan;
    private String maKhachHang;
    private BigDecimal tongTien;
    private KhachHangInfo khachHang;
    private List<ItemResponse> items;

    public String getSoPhieuBan() {
        return soPhieuBan;
    }

    public void setSoPhieuBan(String soPhieuBan) {
        this.soPhieuBan = soPhieuBan;
    }

    public LocalDate getNgayLapPhieuBan() {
        return ngayLapPhieuBan;
    }

    public void setNgayLapPhieuBan(LocalDate ngayLapPhieuBan) {
        this.ngayLapPhieuBan = ngayLapPhieuBan;
    }

    public String getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(String maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public KhachHangInfo getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(KhachHangInfo khachHang) {
        this.khachHang = khachHang;
    }

    public List<ItemResponse> getItems() {
        return items;
    }

    public void setItems(List<ItemResponse> items) {
        this.items = items;
    }

    public static class KhachHangInfo {

        private String maKhachHang;
        private String tenKhachHang;
        private String soDienThoai;
        private String diaChi;

        public String getMaKhachHang() {
            return maKhachHang;
        }

        public void setMaKhachHang(String maKhachHang) {
            this.maKhachHang = maKhachHang;
        }

        public String getTenKhachHang() {
            return tenKhachHang;
        }

        public void setTenKhachHang(String tenKhachHang) {
            this.tenKhachHang = tenKhachHang;
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
        private Integer soLuong;
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

        public Integer getSoLuong() {
            return soLuong;
        }

        public void setSoLuong(Integer soLuong) {
            this.soLuong = soLuong;
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
