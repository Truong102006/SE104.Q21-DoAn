package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.BaoCaoDoanhThuDichVuRequest;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuDichVuResponse;
import com.se104.goldstore.entity.BaoCaoDoanhThuDichVu;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.BaoCaoDoanhThuDichVuRepository;
import com.se104.goldstore.service.BaoCaoDoanhThuDichVuService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BaoCaoDoanhThuDichVuServiceImpl implements BaoCaoDoanhThuDichVuService {

    private static final String PREFIX = "BCDV";

    private final BaoCaoDoanhThuDichVuRepository baoCaoDoanhThuDichVuRepository;

    public BaoCaoDoanhThuDichVuServiceImpl(BaoCaoDoanhThuDichVuRepository baoCaoDoanhThuDichVuRepository) {
        this.baoCaoDoanhThuDichVuRepository = baoCaoDoanhThuDichVuRepository;
    }

    @Override
    public List<BaoCaoDoanhThuDichVuResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<BaoCaoDoanhThuDichVu> entities = normalized.isEmpty()
            ? baoCaoDoanhThuDichVuRepository.findAll()
            : baoCaoDoanhThuDichVuRepository.findByMaBaoCaoDoanhThuDvContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public BaoCaoDoanhThuDichVuResponse getById(String maBaoCaoDoanhThuDv) {
        return toResponse(findByIdOrThrow(maBaoCaoDoanhThuDv));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuDichVuResponse create(BaoCaoDoanhThuDichVuRequest request) {
        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuDichVuRepository.existsByThangAndNam(request.getThang(), request.getNam())) {
            throw new BusinessException("Bao cao doanh thu dich vu thang nam da ton tai");
        }

        String maBaoCaoDoanhThuDv = request.getMaBaoCaoDoanhThuDv();
        if (maBaoCaoDoanhThuDv == null || maBaoCaoDoanhThuDv.isBlank()) {
            String currentMaxCode = baoCaoDoanhThuDichVuRepository
                .findTopByMaBaoCaoDoanhThuDvStartingWithOrderByMaBaoCaoDoanhThuDvDesc(PREFIX)
                .map(BaoCaoDoanhThuDichVu::getMaBaoCaoDoanhThuDv)
                .orElse(null);
            maBaoCaoDoanhThuDv = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (baoCaoDoanhThuDichVuRepository.existsById(maBaoCaoDoanhThuDv)) {
            throw new BusinessException("Ma bao cao doanh thu dich vu da ton tai");
        }

        BaoCaoDoanhThuDichVu entity = new BaoCaoDoanhThuDichVu();
        entity.setMaBaoCaoDoanhThuDv(maBaoCaoDoanhThuDv);
        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuDichVu(request.getTongDoanhThuDichVu());

        return toResponse(baoCaoDoanhThuDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuDichVuResponse update(String maBaoCaoDoanhThuDv, BaoCaoDoanhThuDichVuRequest request) {
        BaoCaoDoanhThuDichVu entity = findByIdOrThrow(maBaoCaoDoanhThuDv);

        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuDichVuRepository.existsByThangAndNamAndMaBaoCaoDoanhThuDvNot(request.getThang(), request.getNam(), maBaoCaoDoanhThuDv)) {
            throw new BusinessException("Bao cao doanh thu dich vu thang nam da ton tai");
        }

        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuDichVu(request.getTongDoanhThuDichVu());

        return toResponse(baoCaoDoanhThuDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maBaoCaoDoanhThuDv) {
        BaoCaoDoanhThuDichVu entity = findByIdOrThrow(maBaoCaoDoanhThuDv);
        try {
            baoCaoDoanhThuDichVuRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa bao cao doanh thu dich vu da co du lieu lien quan");
        }
    }

    private BaoCaoDoanhThuDichVu findByIdOrThrow(String maBaoCaoDoanhThuDv) {
        return baoCaoDoanhThuDichVuRepository.findById(maBaoCaoDoanhThuDv)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bao cao doanh thu dich vu: " + maBaoCaoDoanhThuDv));
    }

    private void validateThangNam(Integer thang, Integer nam) {
        if (thang == null || thang < 1 || thang > 12) {
            throw new BusinessException("Thang phai trong khoang 1 den 12");
        }
        if (nam == null || nam <= 0) {
            throw new BusinessException("Nam phai lon hon 0");
        }
    }

    private BaoCaoDoanhThuDichVuResponse toResponse(BaoCaoDoanhThuDichVu entity) {
        BaoCaoDoanhThuDichVuResponse response = new BaoCaoDoanhThuDichVuResponse();
        response.setMaBaoCaoDoanhThuDv(entity.getMaBaoCaoDoanhThuDv());
        response.setThang(entity.getThang());
        response.setNam(entity.getNam());
        response.setTongDoanhThuDichVu(entity.getTongDoanhThuDichVu());
        return response;
    }
}