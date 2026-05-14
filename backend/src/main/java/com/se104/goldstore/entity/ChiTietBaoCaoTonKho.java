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
import java.util.Objects;

@Entity
@Table(name = "ct_bao_cao_ton_kho")
@IdClass(ChiTietBaoCaoTonKho.ChiTietBaoCaoTonKhoId.class)
public class ChiTietBaoCaoTonKho {

    @Id
    @Column(name = "ma_bao_cao_ton_kho", length = 20, nullable = false)
    private String maBaoCaoTonKho;

    @Id
    @Column(name = "ma_san_pham", length = 20, nullable = false)
    private String maSanPham;

    @Column(name = "ton_dau", nullable = false)
    private Integer tonDau;

    @Column(name = "so_luong_mua_vao", nullable = false)
    private Integer soLuongMuaVao;

    @Column(name = "so_luong_ban_ra", nullable = false)
    private Integer soLuongBanRa;

    @Column(name = "ton_cuoi", nullable = false)
    private Integer tonCuoi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bao_cao_ton_kho", referencedColumnName = "ma_bao_cao_ton_kho", insertable = false, updatable = false)
    private BaoCaoTonKho baoCaoTonKho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_san_pham", referencedColumnName = "ma_san_pham", insertable = false, updatable = false)
    private SanPham sanPham;

    public String getMaBaoCaoTonKho() {
        return maBaoCaoTonKho;
    }

    public void setMaBaoCaoTonKho(String maBaoCaoTonKho) {
        this.maBaoCaoTonKho = maBaoCaoTonKho;
    }

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public Integer getTonDau() {
        return tonDau;
    }

    public void setTonDau(Integer tonDau) {
        this.tonDau = tonDau;
    }

    public Integer getSoLuongMuaVao() {
        return soLuongMuaVao;
    }

    public void setSoLuongMuaVao(Integer soLuongMuaVao) {
        this.soLuongMuaVao = soLuongMuaVao;
    }

    public Integer getSoLuongBanRa() {
        return soLuongBanRa;
    }

    public void setSoLuongBanRa(Integer soLuongBanRa) {
        this.soLuongBanRa = soLuongBanRa;
    }

    public Integer getTonCuoi() {
        return tonCuoi;
    }

    public void setTonCuoi(Integer tonCuoi) {
        this.tonCuoi = tonCuoi;
    }

    public BaoCaoTonKho getBaoCaoTonKho() {
        return baoCaoTonKho;
    }

    public void setBaoCaoTonKho(BaoCaoTonKho baoCaoTonKho) {
        this.baoCaoTonKho = baoCaoTonKho;
    }

    public SanPham getSanPham() {
        return sanPham;
    }

    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }

    public static class ChiTietBaoCaoTonKhoId implements Serializable {
        private String maBaoCaoTonKho;
        private String maSanPham;

        public ChiTietBaoCaoTonKhoId() {
        }

        public ChiTietBaoCaoTonKhoId(String maBaoCaoTonKho, String maSanPham) {
            this.maBaoCaoTonKho = maBaoCaoTonKho;
            this.maSanPham = maSanPham;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof ChiTietBaoCaoTonKhoId that)) {
                return false;
            }
            return Objects.equals(maBaoCaoTonKho, that.maBaoCaoTonKho)
                && Objects.equals(maSanPham, that.maSanPham);
        }

        @Override
        public int hashCode() {
            return Objects.hash(maBaoCaoTonKho, maSanPham);
        }
    }
}
