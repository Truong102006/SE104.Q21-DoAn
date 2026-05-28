package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.BaoCaoTonKhoResponse;
import com.se104.goldstore.service.BaoCaoTonKhoService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.alibaba.excel.EasyExcel;
import com.se104.goldstore.dto.excel.BaoCaoTonKhoExcelDto;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(ApiPaths.REPORTS_INVENTORY)
@PreAuthorize("hasRole('ADMIN')")
public class BaoCaoTonKhoReportController {

    private final BaoCaoTonKhoService baoCaoTonKhoService;

    public BaoCaoTonKhoReportController(BaoCaoTonKhoService baoCaoTonKhoService) {
        this.baoCaoTonKhoService = baoCaoTonKhoService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<BaoCaoTonKhoResponse>> generate(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year
    ) {
        BaoCaoTonKhoResponse response = baoCaoTonKhoService.generate(month, year);
        return ResponseEntity.ok(ApiResponse.success("Generate bao cao ton kho thanh cong", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<BaoCaoTonKhoResponse>> getByMonthYear(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year
    ) {
        BaoCaoTonKhoResponse response = baoCaoTonKhoService.getByMonthYear(month, year);
        return ResponseEntity.ok(ApiResponse.success("Lay bao cao ton kho theo thang nam thanh cong", response));
    }

    @GetMapping("/{maBaoCaoTonKho}")
    public ResponseEntity<ApiResponse<BaoCaoTonKhoResponse>> getById(@PathVariable String maBaoCaoTonKho) {
        BaoCaoTonKhoResponse response = baoCaoTonKhoService.getById(maBaoCaoTonKho);
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet bao cao ton kho thanh cong", response));
    }

    @GetMapping("/excel/export")
    public void exportExcel(
        @RequestParam(name = "month") @Min(1) @Max(12) Integer month,
        @RequestParam(name = "year") @Min(1) Integer year,
        HttpServletResponse response
    ) throws IOException {
        BaoCaoTonKhoResponse report = baoCaoTonKhoService.getByMonthYear(month, year);

        String fileName = String.format("baocao_tonkho_%02d_%d.xlsx", month, year);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        List<BaoCaoTonKhoExcelDto> excelList = new ArrayList<>();
        if (report != null && report.getChiTiet() != null) {
            for (int i = 0; i < report.getChiTiet().size(); i++) {
                BaoCaoTonKhoResponse.ChiTietTonKhoResponse ct = report.getChiTiet().get(i);
                excelList.add(new BaoCaoTonKhoExcelDto(
                    i + 1,
                    ct.getMaSanPham(),
                    ct.getTenSanPham(),
                    ct.getTonDau(),
                    ct.getSoLuongMuaVao(),
                    ct.getSoLuongBanRa(),
                    ct.getTonCuoi(),
                    ct.getTenDonViTinh()
                ));
            }
        }

        EasyExcel.write(response.getOutputStream(), BaoCaoTonKhoExcelDto.class)
            .sheet("Tồn Kho")
            .doWrite(excelList);
    }
}
