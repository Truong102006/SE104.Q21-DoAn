package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "nhom_nguoi_dung")
public class NhomNguoiDung {

    @Id
    @Column(name = "ma_nhom", length = 20, nullable = false)
    private String maNhom;

    @Column(name = "ten_nhom", length = 255, nullable = false, unique = true)
    private String tenNhom;

    public String getMaNhom() {
        return maNhom;
    }

    public void setMaNhom(String maNhom) {
        this.maNhom = maNhom;
    }

    public String getTenNhom() {
        return tenNhom;
    }

    public void setTenNhom(String tenNhom) {
        this.tenNhom = tenNhom;
    }
}
