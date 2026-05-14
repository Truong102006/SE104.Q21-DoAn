package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.LoaiSanPhamRequest;
import com.se104.goldstore.dto.response.LoaiSanPhamResponse;
import java.util.List;

public interface LoaiSanPhamService {

    List<LoaiSanPhamResponse> getAll(String keyword);

    LoaiSanPhamResponse getById(String maLoaiSanPham);

    LoaiSanPhamResponse create(LoaiSanPhamRequest request);

    LoaiSanPhamResponse update(String maLoaiSanPham, LoaiSanPhamRequest request);

    void delete(String maLoaiSanPham);
}
