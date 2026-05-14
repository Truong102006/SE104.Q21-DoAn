package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "khach_hang")
public class KhachHang {

    @Id
    @Column(name = "ma_khach_hang", length = 20, nullable = false)
    private String maKhachHang;

    @Column(name = "ten_khach_hang", length = 255, nullable = false)
    private String tenKhachHang;

    @Column(name = "so_dien_thoai_khach_hang", length = 10, nullable = false, unique = true)
    private String soDienThoaiKhachHang;

    @Column(name = "dia_chi_khach_hang", length = 255)
    private String diaChiKhachHang;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    public String getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(String maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public String getTenKhachHang() {
        return tenKhachHang;
    }

    public void setTenKhachHang(String tenKhachHang) {
        this.tenKhachHang = tenKhachHang;
    }

    public String getSoDienThoaiKhachHang() {
        return soDienThoaiKhachHang;
    }

    public void setSoDienThoaiKhachHang(String soDienThoaiKhachHang) {
        this.soDienThoaiKhachHang = soDienThoaiKhachHang;
    }

    public String getDiaChiKhachHang() {
        return diaChiKhachHang;
    }

    public void setDiaChiKhachHang(String diaChiKhachHang) {
        this.diaChiKhachHang = diaChiKhachHang;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}
