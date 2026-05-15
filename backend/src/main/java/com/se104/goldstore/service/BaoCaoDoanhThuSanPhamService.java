package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.BaoCaoDoanhThuSanPhamRequest;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuSanPhamResponse;
import java.util.List;

public interface BaoCaoDoanhThuSanPhamService {

    List<BaoCaoDoanhThuSanPhamResponse> getAll(String keyword);

    BaoCaoDoanhThuSanPhamResponse getById(String maBaoCaoDoanhThuSp);

    BaoCaoDoanhThuSanPhamResponse create(BaoCaoDoanhThuSanPhamRequest request);

    BaoCaoDoanhThuSanPhamResponse update(String maBaoCaoDoanhThuSp, BaoCaoDoanhThuSanPhamRequest request);

    void delete(String maBaoCaoDoanhThuSp);
}