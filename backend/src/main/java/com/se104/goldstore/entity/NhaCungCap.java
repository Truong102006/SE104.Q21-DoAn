package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "nha_cung_cap")
public class NhaCungCap {

    @Id
    @Column(name = "ma_nha_cung_cap", length = 20, nullable = false)
    private String maNhaCungCap;

    @Column(name = "ten_nha_cung_cap", length = 255, nullable = false)
    private String tenNhaCungCap;

    @Column(name = "so_dien_thoai", length = 10, nullable = false, unique = true)
    private String soDienThoai;

    @Column(name = "dia_chi", length = 255)
    private String diaChi;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    public String getMaNhaCungCap() {
        return maNhaCungCap;
    }

    public void setMaNhaCungCap(String maNhaCungCap) {
        this.maNhaCungCap = maNhaCungCap;
    }

    public String getTenNhaCungCap() {
        return tenNhaCungCap;
    }

    public void setTenNhaCungCap(String tenNhaCungCap) {
        this.tenNhaCungCap = tenNhaCungCap;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}
