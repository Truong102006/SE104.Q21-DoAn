package com.se104.goldstore.dto.response;

import java.math.BigDecimal;

public class LoaiSanPhamResponse {

    private String maLoaiSanPham;
    private String tenLoaiSanPham;
    private BigDecimal tiLeLoiNhuan;

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
}
