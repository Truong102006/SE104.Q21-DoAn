package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.NotBlank;

public class NhomNguoiDungRequest {

    private String maNhom;

    @NotBlank(message = "Ten nhom khong duoc de trong")
    private String tenNhom;

    public String getMaNhom() {
        return maNhom;
    }

    public void setMaNhom(String maNhom) {
        this.maNhom = maNhom;
    }

    public String getTenNhom() {
        return tenNhom;
    }

    public void setTenNhom(String tenNhom) {
        this.tenNhom = tenNhom;
    }
}