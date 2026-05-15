package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.ThamSoRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.ThamSoResponse;
import com.se104.goldstore.service.ThamSoService;
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
@RequestMapping(ApiPaths.THAM_SO)
public class ThamSoController {

    private final ThamSoService thamSoService;

    public ThamSoController(ThamSoService thamSoService) {
        this.thamSoService = thamSoService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ThamSoResponse>>> getAll(
        @RequestParam(name = "q", required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach tham so thanh cong", thamSoService.getAll(keyword)));
    }

    @GetMapping("/{maThamSo}")
    public ResponseEntity<ApiResponse<ThamSoResponse>> getById(@PathVariable String maThamSo) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet tham so thanh cong", thamSoService.getById(maThamSo)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ThamSoResponse>> create(@Valid @RequestBody ThamSoRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao tham so thanh cong", thamSoService.create(request)));
    }

    @PutMapping("/{maThamSo}")
    public ResponseEntity<ApiResponse<ThamSoResponse>> update(
        @PathVariable String maThamSo,
        @Valid @RequestBody ThamSoRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cap nhat tham so thanh cong", thamSoService.update(maThamSo, request)));
    }

    @DeleteMapping("/{maThamSo}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable String maThamSo) {
        thamSoService.delete(maThamSo);
        return ResponseEntity.ok(ApiResponse.success("Xoa tham so thanh cong", null));
    }
}