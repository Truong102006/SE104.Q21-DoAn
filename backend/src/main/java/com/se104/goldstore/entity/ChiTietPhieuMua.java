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
@Table(name = "ct_phieu_mua")
@IdClass(ChiTietPhieuMua.ChiTietPhieuMuaId.class)
public class ChiTietPhieuMua {

    @Id
    @Column(name = "so_phieu_mua", length = 20, nullable = false)
    private String soPhieuMua;

    @Id
    @Column(name = "ma_san_pham", length = 20, nullable = false)
    private String maSanPham;

    @Column(name = "so_luong_mua", nullable = false)
    private Integer soLuongMua;

    @Column(name = "ma_don_vi_tinh", length = 20, nullable = false)
    private String maDonViTinh;

    @Column(name = "don_gia", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGia;

    @Column(name = "thanh_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_phieu_mua", referencedColumnName = "so_phieu_mua", insertable = false, updatable = false)
    private PhieuMuaHang phieuMuaHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_san_pham", referencedColumnName = "ma_san_pham", insertable = false, updatable = false)
    private SanPham sanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_don_vi_tinh", referencedColumnName = "ma_don_vi_tinh", insertable = false, updatable = false)
    private DonViTinh donViTinh;

    public String getSoPhieuMua() {
        return soPhieuMua;
    }

    public void setSoPhieuMua(String soPhieuMua) {
        this.soPhieuMua = soPhieuMua;
    }

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public Integer getSoLuongMua() {
        return soLuongMua;
    }

    public void setSoLuongMua(Integer soLuongMua) {
        this.soLuongMua = soLuongMua;
    }

    public String getMaDonViTinh() {
        return maDonViTinh;
    }

    public void setMaDonViTinh(String maDonViTinh) {
        this.maDonViTinh = maDonViTinh;
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

    public PhieuMuaHang getPhieuMuaHang() {
        return phieuMuaHang;
    }

    public void setPhieuMuaHang(PhieuMuaHang phieuMuaHang) {
        this.phieuMuaHang = phieuMuaHang;
    }

    public SanPham getSanPham() {
        return sanPham;
    }

    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }

    public DonViTinh getDonViTinh() {
        return donViTinh;
    }

    public void setDonViTinh(DonViTinh donViTinh) {
        this.donViTinh = donViTinh;
    }

    public static class ChiTietPhieuMuaId implements Serializable {
        private String soPhieuMua;
        private String maSanPham;

        public ChiTietPhieuMuaId() {
        }

        public ChiTietPhieuMuaId(String soPhieuMua, String maSanPham) {
            this.soPhieuMua = soPhieuMua;
            this.maSanPham = maSanPham;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof ChiTietPhieuMuaId that)) {
                return false;
            }
            return Objects.equals(soPhieuMua, that.soPhieuMua)
                && Objects.equals(maSanPham, that.maSanPham);
        }

        @Override
        public int hashCode() {
            return Objects.hash(soPhieuMua, maSanPham);
        }
    }
}
