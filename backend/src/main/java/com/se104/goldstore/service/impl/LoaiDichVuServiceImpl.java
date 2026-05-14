package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.LoaiDichVuRequest;
import com.se104.goldstore.dto.response.LoaiDichVuResponse;
import com.se104.goldstore.entity.LoaiDichVu;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.LoaiDichVuRepository;
import com.se104.goldstore.service.LoaiDichVuService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class LoaiDichVuServiceImpl implements LoaiDichVuService {

    private static final String PREFIX = "DV";

    private final LoaiDichVuRepository loaiDichVuRepository;

    public LoaiDichVuServiceImpl(LoaiDichVuRepository loaiDichVuRepository) {
        this.loaiDichVuRepository = loaiDichVuRepository;
    }

    @Override
    public List<LoaiDichVuResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<LoaiDichVu> entities = normalized.isEmpty()
            ? loaiDichVuRepository.findAll()
            : loaiDichVuRepository.findByTenLoaiDichVuContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public LoaiDichVuResponse getById(String maLoaiDichVu) {
        return toResponse(findByIdOrThrow(maLoaiDichVu));
    }

    @Override
    @Transactional
    public LoaiDichVuResponse create(LoaiDichVuRequest request) {
        if (loaiDichVuRepository.existsByTenLoaiDichVuIgnoreCase(request.getTenLoaiDichVu().trim())) {
            throw new BusinessException("Ten loai dich vu da ton tai");
        }

        String maLoaiDichVu = request.getMaLoaiDichVu();
        if (maLoaiDichVu == null || maLoaiDichVu.isBlank()) {
            String currentMaxCode = loaiDichVuRepository
                .findTopByMaLoaiDichVuStartingWithOrderByMaLoaiDichVuDesc(PREFIX)
                .map(LoaiDichVu::getMaLoaiDichVu)
                .orElse(null);
            maLoaiDichVu = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (loaiDichVuRepository.existsById(maLoaiDichVu)) {
            throw new BusinessException("Ma loai dich vu da ton tai");
        }

        LoaiDichVu entity = new LoaiDichVu();
        entity.setMaLoaiDichVu(maLoaiDichVu);
        entity.setTenLoaiDichVu(request.getTenLoaiDichVu().trim());
        entity.setDonGiaDichVu(request.getDonGiaDichVu());

        return toResponse(loaiDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public LoaiDichVuResponse update(String maLoaiDichVu, LoaiDichVuRequest request) {
        LoaiDichVu entity = findByIdOrThrow(maLoaiDichVu);

        if (loaiDichVuRepository.existsByTenLoaiDichVuIgnoreCaseAndMaLoaiDichVuNot(request.getTenLoaiDichVu().trim(), maLoaiDichVu)) {
            throw new BusinessException("Ten loai dich vu da ton tai");
        }

        entity.setTenLoaiDichVu(request.getTenLoaiDichVu().trim());
        entity.setDonGiaDichVu(request.getDonGiaDichVu());

        return toResponse(loaiDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maLoaiDichVu) {
        LoaiDichVu entity = findByIdOrThrow(maLoaiDichVu);
        try {
            loaiDichVuRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa loai dich vu da co du lieu lien quan");
        }
    }

    private LoaiDichVu findByIdOrThrow(String maLoaiDichVu) {
        return loaiDichVuRepository.findById(maLoaiDichVu)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay loai dich vu: " + maLoaiDichVu));
    }

    private LoaiDichVuResponse toResponse(LoaiDichVu entity) {
        LoaiDichVuResponse response = new LoaiDichVuResponse();
        response.setMaLoaiDichVu(entity.getMaLoaiDichVu());
        response.setTenLoaiDichVu(entity.getTenLoaiDichVu());
        response.setDonGiaDichVu(entity.getDonGiaDichVu());
        return response;
    }
}
