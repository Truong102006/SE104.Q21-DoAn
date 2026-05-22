package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "loai_dich_vu")
public class LoaiDichVu {

    @Id
    @Column(name = "ma_loai_dich_vu", length = 20, nullable = false)
    private String maLoaiDichVu;

    @Column(name = "ten_loai_dich_vu", length = 255, nullable = false, unique = true)
    private String tenLoaiDichVu;

    @Column(name = "don_gia_dich_vu", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaDichVu;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public String getMaLoaiDichVu() {
        return maLoaiDichVu;
    }

    public void setMaLoaiDichVu(String maLoaiDichVu) {
        this.maLoaiDichVu = maLoaiDichVu;
    }

    public String getTenLoaiDichVu() {
        return tenLoaiDichVu;
    }

    public void setTenLoaiDichVu(String tenLoaiDichVu) {
        this.tenLoaiDichVu = tenLoaiDichVu;
    }

    public BigDecimal getDonGiaDichVu() {
        return donGiaDichVu;
    }

    public void setDonGiaDichVu(BigDecimal donGiaDichVu) {
        this.donGiaDichVu = donGiaDichVu;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
