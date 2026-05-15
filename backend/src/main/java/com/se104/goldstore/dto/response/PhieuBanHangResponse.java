package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PhieuBanHangResponse {

    private String soPhieuBan;
    private LocalDate ngayLapPhieuBan;
    private String maKhachHang;
    private BigDecimal tongTien;

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
}
