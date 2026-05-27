package com.se104.goldstore.dto.response;

import java.math.BigDecimal;

public class LoaiSanPhamResponse {

    private String maLoaiSanPham;
    private String tenLoaiSanPham;
    private BigDecimal tiLeLoiNhuan;
    private Boolean isActive;
    private String maDonViTinh;
    private String tenDonViTinh;

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
}
