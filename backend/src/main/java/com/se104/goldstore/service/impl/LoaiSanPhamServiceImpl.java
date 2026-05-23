package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.PricingUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.LoaiSanPhamRequest;
import com.se104.goldstore.dto.response.LoaiSanPhamResponse;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.SanPham;
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
            throw new BusinessException("Tên loại sản phẩm đã tồn tại");
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
            throw new BusinessException("Mã loại sản phẩm đã tồn tại");
        }

        LoaiSanPham entity = new LoaiSanPham();
        entity.setMaLoaiSanPham(maLoaiSanPham);
        entity.setTenLoaiSanPham(request.getTenLoaiSanPham().trim());
        entity.setTiLeLoiNhuan(request.getTiLeLoiNhuan());
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return toResponse(loaiSanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public LoaiSanPhamResponse update(String maLoaiSanPham, LoaiSanPhamRequest request) {
        LoaiSanPham entity = findByIdOrThrow(maLoaiSanPham);
        boolean changedProfitRate = entity.getTiLeLoiNhuan().compareTo(request.getTiLeLoiNhuan()) != 0;

        if (loaiSanPhamRepository.existsByTenLoaiSanPhamIgnoreCaseAndMaLoaiSanPhamNot(request.getTenLoaiSanPham().trim(), maLoaiSanPham)) {
            throw new BusinessException("Tên loại sản phẩm đã tồn tại");
        }

        entity.setTenLoaiSanPham(request.getTenLoaiSanPham().trim());
        entity.setTiLeLoiNhuan(request.getTiLeLoiNhuan());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        LoaiSanPham saved = loaiSanPhamRepository.save(entity);

        if (changedProfitRate) {
            List<SanPham> sanPhams = sanPhamRepository.findByMaLoaiSanPham(maLoaiSanPham);
            if (!sanPhams.isEmpty()) {
                for (SanPham sanPham : sanPhams) {
                    sanPham.setDonGiaBan(PricingUtils.calculateSellingPrice(sanPham.getDonGiaMua(), saved.getTiLeLoiNhuan()));
                }
                sanPhamRepository.saveAll(sanPhams);
            }
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(String maLoaiSanPham) {
        LoaiSanPham entity = findByIdOrThrow(maLoaiSanPham);
        if (sanPhamRepository.existsByMaLoaiSanPham(maLoaiSanPham)) {
            throw new BusinessException("Không thể xóa loại sản phẩm đã có sản phẩm liên quan");
        }
        try {
            loaiSanPhamRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa loại sản phẩm đã có dữ liệu liên quan");
        }
    }

    private LoaiSanPham findByIdOrThrow(String maLoaiSanPham) {
        return loaiSanPhamRepository.findById(maLoaiSanPham)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại sản phẩm: " + maLoaiSanPham));
    }

    private LoaiSanPhamResponse toResponse(LoaiSanPham entity) {
        LoaiSanPhamResponse response = new LoaiSanPhamResponse();
        response.setMaLoaiSanPham(entity.getMaLoaiSanPham());
        response.setTenLoaiSanPham(entity.getTenLoaiSanPham());
        response.setTiLeLoiNhuan(entity.getTiLeLoiNhuan());
        response.setIsActive(entity.getIsActive());
        return response;
    }
}
