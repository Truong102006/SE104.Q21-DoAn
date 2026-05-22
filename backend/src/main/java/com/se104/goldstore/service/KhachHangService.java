package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.KhachHangRequest;
import com.se104.goldstore.dto.response.KhachHangResponse;
import java.util.List;

public interface KhachHangService {

    List<KhachHangResponse> getAll(String keyword, Integer page, Integer size);

    KhachHangResponse getById(String maKhachHang);

    KhachHangResponse create(KhachHangRequest request);

    KhachHangResponse update(String maKhachHang, KhachHangRequest request);

    void delete(String maKhachHang);
}
