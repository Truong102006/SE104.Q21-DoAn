package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.PhieuMuaHangRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.PhieuMuaHangResponse;
import com.se104.goldstore.service.PhieuMuaHangService;
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
@RequestMapping(ApiPaths.PHIEU_MUA_HANG)
public class PhieuMuaHangController {

    private final PhieuMuaHangService phieuMuaHangService;

    public PhieuMuaHangController(PhieuMuaHangService phieuMuaHangService) {
        this.phieuMuaHangService = phieuMuaHangService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PhieuMuaHangResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach phieu mua hang thanh cong", phieuMuaHangService.getAll(keyword)));
    }

    @GetMapping("/{soPhieuMua}")
    public ResponseEntity<ApiResponse<PhieuMuaHangResponse>> getById(@PathVariable String soPhieuMua) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet phieu mua hang thanh cong", phieuMuaHangService.getById(soPhieuMua)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhieuMuaHangResponse>> create(@Valid @RequestBody PhieuMuaHangRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao phieu mua hang thanh cong", phieuMuaHangService.create(request)));
    }

    @PutMapping("/{soPhieuMua}")
    public ResponseEntity<ApiResponse<PhieuMuaHangResponse>> update(
        @PathVariable String soPhieuMua,
        @Valid @RequestBody PhieuMuaHangRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat phieu mua hang thanh cong", phieuMuaHangService.update(soPhieuMua, request)));
    }

    @DeleteMapping("/{soPhieuMua}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String soPhieuMua) {
        phieuMuaHangService.delete(soPhieuMua);
        return ResponseEntity.ok(ApiResponse.success("Xoa phieu mua hang thanh cong", null));
    }
}
