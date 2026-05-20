package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.PhieuBanHangRequest;
import com.se104.goldstore.dto.response.PhieuBanHangResponse;
import java.util.List;

public interface PhieuBanHangService {

    List<PhieuBanHangResponse> getAll(String keyword);

    PhieuBanHangResponse getById(String soPhieuBan);

    PhieuBanHangResponse create(PhieuBanHangRequest request);
}
