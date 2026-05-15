package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.BaoCaoDoanhThuSanPhamRequest;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuSanPhamResponse;
import com.se104.goldstore.entity.BaoCaoDoanhThuSanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.BaoCaoDoanhThuSanPhamRepository;
import com.se104.goldstore.service.BaoCaoDoanhThuSanPhamService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BaoCaoDoanhThuSanPhamServiceImpl implements BaoCaoDoanhThuSanPhamService {

    private static final String PREFIX = "BCSP";

    private final BaoCaoDoanhThuSanPhamRepository baoCaoDoanhThuSanPhamRepository;

    public BaoCaoDoanhThuSanPhamServiceImpl(BaoCaoDoanhThuSanPhamRepository baoCaoDoanhThuSanPhamRepository) {
        this.baoCaoDoanhThuSanPhamRepository = baoCaoDoanhThuSanPhamRepository;
    }

    @Override
    public List<BaoCaoDoanhThuSanPhamResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<BaoCaoDoanhThuSanPham> entities = normalized.isEmpty()
            ? baoCaoDoanhThuSanPhamRepository.findAll()
            : baoCaoDoanhThuSanPhamRepository.findByMaBaoCaoDoanhThuSpContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public BaoCaoDoanhThuSanPhamResponse getById(String maBaoCaoDoanhThuSp) {
        return toResponse(findByIdOrThrow(maBaoCaoDoanhThuSp));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuSanPhamResponse create(BaoCaoDoanhThuSanPhamRequest request) {
        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuSanPhamRepository.existsByThangAndNam(request.getThang(), request.getNam())) {
            throw new BusinessException("Bao cao doanh thu san pham thang nam da ton tai");
        }

        String maBaoCaoDoanhThuSp = request.getMaBaoCaoDoanhThuSp();
        if (maBaoCaoDoanhThuSp == null || maBaoCaoDoanhThuSp.isBlank()) {
            String currentMaxCode = baoCaoDoanhThuSanPhamRepository
                .findTopByMaBaoCaoDoanhThuSpStartingWithOrderByMaBaoCaoDoanhThuSpDesc(PREFIX)
                .map(BaoCaoDoanhThuSanPham::getMaBaoCaoDoanhThuSp)
                .orElse(null);
            maBaoCaoDoanhThuSp = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (baoCaoDoanhThuSanPhamRepository.existsById(maBaoCaoDoanhThuSp)) {
            throw new BusinessException("Ma bao cao doanh thu san pham da ton tai");
        }

        BaoCaoDoanhThuSanPham entity = new BaoCaoDoanhThuSanPham();
        entity.setMaBaoCaoDoanhThuSp(maBaoCaoDoanhThuSp);
        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuSanPham(request.getTongDoanhThuSanPham());

        return toResponse(baoCaoDoanhThuSanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuSanPhamResponse update(String maBaoCaoDoanhThuSp, BaoCaoDoanhThuSanPhamRequest request) {
        BaoCaoDoanhThuSanPham entity = findByIdOrThrow(maBaoCaoDoanhThuSp);

        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuSanPhamRepository.existsByThangAndNamAndMaBaoCaoDoanhThuSpNot(request.getThang(), request.getNam(), maBaoCaoDoanhThuSp)) {
            throw new BusinessException("Bao cao doanh thu san pham thang nam da ton tai");
        }

        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuSanPham(request.getTongDoanhThuSanPham());

        return toResponse(baoCaoDoanhThuSanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maBaoCaoDoanhThuSp) {
        BaoCaoDoanhThuSanPham entity = findByIdOrThrow(maBaoCaoDoanhThuSp);
        try {
            baoCaoDoanhThuSanPhamRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa bao cao doanh thu san pham da co du lieu lien quan");
        }
    }

    private BaoCaoDoanhThuSanPham findByIdOrThrow(String maBaoCaoDoanhThuSp) {
        return baoCaoDoanhThuSanPhamRepository.findById(maBaoCaoDoanhThuSp)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bao cao doanh thu san pham: " + maBaoCaoDoanhThuSp));
    }

    private void validateThangNam(Integer thang, Integer nam) {
        if (thang == null || thang < 1 || thang > 12) {
            throw new BusinessException("Thang phai trong khoang 1 den 12");
        }
        if (nam == null || nam <= 0) {
            throw new BusinessException("Nam phai lon hon 0");
        }
    }

    private BaoCaoDoanhThuSanPhamResponse toResponse(BaoCaoDoanhThuSanPham entity) {
        BaoCaoDoanhThuSanPhamResponse response = new BaoCaoDoanhThuSanPhamResponse();
        response.setMaBaoCaoDoanhThuSp(entity.getMaBaoCaoDoanhThuSp());
        response.setThang(entity.getThang());
        response.setNam(entity.getNam());
        response.setTongDoanhThuSanPham(entity.getTongDoanhThuSanPham());
        return response;
    }
}