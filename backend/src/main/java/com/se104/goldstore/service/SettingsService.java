package com.se104.goldstore.service;

import com.se104.goldstore.dto.request.ServicePrepaymentRateRequest;
import com.se104.goldstore.dto.response.DonViTinhResponse;
import com.se104.goldstore.dto.response.LoaiDichVuResponse;
import com.se104.goldstore.dto.response.LoaiSanPhamResponse;
import com.se104.goldstore.dto.response.ServicePrepaymentRateResponse;
import java.util.List;

public interface SettingsService {

    List<LoaiSanPhamResponse> getProductTypes(String keyword);

    List<DonViTinhResponse> getUnits(String keyword);

    List<LoaiDichVuResponse> getServiceTypes(String keyword);

    ServicePrepaymentRateResponse getServicePrepaymentRate();

    ServicePrepaymentRateResponse updateServicePrepaymentRate(ServicePrepaymentRateRequest request);
}
