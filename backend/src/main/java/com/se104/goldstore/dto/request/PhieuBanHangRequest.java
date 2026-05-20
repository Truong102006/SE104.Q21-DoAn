package com.se104.goldstore.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class PhieuBanHangRequest {

    private String soPhieuBan;

    @NotNull(message = "Ngay lap phieu ban khong duoc de trong")
    private LocalDate ngayLapPhieuBan;

    @NotBlank(message = "Ma khach hang khong duoc de trong")
    private String maKhachHang;

    @NotEmpty(message = "Danh sach san pham ban khong duoc de trong")
    private List<@Valid ItemRequest> items;

    public String getSoPhieuBan() {
        return soPhieuBan;
    }

    public void setSoPhieuBan(String soPhieuBan) {
        this.soPhieuBan = soPhieuBan;
    }

    public LocalDate getNgayLapPhieuBan() {
        return ngayLapPhieuBan;
    }

    public void setNgayLapPhieuBan(LocalDate ngayLapPhieuBan) {
        this.ngayLapPhieuBan = ngayLapPhieuBan;
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

        @NotBlank(message = "Ma san pham khong duoc de trong")
        private String maSanPham;

        @NotNull(message = "So luong khong duoc de trong")
        @Min(value = 1, message = "So luong phai > 0")
        private Integer soLuong;

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
    }
}
