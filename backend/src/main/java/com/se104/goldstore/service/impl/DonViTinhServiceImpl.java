package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.DonViTinhRequest;
import com.se104.goldstore.dto.response.DonViTinhResponse;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.service.DonViTinhService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DonViTinhServiceImpl implements DonViTinhService {

    private static final String PREFIX = "DVT";

    private final DonViTinhRepository donViTinhRepository;

    public DonViTinhServiceImpl(DonViTinhRepository donViTinhRepository) {
        this.donViTinhRepository = donViTinhRepository;
    }

    @Override
    public List<DonViTinhResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<DonViTinh> entities = normalized.isEmpty()
            ? donViTinhRepository.findAll()
            : donViTinhRepository.findByTenDonViTinhContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public DonViTinhResponse getById(String maDonViTinh) {
        return toResponse(findByIdOrThrow(maDonViTinh));
    }

    @Override
    @Transactional
    public DonViTinhResponse create(DonViTinhRequest request) {
        if (donViTinhRepository.existsByTenDonViTinhIgnoreCase(request.getTenDonViTinh().trim())) {
            throw new BusinessException("Ten don vi tinh da ton tai");
        }

        String maDonViTinh = request.getMaDonViTinh();
        if (maDonViTinh == null || maDonViTinh.isBlank()) {
            String currentMaxCode = donViTinhRepository
                .findTopByMaDonViTinhStartingWithOrderByMaDonViTinhDesc(PREFIX)
                .map(DonViTinh::getMaDonViTinh)
                .orElse(null);
            maDonViTinh = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (donViTinhRepository.existsById(maDonViTinh)) {
            throw new BusinessException("Ma don vi tinh da ton tai");
        }

        DonViTinh entity = new DonViTinh();
        entity.setMaDonViTinh(maDonViTinh);
        entity.setTenDonViTinh(request.getTenDonViTinh().trim());
        entity.setLoaiDonVi(request.getLoaiDonVi());
        entity.setHeSoQuyDoi(request.getHeSoQuyDoi());
        entity.setGhiChu(request.getGhiChu());

        return toResponse(donViTinhRepository.save(entity));
    }

    @Override
    @Transactional
    public DonViTinhResponse update(String maDonViTinh, DonViTinhRequest request) {
        DonViTinh entity = findByIdOrThrow(maDonViTinh);

        if (donViTinhRepository.existsByTenDonViTinhIgnoreCaseAndMaDonViTinhNot(request.getTenDonViTinh().trim(), maDonViTinh)) {
            throw new BusinessException("Ten don vi tinh da ton tai");
        }

        entity.setTenDonViTinh(request.getTenDonViTinh().trim());
        entity.setLoaiDonVi(request.getLoaiDonVi());
        entity.setHeSoQuyDoi(request.getHeSoQuyDoi());
        entity.setGhiChu(request.getGhiChu());

        return toResponse(donViTinhRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maDonViTinh) {
        DonViTinh entity = findByIdOrThrow(maDonViTinh);
        try {
            donViTinhRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa don vi tinh da co du lieu lien quan");
        }
    }

    private DonViTinh findByIdOrThrow(String maDonViTinh) {
        return donViTinhRepository.findById(maDonViTinh)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay don vi tinh: " + maDonViTinh));
    }

    private DonViTinhResponse toResponse(DonViTinh entity) {
        DonViTinhResponse response = new DonViTinhResponse();
        response.setMaDonViTinh(entity.getMaDonViTinh());
        response.setTenDonViTinh(entity.getTenDonViTinh());
        response.setLoaiDonVi(entity.getLoaiDonVi());
        response.setHeSoQuyDoi(entity.getHeSoQuyDoi());
        response.setGhiChu(entity.getGhiChu());
        return response;
    }
}
