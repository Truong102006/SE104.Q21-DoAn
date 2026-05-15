package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.PhieuBanHangRequest;
import com.se104.goldstore.dto.response.PhieuBanHangResponse;
import com.se104.goldstore.entity.PhieuBanHang;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.PhieuBanHangRepository;
import com.se104.goldstore.service.PhieuBanHangService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PhieuBanHangServiceImpl implements PhieuBanHangService {

    private static final String PREFIX = "PB";

    private final PhieuBanHangRepository phieuBanHangRepository;
    private final KhachHangRepository khachHangRepository;

    public PhieuBanHangServiceImpl(
        PhieuBanHangRepository phieuBanHangRepository,
        KhachHangRepository khachHangRepository
    ) {
        this.phieuBanHangRepository = phieuBanHangRepository;
        this.khachHangRepository = khachHangRepository;
    }

    @Override
    public List<PhieuBanHangResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<PhieuBanHang> entities = normalized.isEmpty()
            ? phieuBanHangRepository.findAll()
            : phieuBanHangRepository.findBySoPhieuBanContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public PhieuBanHangResponse getById(String soPhieuBan) {
        return toResponse(findByIdOrThrow(soPhieuBan));
    }

    @Override
    @Transactional
    public PhieuBanHangResponse create(PhieuBanHangRequest request) {
        String maKhachHang = request.getMaKhachHang().trim();
        validateKhachHang(maKhachHang);

        String soPhieuBan = request.getSoPhieuBan();
        if (soPhieuBan == null || soPhieuBan.isBlank()) {
            String currentMaxCode = phieuBanHangRepository
                .findTopBySoPhieuBanStartingWithOrderBySoPhieuBanDesc(PREFIX)
                .map(PhieuBanHang::getSoPhieuBan)
                .orElse(null);
            soPhieuBan = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (phieuBanHangRepository.existsById(soPhieuBan)) {
            throw new BusinessException("So phieu ban da ton tai");
        }

        PhieuBanHang entity = new PhieuBanHang();
        entity.setSoPhieuBan(soPhieuBan);
        entity.setNgayLapPhieuBan(request.getNgayLapPhieuBan());
        entity.setMaKhachHang(maKhachHang);
        entity.setTongTien(request.getTongTien());

        return toResponse(phieuBanHangRepository.save(entity));
    }

    @Override
    @Transactional
    public PhieuBanHangResponse update(String soPhieuBan, PhieuBanHangRequest request) {
        PhieuBanHang entity = findByIdOrThrow(soPhieuBan);

        String maKhachHang = request.getMaKhachHang().trim();
        validateKhachHang(maKhachHang);

        entity.setNgayLapPhieuBan(request.getNgayLapPhieuBan());
        entity.setMaKhachHang(maKhachHang);
        entity.setTongTien(request.getTongTien());

        return toResponse(phieuBanHangRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String soPhieuBan) {
        PhieuBanHang entity = findByIdOrThrow(soPhieuBan);
        try {
            phieuBanHangRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa phieu ban hang da co du lieu lien quan");
        }
    }

    private PhieuBanHang findByIdOrThrow(String soPhieuBan) {
        return phieuBanHangRepository.findById(soPhieuBan)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay phieu ban hang: " + soPhieuBan));
    }

    private void validateKhachHang(String maKhachHang) {
        if (!khachHangRepository.existsById(maKhachHang)) {
            throw new BusinessException("Ma khach hang khong ton tai");
        }
    }

    private PhieuBanHangResponse toResponse(PhieuBanHang entity) {
        PhieuBanHangResponse response = new PhieuBanHangResponse();
        response.setSoPhieuBan(entity.getSoPhieuBan());
        response.setNgayLapPhieuBan(entity.getNgayLapPhieuBan());
        response.setMaKhachHang(entity.getMaKhachHang());
        response.setTongTien(entity.getTongTien());
        return response;
    }
}
