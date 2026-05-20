package com.se104.goldstore.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PhieuDichVuRequest {

    private String soPhieuDichVu;

    @NotNull(message = "Ngay lap phieu dich vu khong duoc de trong")
    private LocalDate ngayLapPhieuDichVu;

    @NotBlank(message = "Ma khach hang khong duoc de trong")
    private String maKhachHang;

    @NotEmpty(message = "Danh sach dich vu khong duoc de trong")
    private List<@Valid ItemRequest> items;

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

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
    }

    public static class ItemRequest {

        @NotBlank(message = "Ma loai dich vu khong duoc de trong")
        private String maLoaiDichVu;

        @NotNull(message = "So luong dich vu khong duoc de trong")
        @Min(value = 1, message = "So luong dich vu phai > 0")
        private Integer soLuongDichVu;

        @DecimalMin(value = "0", inclusive = true, message = "Chi phi rieng phai >= 0")
        private BigDecimal chiPhiRieng;

        @DecimalMin(value = "0", inclusive = true, message = "Don gia duoc tinh phai >= 0")
        private BigDecimal donGiaDuocTinh;

        @NotNull(message = "Tien tra truoc khong duoc de trong")
        @DecimalMin(value = "0", inclusive = true, message = "Tien tra truoc phai >= 0")
        private BigDecimal tienTraTruoc;

        private LocalDate ngayGiao;

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

        public BigDecimal getChiPhiRieng() {
            return chiPhiRieng;
        }

        public void setChiPhiRieng(BigDecimal chiPhiRieng) {
            this.chiPhiRieng = chiPhiRieng;
        }

        public BigDecimal getDonGiaDuocTinh() {
            return donGiaDuocTinh;
        }

        public void setDonGiaDuocTinh(BigDecimal donGiaDuocTinh) {
            this.donGiaDuocTinh = donGiaDuocTinh;
        }

        public BigDecimal getTienTraTruoc() {
            return tienTraTruoc;
        }

        public void setTienTraTruoc(BigDecimal tienTraTruoc) {
            this.tienTraTruoc = tienTraTruoc;
        }

        public LocalDate getNgayGiao() {
            return ngayGiao;
        }

        public void setNgayGiao(LocalDate ngayGiao) {
            this.ngayGiao = ngayGiao;
        }
    }
}
