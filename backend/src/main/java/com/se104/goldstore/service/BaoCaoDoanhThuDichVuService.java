package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.BaoCaoDoanhThuDichVuRequest;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuDichVuResponse;
import java.util.List;

public interface BaoCaoDoanhThuDichVuService {

    List<BaoCaoDoanhThuDichVuResponse> getAll(String keyword);

    BaoCaoDoanhThuDichVuResponse getByMonthYear(Integer thang, Integer nam);

    BaoCaoDoanhThuDichVuResponse generate(Integer thang, Integer nam);

    BaoCaoDoanhThuDichVuResponse getById(String maBaoCaoDoanhThuDv);

    BaoCaoDoanhThuDichVuResponse create(BaoCaoDoanhThuDichVuRequest request);

    BaoCaoDoanhThuDichVuResponse update(String maBaoCaoDoanhThuDv, BaoCaoDoanhThuDichVuRequest request);

    void delete(String maBaoCaoDoanhThuDv);
}
