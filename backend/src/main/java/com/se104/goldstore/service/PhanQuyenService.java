package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.PhanQuyenRequest;
import com.se104.goldstore.dto.response.PhanQuyenResponse;
import java.util.List;

public interface PhanQuyenService {

    List<PhanQuyenResponse> getAll(String keyword);

    PhanQuyenResponse getById(String maNhom, String maChucNang);

    PhanQuyenResponse create(PhanQuyenRequest request);

    void delete(String maNhom, String maChucNang);
}