package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.NguoiDungRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.NguoiDungResponse;
import com.se104.goldstore.service.NguoiDungService;
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
@RequestMapping(ApiPaths.NGUOI_DUNG)
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    public NguoiDungController(NguoiDungService nguoiDungService) {
        this.nguoiDungService = nguoiDungService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NguoiDungResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach nguoi dung thanh cong", nguoiDungService.getAll(keyword)));
    }

    @GetMapping("/{tenDangNhap}")
    public ResponseEntity<ApiResponse<NguoiDungResponse>> getById(@PathVariable String tenDangNhap) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet nguoi dung thanh cong", nguoiDungService.getById(tenDangNhap)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NguoiDungResponse>> create(@Valid @RequestBody NguoiDungRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao nguoi dung thanh cong", nguoiDungService.create(request)));
    }

    @PutMapping("/{tenDangNhap}")
    public ResponseEntity<ApiResponse<NguoiDungResponse>> update(
        @PathVariable String tenDangNhap,
        @Valid @RequestBody NguoiDungRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat nguoi dung thanh cong", nguoiDungService.update(tenDangNhap, request)));
    }

    @DeleteMapping("/{tenDangNhap}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String tenDangNhap) {
        nguoiDungService.delete(tenDangNhap);
        return ResponseEntity.ok(ApiResponse.success("Xoa nguoi dung thanh cong", null));
    }
}