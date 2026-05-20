package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.PhieuMuaHangRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.PhieuMuaHangResponse;
import com.se104.goldstore.service.PhieuMuaHangService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ ApiPaths.PHIEU_MUA_HANG, ApiPaths.PURCHASES })
public class PhieuMuaHangController {

    private final PhieuMuaHangService phieuMuaHangService;

    public PhieuMuaHangController(PhieuMuaHangService phieuMuaHangService) {
        this.phieuMuaHangService = phieuMuaHangService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhieuMuaHangResponse>>> getAll(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "q", required = false) String keywordLegacy
    ) {
        String resolvedKeyword = keyword != null ? keyword : keywordLegacy;
        return ResponseEntity.ok(
            ApiResponse.success("Lay danh sach phieu mua hang thanh cong", phieuMuaHangService.getAll(resolvedKeyword))
        );
    }

    @GetMapping("/{soPhieuMua}")
    public ResponseEntity<ApiResponse<PhieuMuaHangResponse>> getById(@PathVariable String soPhieuMua) {
        return ResponseEntity.ok(
            ApiResponse.success("Lay chi tiet phieu mua hang thanh cong", phieuMuaHangService.getById(soPhieuMua))
        );
    }

    @GetMapping("/{soPhieuMua}/print-data")
    public ResponseEntity<ApiResponse<PhieuMuaHangResponse>> getPrintData(@PathVariable String soPhieuMua) {
        return ResponseEntity.ok(
            ApiResponse.success("Lay du lieu in phieu mua hang thanh cong", phieuMuaHangService.getPrintData(soPhieuMua))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhieuMuaHangResponse>> create(@Valid @RequestBody PhieuMuaHangRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao phieu mua hang thanh cong", phieuMuaHangService.create(request)));
    }
}
