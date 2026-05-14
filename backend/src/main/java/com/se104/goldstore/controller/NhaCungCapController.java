package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.NhaCungCapRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.NhaCungCapResponse;
import com.se104.goldstore.service.NhaCungCapService;
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
@RequestMapping(ApiPaths.NHA_CUNG_CAP)
public class NhaCungCapController {

    private final NhaCungCapService nhaCungCapService;

    public NhaCungCapController(NhaCungCapService nhaCungCapService) {
        this.nhaCungCapService = nhaCungCapService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NhaCungCapResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach nha cung cap thanh cong", nhaCungCapService.getAll(keyword)));
    }

    @GetMapping("/{maNhaCungCap}")
    public ResponseEntity<ApiResponse<NhaCungCapResponse>> getById(@PathVariable String maNhaCungCap) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet nha cung cap thanh cong", nhaCungCapService.getById(maNhaCungCap)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NhaCungCapResponse>> create(@Valid @RequestBody NhaCungCapRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao nha cung cap thanh cong", nhaCungCapService.create(request)));
    }

    @PutMapping("/{maNhaCungCap}")
    public ResponseEntity<ApiResponse<NhaCungCapResponse>> update(
        @PathVariable String maNhaCungCap,
        @Valid @RequestBody NhaCungCapRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat nha cung cap thanh cong", nhaCungCapService.update(maNhaCungCap, request)));
    }

    @DeleteMapping("/{maNhaCungCap}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maNhaCungCap) {
        nhaCungCapService.delete(maNhaCungCap);
        return ResponseEntity.ok(ApiResponse.success("Xoa nha cung cap thanh cong", null));
    }
}
