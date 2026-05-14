package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "bao_cao_doanh_thu_dv")
public class BaoCaoDoanhThuDichVu {

    @Id
    @Column(name = "ma_bao_cao_doanh_thu_dv", length = 20, nullable = false)
    private String maBaoCaoDoanhThuDv;

    @Column(name = "thang", nullable = false)
    private Integer thang;

    @Column(name = "nam", nullable = false)
    private Integer nam;

    @Column(name = "tong_doanh_thu_dich_vu", nullable = false, precision = 18, scale = 2)
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
