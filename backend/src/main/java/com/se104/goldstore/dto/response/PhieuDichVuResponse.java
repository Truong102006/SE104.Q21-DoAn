package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PhieuDichVuResponse {

    private String soPhieuDichVu;
    private LocalDate ngayLapPhieuDichVu;
    private String maKhachHang;
    private BigDecimal tongTienTraTruoc;
    private BigDecimal tongTienConLai;
    private BigDecimal tongTien;
    private String tinhTrangDichVu;
    private KhachHangInfo khachHang;
    private List<ItemResponse> items;

    public String getSoPhieuDichVu() {
        return soPhieuDichVu;
    }

    public void setSoPhieuDichVu(String soPhieuDichVu) {
        this.soPhieuDichVu = soPhieuDichVu;
    }

    public LocalDate getNgayLapPhieuDichVu() {
        return ngayLapPhieuDichVu;
    }

    public void setNgayLapPhieuDichVu(LocalDate ngayLapPhieuDichVu) {
        this.ngayLapPhieuDichVu = ngayLapPhieuDichVu;
    }

    public String getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(String maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public BigDecimal getTongTienTraTruoc() {
        return tongTienTraTruoc;
    }

    public void setTongTienTraTruoc(BigDecimal tongTienTraTruoc) {
        this.tongTienTraTruoc = tongTienTraTruoc;
    }

    public BigDecimal getTongTienConLai() {
        return tongTienConLai;
    }

    public void setTongTienConLai(BigDecimal tongTienConLai) {
        this.tongTienConLai = tongTienConLai;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public String getTinhTrangDichVu() {
        return tinhTrangDichVu;
    }

    public void setTinhTrangDichVu(String tinhTrangDichVu) {
        this.tinhTrangDichVu = tinhTrangDichVu;
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

        private String maLoaiDichVu;
        private String tenLoaiDichVu;
        private Integer soLuongDichVu;
        private BigDecimal donGiaDichVu;
        private BigDecimal donGiaDuocTinh;
        private BigDecimal thanhTien;
        private BigDecimal tienTraTruoc;
        private BigDecimal tienConLai;
        private LocalDate ngayGiao;
        private String tinhTrang;

        public String getMaLoaiDichVu() {
            return maLoaiDichVu;
        }

        public void setMaLoaiDichVu(String maLoaiDichVu) {
            this.maLoaiDichVu = maLoaiDichVu;
        }

        public String getTenLoaiDichVu() {
            return tenLoaiDichVu;
        }

        public void setTenLoaiDichVu(String tenLoaiDichVu) {
            this.tenLoaiDichVu = tenLoaiDichVu;
        }

        public Integer getSoLuongDichVu() {
            return soLuongDichVu;
        }

        public void setSoLuongDichVu(Integer soLuongDichVu) {
            this.soLuongDichVu = soLuongDichVu;
        }

        public BigDecimal getDonGiaDichVu() {
            return donGiaDichVu;
        }

        public void setDonGiaDichVu(BigDecimal donGiaDichVu) {
            this.donGiaDichVu = donGiaDichVu;
        }

        public BigDecimal getDonGiaDuocTinh() {
            return donGiaDuocTinh;
        }

        public void setDonGiaDuocTinh(BigDecimal donGiaDuocTinh) {
            this.donGiaDuocTinh = donGiaDuocTinh;
        }

        public BigDecimal getThanhTien() {
            return thanhTien;
        }

        public void setThanhTien(BigDecimal thanhTien) {
            this.thanhTien = thanhTien;
        }

        public BigDecimal getTienTraTruoc() {
            return tienTraTruoc;
        }

        public void setTienTraTruoc(BigDecimal tienTraTruoc) {
            this.tienTraTruoc = tienTraTruoc;
        }

        public BigDecimal getTienConLai() {
            return tienConLai;
        }

        public void setTienConLai(BigDecimal tienConLai) {
            this.tienConLai = tienConLai;
        }

        public LocalDate getNgayGiao() {
            return ngayGiao;
        }

        public void setNgayGiao(LocalDate ngayGiao) {
            this.ngayGiao = ngayGiao;
        }

        public String getTinhTrang() {
            return tinhTrang;
        }

        public void setTinhTrang(String tinhTrang) {
            this.tinhTrang = tinhTrang;
        }
    }
}
