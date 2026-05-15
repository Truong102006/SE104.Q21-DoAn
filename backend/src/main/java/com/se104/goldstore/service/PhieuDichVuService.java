package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.PhieuDichVuRequest;
import com.se104.goldstore.dto.response.PhieuDichVuResponse;
import java.util.List;

public interface PhieuDichVuService {

    List<PhieuDichVuResponse> getAll(String keyword);

    PhieuDichVuResponse getById(String soPhieuDichVu);

    PhieuDichVuResponse create(PhieuDichVuRequest request);

    PhieuDichVuResponse update(String soPhieuDichVu, PhieuDichVuRequest request);

    void delete(String soPhieuDichVu);
}
