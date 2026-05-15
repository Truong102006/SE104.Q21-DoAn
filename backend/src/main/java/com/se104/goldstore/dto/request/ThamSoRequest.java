package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ThamSoRequest {

    private String maThamSo;

    @NotBlank(message = "Ten tham so khong duoc de trong")
    private String tenThamSo;

    private BigDecimal giaTri;

    public String getMaThamSo() {
        return maThamSo;
    }

    public void setMaThamSo(String maThamSo) {
        this.maThamSo = maThamSo;
    }

    public String getTenThamSo() {
        return tenThamSo;
    }

    public void setTenThamSo(String tenThamSo) {
        this.tenThamSo = tenThamSo;
    }

    public BigDecimal getGiaTri() {
        return giaTri;
    }

    public void setGiaTri(BigDecimal giaTri) {
        this.giaTri = giaTri;
    }
}