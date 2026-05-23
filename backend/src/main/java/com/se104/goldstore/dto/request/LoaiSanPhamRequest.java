package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class LoaiSanPhamRequest {

    private String maLoaiSanPham;

    @NotBlank(message = "Ten loai san pham khong duoc de trong")
    private String tenLoaiSanPham;

    @NotNull(message = "Ti le loi nhuan khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Ti le loi nhuan phai >= 0")
    private BigDecimal tiLeLoiNhuan;
    private Boolean isActive;

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

    public BigDecimal getTiLeLoiNhuan() {
        return tiLeLoiNhuan;
    }

    public void setTiLeLoiNhuan(BigDecimal tiLeLoiNhuan) {
        this.tiLeLoiNhuan = tiLeLoiNhuan;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
