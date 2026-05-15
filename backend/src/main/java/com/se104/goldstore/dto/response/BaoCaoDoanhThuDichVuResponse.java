package com.se104.goldstore.dto.response;

import java.math.BigDecimal;

public class BaoCaoDoanhThuDichVuResponse {

    private String maBaoCaoDoanhThuDv;
    private Integer thang;
    private Integer nam;
    private BigDecimal tongDoanhThuDichVu;

    public String getMaBaoCaoDoanhThuDv() {
        return maBaoCaoDoanhThuDv;
    }

    public void setMaBaoCaoDoanhThuDv(String maBaoCaoDoanhThuDv) {
        this.maBaoCaoDoanhThuDv = maBaoCaoDoanhThuDv;
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

    public BigDecimal getTongDoanhThuDichVu() {
        return tongDoanhThuDichVu;
    }

    public void setTongDoanhThuDichVu(BigDecimal tongDoanhThuDichVu) {
        this.tongDoanhThuDichVu = tongDoanhThuDichVu;
    }
}