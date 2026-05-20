package com.se104.goldstore.dto.request;

import java.time.LocalDate;

public class PhieuDichVuDeliverRequest {

    private LocalDate ngayGiao;

    public LocalDate getNgayGiao() {
        return ngayGiao;
    }

    public void setNgayGiao(LocalDate ngayGiao) {
        this.ngayGiao = ngayGiao;
    }
}
