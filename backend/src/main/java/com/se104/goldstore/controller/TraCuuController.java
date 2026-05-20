package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.TraCuuPhieuDichVuResponse;
import com.se104.goldstore.dto.response.TraCuuSanPhamResponse;
import com.se104.goldstore.service.TraCuuService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.SEARCH)
public class TraCuuController {

    private final TraCuuService traCuuService;

    public TraCuuController(TraCuuService traCuuService) {
        this.traCuuService = traCuuService;
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<TraCuuSanPhamResponse>>> searchProducts(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "page", defaultValue = "0") @Min(0) int page,
        @RequestParam(name = "size", defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Tra cuu san pham thanh cong", traCuuService.searchProducts(keyword, page, size))
        );
    }

    @GetMapping("/service-tickets")
    public ResponseEntity<ApiResponse<Page<TraCuuPhieuDichVuResponse>>> searchServiceTickets(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "status", required = false) String status,
        @RequestParam(name = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(name = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(name = "page", defaultValue = "0") @Min(0) int page,
        @RequestParam(name = "size", defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                "Tra cuu phieu dich vu thanh cong",
                traCuuService.searchServiceTickets(keyword, status, fromDate, toDate, page, size)
            )
        );
    }
}
