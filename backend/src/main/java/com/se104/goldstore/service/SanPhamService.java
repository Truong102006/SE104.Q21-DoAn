package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.SanPhamRequest;
import com.se104.goldstore.dto.response.SanPhamResponse;
import java.util.List;
import org.springframework.data.domain.Page;

public interface SanPhamService {

    Page<SanPhamResponse> getAll(String keyword, String productTypeId, int page, int size);

    Page<SanPhamResponse> getCatalog(
        String keyword,
        String productTypeId,
        String stockStatus,
        String sort,
        int page,
        int size
    );

    List<SanPhamResponse> search(String keyword);

    SanPhamResponse getById(String maSanPham);

    SanPhamResponse create(SanPhamRequest request);

    SanPhamResponse update(String maSanPham, SanPhamRequest request);

    void delete(String maSanPham);
}
