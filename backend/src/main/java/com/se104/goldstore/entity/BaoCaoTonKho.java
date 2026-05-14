package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bao_cao_ton_kho")
public class BaoCaoTonKho {

    @Id
    @Column(name = "ma_bao_cao_ton_kho", length = 20, nullable = false)
    private String maBaoCaoTonKho;

    @Column(name = "thang", nullable = false)
    private Integer thang;

    @Column(name = "nam", nullable = false)
    private Integer nam;

    public String getMaBaoCaoTonKho() {
        return maBaoCaoTonKho;
    }

    public void setMaBaoCaoTonKho(String maBaoCaoTonKho) {
        this.maBaoCaoTonKho = maBaoCaoTonKho;
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
}
