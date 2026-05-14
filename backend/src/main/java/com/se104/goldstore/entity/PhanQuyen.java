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
@Table(name = "phan_quyen")
@IdClass(PhanQuyen.PhanQuyenId.class)
public class PhanQuyen {

    @Id
    @Column(name = "ma_nhom", length = 20, nullable = false)
    private String maNhom;

    @Id
    @Column(name = "ma_chuc_nang", length = 20, nullable = false)
    private String maChucNang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nhom", referencedColumnName = "ma_nhom", insertable = false, updatable = false)
    private NhomNguoiDung nhomNguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_chuc_nang", referencedColumnName = "ma_chuc_nang", insertable = false, updatable = false)
    private ChucNang chucNang;

    public String getMaNhom() {
        return maNhom;
    }

    public void setMaNhom(String maNhom) {
        this.maNhom = maNhom;
    }

    public String getMaChucNang() {
        return maChucNang;
    }

    public void setMaChucNang(String maChucNang) {
        this.maChucNang = maChucNang;
    }

    public NhomNguoiDung getNhomNguoiDung() {
        return nhomNguoiDung;
    }

    public void setNhomNguoiDung(NhomNguoiDung nhomNguoiDung) {
        this.nhomNguoiDung = nhomNguoiDung;
    }

    public ChucNang getChucNang() {
        return chucNang;
    }

    public void setChucNang(ChucNang chucNang) {
        this.chucNang = chucNang;
    }

    public static class PhanQuyenId implements Serializable {
        private String maNhom;
        private String maChucNang;

        public PhanQuyenId() {
        }

        public PhanQuyenId(String maNhom, String maChucNang) {
            this.maNhom = maNhom;
            this.maChucNang = maChucNang;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof PhanQuyenId that)) {
                return false;
            }
            return Objects.equals(maNhom, that.maNhom)
                && Objects.equals(maChucNang, that.maChucNang);
        }

        @Override
        public int hashCode() {
            return Objects.hash(maNhom, maChucNang);
        }
    }
}
