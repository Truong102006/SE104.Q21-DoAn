package com.se104.goldstore.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PricingUtils {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private PricingUtils() {
    }

    public static BigDecimal calculateSellingPrice(BigDecimal donGiaMua, BigDecimal tiLeLoiNhuan) {
        if (donGiaMua == null || tiLeLoiNhuan == null) {
            throw new IllegalArgumentException("Don gia mua va ti le loi nhuan khong duoc null");
        }

        BigDecimal profitAmount = donGiaMua
            .multiply(tiLeLoiNhuan)
            .divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
        return donGiaMua
            .add(profitAmount)
            .setScale(2, RoundingMode.HALF_UP);
    }
}
