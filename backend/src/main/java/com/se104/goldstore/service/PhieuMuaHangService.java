package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.PhieuMuaHangRequest;
import com.se104.goldstore.dto.response.PhieuMuaHangResponse;
import java.util.List;
import org.springframework.data.domain.Page;

public interface PhieuMuaHangService {

    List<PhieuMuaHangResponse> getAll(String keyword);

    Page<PhieuMuaHangResponse> getAllPaginated(String keyword, int page, int size);

    PhieuMuaHangResponse getById(String soPhieuMua);

    PhieuMuaHangResponse getPrintData(String soPhieuMua);

    PhieuMuaHangResponse create(PhieuMuaHangRequest request);
}
