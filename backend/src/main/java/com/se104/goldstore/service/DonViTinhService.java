package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.DonViTinhRequest;
import com.se104.goldstore.dto.response.DonViTinhResponse;
import java.util.List;

public interface DonViTinhService {

    List<DonViTinhResponse> getAll(String keyword);

    DonViTinhResponse getById(String maDonViTinh);

    DonViTinhResponse create(DonViTinhRequest request);

    DonViTinhResponse update(String maDonViTinh, DonViTinhRequest request);

    void delete(String maDonViTinh);
}
