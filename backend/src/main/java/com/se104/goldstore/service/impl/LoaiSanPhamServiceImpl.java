package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.LoaiSanPhamRequest;
import com.se104.goldstore.dto.response.LoaiSanPhamResponse;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.LoaiSanPhamService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class LoaiSanPhamServiceImpl implements LoaiSanPhamService {

    private static final String PREFIX = "LSP";

    private final LoaiSanPhamRepository loaiSanPhamRepository;
    private final SanPhamRepository sanPhamRepository;

    public LoaiSanPhamServiceImpl(
        LoaiSanPhamRepository loaiSanPhamRepository,
        SanPhamRepository sanPhamRepository
    ) {
        this.loaiSanPhamRepository = loaiSanPhamRepository;
        this.sanPhamRepository = sanPhamRepository;
    }

    @Override
    public List<LoaiSanPhamResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<LoaiSanPham> entities = normalized.isEmpty()
            ? loaiSanPhamRepository.findAll()
            : loaiSanPhamRepository.findByTenLoaiSanPhamContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public LoaiSanPhamResponse getById(String maLoaiSanPham) {
        return toResponse(findByIdOrThrow(maLoaiSanPham));
    }

    @Override
    @Transactional
    public LoaiSanPhamResponse create(LoaiSanPhamRequest request) {
        if (loaiSanPhamRepository.existsByTenLoaiSanPhamIgnoreCase(request.getTenLoaiSanPham().trim())) {
            throw new BusinessException("Ten loai san pham da ton tai");
        }

        String maLoaiSanPham = request.getMaLoaiSanPham();
        if (maLoaiSanPham == null || maLoaiSanPham.isBlank()) {
            String currentMaxCode = loaiSanPhamRepository
                .findTopByMaLoaiSanPhamStartingWithOrderByMaLoaiSanPhamDesc(PREFIX)
                .map(LoaiSanPham::getMaLoaiSanPham)
                .orElse(null);
            maLoaiSanPham = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (loaiSanPhamRepository.existsById(maLoaiSanPham)) {
            throw new BusinessException("Ma loai san pham da ton tai");
        }

        LoaiSanPham entity = new LoaiSanPham();
        entity.setMaLoaiSanPham(maLoaiSanPham);
        entity.setTenLoaiSanPham(request.getTenLoaiSanPham().trim());
        entity.setTiLeLoiNhuan(request.getTiLeLoiNhuan());

        return toResponse(loaiSanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public LoaiSanPhamResponse update(String maLoaiSanPham, LoaiSanPhamRequest request) {
        LoaiSanPham entity = findByIdOrThrow(maLoaiSanPham);

        if (loaiSanPhamRepository.existsByTenLoaiSanPhamIgnoreCaseAndMaLoaiSanPhamNot(request.getTenLoaiSanPham().trim(), maLoaiSanPham)) {
            throw new BusinessException("Ten loai san pham da ton tai");
        }

        entity.setTenLoaiSanPham(request.getTenLoaiSanPham().trim());
        entity.setTiLeLoiNhuan(request.getTiLeLoiNhuan());

        return toResponse(loaiSanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maLoaiSanPham) {
        LoaiSanPham entity = findByIdOrThrow(maLoaiSanPham);
        if (sanPhamRepository.existsByMaLoaiSanPham(maLoaiSanPham)) {
            throw new BusinessException("Khong the xoa loai san pham da co san pham thuoc loai nay");
        }
        try {
            loaiSanPhamRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa loai san pham da co du lieu lien quan");
        }
    }

    private LoaiSanPham findByIdOrThrow(String maLoaiSanPham) {
        return loaiSanPhamRepository.findById(maLoaiSanPham)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay loai san pham: " + maLoaiSanPham));
    }

    private LoaiSanPhamResponse toResponse(LoaiSanPham entity) {
        LoaiSanPhamResponse response = new LoaiSanPhamResponse();
        response.setMaLoaiSanPham(entity.getMaLoaiSanPham());
        response.setTenLoaiSanPham(entity.getTenLoaiSanPham());
        response.setTiLeLoiNhuan(entity.getTiLeLoiNhuan());
        return response;
    }
}
