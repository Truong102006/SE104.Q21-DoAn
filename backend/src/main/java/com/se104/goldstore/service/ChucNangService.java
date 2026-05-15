package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.ChucNangRequest;
import com.se104.goldstore.dto.response.ChucNangResponse;
import java.util.List;

public interface ChucNangService {

    List<ChucNangResponse> getAll(String keyword);

    ChucNangResponse getById(String maChucNang);

    ChucNangResponse create(ChucNangRequest request);

    ChucNangResponse update(String maChucNang, ChucNangRequest request);

    void delete(String maChucNang);
}