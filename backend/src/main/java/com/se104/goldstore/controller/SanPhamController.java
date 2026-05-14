package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.SanPhamRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.SanPhamResponse;
import com.se104.goldstore.service.SanPhamService;
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
@RequestMapping(ApiPaths.SAN_PHAM)
public class SanPhamController {

    private final SanPhamService sanPhamService;

    public SanPhamController(SanPhamService sanPhamService) {
        this.sanPhamService = sanPhamService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SanPhamResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach san pham thanh cong", sanPhamService.getAll(keyword)));
    }

    @GetMapping("/{maSanPham}")
    public ResponseEntity<ApiResponse<SanPhamResponse>> getById(@PathVariable String maSanPham) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet san pham thanh cong", sanPhamService.getById(maSanPham)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SanPhamResponse>> create(@Valid @RequestBody SanPhamRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao san pham thanh cong", sanPhamService.create(request)));
    }

    @PutMapping("/{maSanPham}")
    public ResponseEntity<ApiResponse<SanPhamResponse>> update(
        @PathVariable String maSanPham,
        @Valid @RequestBody SanPhamRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat san pham thanh cong", sanPhamService.update(maSanPham, request)));
    }

    @DeleteMapping("/{maSanPham}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maSanPham) {
        sanPhamService.delete(maSanPham);
        return ResponseEntity.ok(ApiResponse.success("Xoa san pham thanh cong", null));
    }
}
