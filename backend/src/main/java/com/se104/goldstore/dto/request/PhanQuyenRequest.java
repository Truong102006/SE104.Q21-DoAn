package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PhanQuyenRequest {

    @NotBlank(message = "Ma nhom khong duoc de trong")
    private String maNhom;

    @NotBlank(message = "Ma chuc nang khong duoc de trong")
    private String maChucNang;

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
}