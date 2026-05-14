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
@Table(name = "ct_bao_cao_doanh_thu_dv")
@IdClass(ChiTietBaoCaoDoanhThuDichVu.ChiTietBaoCaoDoanhThuDichVuId.class)
public class ChiTietBaoCaoDoanhThuDichVu {

    @Id
    @Column(name = "ma_bao_cao_doanh_thu_dv", length = 20, nullable = false)
    private String maBaoCaoDoanhThuDv;

    @Id
    @Column(name = "ma_loai_dich_vu", length = 20, nullable = false)
    private String maLoaiDichVu;

    @Column(name = "doanh_thu_dich_vu", nullable = false, precision = 18, scale = 2)
    private BigDecimal doanhThuDichVu;

    @Column(name = "ti_le_dich_vu", nullable = false, precision = 5, scale = 2)
    private BigDecimal tiLeDichVu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_bao_cao_doanh_thu_dv", referencedColumnName = "ma_bao_cao_doanh_thu_dv", insertable = false, updatable = false)
    private BaoCaoDoanhThuDichVu baoCaoDoanhThuDichVu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_loai_dich_vu", referencedColumnName = "ma_loai_dich_vu", insertable = false, updatable = false)
    private LoaiDichVu loaiDichVu;

    public String getMaBaoCaoDoanhThuDv() {
        return maBaoCaoDoanhThuDv;
    }

    public void setMaBaoCaoDoanhThuDv(String maBaoCaoDoanhThuDv) {
        this.maBaoCaoDoanhThuDv = maBaoCaoDoanhThuDv;
    }

    public String getMaLoaiDichVu() {
        return maLoaiDichVu;
    }

    public void setMaLoaiDichVu(String maLoaiDichVu) {
        this.maLoaiDichVu = maLoaiDichVu;
    }

    public BigDecimal getDoanhThuDichVu() {
        return doanhThuDichVu;
    }

    public void setDoanhThuDichVu(BigDecimal doanhThuDichVu) {
        this.doanhThuDichVu = doanhThuDichVu;
    }

    public BigDecimal getTiLeDichVu() {
        return tiLeDichVu;
    }

    public void setTiLeDichVu(BigDecimal tiLeDichVu) {
        this.tiLeDichVu = tiLeDichVu;
    }

    public BaoCaoDoanhThuDichVu getBaoCaoDoanhThuDichVu() {
        return baoCaoDoanhThuDichVu;
    }

    public void setBaoCaoDoanhThuDichVu(BaoCaoDoanhThuDichVu baoCaoDoanhThuDichVu) {
        this.baoCaoDoanhThuDichVu = baoCaoDoanhThuDichVu;
    }

    public LoaiDichVu getLoaiDichVu() {
        return loaiDichVu;
    }

    public void setLoaiDichVu(LoaiDichVu loaiDichVu) {
        this.loaiDichVu = loaiDichVu;
    }

    public static class ChiTietBaoCaoDoanhThuDichVuId implements Serializable {
        private String maBaoCaoDoanhThuDv;
        private String maLoaiDichVu;

        public ChiTietBaoCaoDoanhThuDichVuId() {
        }

        public ChiTietBaoCaoDoanhThuDichVuId(String maBaoCaoDoanhThuDv, String maLoaiDichVu) {
            this.maBaoCaoDoanhThuDv = maBaoCaoDoanhThuDv;
            this.maLoaiDichVu = maLoaiDichVu;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof ChiTietBaoCaoDoanhThuDichVuId that)) {
                return false;
            }
            return Objects.equals(maBaoCaoDoanhThuDv, that.maBaoCaoDoanhThuDv)
                && Objects.equals(maLoaiDichVu, that.maLoaiDichVu);
        }

        @Override
        public int hashCode() {
            return Objects.hash(maBaoCaoDoanhThuDv, maLoaiDichVu);
        }
    }
}
