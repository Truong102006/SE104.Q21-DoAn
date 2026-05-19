package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.LoaiSanPhamRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.LoaiSanPhamResponse;
import com.se104.goldstore.service.LoaiSanPhamService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping({ ApiPaths.LOAI_SAN_PHAM, ApiPaths.PRODUCT_TYPES })
public class LoaiSanPhamController {

    private final LoaiSanPhamService loaiSanPhamService;

    public LoaiSanPhamController(LoaiSanPhamService loaiSanPhamService) {
        this.loaiSanPhamService = loaiSanPhamService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoaiSanPhamResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach loai san pham thanh cong", loaiSanPhamService.getAll(keyword)));
    }

    @GetMapping("/{maLoaiSanPham}")
    public ResponseEntity<ApiResponse<LoaiSanPhamResponse>> getById(@PathVariable String maLoaiSanPham) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet loai san pham thanh cong", loaiSanPhamService.getById(maLoaiSanPham)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LoaiSanPhamResponse>> create(@Valid @RequestBody LoaiSanPhamRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao loai san pham thanh cong", loaiSanPhamService.create(request)));
    }

    @PutMapping("/{maLoaiSanPham}")
    public ResponseEntity<ApiResponse<LoaiSanPhamResponse>> update(
        @PathVariable String maLoaiSanPham,
        @Valid @RequestBody LoaiSanPhamRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat loai san pham thanh cong", loaiSanPhamService.update(maLoaiSanPham, request)));
    }

    @DeleteMapping("/{maLoaiSanPham}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maLoaiSanPham) {
        loaiSanPhamService.delete(maLoaiSanPham);
        return ResponseEntity.ok(ApiResponse.success("Xoa loai san pham thanh cong", null));
    }
}
