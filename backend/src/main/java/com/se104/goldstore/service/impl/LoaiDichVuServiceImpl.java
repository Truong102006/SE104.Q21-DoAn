package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.LoaiDichVuRequest;
import com.se104.goldstore.dto.response.LoaiDichVuResponse;
import com.se104.goldstore.entity.LoaiDichVu;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
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
    private final ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;

    public LoaiDichVuServiceImpl(
        LoaiDichVuRepository loaiDichVuRepository,
        ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository
    ) {
        this.loaiDichVuRepository = loaiDichVuRepository;
        this.chiTietPhieuDichVuRepository = chiTietPhieuDichVuRepository;
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
            throw new BusinessException("Tên loại dịch vụ đã tồn tại");
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
            throw new BusinessException("Mã loại dịch vụ đã tồn tại");
        }

        LoaiDichVu entity = new LoaiDichVu();
        entity.setMaLoaiDichVu(maLoaiDichVu);
        entity.setTenLoaiDichVu(request.getTenLoaiDichVu().trim());
        entity.setDonGiaDichVu(request.getDonGiaDichVu());
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return toResponse(loaiDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public LoaiDichVuResponse update(String maLoaiDichVu, LoaiDichVuRequest request) {
        LoaiDichVu entity = findByIdOrThrow(maLoaiDichVu);

        if (loaiDichVuRepository.existsByTenLoaiDichVuIgnoreCaseAndMaLoaiDichVuNot(request.getTenLoaiDichVu().trim(), maLoaiDichVu)) {
            throw new BusinessException("Tên loại dịch vụ đã tồn tại");
        }

        entity.setTenLoaiDichVu(request.getTenLoaiDichVu().trim());
        entity.setDonGiaDichVu(request.getDonGiaDichVu());
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        return toResponse(loaiDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maLoaiDichVu) {
        LoaiDichVu entity = findByIdOrThrow(maLoaiDichVu);
        if (chiTietPhieuDichVuRepository.existsByMaLoaiDichVu(maLoaiDichVu)) {
            throw new BusinessException("Không thể xóa loại dịch vụ đã có phiếu dịch vụ liên quan");
        }
        try {
            loaiDichVuRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa loại dịch vụ đã có dữ liệu liên quan");
        }
    }

    private LoaiDichVu findByIdOrThrow(String maLoaiDichVu) {
        return loaiDichVuRepository.findById(maLoaiDichVu)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại dịch vụ: " + maLoaiDichVu));
    }

    private LoaiDichVuResponse toResponse(LoaiDichVu entity) {
        LoaiDichVuResponse response = new LoaiDichVuResponse();
        response.setMaLoaiDichVu(entity.getMaLoaiDichVu());
        response.setTenLoaiDichVu(entity.getTenLoaiDichVu());
        response.setDonGiaDichVu(entity.getDonGiaDichVu());
        response.setIsActive(entity.getIsActive());
        return response;
    }
}
