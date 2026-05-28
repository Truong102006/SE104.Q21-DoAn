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
import com.alibaba.excel.EasyExcel;
import com.se104.goldstore.dto.excel.BaoCaoDoanhThuDichVuExcelDto;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

    @GetMapping("/excel/export")
    public void exportExcel(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year,
        HttpServletResponse response
    ) throws IOException {
        BaoCaoDoanhThuDichVuResponse report = baoCaoDoanhThuDichVuService.getByMonthYear(month, year);

        String fileName = String.format("doanhthu_dichvu_%02d_%d.xlsx", month, year);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        List<BaoCaoDoanhThuDichVuExcelDto> excelList = new ArrayList<>();
        if (report != null && report.getChiTiet() != null) {
            for (int i = 0; i < report.getChiTiet().size(); i++) {
                BaoCaoDoanhThuDichVuResponse.ChiTietDoanhThuDichVuResponse ct = report.getChiTiet().get(i);
                excelList.add(new BaoCaoDoanhThuDichVuExcelDto(
                    i + 1,
                    ct.getMaLoaiDichVu(),
                    ct.getTenLoaiDichVu(),
                    ct.getDoanhThu(),
                    ct.getTiLe()
                ));
            }
        }

        EasyExcel.write(response.getOutputStream(), BaoCaoDoanhThuDichVuExcelDto.class)
            .sheet("Doanh Thu Dịch Vụ")
            .doWrite(excelList);
    }
}
