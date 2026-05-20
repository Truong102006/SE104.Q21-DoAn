package com.se104.goldstore.dto.response;

import java.math.BigDecimal;

public class ServicePrepaymentRateResponse {

    private String key;
    private BigDecimal value;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }
}
