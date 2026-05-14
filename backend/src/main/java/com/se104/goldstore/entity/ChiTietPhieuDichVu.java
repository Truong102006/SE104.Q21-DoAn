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
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "ct_phieu_dich_vu")
@IdClass(ChiTietPhieuDichVu.ChiTietPhieuDichVuId.class)
public class ChiTietPhieuDichVu {

    @Id
    @Column(name = "so_phieu_dich_vu", length = 20, nullable = false)
    private String soPhieuDichVu;

    @Id
    @Column(name = "ma_loai_dich_vu", length = 20, nullable = false)
    private String maLoaiDichVu;

    @Column(name = "so_luong_dich_vu", nullable = false)
    private Integer soLuongDichVu;

    @Column(name = "don_gia_duoc_tinh", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaDuocTinh;

    @Column(name = "thanh_tien", nullable = false, precision = 18, scale = 2)
    private BigDecimal thanhTien;

    @Column(name = "tien_tra_truoc", nullable = false, precision = 18, scale = 2)
    private BigDecimal tienTraTruoc;

    @Column(name = "tien_con_lai", nullable = false, precision = 18, scale = 2)
    private BigDecimal tienConLai;

    @Column(name = "ngay_giao")
    private LocalDate ngayGiao;

    @Column(name = "tinh_trang", length = 50, nullable = false)
    private String tinhTrang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_phieu_dich_vu", referencedColumnName = "so_phieu_dich_vu", insertable = false, updatable = false)
    private PhieuDichVu phieuDichVu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_loai_dich_vu", referencedColumnName = "ma_loai_dich_vu", insertable = false, updatable = false)
    private LoaiDichVu loaiDichVu;

    public String getSoPhieuDichVu() {
        return soPhieuDichVu;
    }

    public void setSoPhieuDichVu(String soPhieuDichVu) {
        this.soPhieuDichVu = soPhieuDichVu;
    }

    public String getMaLoaiDichVu() {
        return maLoaiDichVu;
    }

    public void setMaLoaiDichVu(String maLoaiDichVu) {
        this.maLoaiDichVu = maLoaiDichVu;
    }

    public Integer getSoLuongDichVu() {
        return soLuongDichVu;
    }

    public void setSoLuongDichVu(Integer soLuongDichVu) {
        this.soLuongDichVu = soLuongDichVu;
    }

    public BigDecimal getDonGiaDuocTinh() {
        return donGiaDuocTinh;
    }

    public void setDonGiaDuocTinh(BigDecimal donGiaDuocTinh) {
        this.donGiaDuocTinh = donGiaDuocTinh;
    }

    public BigDecimal getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(BigDecimal thanhTien) {
        this.thanhTien = thanhTien;
    }

    public BigDecimal getTienTraTruoc() {
        return tienTraTruoc;
    }

    public void setTienTraTruoc(BigDecimal tienTraTruoc) {
        this.tienTraTruoc = tienTraTruoc;
    }

    public BigDecimal getTienConLai() {
        return tienConLai;
    }

    public void setTienConLai(BigDecimal tienConLai) {
        this.tienConLai = tienConLai;
    }

    public LocalDate getNgayGiao() {
        return ngayGiao;
    }

    public void setNgayGiao(LocalDate ngayGiao) {
        this.ngayGiao = ngayGiao;
    }

    public String getTinhTrang() {
        return tinhTrang;
    }

    public void setTinhTrang(String tinhTrang) {
        this.tinhTrang = tinhTrang;
    }

    public PhieuDichVu getPhieuDichVu() {
        return phieuDichVu;
    }

    public void setPhieuDichVu(PhieuDichVu phieuDichVu) {
        this.phieuDichVu = phieuDichVu;
    }

    public LoaiDichVu getLoaiDichVu() {
        return loaiDichVu;
    }

    public void setLoaiDichVu(LoaiDichVu loaiDichVu) {
        this.loaiDichVu = loaiDichVu;
    }

    public static class ChiTietPhieuDichVuId implements Serializable {
        private String soPhieuDichVu;
        private String maLoaiDichVu;

        public ChiTietPhieuDichVuId() {
        }

        public ChiTietPhieuDichVuId(String soPhieuDichVu, String maLoaiDichVu) {
            this.soPhieuDichVu = soPhieuDichVu;
            this.maLoaiDichVu = maLoaiDichVu;
        }

        @Override
        public boolean equals(Object object) {
            if (this == object) {
                return true;
            }
            if (!(object instanceof ChiTietPhieuDichVuId that)) {
                return false;
            }
            return Objects.equals(soPhieuDichVu, that.soPhieuDichVu)
                && Objects.equals(maLoaiDichVu, that.maLoaiDichVu);
        }

        @Override
        public int hashCode() {
            return Objects.hash(soPhieuDichVu, maLoaiDichVu);
        }
    }
}
