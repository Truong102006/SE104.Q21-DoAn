package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.KhachHangRequest;
import com.se104.goldstore.dto.response.KhachHangResponse;
import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.PhieuBanHangRepository;
import com.se104.goldstore.repository.PhieuDichVuRepository;
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
    private final PhieuBanHangRepository phieuBanHangRepository;
    private final PhieuDichVuRepository phieuDichVuRepository;

    public KhachHangServiceImpl(
        KhachHangRepository khachHangRepository,
        PhieuBanHangRepository phieuBanHangRepository,
        PhieuDichVuRepository phieuDichVuRepository
    ) {
        this.khachHangRepository = khachHangRepository;
        this.phieuBanHangRepository = phieuBanHangRepository;
        this.phieuDichVuRepository = phieuDichVuRepository;
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
        String tenKhachHang = request.getTenKhachHang().trim();
        String soDienThoaiKhachHang = request.getSoDienThoaiKhachHang().trim();

        PhoneValidator.validateOrThrow(soDienThoaiKhachHang, "So dien thoai khach hang");

        if (khachHangRepository.existsByTenKhachHangIgnoreCaseAndSoDienThoaiKhachHang(tenKhachHang, soDienThoaiKhachHang)) {
            throw new BusinessException("Khach hang da ton tai voi cung ten va so dien thoai");
        }

        if (khachHangRepository.existsBySoDienThoaiKhachHang(soDienThoaiKhachHang)) {
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
        entity.setTenKhachHang(tenKhachHang);
        entity.setSoDienThoaiKhachHang(soDienThoaiKhachHang);
        entity.setDiaChiKhachHang(emptyToNull(request.getDiaChiKhachHang()));
        entity.setGhiChu(emptyToNull(request.getGhiChu()));

        return toResponse(khachHangRepository.save(entity));
    }

    @Override
    @Transactional
    public KhachHangResponse update(String maKhachHang, KhachHangRequest request) {
        KhachHang entity = findByIdOrThrow(maKhachHang);
        String tenKhachHang = request.getTenKhachHang().trim();
        String soDienThoaiKhachHang = request.getSoDienThoaiKhachHang().trim();

        PhoneValidator.validateOrThrow(soDienThoaiKhachHang, "So dien thoai khach hang");

        if (khachHangRepository.existsByTenKhachHangIgnoreCaseAndSoDienThoaiKhachHangAndMaKhachHangNot(
            tenKhachHang,
            soDienThoaiKhachHang,
            maKhachHang
        )) {
            throw new BusinessException("Khach hang da ton tai voi cung ten va so dien thoai");
        }

        if (khachHangRepository.existsBySoDienThoaiKhachHangAndMaKhachHangNot(soDienThoaiKhachHang, maKhachHang)) {
            throw new BusinessException("So dien thoai khach hang da ton tai");
        }

        entity.setTenKhachHang(tenKhachHang);
        entity.setSoDienThoaiKhachHang(soDienThoaiKhachHang);
        entity.setDiaChiKhachHang(emptyToNull(request.getDiaChiKhachHang()));
        entity.setGhiChu(emptyToNull(request.getGhiChu()));

        return toResponse(khachHangRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maKhachHang) {
        KhachHang entity = findByIdOrThrow(maKhachHang);
        if (phieuBanHangRepository.existsByMaKhachHang(maKhachHang) || phieuDichVuRepository.existsByMaKhachHang(maKhachHang)) {
            throw new BusinessException("Khong the xoa khach hang da phat sinh phieu ban hoac phieu dich vu");
        }
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

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
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
