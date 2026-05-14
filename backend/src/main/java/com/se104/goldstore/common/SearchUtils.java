package com.se104.goldstore.common;

public final class SearchUtils {

    private SearchUtils() {
    }

    public static String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return "";
        }
        return keyword
            .trim()
            .replaceAll("\\s+", " ")
            .toLowerCase();
    }
}
