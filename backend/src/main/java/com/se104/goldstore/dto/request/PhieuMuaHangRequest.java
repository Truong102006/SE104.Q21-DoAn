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

public class PhieuMuaHangRequest {

    private String soPhieuMua;

    @NotNull(message = "Ngay lap phieu mua khong duoc de trong")
    private LocalDate ngayLapPhieuMua;

    @NotBlank(message = "Ma nha cung cap khong duoc de trong")
    private String maNhaCungCap;

    @NotEmpty(message = "Danh sach san pham mua khong duoc de trong")
    private List<@Valid ItemRequest> items;

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

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
    }

    public static class ItemRequest {

        @NotBlank(message = "Ma san pham khong duoc de trong")
        private String maSanPham;

        @NotNull(message = "So luong mua khong duoc de trong")
        @Min(value = 1, message = "So luong mua phai > 0")
        private Integer soLuongMua;

        @NotBlank(message = "Ma don vi tinh khong duoc de trong")
        private String maDonViTinh;

        @NotNull(message = "Don gia khong duoc de trong")
        @DecimalMin(value = "0", inclusive = true, message = "Don gia mua phai >= 0")
        private BigDecimal donGia;

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
    }
}
