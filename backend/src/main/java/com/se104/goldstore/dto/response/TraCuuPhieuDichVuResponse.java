package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TraCuuPhieuDichVuResponse {

    private String soPhieuDichVu;
    private LocalDate ngayLapPhieuDichVu;
    private String tenKhachHang;
    private BigDecimal tongTien;
    private BigDecimal tongTienTraTruoc;
    private BigDecimal tongTienConLai;
    private String tinhTrangDichVu;

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

    public String getTenKhachHang() {
        return tenKhachHang;
    }

    public void setTenKhachHang(String tenKhachHang) {
        this.tenKhachHang = tenKhachHang;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
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

    public String getTinhTrangDichVu() {
        return tinhTrangDichVu;
    }

    public void setTinhTrangDichVu(String tinhTrangDichVu) {
        this.tinhTrangDichVu = tinhTrangDichVu;
    }
}
