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
@Table(name = "ct_bao_cao_doanh_thu_sp")
@IdClass(ChiTietBaoCaoDoanhThuSanPham.ChiTietBaoCaoDoanhThuSanPhamId.class)
public class ChiTietBaoCaoDoanhThuSanPham {

    @Id
    @Column(name = "ma_bao_cao_doanh_thu_sp", length = 20, nullable = false)
    private String maBaoCaoDoanhThuSp;

    @Id
    @Column(name = "ma_san_pham", length = 20, nullable = false)
    private String maSanPham;

    @Column(name = "doanh_thu_san_pham", nullable = false, precision = 18, scale = 2)
    private BigDecimal doanhThuSanPham;

    @Column(name = "ti_le_san_pham", nullable = false, precision = 5, scale = 2)
    private BigDecimal tiLeSanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bao_cao_doanh_thu_sp", referencedColumnName = "ma_bao_cao_doanh_thu_sp", insertable = false, updatable = false)
    private BaoCaoDoanhThuSanPham baoCaoDoanhThuSanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_san_pham", referencedColumnName = "ma_san_pham", insertable = false, updatable = false)
    private SanPham sanPham;

    public String getMaBaoCaoDoanhThuSp() {
        return maBaoCaoDoanhThuSp;
    }

    public void setMaBaoCaoDoanhThuSp(String maBaoCaoDoanhThuSp) {
        this.maBaoCaoDoanhThuSp = maBaoCaoDoanhThuSp;
    }

    public String getMaSanPham() {
        return maSanPham;
    }

    public void setMaSanPham(String maSanPham) {
        this.maSanPham = maSanPham;
    }

    public BigDecimal getDoanhThuSanPham() {
        return doanhThuSanPham;
    }

    public void setDoanhThuSanPham(BigDecimal doanhThuSanPham) {
        this.doanhThuSanPham = doanhThuSanPham;
    }

    public BigDecimal getTiLeSanPham() {
        return tiLeSanPham;
    }

    public void setTiLeSanPham(BigDecimal tiLeSanPham) {
        this.tiLeSanPham = tiLeSanPham;
    }

    public BaoCaoDoanhThuSanPham getBaoCaoDoanhThuSanPham() {
        return baoCaoDoanhThuSanPham;
    }

    public void setBaoCaoDoanhThuSanPham(BaoCaoDoanhThuSanPham baoCaoDoanhThuSanPham) {
        this.baoCaoDoanhThuSanPham = baoCaoDoanhThuSanPham;
    }

    public SanPham getSanPham() {
        return sanPham;
    }

    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }

    public static class ChiTietBaoCaoDoanhThuSanPhamId implements Serializable {
        private String maBaoCaoDoanhThuSp;
        private String maSanPham;

        public ChiTietBaoCaoDoanhThuSanPhamId() {
        }

        public ChiTietBaoCaoDoanhThuSanPhamId(String maBaoCaoDoanhThuSp, String maSanPham) {
            this.maBaoCaoDoanhThuSp = maBaoCaoDoanhThuSp;
            this.maSanPham = maSanPham;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof ChiTietBaoCaoDoanhThuSanPhamId that)) {
                return false;
            }
            return Objects.equals(maBaoCaoDoanhThuSp, that.maBaoCaoDoanhThuSp)
                && Objects.equals(maSanPham, that.maSanPham);
        }

        @Override
        public int hashCode() {
            return Objects.hash(maBaoCaoDoanhThuSp, maSanPham);
        }
    }
}
