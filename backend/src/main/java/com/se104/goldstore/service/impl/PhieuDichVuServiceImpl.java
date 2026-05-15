package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.PhieuDichVuRequest;
import com.se104.goldstore.dto.response.PhieuDichVuResponse;
import com.se104.goldstore.entity.PhieuDichVu;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.PhieuDichVuRepository;
import com.se104.goldstore.service.PhieuDichVuService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PhieuDichVuServiceImpl implements PhieuDichVuService {

    private static final String PREFIX = "DV";

    private final PhieuDichVuRepository phieuDichVuRepository;
    private final KhachHangRepository khachHangRepository;

    public PhieuDichVuServiceImpl(
        PhieuDichVuRepository phieuDichVuRepository,
        KhachHangRepository khachHangRepository
    ) {
        this.phieuDichVuRepository = phieuDichVuRepository;
        this.khachHangRepository = khachHangRepository;
    }

    @Override
    public List<PhieuDichVuResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<PhieuDichVu> entities = normalized.isEmpty()
            ? phieuDichVuRepository.findAll()
            : phieuDichVuRepository.findBySoPhieuDichVuContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public PhieuDichVuResponse getById(String soPhieuDichVu) {
        return toResponse(findByIdOrThrow(soPhieuDichVu));
    }

    @Override
    @Transactional
    public PhieuDichVuResponse create(PhieuDichVuRequest request) {
        String maKhachHang = request.getMaKhachHang().trim();
        validateKhachHang(maKhachHang);

        String soPhieuDichVu = request.getSoPhieuDichVu();
        if (soPhieuDichVu == null || soPhieuDichVu.isBlank()) {
            String currentMaxCode = phieuDichVuRepository
                .findTopBySoPhieuDichVuStartingWithOrderBySoPhieuDichVuDesc(PREFIX)
                .map(PhieuDichVu::getSoPhieuDichVu)
                .orElse(null);
            soPhieuDichVu = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (phieuDichVuRepository.existsById(soPhieuDichVu)) {
            throw new BusinessException("So phieu dich vu da ton tai");
        }

        PhieuDichVu entity = new PhieuDichVu();
        entity.setSoPhieuDichVu(soPhieuDichVu);
        entity.setNgayLapPhieuDichVu(request.getNgayLapPhieuDichVu());
        entity.setMaKhachHang(maKhachHang);
        entity.setTongTienTraTruoc(request.getTongTienTraTruoc());
        entity.setTongTienConLai(request.getTongTienConLai());
        entity.setTongTien(request.getTongTien());
        entity.setTinhTrangDichVu(request.getTinhTrangDichVu().trim());

        return toResponse(phieuDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public PhieuDichVuResponse update(String soPhieuDichVu, PhieuDichVuRequest request) {
        PhieuDichVu entity = findByIdOrThrow(soPhieuDichVu);

        String maKhachHang = request.getMaKhachHang().trim();
        validateKhachHang(maKhachHang);

        entity.setNgayLapPhieuDichVu(request.getNgayLapPhieuDichVu());
        entity.setMaKhachHang(maKhachHang);
        entity.setTongTienTraTruoc(request.getTongTienTraTruoc());
        entity.setTongTienConLai(request.getTongTienConLai());
        entity.setTongTien(request.getTongTien());
        entity.setTinhTrangDichVu(request.getTinhTrangDichVu().trim());

        return toResponse(phieuDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String soPhieuDichVu) {
        PhieuDichVu entity = findByIdOrThrow(soPhieuDichVu);
        try {
            phieuDichVuRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa phieu dich vu da co du lieu lien quan");
        }
    }

    private PhieuDichVu findByIdOrThrow(String soPhieuDichVu) {
        return phieuDichVuRepository.findById(soPhieuDichVu)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay phieu dich vu: " + soPhieuDichVu));
    }

    private void validateKhachHang(String maKhachHang) {
        if (!khachHangRepository.existsById(maKhachHang)) {
            throw new BusinessException("Ma khach hang khong ton tai");
        }
    }

    private PhieuDichVuResponse toResponse(PhieuDichVu entity) {
        PhieuDichVuResponse response = new PhieuDichVuResponse();
        response.setSoPhieuDichVu(entity.getSoPhieuDichVu());
        response.setNgayLapPhieuDichVu(entity.getNgayLapPhieuDichVu());
        response.setMaKhachHang(entity.getMaKhachHang());
        response.setTongTienTraTruoc(entity.getTongTienTraTruoc());
        response.setTongTienConLai(entity.getTongTienConLai());
        response.setTongTien(entity.getTongTien());
        response.setTinhTrangDichVu(entity.getTinhTrangDichVu());
        return response;
    }
}
