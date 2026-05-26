package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.ServicePrepaymentRateRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.DonViTinhResponse;
import com.se104.goldstore.dto.response.LoaiDichVuResponse;
import com.se104.goldstore.dto.response.LoaiSanPhamResponse;
import com.se104.goldstore.dto.response.ServicePrepaymentRateResponse;
import com.se104.goldstore.service.SettingsService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.SETTINGS)
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/product-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LoaiSanPhamResponse>>> getProductTypes(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Lay danh sach loai san pham cho cai dat thanh cong", settingsService.getProductTypes(keyword))
        );
    }

    @GetMapping("/units")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DonViTinhResponse>>> getUnits(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Lay danh sach don vi tinh cho cai dat thanh cong", settingsService.getUnits(keyword))
        );
    }

    @GetMapping("/service-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LoaiDichVuResponse>>> getServiceTypes(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Lay danh sach loai dich vu cho cai dat thanh cong", settingsService.getServiceTypes(keyword))
        );
    }

    @GetMapping("/service-prepayment-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ServicePrepaymentRateResponse>> getServicePrepaymentRate() {
        return ResponseEntity.ok(
            ApiResponse.success("Lay ti le tra truoc dich vu thanh cong", settingsService.getServicePrepaymentRate())
        );
    }

    @PutMapping("/service-prepayment-rate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ServicePrepaymentRateResponse>> updateServicePrepaymentRate(
        @Valid @RequestBody ServicePrepaymentRateRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Cap nhat ti le tra truoc dich vu thanh cong", settingsService.updateServicePrepaymentRate(request))
        );
    }
}
