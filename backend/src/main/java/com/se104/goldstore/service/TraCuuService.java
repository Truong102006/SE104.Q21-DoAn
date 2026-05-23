package com.se104.goldstore.service;

import com.se104.goldstore.dto.response.TraCuuPhieuDichVuResponse;
import com.se104.goldstore.dto.response.TraCuuSanPhamResponse;
import java.time.LocalDate;
import org.springframework.data.domain.Page;

public interface TraCuuService {

    Page<TraCuuSanPhamResponse> searchProducts(String keyword, int page, int size);

    Page<TraCuuPhieuDichVuResponse> searchServiceTickets(
        String keyword,
        String status,
        LocalDate fromDate,
        LocalDate toDate,
        int page,
        int size
    );

    Object getDrillDown(String type, String id, Integer month, Integer year);
}
