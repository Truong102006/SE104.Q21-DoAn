package com.se104.goldstore.controller;

import com.se104.goldstore.common.ApiPaths;
import com.se104.goldstore.dto.request.PhieuDichVuDeliverRequest;
import com.se104.goldstore.dto.request.PhieuDichVuRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.PhieuDichVuResponse;
import com.se104.goldstore.service.PhieuDichVuService;
import jakarta.validation.Valid;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ ApiPaths.PHIEU_DICH_VU, ApiPaths.SERVICE_TICKETS })
public class PhieuDichVuController {

    private final PhieuDichVuService phieuDichVuService;

    public PhieuDichVuController(PhieuDichVuService phieuDichVuService) {
        this.phieuDichVuService = phieuDichVuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAll(
        @RequestParam(name = "keyword", required = false) String keyword,
        @RequestParam(name = "q", required = false) String keywordLegacy,
        @RequestParam(name = "page", required = false) Integer page,
        @RequestParam(name = "size", required = false) Integer size
    ) {
        String resolvedKeyword = keyword != null ? keyword : keywordLegacy;
        if (page != null && size != null) {
            return ResponseEntity.ok(
                ApiResponse.success(
                    "Lay danh sach phieu dich vu thanh cong",
                    phieuDichVuService.getAllPaginated(resolvedKeyword, page, size)
                )
            );
        }
        return ResponseEntity.ok(
            ApiResponse.success("Lay danh sach phieu dich vu thanh cong", phieuDichVuService.getAll(resolvedKeyword))
        );
    }

    @GetMapping("/{soPhieuDichVu}")
    public ResponseEntity<ApiResponse<PhieuDichVuResponse>> getById(@PathVariable String soPhieuDichVu) {
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet phieu dich vu thanh cong", phieuDichVuService.getById(soPhieuDichVu)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PhieuDichVuResponse>> create(@Valid @RequestBody PhieuDichVuRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tao phieu dich vu thanh cong", phieuDichVuService.create(request)));
    }

    @PatchMapping("/{soPhieuDichVu}/items/{maLoaiDichVu}/deliver")
    public ResponseEntity<ApiResponse<PhieuDichVuResponse>> deliverItem(
        @PathVariable String soPhieuDichVu,
        @PathVariable String maLoaiDichVu,
        @RequestBody(required = false) PhieuDichVuDeliverRequest request
    ) {
        LocalDate ngayGiao = request != null ? request.getNgayGiao() : null;
        return ResponseEntity.ok(
            ApiResponse.success(
                "Giao hang dich vu thanh cong",
                phieuDichVuService.deliverItem(soPhieuDichVu, maLoaiDichVu, ngayGiao)
            )
        );
    }

    @PatchMapping("/{soPhieuDichVu}/deliver-all")
    public ResponseEntity<ApiResponse<PhieuDichVuResponse>> deliverAll(
        @PathVariable String soPhieuDichVu,
        @RequestBody(required = false) PhieuDichVuDeliverRequest request
    ) {
        LocalDate ngayGiao = request != null ? request.getNgayGiao() : null;
        return ResponseEntity.ok(
            ApiResponse.success("Giao toan bo dich vu thanh cong", phieuDichVuService.deliverAll(soPhieuDichVu, ngayGiao))
        );
    }
}
