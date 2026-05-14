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
@Table(name = "phieu_mua_hang")
public class PhieuMuaHang {

    @Id
    @Column(name = "so_phieu_mua", length = 20, nullable = false)
    private String soPhieuMua;

    @Column(name = "ngay_lap_phieu_mua", nullable = false)
    private LocalDate ngayLapPhieuMua;

    @Column(name = "ma_nha_cung_cap", length = 20, nullable = false)
    private String maNhaCungCap;

    @Column(name = "tong_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal tongTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nha_cung_cap", referencedColumnName = "ma_nha_cung_cap", insertable = false, updatable = false)
    private NhaCungCap nhaCungCap;

    public String getSoPhieuMua() {
        return soPhieuMua;
    }

    public void setSoPhieuMua(String soPhieuMua) {
        this.soPhieuMua = soPhieuMua;
    }

    public LocalDate getNgayLapPhieuMua() {
        return ngayLapPhieuMua;
    }

    public void setNgayLapPhieuMua(LocalDate ngayLapPhieuMua) {
        this.ngayLapPhieuMua = ngayLapPhieuMua;
    }

    public String getMaNhaCungCap() {
        return maNhaCungCap;
    }

    public void setMaNhaCungCap(String maNhaCungCap) {
        this.maNhaCungCap = maNhaCungCap;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public NhaCungCap getNhaCungCap() {
        return nhaCungCap;
    }

    public void setNhaCungCap(NhaCungCap nhaCungCap) {
        this.nhaCungCap = nhaCungCap;
    }
}
