package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.ChucNangRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.ChucNangResponse;
import com.se104.goldstore.service.ChucNangService;
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
@RequestMapping(ApiPaths.CHUC_NANG)
public class ChucNangController {

    private final ChucNangService chucNangService;

    public ChucNangController(ChucNangService chucNangService) {
        this.chucNangService = chucNangService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChucNangResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach chuc nang thanh cong", chucNangService.getAll(keyword)));
    }

    @GetMapping("/{maChucNang}")
    public ResponseEntity<ApiResponse<ChucNangResponse>> getById(@PathVariable String maChucNang) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet chuc nang thanh cong", chucNangService.getById(maChucNang)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChucNangResponse>> create(@Valid @RequestBody ChucNangRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao chuc nang thanh cong", chucNangService.create(request)));
    }

    @PutMapping("/{maChucNang}")
    public ResponseEntity<ApiResponse<ChucNangResponse>> update(
        @PathVariable String maChucNang,
        @Valid @RequestBody ChucNangRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat chuc nang thanh cong", chucNangService.update(maChucNang, request)));
    }

    @DeleteMapping("/{maChucNang}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maChucNang) {
        chucNangService.delete(maChucNang);
        return ResponseEntity.ok(ApiResponse.success("Xoa chuc nang thanh cong", null));
    }
}