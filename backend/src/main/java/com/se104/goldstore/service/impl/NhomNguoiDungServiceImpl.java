package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.NhomNguoiDungRequest;
import com.se104.goldstore.dto.response.NhomNguoiDungResponse;
import com.se104.goldstore.entity.NhomNguoiDung;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.NhomNguoiDungRepository;
import com.se104.goldstore.service.NhomNguoiDungService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NhomNguoiDungServiceImpl implements NhomNguoiDungService {

    private static final String PREFIX = "NND";

    private final NhomNguoiDungRepository nhomNguoiDungRepository;

    public NhomNguoiDungServiceImpl(NhomNguoiDungRepository nhomNguoiDungRepository) {
        this.nhomNguoiDungRepository = nhomNguoiDungRepository;
    }

    @Override
    public List<NhomNguoiDungResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<NhomNguoiDung> entities = normalized.isEmpty()
            ? nhomNguoiDungRepository.findAll()
            : nhomNguoiDungRepository.findByTenNhomContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public NhomNguoiDungResponse getById(String maNhom) {
        return toResponse(findByIdOrThrow(maNhom));
    }

    @Override
    @Transactional
    public NhomNguoiDungResponse create(NhomNguoiDungRequest request) {
        String tenNhom = request.getTenNhom().trim();
        if (nhomNguoiDungRepository.existsByTenNhomIgnoreCase(tenNhom)) {
            throw new BusinessException("Tên nhóm đã tồn tại");
        }

        String maNhom = request.getMaNhom();
        if (maNhom == null || maNhom.isBlank()) {
            String currentMaxCode = nhomNguoiDungRepository
                .findTopByMaNhomStartingWithOrderByMaNhomDesc(PREFIX)
                .map(NhomNguoiDung::getMaNhom)
                .orElse(null);
            maNhom = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (nhomNguoiDungRepository.existsById(maNhom)) {
            throw new BusinessException("Mã nhóm đã tồn tại");
        }

        NhomNguoiDung entity = new NhomNguoiDung();
        entity.setMaNhom(maNhom);
        entity.setTenNhom(tenNhom);

        return toResponse(nhomNguoiDungRepository.save(entity));
    }

    @Override
    @Transactional
    public NhomNguoiDungResponse update(String maNhom, NhomNguoiDungRequest request) {
        NhomNguoiDung entity = findByIdOrThrow(maNhom);

        String tenNhom = request.getTenNhom().trim();
        if (nhomNguoiDungRepository.existsByTenNhomIgnoreCaseAndMaNhomNot(tenNhom, maNhom)) {
            throw new BusinessException("Tên nhóm đã tồn tại");
        }

        entity.setTenNhom(tenNhom);

        return toResponse(nhomNguoiDungRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maNhom) {
        NhomNguoiDung entity = findByIdOrThrow(maNhom);
        try {
            nhomNguoiDungRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa nhóm người dùng đã có dữ liệu liên quan");
        }
    }

    private NhomNguoiDung findByIdOrThrow(String maNhom) {
        return nhomNguoiDungRepository.findById(maNhom)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhóm người dùng: " + maNhom));
    }

    private NhomNguoiDungResponse toResponse(NhomNguoiDung entity) {
        NhomNguoiDungResponse response = new NhomNguoiDungResponse();
        response.setMaNhom(entity.getMaNhom());
        response.setTenNhom(entity.getTenNhom());
        return response;
    }
}