package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "phieu_ban_hang")
public class PhieuBanHang {

    @Id
    @Column(name = "so_phieu_ban", length = 20, nullable = false)
    private String soPhieuBan;

    @Column(name = "ngay_lap_phieu_ban", nullable = false)
    private LocalDate ngayLapPhieuBan;

    @Column(name = "ma_khach_hang", length = 20, nullable = false)
    private String maKhachHang;

    @Column(name = "tong_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_khach_hang", referencedColumnName = "ma_khach_hang", insertable = false, updatable = false)
    private KhachHang khachHang;

    public String getSoPhieuBan() {
        return soPhieuBan;
    }

    public void setSoPhieuBan(String soPhieuBan) {
        this.soPhieuBan = soPhieuBan;
    }

    public LocalDate getNgayLapPhieuBan() {
        return ngayLapPhieuBan;
    }

    public void setNgayLapPhieuBan(LocalDate ngayLapPhieuBan) {
        this.ngayLapPhieuBan = ngayLapPhieuBan;
    }

    public String getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(String maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public KhachHang getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(KhachHang khachHang) {
        this.khachHang = khachHang;
    }
}
