package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.KhachHangRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.KhachHangResponse;
import com.se104.goldstore.service.KhachHangService;
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
@RequestMapping(ApiPaths.KHACH_HANG)
public class KhachHangController {

    private final KhachHangService khachHangService;

    public KhachHangController(KhachHangService khachHangService) {
        this.khachHangService = khachHangService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<KhachHangResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach khach hang thanh cong", khachHangService.getAll(keyword)));
    }

    @GetMapping("/{maKhachHang}")
    public ResponseEntity<ApiResponse<KhachHangResponse>> getById(@PathVariable String maKhachHang) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet khach hang thanh cong", khachHangService.getById(maKhachHang)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KhachHangResponse>> create(@Valid @RequestBody KhachHangRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao khach hang thanh cong", khachHangService.create(request)));
    }

    @PutMapping("/{maKhachHang}")
    public ResponseEntity<ApiResponse<KhachHangResponse>> update(
        @PathVariable String maKhachHang,
        @Valid @RequestBody KhachHangRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat khach hang thanh cong", khachHangService.update(maKhachHang, request)));
    }

    @DeleteMapping("/{maKhachHang}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maKhachHang) {
        khachHangService.delete(maKhachHang);
        return ResponseEntity.ok(ApiResponse.success("Xoa khach hang thanh cong", null));
    }
}
