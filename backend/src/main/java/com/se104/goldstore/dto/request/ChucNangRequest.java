package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ChucNangRequest {

    private String maChucNang;

    @NotBlank(message = "Ten chuc nang khong duoc de trong")
    private String tenChucNang;

    private String tenManHinhLoad;

    public String getMaChucNang() {
        return maChucNang;
    }

    public void setMaChucNang(String maChucNang) {
        this.maChucNang = maChucNang;
    }

    public String getTenChucNang() {
        return tenChucNang;
    }

    public void setTenChucNang(String tenChucNang) {
        this.tenChucNang = tenChucNang;
    }

    public String getTenManHinhLoad() {
        return tenManHinhLoad;
    }

    public void setTenManHinhLoad(String tenManHinhLoad) {
        this.tenManHinhLoad = tenManHinhLoad;
    }
}