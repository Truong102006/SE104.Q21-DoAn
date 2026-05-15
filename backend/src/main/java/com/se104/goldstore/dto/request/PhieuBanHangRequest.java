package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PhieuBanHangRequest {

    private String soPhieuBan;

    @NotNull(message = "Ngay lap phieu ban khong duoc de trong")
    private LocalDate ngayLapPhieuBan;

    @NotBlank(message = "Ma khach hang khong duoc de trong")
    private String maKhachHang;

    @NotNull(message = "Tong tien khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Tong tien phai >= 0")
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
