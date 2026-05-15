package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.ChucNangRequest;
import com.se104.goldstore.dto.response.ChucNangResponse;
import com.se104.goldstore.entity.ChucNang;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChucNangRepository;
import com.se104.goldstore.service.ChucNangService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ChucNangServiceImpl implements ChucNangService {

    private static final String PREFIX = "CN";

    private final ChucNangRepository chucNangRepository;

    public ChucNangServiceImpl(ChucNangRepository chucNangRepository) {
        this.chucNangRepository = chucNangRepository;
    }

    @Override
    public List<ChucNangResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<ChucNang> entities = normalized.isEmpty()
            ? chucNangRepository.findAll()
            : chucNangRepository.findByTenChucNangContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public ChucNangResponse getById(String maChucNang) {
        return toResponse(findByIdOrThrow(maChucNang));
    }

    @Override
    @Transactional
    public ChucNangResponse create(ChucNangRequest request) {
        String tenChucNang = request.getTenChucNang().trim();
        if (chucNangRepository.existsByTenChucNangIgnoreCase(tenChucNang)) {
            throw new BusinessException("Ten chuc nang da ton tai");
        }

        String maChucNang = request.getMaChucNang();
        if (maChucNang == null || maChucNang.isBlank()) {
            String currentMaxCode = chucNangRepository
                .findTopByMaChucNangStartingWithOrderByMaChucNangDesc(PREFIX)
                .map(ChucNang::getMaChucNang)
                .orElse(null);
            maChucNang = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (chucNangRepository.existsById(maChucNang)) {
            throw new BusinessException("Ma chuc nang da ton tai");
        }

        ChucNang entity = new ChucNang();
        entity.setMaChucNang(maChucNang);
        entity.setTenChucNang(tenChucNang);
        entity.setTenManHinhLoad(emptyToNull(request.getTenManHinhLoad()));

        return toResponse(chucNangRepository.save(entity));
    }

    @Override
    @Transactional
    public ChucNangResponse update(String maChucNang, ChucNangRequest request) {
        ChucNang entity = findByIdOrThrow(maChucNang);

        String tenChucNang = request.getTenChucNang().trim();
        if (chucNangRepository.existsByTenChucNangIgnoreCaseAndMaChucNangNot(tenChucNang, maChucNang)) {
            throw new BusinessException("Ten chuc nang da ton tai");
        }

        entity.setTenChucNang(tenChucNang);
        entity.setTenManHinhLoad(emptyToNull(request.getTenManHinhLoad()));

        return toResponse(chucNangRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maChucNang) {
        ChucNang entity = findByIdOrThrow(maChucNang);
        try {
            chucNangRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa chuc nang da co du lieu lien quan");
        }
    }

    private ChucNang findByIdOrThrow(String maChucNang) {
        return chucNangRepository.findById(maChucNang)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay chuc nang: " + maChucNang));
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private ChucNangResponse toResponse(ChucNang entity) {
        ChucNangResponse response = new ChucNangResponse();
        response.setMaChucNang(entity.getMaChucNang());
        response.setTenChucNang(entity.getTenChucNang());
        response.setTenManHinhLoad(entity.getTenManHinhLoad());
        return response;
    }
}