package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.BaoCaoDoanhThuDichVuRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuDichVuResponse;
import com.se104.goldstore.service.BaoCaoDoanhThuDichVuService;
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
@RequestMapping(ApiPaths.BAO_CAO_DOANH_THU_DICH_VU)
public class BaoCaoDoanhThuDichVuController {

    private final BaoCaoDoanhThuDichVuService baoCaoDoanhThuDichVuService;

    public BaoCaoDoanhThuDichVuController(BaoCaoDoanhThuDichVuService baoCaoDoanhThuDichVuService) {
        this.baoCaoDoanhThuDichVuService = baoCaoDoanhThuDichVuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BaoCaoDoanhThuDichVuResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach bao cao doanh thu dich vu thanh cong", baoCaoDoanhThuDichVuService.getAll(keyword)));
    }

    @GetMapping("/{maBaoCaoDoanhThuDv}")
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuDichVuResponse>> getById(@PathVariable String maBaoCaoDoanhThuDv) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet bao cao doanh thu dich vu thanh cong", baoCaoDoanhThuDichVuService.getById(maBaoCaoDoanhThuDv)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuDichVuResponse>> create(@Valid @RequestBody BaoCaoDoanhThuDichVuRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao bao cao doanh thu dich vu thanh cong", baoCaoDoanhThuDichVuService.create(request)));
    }

    @PutMapping("/{maBaoCaoDoanhThuDv}")
    public ResponseEntity<ApiResponse<BaoCaoDoanhThuDichVuResponse>> update(
        @PathVariable String maBaoCaoDoanhThuDv,
        @Valid @RequestBody BaoCaoDoanhThuDichVuRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat bao cao doanh thu dich vu thanh cong", baoCaoDoanhThuDichVuService.update(maBaoCaoDoanhThuDv, request)));
    }

    @DeleteMapping("/{maBaoCaoDoanhThuDv}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maBaoCaoDoanhThuDv) {
        baoCaoDoanhThuDichVuService.delete(maBaoCaoDoanhThuDv);
        return ResponseEntity.ok(ApiResponse.success("Xoa bao cao doanh thu dich vu thanh cong", null));
    }
}