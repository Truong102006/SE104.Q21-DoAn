package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.PhieuDichVuRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.PhieuDichVuResponse;
import com.se104.goldstore.service.PhieuDichVuService;
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
@RequestMapping(ApiPaths.PHIEU_DICH_VU)
public class PhieuDichVuController {

    private final PhieuDichVuService phieuDichVuService;

    public PhieuDichVuController(PhieuDichVuService phieuDichVuService) {
        this.phieuDichVuService = phieuDichVuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhieuDichVuResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach phieu dich vu thanh cong", phieuDichVuService.getAll(keyword)));
    }

    @GetMapping("/{soPhieuDichVu}")
    public ResponseEntity<ApiResponse<PhieuDichVuResponse>> getById(@PathVariable String soPhieuDichVu) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet phieu dich vu thanh cong", phieuDichVuService.getById(soPhieuDichVu)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhieuDichVuResponse>> create(@Valid @RequestBody PhieuDichVuRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao phieu dich vu thanh cong", phieuDichVuService.create(request)));
    }

    @PutMapping("/{soPhieuDichVu}")
    public ResponseEntity<ApiResponse<PhieuDichVuResponse>> update(
        @PathVariable String soPhieuDichVu,
        @Valid @RequestBody PhieuDichVuRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat phieu dich vu thanh cong", phieuDichVuService.update(soPhieuDichVu, request)));
    }

    @DeleteMapping("/{soPhieuDichVu}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String soPhieuDichVu) {
        phieuDichVuService.delete(soPhieuDichVu);
        return ResponseEntity.ok(ApiResponse.success("Xoa phieu dich vu thanh cong", null));
    }
}
