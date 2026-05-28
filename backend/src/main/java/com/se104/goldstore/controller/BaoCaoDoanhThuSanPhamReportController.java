package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuSanPhamResponse;
import com.se104.goldstore.service.BaoCaoDoanhThuSanPhamService;
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
import com.se104.goldstore.dto.excel.BaoCaoDoanhThuSanPhamExcelDto;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(ApiPaths.REPORTS_REVENUE_PRODUCTS)
@PreAuthorize("hasRole('ADMIN')")
public class BaoCaoDoanhThuSanPhamReportController {

    private final BaoCaoDoanhThuSanPhamService baoCaoDoanhThuSanPhamService;

    public BaoCaoDoanhThuSanPhamReportController(BaoCaoDoanhThuSanPhamService baoCaoDoanhThuSanPhamService) {
        this.baoCaoDoanhThuSanPhamService = baoCaoDoanhThuSanPhamService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuSanPhamResponse>> generate(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year
    ) {
        BaoCaoDoanhThuSanPhamResponse response = baoCaoDoanhThuSanPhamService.generate(month, year);
        return ResponseEntity.ok(ApiResponse.success("Generate bao cao doanh thu san pham thanh cong", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuSanPhamResponse>> getByMonthYear(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year
    ) {
        BaoCaoDoanhThuSanPhamResponse response = baoCaoDoanhThuSanPhamService.getByMonthYear(month, year);
        return ResponseEntity.ok(ApiResponse.success("Lay bao cao doanh thu san pham theo thang nam thanh cong", response));
    }

    @GetMapping("/excel/export")
    public void exportExcel(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year,
        HttpServletResponse response
    ) throws IOException {
        BaoCaoDoanhThuSanPhamResponse report = baoCaoDoanhThuSanPhamService.getByMonthYear(month, year);

        String fileName = String.format("doanhthu_sanpham_%02d_%d.xlsx", month, year);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        List<BaoCaoDoanhThuSanPhamExcelDto> excelList = new ArrayList<>();
        if (report != null && report.getChiTiet() != null) {
            for (int i = 0; i < report.getChiTiet().size(); i++) {
                BaoCaoDoanhThuSanPhamResponse.ChiTietDoanhThuSanPhamResponse ct = report.getChiTiet().get(i);
                excelList.add(new BaoCaoDoanhThuSanPhamExcelDto(
                    i + 1,
                    ct.getMaSanPham(),
                    ct.getTenSanPham(),
                    ct.getSoLuongBan(),
                    ct.getDoanhThu(),
                    ct.getTiLe()
                ));
            }
        }

        EasyExcel.write(response.getOutputStream(), BaoCaoDoanhThuSanPhamExcelDto.class)
            .sheet("Doanh Thu Sản Phẩm")
            .doWrite(excelList);
    }
}
