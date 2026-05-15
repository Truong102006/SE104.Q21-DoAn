package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.BaoCaoTonKhoRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.BaoCaoTonKhoResponse;
import com.se104.goldstore.service.BaoCaoTonKhoService;
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
@RequestMapping(ApiPaths.BAO_CAO_TON_KHO)
public class BaoCaoTonKhoController {

    private final BaoCaoTonKhoService baoCaoTonKhoService;

    public BaoCaoTonKhoController(BaoCaoTonKhoService baoCaoTonKhoService) {
        this.baoCaoTonKhoService = baoCaoTonKhoService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BaoCaoTonKhoResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach bao cao ton kho thanh cong", baoCaoTonKhoService.getAll(keyword)));
    }

    @GetMapping("/{maBaoCaoTonKho}")
    public ResponseEntity<ApiResponse<BaoCaoTonKhoResponse>> getById(@PathVariable String maBaoCaoTonKho) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet bao cao ton kho thanh cong", baoCaoTonKhoService.getById(maBaoCaoTonKho)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BaoCaoTonKhoResponse>> create(@Valid @RequestBody BaoCaoTonKhoRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao bao cao ton kho thanh cong", baoCaoTonKhoService.create(request)));
    }

    @PutMapping("/{maBaoCaoTonKho}")
    public ResponseEntity<ApiResponse<BaoCaoTonKhoResponse>> update(
        @PathVariable String maBaoCaoTonKho,
        @Valid @RequestBody BaoCaoTonKhoRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat bao cao ton kho thanh cong", baoCaoTonKhoService.update(maBaoCaoTonKho, request)));
    }

    @DeleteMapping("/{maBaoCaoTonKho}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maBaoCaoTonKho) {
        baoCaoTonKhoService.delete(maBaoCaoTonKho);
        return ResponseEntity.ok(ApiResponse.success("Xoa bao cao ton kho thanh cong", null));
    }
}