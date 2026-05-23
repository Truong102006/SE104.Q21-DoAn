package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class LoaiDichVuRequest {

    private String maLoaiDichVu;

    @NotBlank(message = "Ten loai dich vu khong duoc de trong")
    private String tenLoaiDichVu;

    @NotNull(message = "Don gia dich vu khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Don gia dich vu phai >= 0")
    private BigDecimal donGiaDichVu;
    private Boolean isActive;

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

    public BigDecimal getDonGiaDichVu() {
        return donGiaDichVu;
    }

    public void setDonGiaDichVu(BigDecimal donGiaDichVu) {
        this.donGiaDichVu = donGiaDichVu;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
