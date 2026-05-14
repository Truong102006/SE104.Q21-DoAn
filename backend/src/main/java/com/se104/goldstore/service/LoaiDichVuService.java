package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.LoaiDichVuRequest;
import com.se104.goldstore.dto.response.LoaiDichVuResponse;
import java.util.List;

public interface LoaiDichVuService {

    List<LoaiDichVuResponse> getAll(String keyword);

    LoaiDichVuResponse getById(String maLoaiDichVu);

    LoaiDichVuResponse create(LoaiDichVuRequest request);

    LoaiDichVuResponse update(String maLoaiDichVu, LoaiDichVuRequest request);

    void delete(String maLoaiDichVu);
}
