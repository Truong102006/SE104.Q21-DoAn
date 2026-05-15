package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.NotBlank;

public class NguoiDungRequest {

    private String tenDangNhap;

    @NotBlank(message = "Mat khau khong duoc de trong")
    private String matKhau;

    private String maNhom;

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }

    public String getMaNhom() {
        return maNhom;
    }

    public void setMaNhom(String maNhom) {
        this.maNhom = maNhom;
    }
}