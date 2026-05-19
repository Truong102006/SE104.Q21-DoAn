package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.DonViTinhRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.DonViTinhResponse;
import com.se104.goldstore.service.DonViTinhService;
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
@RequestMapping({ ApiPaths.DON_VI_TINH, ApiPaths.UNITS })
public class DonViTinhController {

    private final DonViTinhService donViTinhService;

    public DonViTinhController(DonViTinhService donViTinhService) {
        this.donViTinhService = donViTinhService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DonViTinhResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach don vi tinh thanh cong", donViTinhService.getAll(keyword)));
    }

    @GetMapping("/{maDonViTinh}")
    public ResponseEntity<ApiResponse<DonViTinhResponse>> getById(@PathVariable String maDonViTinh) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet don vi tinh thanh cong", donViTinhService.getById(maDonViTinh)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DonViTinhResponse>> create(@Valid @RequestBody DonViTinhRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao don vi tinh thanh cong", donViTinhService.create(request)));
    }

    @PutMapping("/{maDonViTinh}")
    public ResponseEntity<ApiResponse<DonViTinhResponse>> update(
        @PathVariable String maDonViTinh,
        @Valid @RequestBody DonViTinhRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat don vi tinh thanh cong", donViTinhService.update(maDonViTinh, request)));
    }

    @DeleteMapping("/{maDonViTinh}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maDonViTinh) {
        donViTinhService.delete(maDonViTinh);
        return ResponseEntity.ok(ApiResponse.success("Xoa don vi tinh thanh cong", null));
    }
}
