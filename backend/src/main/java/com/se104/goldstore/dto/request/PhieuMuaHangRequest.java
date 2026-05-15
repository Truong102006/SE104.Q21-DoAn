package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PhieuMuaHangRequest {

    private String soPhieuMua;

    @NotNull(message = "Ngay lap phieu mua khong duoc de trong")
    private LocalDate ngayLapPhieuMua;

    @NotBlank(message = "Ma nha cung cap khong duoc de trong")
    private String maNhaCungCap;

    @NotNull(message = "Tong tien khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Tong tien phai >= 0")
    private BigDecimal tongTien;

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
}
