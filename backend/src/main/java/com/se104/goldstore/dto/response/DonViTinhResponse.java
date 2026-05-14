package com.se104.goldstore.dto.response;

import java.math.BigDecimal;

public class DonViTinhResponse {

    private String maDonViTinh;
    private String tenDonViTinh;
    private String loaiDonVi;
    private BigDecimal heSoQuyDoi;
    private String ghiChu;

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

    public BigDecimal getHeSoQuyDoi() {
        return heSoQuyDoi;
    }

    public void setHeSoQuyDoi(BigDecimal heSoQuyDoi) {
        this.heSoQuyDoi = heSoQuyDoi;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}
