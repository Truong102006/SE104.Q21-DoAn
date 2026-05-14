package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.SanPhamRequest;
import com.se104.goldstore.dto.response.SanPhamResponse;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.SanPhamService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SanPhamServiceImpl implements SanPhamService {

    private static final String PREFIX = "SP";

    private final SanPhamRepository sanPhamRepository;
    private final LoaiSanPhamRepository loaiSanPhamRepository;
    private final DonViTinhRepository donViTinhRepository;

    public SanPhamServiceImpl(
        SanPhamRepository sanPhamRepository,
        LoaiSanPhamRepository loaiSanPhamRepository,
        DonViTinhRepository donViTinhRepository
    ) {
        this.sanPhamRepository = sanPhamRepository;
        this.loaiSanPhamRepository = loaiSanPhamRepository;
        this.donViTinhRepository = donViTinhRepository;
    }

    @Override
    public List<SanPhamResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<SanPham> entities = normalized.isEmpty()
            ? sanPhamRepository.findAll()
            : sanPhamRepository.findByTenSanPhamContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public SanPhamResponse getById(String maSanPham) {
        return toResponse(findByIdOrThrow(maSanPham));
    }

    @Override
    @Transactional
    public SanPhamResponse create(SanPhamRequest request) {
        validateReferences(request.getMaLoaiSanPham(), request.getMaDonViTinh());

        String maSanPham = request.getMaSanPham();
        if (maSanPham == null || maSanPham.isBlank()) {
            String currentMaxCode = sanPhamRepository
                .findTopByMaSanPhamStartingWithOrderByMaSanPhamDesc(PREFIX)
                .map(SanPham::getMaSanPham)
                .orElse(null);
            maSanPham = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (sanPhamRepository.existsById(maSanPham)) {
            throw new BusinessException("Ma san pham da ton tai");
        }

        SanPham entity = new SanPham();
        entity.setMaSanPham(maSanPham);
        entity.setTenSanPham(request.getTenSanPham().trim());
        entity.setMaLoaiSanPham(request.getMaLoaiSanPham().trim());
        entity.setMaDonViTinh(request.getMaDonViTinh().trim());
        entity.setDonGiaMua(request.getDonGiaMua());
        entity.setDonGiaBan(request.getDonGiaBan());
        entity.setTonKho(request.getTonKho());

        return toResponse(sanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public SanPhamResponse update(String maSanPham, SanPhamRequest request) {
        SanPham entity = findByIdOrThrow(maSanPham);
        validateReferences(request.getMaLoaiSanPham(), request.getMaDonViTinh());

        entity.setTenSanPham(request.getTenSanPham().trim());
        entity.setMaLoaiSanPham(request.getMaLoaiSanPham().trim());
        entity.setMaDonViTinh(request.getMaDonViTinh().trim());
        entity.setDonGiaMua(request.getDonGiaMua());
        entity.setDonGiaBan(request.getDonGiaBan());
        entity.setTonKho(request.getTonKho());

        return toResponse(sanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maSanPham) {
        SanPham entity = findByIdOrThrow(maSanPham);
        try {
            sanPhamRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa san pham da co du lieu lien quan");
        }
    }

    private SanPham findByIdOrThrow(String maSanPham) {
        return sanPhamRepository.findById(maSanPham)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay san pham: " + maSanPham));
    }

    private void validateReferences(String maLoaiSanPham, String maDonViTinh) {
        if (!loaiSanPhamRepository.existsById(maLoaiSanPham.trim())) {
            throw new BusinessException("Ma loai san pham khong ton tai");
        }
        if (!donViTinhRepository.existsById(maDonViTinh.trim())) {
            throw new BusinessException("Ma don vi tinh khong ton tai");
        }
    }

    private SanPhamResponse toResponse(SanPham entity) {
        SanPhamResponse response = new SanPhamResponse();
        response.setMaSanPham(entity.getMaSanPham());
        response.setTenSanPham(entity.getTenSanPham());
        response.setMaLoaiSanPham(entity.getMaLoaiSanPham());
        response.setMaDonViTinh(entity.getMaDonViTinh());
        response.setDonGiaMua(entity.getDonGiaMua());
        response.setDonGiaBan(entity.getDonGiaBan());
        response.setTonKho(entity.getTonKho());
        return response;
    }
}
