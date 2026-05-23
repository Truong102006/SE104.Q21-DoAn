package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.ThamSoRequest;
import com.se104.goldstore.dto.response.ThamSoResponse;
import com.se104.goldstore.entity.ThamSo;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ThamSoRepository;
import com.se104.goldstore.service.ThamSoService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ThamSoServiceImpl implements ThamSoService {

    private static final String PREFIX = "TS";

    private final ThamSoRepository thamSoRepository;

    public ThamSoServiceImpl(ThamSoRepository thamSoRepository) {
        this.thamSoRepository = thamSoRepository;
    }

    @Override
    public List<ThamSoResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<ThamSo> entities = normalized.isEmpty()
            ? thamSoRepository.findAll()
            : thamSoRepository.findByTenThamSoContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public ThamSoResponse getById(String maThamSo) {
        return toResponse(findByIdOrThrow(maThamSo));
    }

    @Override
    @Transactional
    public ThamSoResponse create(ThamSoRequest request) {
        String tenThamSo = request.getTenThamSo().trim();
        if (thamSoRepository.existsByTenThamSoIgnoreCase(tenThamSo)) {
            throw new BusinessException("Tên tham số đã tồn tại");
        }

        String maThamSo = request.getMaThamSo();
        if (maThamSo == null || maThamSo.isBlank()) {
            String currentMaxCode = thamSoRepository
                .findTopByMaThamSoStartingWithOrderByMaThamSoDesc(PREFIX)
                .map(ThamSo::getMaThamSo)
                .orElse(null);
            maThamSo = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (thamSoRepository.existsById(maThamSo)) {
            throw new BusinessException("Mã tham số đã tồn tại");
        }

        ThamSo entity = new ThamSo();
        entity.setMaThamSo(maThamSo);
        entity.setTenThamSo(tenThamSo);
        entity.setGiaTri(request.getGiaTri());

        return toResponse(thamSoRepository.save(entity));
    }

    @Override
    @Transactional
    public ThamSoResponse update(String maThamSo, ThamSoRequest request) {
        ThamSo entity = findByIdOrThrow(maThamSo);

        String tenThamSo = request.getTenThamSo().trim();
        if (thamSoRepository.existsByTenThamSoIgnoreCaseAndMaThamSoNot(tenThamSo, maThamSo)) {
            throw new BusinessException("Tên tham số đã tồn tại");
        }

        entity.setTenThamSo(tenThamSo);
        entity.setGiaTri(request.getGiaTri());

        return toResponse(thamSoRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maThamSo) {
        ThamSo entity = findByIdOrThrow(maThamSo);
        try {
            thamSoRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa tham số đã có dữ liệu liên quan");
        }
    }

    private ThamSo findByIdOrThrow(String maThamSo) {
        return thamSoRepository.findById(maThamSo)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tham số: " + maThamSo));
    }

    private ThamSoResponse toResponse(ThamSo entity) {
        ThamSoResponse response = new ThamSoResponse();
        response.setMaThamSo(entity.getMaThamSo());
        response.setTenThamSo(entity.getTenThamSo());
        response.setGiaTri(entity.getGiaTri());
        return response;
    }
}