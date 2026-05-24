package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.PhieuBanHangRequest;
import com.se104.goldstore.dto.response.PhieuBanHangResponse;
import java.util.List;
import org.springframework.data.domain.Page;

public interface PhieuBanHangService {

    List<PhieuBanHangResponse> getAll(String keyword);

    Page<PhieuBanHangResponse> getAllPaginated(String keyword, int page, int size);

    PhieuBanHangResponse getById(String soPhieuBan);

    PhieuBanHangResponse create(PhieuBanHangRequest request);
}
