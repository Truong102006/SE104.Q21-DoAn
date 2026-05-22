package com.se104.goldstore.common;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class CodeGeneratorUtils {

    private static final Pattern TRAILING_DIGITS = Pattern.compile("(\\d+)$");

    private CodeGeneratorUtils() {
    }

    public static String generateNextCode(String prefix, String currentMaxCode) {
        if (prefix == null || prefix.isBlank()) {
            throw new IllegalArgumentException("Prefix không được để trống");
        }

        if (currentMaxCode == null || currentMaxCode.isBlank()) {
            return prefix + "001";
        }

        Matcher matcher = TRAILING_DIGITS.matcher(currentMaxCode.trim());
        if (!matcher.find()) {
            return prefix + "001";
        }

        String digits = matcher.group(1);
        int nextNumber = Integer.parseInt(digits) + 1;
        int width = Math.max(3, digits.length());
        return prefix + String.format("%0" + width + "d", nextNumber);
    }
}
