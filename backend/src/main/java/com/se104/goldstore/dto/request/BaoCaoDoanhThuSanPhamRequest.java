package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BaoCaoDoanhThuSanPhamRequest {

    private String maBaoCaoDoanhThuSp;

    @NotNull(message = "Thang khong duoc de trong")
    private Integer thang;

    @NotNull(message = "Nam khong duoc de trong")
    private Integer nam;

    @NotNull(message = "Tong doanh thu san pham khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Tong doanh thu san pham phai >= 0")
    private BigDecimal tongDoanhThuSanPham;

    public String getMaBaoCaoDoanhThuSp() {
        return maBaoCaoDoanhThuSp;
    }

    public void setMaBaoCaoDoanhThuSp(String maBaoCaoDoanhThuSp) {
        this.maBaoCaoDoanhThuSp = maBaoCaoDoanhThuSp;
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

    public BigDecimal getTongDoanhThuSanPham() {
        return tongDoanhThuSanPham;
    }

    public void setTongDoanhThuSanPham(BigDecimal tongDoanhThuSanPham) {
        this.tongDoanhThuSanPham = tongDoanhThuSanPham;
    }
}