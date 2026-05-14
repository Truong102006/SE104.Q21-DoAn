package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "tham_so")
public class ThamSo {

    @Id
    @Column(name = "ma_tham_so", length = 20, nullable = false)
    private String maThamSo;

    @Column(name = "ten_tham_so", length = 255, unique = true)
    private String tenThamSo;

    @Column(name = "gia_tri", precision = 18, scale = 4)
    private BigDecimal giaTri;

    public String getMaThamSo() {
        return maThamSo;
    }

    public void setMaThamSo(String maThamSo) {
        this.maThamSo = maThamSo;
    }

    public String getTenThamSo() {
        return tenThamSo;
    }

    public void setTenThamSo(String tenThamSo) {
        this.tenThamSo = tenThamSo;
    }

    public BigDecimal getGiaTri() {
        return giaTri;
    }

    public void setGiaTri(BigDecimal giaTri) {
        this.giaTri = giaTri;
    }
}
