package com.se104.goldstore.dto.response;

import java.math.BigDecimal;

public class BaoCaoDoanhThuSanPhamResponse {

    private String maBaoCaoDoanhThuSp;
    private Integer thang;
    private Integer nam;
    private BigDecimal tongDoanhThuSanPham;

    public String getMaBaoCaoDoanhThuSp() {
        return maBaoCaoDoanhThuSp;
    }

    public void setMaBaoCaoDoanhThuSp(String maBaoCaoDoanhThuSp) {
        this.maBaoCaoDoanhThuSp = maBaoCaoDoanhThuSp;
    }

    public Integer getThang() {
        return thang;
    }

    public void setThang(Integer thang) {
        this.thang = thang;
    }

    public Integer getNam() {
        return nam;
    }

    public void setNam(Integer nam) {
        this.nam = nam;
    }

    public BigDecimal getTongDoanhThuSanPham() {
        return tongDoanhThuSanPham;
    }

    public void setTongDoanhThuSanPham(BigDecimal tongDoanhThuSanPham) {
        this.tongDoanhThuSanPham = tongDoanhThuSanPham;
    }
}