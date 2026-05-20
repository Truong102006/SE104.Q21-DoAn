package com.se104.goldstore.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ServicePrepaymentRateRequest {

    @NotNull(message = "Gia tri ti le tra truoc khong duoc de trong")
    @DecimalMin(value = "0", inclusive = true, message = "Gia tri ti le tra truoc phai >= 0")
    @DecimalMax(value = "100", inclusive = true, message = "Gia tri ti le tra truoc phai <= 100")
    private BigDecimal value;

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }
}
