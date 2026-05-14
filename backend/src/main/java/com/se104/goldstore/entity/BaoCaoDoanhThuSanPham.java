package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "bao_cao_doanh_thu_sp")
public class BaoCaoDoanhThuSanPham {

    @Id
    @Column(name = "ma_bao_cao_doanh_thu_sp", length = 20, nullable = false)
    private String maBaoCaoDoanhThuSp;

    @Column(name = "thang", nullable = false)
    private Integer thang;

    @Column(name = "nam", nullable = false)
    private Integer nam;

    @Column(name = "tong_doanh_thu_san_pham", nullable = false, precision = 18, scale = 2)
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
