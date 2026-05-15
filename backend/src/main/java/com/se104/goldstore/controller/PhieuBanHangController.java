package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.PhieuBanHangRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.PhieuBanHangResponse;
import com.se104.goldstore.service.PhieuBanHangService;
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
@RequestMapping(ApiPaths.PHIEU_BAN_HANG)
public class PhieuBanHangController {

    private final PhieuBanHangService phieuBanHangService;

    public PhieuBanHangController(PhieuBanHangService phieuBanHangService) {
        this.phieuBanHangService = phieuBanHangService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhieuBanHangResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach phieu ban hang thanh cong", phieuBanHangService.getAll(keyword)));
    }

    @GetMapping("/{soPhieuBan}")
    public ResponseEntity<ApiResponse<PhieuBanHangResponse>> getById(@PathVariable String soPhieuBan) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet phieu ban hang thanh cong", phieuBanHangService.getById(soPhieuBan)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhieuBanHangResponse>> create(@Valid @RequestBody PhieuBanHangRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao phieu ban hang thanh cong", phieuBanHangService.create(request)));
    }

    @PutMapping("/{soPhieuBan}")
    public ResponseEntity<ApiResponse<PhieuBanHangResponse>> update(
        @PathVariable String soPhieuBan,
        @Valid @RequestBody PhieuBanHangRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat phieu ban hang thanh cong", phieuBanHangService.update(soPhieuBan, request)));
    }

    @DeleteMapping("/{soPhieuBan}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String soPhieuBan) {
        phieuBanHangService.delete(soPhieuBan);
        return ResponseEntity.ok(ApiResponse.success("Xoa phieu ban hang thanh cong", null));
    }
}
