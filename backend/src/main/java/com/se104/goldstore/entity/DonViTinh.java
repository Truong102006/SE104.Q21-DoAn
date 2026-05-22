package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "don_vi_tinh")
public class DonViTinh {

    @Id
    @Column(name = "ma_don_vi_tinh", length = 20, nullable = false)
    private String maDonViTinh;

    @Column(name = "ten_don_vi_tinh", length = 50, nullable = false, unique = true)
    private String tenDonViTinh;

    @Column(name = "loai_don_vi", length = 50)
    private String loaiDonVi;

    @Column(name = "he_so_quy_doi")
    private BigDecimal heSoQuyDoi;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public String getMaDonViTinh() {
        return maDonViTinh;
    }

    public void setMaDonViTinh(String maDonViTinh) {
        this.maDonViTinh = maDonViTinh;
    }

    public String getTenDonViTinh() {
        return tenDonViTinh;
    }

    public void setTenDonViTinh(String tenDonViTinh) {
        this.tenDonViTinh = tenDonViTinh;
    }

    public String getLoaiDonVi() {
        return loaiDonVi;
    }

    public void setLoaiDonVi(String loaiDonVi) {
        this.loaiDonVi = loaiDonVi;
    }

    public BigDecimal getHeSoQuyDoi() {
        return heSoQuyDoi;
    }

    public void setHeSoQuyDoi(BigDecimal heSoQuyDoi) {
        this.heSoQuyDoi = heSoQuyDoi;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
