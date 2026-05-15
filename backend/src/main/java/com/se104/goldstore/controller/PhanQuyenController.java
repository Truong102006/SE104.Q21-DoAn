package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.PhanQuyenRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.PhanQuyenResponse;
import com.se104.goldstore.service.PhanQuyenService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.PHAN_QUYEN)
public class PhanQuyenController {

    private final PhanQuyenService phanQuyenService;

    public PhanQuyenController(PhanQuyenService phanQuyenService) {
        this.phanQuyenService = phanQuyenService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhanQuyenResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach phan quyen thanh cong", phanQuyenService.getAll(keyword)));
    }

    @GetMapping("/{maNhom}/{maChucNang}")
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> getById(
        @PathVariable String maNhom,
        @PathVariable String maChucNang
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet phan quyen thanh cong", phanQuyenService.getById(maNhom, maChucNang)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhanQuyenResponse>> create(@Valid @RequestBody PhanQuyenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao phan quyen thanh cong", phanQuyenService.create(request)));
    }

    @DeleteMapping("/{maNhom}/{maChucNang}")
    public ResponseEntity<ApiResponse<Object>> delete(
        @PathVariable String maNhom,
        @PathVariable String maChucNang
    ) {
        phanQuyenService.delete(maNhom, maChucNang);
        return ResponseEntity.ok(ApiResponse.success("Xoa phan quyen thanh cong", null));
    }
}