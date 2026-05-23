package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

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

    @Column(name = "ma_don_vi_tinh", length = 20, nullable = false)
    private String maDonViTinh;

    @Column(name = "don_gia_mua", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaMua;

    @Column(name = "don_gia_ban", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaBan;

    @Column(name = "ton_kho", nullable = false)
    private Integer tonKho;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_loai_san_pham", referencedColumnName = "ma_loai_san_pham", insertable = false, updatable = false)
    private LoaiSanPham loaiSanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_don_vi_tinh", referencedColumnName = "ma_don_vi_tinh", insertable = false, updatable = false)
    private DonViTinh donViTinh;

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

    public String getMaDonViTinh() {
        return maDonViTinh;
    }

    public void setMaDonViTinh(String maDonViTinh) {
        this.maDonViTinh = maDonViTinh;
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

    public DonViTinh getDonViTinh() {
        return donViTinh;
    }

    public void setDonViTinh(DonViTinh donViTinh) {
        this.donViTinh = donViTinh;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
