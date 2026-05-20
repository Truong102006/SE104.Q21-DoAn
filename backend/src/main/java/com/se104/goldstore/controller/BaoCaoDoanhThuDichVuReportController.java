package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuDichVuResponse;
import com.se104.goldstore.service.BaoCaoDoanhThuDichVuService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.REPORTS_REVENUE_SERVICES)
@PreAuthorize("hasRole('ADMIN')")
public class BaoCaoDoanhThuDichVuReportController {

    private final BaoCaoDoanhThuDichVuService baoCaoDoanhThuDichVuService;

    public BaoCaoDoanhThuDichVuReportController(BaoCaoDoanhThuDichVuService baoCaoDoanhThuDichVuService) {
        this.baoCaoDoanhThuDichVuService = baoCaoDoanhThuDichVuService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuDichVuResponse>> generate(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year
    ) {
        BaoCaoDoanhThuDichVuResponse response = baoCaoDoanhThuDichVuService.generate(month, year);
        return ResponseEntity.ok(ApiResponse.success("Generate bao cao doanh thu dich vu thanh cong", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuDichVuResponse>> getByMonthYear(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year
    ) {
        BaoCaoDoanhThuDichVuResponse response = baoCaoDoanhThuDichVuService.getByMonthYear(month, year);
        return ResponseEntity.ok(ApiResponse.success("Lay bao cao doanh thu dich vu theo thang nam thanh cong", response));
    }
}
