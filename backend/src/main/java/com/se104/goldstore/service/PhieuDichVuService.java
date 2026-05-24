package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.PhieuDichVuRequest;
import com.se104.goldstore.dto.response.PhieuDichVuResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;

public interface PhieuDichVuService {

    List<PhieuDichVuResponse> getAll(String keyword);

    Page<PhieuDichVuResponse> getAllPaginated(String keyword, int page, int size);

    PhieuDichVuResponse getById(String soPhieuDichVu);

    PhieuDichVuResponse create(PhieuDichVuRequest request);

    PhieuDichVuResponse deliverItem(String soPhieuDichVu, String maLoaiDichVu, LocalDate ngayGiao);

    PhieuDichVuResponse deliverAll(String soPhieuDichVu, LocalDate ngayGiao);
}
