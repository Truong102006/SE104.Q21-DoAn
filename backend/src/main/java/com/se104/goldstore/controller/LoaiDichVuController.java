package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.LoaiDichVuRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.LoaiDichVuResponse;
import com.se104.goldstore.service.LoaiDichVuService;
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
@RequestMapping({ ApiPaths.LOAI_DICH_VU, ApiPaths.SERVICE_TYPES })
public class LoaiDichVuController {

    private final LoaiDichVuService loaiDichVuService;

    public LoaiDichVuController(LoaiDichVuService loaiDichVuService) {
        this.loaiDichVuService = loaiDichVuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoaiDichVuResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach loai dich vu thanh cong", loaiDichVuService.getAll(keyword)));
    }

    @GetMapping("/{maLoaiDichVu}")
    public ResponseEntity<ApiResponse<LoaiDichVuResponse>> getById(@PathVariable String maLoaiDichVu) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet loai dich vu thanh cong", loaiDichVuService.getById(maLoaiDichVu)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LoaiDichVuResponse>> create(@Valid @RequestBody LoaiDichVuRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao loai dich vu thanh cong", loaiDichVuService.create(request)));
    }

    @PutMapping("/{maLoaiDichVu}")
    public ResponseEntity<ApiResponse<LoaiDichVuResponse>> update(
        @PathVariable String maLoaiDichVu,
        @Valid @RequestBody LoaiDichVuRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat loai dich vu thanh cong", loaiDichVuService.update(maLoaiDichVu, request)));
    }

    @DeleteMapping("/{maLoaiDichVu}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maLoaiDichVu) {
        loaiDichVuService.delete(maLoaiDichVu);
        return ResponseEntity.ok(ApiResponse.success("Xoa loai dich vu thanh cong", null));
    }
}
