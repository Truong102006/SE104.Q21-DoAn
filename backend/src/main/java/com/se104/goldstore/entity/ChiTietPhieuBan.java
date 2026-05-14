package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "ct_phieu_ban")
@IdClass(ChiTietPhieuBan.ChiTietPhieuBanId.class)
public class ChiTietPhieuBan {

    @Id
    @Column(name = "so_phieu_ban", length = 20, nullable = false)
    private String soPhieuBan;

    @Id
    @Column(name = "ma_san_pham", length = 20, nullable = false)
    private String maSanPham;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;

    @Column(name = "thanh_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_phieu_ban", referencedColumnName = "so_phieu_ban", insertable = false, updatable = false)
    private PhieuBanHang phieuBanHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_san_pham", referencedColumnName = "ma_san_pham", insertable = false, updatable = false)
    private SanPham sanPham;

    public String getSoPhieuBan() {
        return soPhieuBan;
    }

    public void setSoPhieuBan(String soPhieuBan) {
        this.soPhieuBan = soPhieuBan;
    }

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    public BigDecimal getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(BigDecimal thanhTien) {
        this.thanhTien = thanhTien;
    }

    public PhieuBanHang getPhieuBanHang() {
        return phieuBanHang;
    }

    public void setPhieuBanHang(PhieuBanHang phieuBanHang) {
        this.phieuBanHang = phieuBanHang;
    }

    public SanPham getSanPham() {
        return sanPham;
    }

    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }

    public static class ChiTietPhieuBanId implements Serializable {
        private String soPhieuBan;
        private String maSanPham;

        public ChiTietPhieuBanId() {
        }

        public ChiTietPhieuBanId(String soPhieuBan, String maSanPham) {
            this.soPhieuBan = soPhieuBan;
            this.maSanPham = maSanPham;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof ChiTietPhieuBanId that)) {
                return false;
            }
            return Objects.equals(soPhieuBan, that.soPhieuBan)
                && Objects.equals(maSanPham, that.maSanPham);
        }

        @Override
        public int hashCode() {
            return Objects.hash(soPhieuBan, maSanPham);
        }
    }
}
