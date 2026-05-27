package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "loai_san_pham")
public class LoaiSanPham {

    @Id
    @Column(name = "ma_loai_san_pham", length = 20, nullable = false)
    private String maLoaiSanPham;

    @Column(name = "ten_loai_san_pham", length = 255, nullable = false, unique = true)
    private String tenLoaiSanPham;

    @Column(name = "ti_le_loi_nhuan", nullable = false, precision = 5, scale = 2)
    private BigDecimal tiLeLoiNhuan;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "ma_don_vi_tinh", length = 20, nullable = false)
    private String maDonViTinh;

    @jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @jakarta.persistence.JoinColumn(name = "ma_don_vi_tinh", referencedColumnName = "ma_don_vi_tinh", insertable = false, updatable = false)
    private DonViTinh donViTinh;

    public String getMaLoaiSanPham() {
        return maLoaiSanPham;
    }

    public void setMaLoaiSanPham(String maLoaiSanPham) {
        this.maLoaiSanPham = maLoaiSanPham;
    }

    public String getTenLoaiSanPham() {
        return tenLoaiSanPham;
    }

    public void setTenLoaiSanPham(String tenLoaiSanPham) {
        this.tenLoaiSanPham = tenLoaiSanPham;
    }

    public BigDecimal getTiLeLoiNhuan() {
        return tiLeLoiNhuan;
    }

    public void setTiLeLoiNhuan(BigDecimal tiLeLoiNhuan) {
        this.tiLeLoiNhuan = tiLeLoiNhuan;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getMaDonViTinh() {
        return maDonViTinh;
    }

    public void setMaDonViTinh(String maDonViTinh) {
        this.maDonViTinh = maDonViTinh;
    }

    public DonViTinh getDonViTinh() {
        return donViTinh;
    }

    public void setDonViTinh(DonViTinh donViTinh) {
        this.donViTinh = donViTinh;
    }
}
