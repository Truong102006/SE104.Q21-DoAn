package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "san_pham")
public class SanPham {

    @Id
    @Column(name = "ma_san_pham", length = 20, nullable = false)
    private String maSanPham;

    @Column(name = "ten_san_pham", length = 255, nullable = false)
    private String tenSanPham;

    @Column(name = "ma_loai_san_pham", length = 20, nullable = false)
    private String maLoaiSanPham;

    @Column(name = "don_gia_mua", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaMua;

    @Column(name = "don_gia_ban", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaBan;

    @Column(name = "ton_kho", nullable = false)
    private Integer tonKho;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_loai_san_pham", referencedColumnName = "ma_loai_san_pham", insertable = false, updatable = false)
    private LoaiSanPham loaiSanPham;

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public String getTenSanPham() {
        return tenSanPham;
    }

    public void setTenSanPham(String tenSanPham) {
        this.tenSanPham = tenSanPham;
    }

    public String getMaLoaiSanPham() {
        return maLoaiSanPham;
    }

    public void setMaLoaiSanPham(String maLoaiSanPham) {
        this.maLoaiSanPham = maLoaiSanPham;
    }

    public BigDecimal getDonGiaMua() {
        return donGiaMua;
    }

    public void setDonGiaMua(BigDecimal donGiaMua) {
        this.donGiaMua = donGiaMua;
    }

    public BigDecimal getDonGiaBan() {
        return donGiaBan;
    }

    public void setDonGiaBan(BigDecimal donGiaBan) {
        this.donGiaBan = donGiaBan;
    }

    public Integer getTonKho() {
        return tonKho;
    }

    public void setTonKho(Integer tonKho) {
        this.tonKho = tonKho;
    }

    public LoaiSanPham getLoaiSanPham() {
        return loaiSanPham;
    }

    public void setLoaiSanPham(LoaiSanPham loaiSanPham) {
        this.loaiSanPham = loaiSanPham;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
