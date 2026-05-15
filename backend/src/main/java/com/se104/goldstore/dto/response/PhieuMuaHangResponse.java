package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PhieuMuaHangResponse {

    private String soPhieuMua;
    private LocalDate ngayLapPhieuMua;
    private String maNhaCungCap;
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
