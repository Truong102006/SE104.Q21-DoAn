package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.KhachHangRequest;
import com.se104.goldstore.dto.response.KhachHangResponse;
import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.service.KhachHangService;
import com.se104.goldstore.validation.PhoneValidator;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class KhachHangServiceImpl implements KhachHangService {

    private static final String PREFIX = "KH";

    private final KhachHangRepository khachHangRepository;

    public KhachHangServiceImpl(KhachHangRepository khachHangRepository) {
        this.khachHangRepository = khachHangRepository;
    }

    @Override
    public List<KhachHangResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<KhachHang> entities = normalized.isEmpty()
            ? khachHangRepository.findAll()
            : khachHangRepository.findByTenKhachHangContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public KhachHangResponse getById(String maKhachHang) {
        return toResponse(findByIdOrThrow(maKhachHang));
    }

    @Override
    @Transactional
    public KhachHangResponse create(KhachHangRequest request) {
        PhoneValidator.validateOrThrow(request.getSoDienThoaiKhachHang(), "So dien thoai khach hang");

        if (khachHangRepository.existsBySoDienThoaiKhachHang(request.getSoDienThoaiKhachHang().trim())) {
            throw new BusinessException("So dien thoai khach hang da ton tai");
        }

        String maKhachHang = request.getMaKhachHang();
        if (maKhachHang == null || maKhachHang.isBlank()) {
            String currentMaxCode = khachHangRepository
                .findTopByMaKhachHangStartingWithOrderByMaKhachHangDesc(PREFIX)
                .map(KhachHang::getMaKhachHang)
                .orElse(null);
            maKhachHang = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (khachHangRepository.existsById(maKhachHang)) {
            throw new BusinessException("Ma khach hang da ton tai");
        }

        KhachHang entity = new KhachHang();
        entity.setMaKhachHang(maKhachHang);
        entity.setTenKhachHang(request.getTenKhachHang().trim());
        entity.setSoDienThoaiKhachHang(request.getSoDienThoaiKhachHang().trim());
        entity.setDiaChiKhachHang(request.getDiaChiKhachHang());
        entity.setGhiChu(request.getGhiChu());

        return toResponse(khachHangRepository.save(entity));
    }

    @Override
    @Transactional
    public KhachHangResponse update(String maKhachHang, KhachHangRequest request) {
        KhachHang entity = findByIdOrThrow(maKhachHang);

        PhoneValidator.validateOrThrow(request.getSoDienThoaiKhachHang(), "So dien thoai khach hang");

        if (khachHangRepository.existsBySoDienThoaiKhachHangAndMaKhachHangNot(request.getSoDienThoaiKhachHang().trim(), maKhachHang)) {
            throw new BusinessException("So dien thoai khach hang da ton tai");
        }

        entity.setTenKhachHang(request.getTenKhachHang().trim());
        entity.setSoDienThoaiKhachHang(request.getSoDienThoaiKhachHang().trim());
        entity.setDiaChiKhachHang(request.getDiaChiKhachHang());
        entity.setGhiChu(request.getGhiChu());

        return toResponse(khachHangRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maKhachHang) {
        KhachHang entity = findByIdOrThrow(maKhachHang);
        try {
            khachHangRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa khach hang da co du lieu lien quan");
        }
    }

    private KhachHang findByIdOrThrow(String maKhachHang) {
        return khachHangRepository.findById(maKhachHang)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khach hang: " + maKhachHang));
    }

    private KhachHangResponse toResponse(KhachHang entity) {
        KhachHangResponse response = new KhachHangResponse();
        response.setMaKhachHang(entity.getMaKhachHang());
        response.setTenKhachHang(entity.getTenKhachHang());
        response.setSoDienThoaiKhachHang(entity.getSoDienThoaiKhachHang());
        response.setDiaChiKhachHang(entity.getDiaChiKhachHang());
        response.setGhiChu(entity.getGhiChu());
        return response;
    }
}
