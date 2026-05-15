package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PhieuDichVuRequest {

    private String soPhieuDichVu;

    @NotNull(message = "Ngay lap phieu dich vu khong duoc de trong")
    private LocalDate ngayLapPhieuDichVu;

    @NotBlank(message = "Ma khach hang khong duoc de trong")
    private String maKhachHang;

    @NotNull(message = "Tong tien tra truoc khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Tong tien tra truoc phai >= 0")
    private BigDecimal tongTienTraTruoc;

    @NotNull(message = "Tong tien con lai khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Tong tien con lai phai >= 0")
    private BigDecimal tongTienConLai;

    @NotNull(message = "Tong tien khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Tong tien phai >= 0")
    private BigDecimal tongTien;

    @NotBlank(message = "Tinh trang dich vu khong duoc de trong")
    private String tinhTrangDichVu;

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
}
