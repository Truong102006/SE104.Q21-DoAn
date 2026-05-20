package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.BaoCaoTonKhoRequest;
import com.se104.goldstore.dto.response.BaoCaoTonKhoResponse;
import java.util.List;

public interface BaoCaoTonKhoService {

    List<BaoCaoTonKhoResponse> getAll(String keyword);

    BaoCaoTonKhoResponse getByMonthYear(Integer thang, Integer nam);

    BaoCaoTonKhoResponse generate(Integer thang, Integer nam);

    BaoCaoTonKhoResponse getById(String maBaoCaoTonKho);

    BaoCaoTonKhoResponse create(BaoCaoTonKhoRequest request);

    BaoCaoTonKhoResponse update(String maBaoCaoTonKho, BaoCaoTonKhoRequest request);

    void delete(String maBaoCaoTonKho);
}
