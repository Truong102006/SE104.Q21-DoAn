package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.NhomNguoiDungRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.NhomNguoiDungResponse;
import com.se104.goldstore.service.NhomNguoiDungService;
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
@RequestMapping(ApiPaths.NHOM_NGUOI_DUNG)
public class NhomNguoiDungController {

    private final NhomNguoiDungService nhomNguoiDungService;

    public NhomNguoiDungController(NhomNguoiDungService nhomNguoiDungService) {
        this.nhomNguoiDungService = nhomNguoiDungService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NhomNguoiDungResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach nhom nguoi dung thanh cong", nhomNguoiDungService.getAll(keyword)));
    }

    @GetMapping("/{maNhom}")
    public ResponseEntity<ApiResponse<NhomNguoiDungResponse>> getById(@PathVariable String maNhom) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet nhom nguoi dung thanh cong", nhomNguoiDungService.getById(maNhom)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NhomNguoiDungResponse>> create(@Valid @RequestBody NhomNguoiDungRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao nhom nguoi dung thanh cong", nhomNguoiDungService.create(request)));
    }

    @PutMapping("/{maNhom}")
    public ResponseEntity<ApiResponse<NhomNguoiDungResponse>> update(
        @PathVariable String maNhom,
        @Valid @RequestBody NhomNguoiDungRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat nhom nguoi dung thanh cong", nhomNguoiDungService.update(maNhom, request)));
    }

    @DeleteMapping("/{maNhom}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maNhom) {
        nhomNguoiDungService.delete(maNhom);
        return ResponseEntity.ok(ApiResponse.success("Xoa nhom nguoi dung thanh cong", null));
    }
}