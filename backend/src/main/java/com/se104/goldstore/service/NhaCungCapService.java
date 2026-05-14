package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.NhaCungCapRequest;
import com.se104.goldstore.dto.response.NhaCungCapResponse;
import java.util.List;

public interface NhaCungCapService {

    List<NhaCungCapResponse> getAll(String keyword);

    NhaCungCapResponse getById(String maNhaCungCap);

    NhaCungCapResponse create(NhaCungCapRequest request);

    NhaCungCapResponse update(String maNhaCungCap, NhaCungCapRequest request);

    void delete(String maNhaCungCap);
}
