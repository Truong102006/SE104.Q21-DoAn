package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.SanPhamRequest;
import com.se104.goldstore.dto.response.SanPhamResponse;
import java.util.List;

public interface SanPhamService {

    List<SanPhamResponse> getAll(String keyword);

    SanPhamResponse getById(String maSanPham);

    SanPhamResponse create(SanPhamRequest request);

    SanPhamResponse update(String maSanPham, SanPhamRequest request);

    void delete(String maSanPham);
}
