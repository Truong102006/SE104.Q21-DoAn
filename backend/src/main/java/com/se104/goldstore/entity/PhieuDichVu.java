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
@Table(name = "phieu_dich_vu")
public class PhieuDichVu {

    @Id
    @Column(name = "so_phieu_dich_vu", length = 20, nullable = false)
    private String soPhieuDichVu;

    @Column(name = "ngay_lap_phieu_dich_vu", nullable = false)
    private LocalDate ngayLapPhieuDichVu;

    @Column(name = "ma_khach_hang", length = 20, nullable = false)
    private String maKhachHang;

    @Column(name = "tong_tien_tra_truoc", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTienTraTruoc;

    @Column(name = "tong_tien_con_lai", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTienConLai;

    @Column(name = "tong_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "tinh_trang_dich_vu", length = 50, nullable = false)
    private String tinhTrangDichVu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_khach_hang", referencedColumnName = "ma_khach_hang", insertable = false, updatable = false)
    private KhachHang khachHang;

    public String getSoPhieuDichVu() {
        return soPhieuDichVu;
    }

    public void setSoPhieuDichVu(String soPhieuDichVu) {
        this.soPhieuDichVu = soPhieuDichVu;
    }

    public LocalDate getNgayLapPhieuDichVu() {
        return ngayLapPhieuDichVu;
    }

    public void setNgayLapPhieuDichVu(LocalDate ngayLapPhieuDichVu) {
        this.ngayLapPhieuDichVu = ngayLapPhieuDichVu;
    }

    public String getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(String maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public BigDecimal getTongTienTraTruoc() {
        return tongTienTraTruoc;
    }

    public void setTongTienTraTruoc(BigDecimal tongTienTraTruoc) {
        this.tongTienTraTruoc = tongTienTraTruoc;
    }

    public BigDecimal getTongTienConLai() {
        return tongTienConLai;
    }

    public void setTongTienConLai(BigDecimal tongTienConLai) {
        this.tongTienConLai = tongTienConLai;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public String getTinhTrangDichVu() {
        return tinhTrangDichVu;
    }

    public void setTinhTrangDichVu(String tinhTrangDichVu) {
        this.tinhTrangDichVu = tinhTrangDichVu;
    }

    public KhachHang getKhachHang() {
        return khachHang;
    }

    public void setKhachHang(KhachHang khachHang) {
        this.khachHang = khachHang;
    }
}
