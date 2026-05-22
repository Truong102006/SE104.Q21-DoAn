package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SanPhamRequest {

    private String maSanPham;

    @NotBlank(message = "Ten san pham khong duoc de trong")
    private String tenSanPham;

    @NotBlank(message = "Ma loai san pham khong duoc de trong")
    private String maLoaiSanPham;

    @NotBlank(message = "Ma don vi tinh khong duoc de trong")
    private String maDonViTinh;

    @NotNull(message = "Don gia mua khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Don gia mua phai >= 0")
    private BigDecimal donGiaMua;

    @DecimalMin(value = "0", inclusive = true, message = "Don gia ban phai >= 0")
    private BigDecimal donGiaBan;

    @Min(value = 0, message = "Ton kho phai >= 0")
    private Integer tonKho;

    private Boolean isActive;

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getMaLoaiSanPham() {
        return maLoaiSanPham;
    }

    public void setMaLoaiSanPham(String maLoaiSanPham) {
        this.maLoaiSanPham = maLoaiSanPham;
    }

    public String getMaDonViTinh() {
        return maDonViTinh;
    }

    public void setMaDonViTinh(String maDonViTinh) {
        this.maDonViTinh = maDonViTinh;
    }

    public BigDecimal getDonGiaMua() {
        return donGiaMua;
    }

    public void setDonGiaMua(BigDecimal donGiaMua) {
        this.donGiaMua = donGiaMua;
    }

    public BigDecimal getDonGiaBan() {
        return donGiaBan;
    }

    public void setDonGiaBan(BigDecimal donGiaBan) {
        this.donGiaBan = donGiaBan;
    }

    public Integer getTonKho() {
        return tonKho;
    }

    public void setTonKho(Integer tonKho) {
        this.tonKho = tonKho;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
