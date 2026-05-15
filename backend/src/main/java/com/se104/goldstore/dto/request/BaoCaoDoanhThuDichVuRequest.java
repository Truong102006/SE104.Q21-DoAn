package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BaoCaoDoanhThuDichVuRequest {

    private String maBaoCaoDoanhThuDv;

    @NotNull(message = "Thang khong duoc de trong")
    private Integer thang;

    @NotNull(message = "Nam khong duoc de trong")
    private Integer nam;

    @NotNull(message = "Tong doanh thu dich vu khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Tong doanh thu dich vu phai >= 0")
    private BigDecimal tongDoanhThuDichVu;

    public String getMaBaoCaoDoanhThuDv() {
        return maBaoCaoDoanhThuDv;
    }

    public void setMaBaoCaoDoanhThuDv(String maBaoCaoDoanhThuDv) {
        this.maBaoCaoDoanhThuDv = maBaoCaoDoanhThuDv;
    }

    public Integer getThang() {
        return thang;
    }

    public void setThang(Integer thang) {
        this.thang = thang;
    }

    public Integer getNam() {
        return nam;
    }

    public void setNam(Integer nam) {
        this.nam = nam;
    }

    public BigDecimal getTongDoanhThuDichVu() {
        return tongDoanhThuDichVu;
    }

    public void setTongDoanhThuDichVu(BigDecimal tongDoanhThuDichVu) {
        this.tongDoanhThuDichVu = tongDoanhThuDichVu;
    }
}