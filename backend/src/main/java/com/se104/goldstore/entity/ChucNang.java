package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chuc_nang")
public class ChucNang {

    @Id
    @Column(name = "ma_chuc_nang", length = 20, nullable = false)
    private String maChucNang;

    @Column(name = "ten_chuc_nang", length = 255, nullable = false)
    private String tenChucNang;

    @Column(name = "ten_man_hinh_load", length = 255)
    private String tenManHinhLoad;

    public String getMaChucNang() {
        return maChucNang;
    }

    public void setMaChucNang(String maChucNang) {
        this.maChucNang = maChucNang;
    }

    public String getTenChucNang() {
        return tenChucNang;
    }

    public void setTenChucNang(String tenChucNang) {
        this.tenChucNang = tenChucNang;
    }

    public String getTenManHinhLoad() {
        return tenManHinhLoad;
    }

    public void setTenManHinhLoad(String tenManHinhLoad) {
        this.tenManHinhLoad = tenManHinhLoad;
    }
}
