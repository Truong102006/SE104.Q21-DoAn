package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.PhieuMuaHangRequest;
import com.se104.goldstore.dto.response.PhieuMuaHangResponse;
import com.se104.goldstore.entity.PhieuMuaHang;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.NhaCungCapRepository;
import com.se104.goldstore.repository.PhieuMuaHangRepository;
import com.se104.goldstore.service.PhieuMuaHangService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PhieuMuaHangServiceImpl implements PhieuMuaHangService {

    private static final String PREFIX = "PM";

    private final PhieuMuaHangRepository phieuMuaHangRepository;
    private final NhaCungCapRepository nhaCungCapRepository;

    public PhieuMuaHangServiceImpl(
        PhieuMuaHangRepository phieuMuaHangRepository,
        NhaCungCapRepository nhaCungCapRepository
    ) {
        this.phieuMuaHangRepository = phieuMuaHangRepository;
        this.nhaCungCapRepository = nhaCungCapRepository;
    }

    @Override
    public List<PhieuMuaHangResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<PhieuMuaHang> entities = normalized.isEmpty()
            ? phieuMuaHangRepository.findAll()
            : phieuMuaHangRepository.findBySoPhieuMuaContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public PhieuMuaHangResponse getById(String soPhieuMua) {
        return toResponse(findByIdOrThrow(soPhieuMua));
    }

    @Override
    @Transactional
    public PhieuMuaHangResponse create(PhieuMuaHangRequest request) {
        String maNhaCungCap = request.getMaNhaCungCap().trim();
        validateNhaCungCap(maNhaCungCap);

        String soPhieuMua = request.getSoPhieuMua();
        if (soPhieuMua == null || soPhieuMua.isBlank()) {
            String currentMaxCode = phieuMuaHangRepository
                .findTopBySoPhieuMuaStartingWithOrderBySoPhieuMuaDesc(PREFIX)
                .map(PhieuMuaHang::getSoPhieuMua)
                .orElse(null);
            soPhieuMua = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (phieuMuaHangRepository.existsById(soPhieuMua)) {
            throw new BusinessException("So phieu mua da ton tai");
        }

        PhieuMuaHang entity = new PhieuMuaHang();
        entity.setSoPhieuMua(soPhieuMua);
        entity.setNgayLapPhieuMua(request.getNgayLapPhieuMua());
        entity.setMaNhaCungCap(maNhaCungCap);
        entity.setTongTien(request.getTongTien());

        return toResponse(phieuMuaHangRepository.save(entity));
    }

    @Override
    @Transactional
    public PhieuMuaHangResponse update(String soPhieuMua, PhieuMuaHangRequest request) {
        PhieuMuaHang entity = findByIdOrThrow(soPhieuMua);

        String maNhaCungCap = request.getMaNhaCungCap().trim();
        validateNhaCungCap(maNhaCungCap);

        entity.setNgayLapPhieuMua(request.getNgayLapPhieuMua());
        entity.setMaNhaCungCap(maNhaCungCap);
        entity.setTongTien(request.getTongTien());

        return toResponse(phieuMuaHangRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String soPhieuMua) {
        PhieuMuaHang entity = findByIdOrThrow(soPhieuMua);
        try {
            phieuMuaHangRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa phieu mua hang da co du lieu lien quan");
        }
    }

    private PhieuMuaHang findByIdOrThrow(String soPhieuMua) {
        return phieuMuaHangRepository.findById(soPhieuMua)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay phieu mua hang: " + soPhieuMua));
    }

    private void validateNhaCungCap(String maNhaCungCap) {
        if (!nhaCungCapRepository.existsById(maNhaCungCap)) {
            throw new BusinessException("Ma nha cung cap khong ton tai");
        }
    }

    private PhieuMuaHangResponse toResponse(PhieuMuaHang entity) {
        PhieuMuaHangResponse response = new PhieuMuaHangResponse();
        response.setSoPhieuMua(entity.getSoPhieuMua());
        response.setNgayLapPhieuMua(entity.getNgayLapPhieuMua());
        response.setMaNhaCungCap(entity.getMaNhaCungCap());
        response.setTongTien(entity.getTongTien());
        return response;
    }
}
