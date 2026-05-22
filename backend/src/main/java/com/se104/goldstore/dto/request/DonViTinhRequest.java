package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class DonViTinhRequest {

    private String maDonViTinh;

    @NotBlank(message = "Ten don vi tinh khong duoc de trong")
    private String tenDonViTinh;

    private String loaiDonVi;

    @DecimalMin(value = "0", inclusive = true, message = "He so quy doi phai >= 0")
    private BigDecimal heSoQuyDoi;

    private String ghiChu;

    private Boolean isActive;

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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
