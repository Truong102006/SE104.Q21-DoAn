package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.NotNull;

public class BaoCaoTonKhoRequest {

    private String maBaoCaoTonKho;

    @NotNull(message = "Thang khong duoc de trong")
    private Integer thang;

    @NotNull(message = "Nam khong duoc de trong")
    private Integer nam;

    public String getMaBaoCaoTonKho() {
        return maBaoCaoTonKho;
    }

    public void setMaBaoCaoTonKho(String maBaoCaoTonKho) {
        this.maBaoCaoTonKho = maBaoCaoTonKho;
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
}