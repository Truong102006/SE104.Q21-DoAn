package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.BaoCaoTonKhoRequest;
import com.se104.goldstore.dto.response.BaoCaoTonKhoResponse;
import com.se104.goldstore.entity.BaoCaoTonKho;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.BaoCaoTonKhoRepository;
import com.se104.goldstore.service.BaoCaoTonKhoService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BaoCaoTonKhoServiceImpl implements BaoCaoTonKhoService {

    private static final String PREFIX = "BCTK";

    private final BaoCaoTonKhoRepository baoCaoTonKhoRepository;

    public BaoCaoTonKhoServiceImpl(BaoCaoTonKhoRepository baoCaoTonKhoRepository) {
        this.baoCaoTonKhoRepository = baoCaoTonKhoRepository;
    }

    @Override
    public List<BaoCaoTonKhoResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<BaoCaoTonKho> entities = normalized.isEmpty()
            ? baoCaoTonKhoRepository.findAll()
            : baoCaoTonKhoRepository.findByMaBaoCaoTonKhoContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public BaoCaoTonKhoResponse getById(String maBaoCaoTonKho) {
        return toResponse(findByIdOrThrow(maBaoCaoTonKho));
    }

    @Override
    @Transactional
    public BaoCaoTonKhoResponse create(BaoCaoTonKhoRequest request) {
        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoTonKhoRepository.existsByThangAndNam(request.getThang(), request.getNam())) {
            throw new BusinessException("Bao cao ton kho thang nam da ton tai");
        }

        String maBaoCaoTonKho = request.getMaBaoCaoTonKho();
        if (maBaoCaoTonKho == null || maBaoCaoTonKho.isBlank()) {
            String currentMaxCode = baoCaoTonKhoRepository
                .findTopByMaBaoCaoTonKhoStartingWithOrderByMaBaoCaoTonKhoDesc(PREFIX)
                .map(BaoCaoTonKho::getMaBaoCaoTonKho)
                .orElse(null);
            maBaoCaoTonKho = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (baoCaoTonKhoRepository.existsById(maBaoCaoTonKho)) {
            throw new BusinessException("Ma bao cao ton kho da ton tai");
        }

        BaoCaoTonKho entity = new BaoCaoTonKho();
        entity.setMaBaoCaoTonKho(maBaoCaoTonKho);
        entity.setThang(request.getThang());
        entity.setNam(request.getNam());

        return toResponse(baoCaoTonKhoRepository.save(entity));
    }

    @Override
    @Transactional
    public BaoCaoTonKhoResponse update(String maBaoCaoTonKho, BaoCaoTonKhoRequest request) {
        BaoCaoTonKho entity = findByIdOrThrow(maBaoCaoTonKho);

        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoTonKhoRepository.existsByThangAndNamAndMaBaoCaoTonKhoNot(request.getThang(), request.getNam(), maBaoCaoTonKho)) {
            throw new BusinessException("Bao cao ton kho thang nam da ton tai");
        }

        entity.setThang(request.getThang());
        entity.setNam(request.getNam());

        return toResponse(baoCaoTonKhoRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maBaoCaoTonKho) {
        BaoCaoTonKho entity = findByIdOrThrow(maBaoCaoTonKho);
        try {
            baoCaoTonKhoRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa bao cao ton kho da co du lieu lien quan");
        }
    }

    private BaoCaoTonKho findByIdOrThrow(String maBaoCaoTonKho) {
        return baoCaoTonKhoRepository.findById(maBaoCaoTonKho)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bao cao ton kho: " + maBaoCaoTonKho));
    }

    private void validateThangNam(Integer thang, Integer nam) {
        if (thang == null || thang < 1 || thang > 12) {
            throw new BusinessException("Thang phai trong khoang 1 den 12");
        }
        if (nam == null || nam <= 0) {
            throw new BusinessException("Nam phai lon hon 0");
        }
    }

    private BaoCaoTonKhoResponse toResponse(BaoCaoTonKho entity) {
        BaoCaoTonKhoResponse response = new BaoCaoTonKhoResponse();
        response.setMaBaoCaoTonKho(entity.getMaBaoCaoTonKho());
        response.setThang(entity.getThang());
        response.setNam(entity.getNam());
        return response;
    }
}