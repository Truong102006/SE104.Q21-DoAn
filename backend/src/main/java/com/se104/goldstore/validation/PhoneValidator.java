package com.se104.goldstore.validation;

import java.util.regex.Pattern;

public final class PhoneValidator {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10}$");

    private PhoneValidator() {
    }

    public static boolean isValid(String phone) {
        if (phone == null) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone.trim()).matches();
    }

    public static void validateOrThrow(String phone, String fieldName) {
        if (!isValid(phone)) {
            throw new IllegalArgumentException(fieldName + " phải gồm đúng 10 chữ số");
        }
    }
}
