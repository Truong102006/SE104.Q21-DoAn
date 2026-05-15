package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.PhieuMuaHangRequest;
import com.se104.goldstore.dto.response.PhieuMuaHangResponse;
import java.util.List;

public interface PhieuMuaHangService {

    List<PhieuMuaHangResponse> getAll(String keyword);

    PhieuMuaHangResponse getById(String soPhieuMua);

    PhieuMuaHangResponse create(PhieuMuaHangRequest request);

    PhieuMuaHangResponse update(String soPhieuMua, PhieuMuaHangRequest request);

    void delete(String soPhieuMua);
}
