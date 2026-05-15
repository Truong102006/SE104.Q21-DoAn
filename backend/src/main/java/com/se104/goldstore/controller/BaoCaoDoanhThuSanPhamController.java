package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.BaoCaoDoanhThuSanPhamRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuSanPhamResponse;
import com.se104.goldstore.service.BaoCaoDoanhThuSanPhamService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.BAO_CAO_DOANH_THU_SAN_PHAM)
public class BaoCaoDoanhThuSanPhamController {

    private final BaoCaoDoanhThuSanPhamService baoCaoDoanhThuSanPhamService;

    public BaoCaoDoanhThuSanPhamController(BaoCaoDoanhThuSanPhamService baoCaoDoanhThuSanPhamService) {
        this.baoCaoDoanhThuSanPhamService = baoCaoDoanhThuSanPhamService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BaoCaoDoanhThuSanPhamResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach bao cao doanh thu san pham thanh cong", baoCaoDoanhThuSanPhamService.getAll(keyword)));
    }

    @GetMapping("/{maBaoCaoDoanhThuSp}")
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuSanPhamResponse>> getById(@PathVariable String maBaoCaoDoanhThuSp) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet bao cao doanh thu san pham thanh cong", baoCaoDoanhThuSanPhamService.getById(maBaoCaoDoanhThuSp)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuSanPhamResponse>> create(@Valid @RequestBody BaoCaoDoanhThuSanPhamRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao bao cao doanh thu san pham thanh cong", baoCaoDoanhThuSanPhamService.create(request)));
    }

    @PutMapping("/{maBaoCaoDoanhThuSp}")
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuSanPhamResponse>> update(
        @PathVariable String maBaoCaoDoanhThuSp,
        @Valid @RequestBody BaoCaoDoanhThuSanPhamRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat bao cao doanh thu san pham thanh cong", baoCaoDoanhThuSanPhamService.update(maBaoCaoDoanhThuSp, request)));
    }

    @DeleteMapping("/{maBaoCaoDoanhThuSp}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maBaoCaoDoanhThuSp) {
        baoCaoDoanhThuSanPhamService.delete(maBaoCaoDoanhThuSp);
        return ResponseEntity.ok(ApiResponse.success("Xoa bao cao doanh thu san pham thanh cong", null));
    }
}