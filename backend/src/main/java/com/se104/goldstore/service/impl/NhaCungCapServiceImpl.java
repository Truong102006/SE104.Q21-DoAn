package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.NhaCungCapRequest;
import com.se104.goldstore.dto.response.NhaCungCapResponse;
import com.se104.goldstore.entity.NhaCungCap;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.NhaCungCapRepository;
import com.se104.goldstore.repository.PhieuMuaHangRepository;
import com.se104.goldstore.service.NhaCungCapService;
import com.se104.goldstore.validation.PhoneValidator;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NhaCungCapServiceImpl implements NhaCungCapService {

    private static final String PREFIX = "NCC";

    private final NhaCungCapRepository nhaCungCapRepository;
    private final PhieuMuaHangRepository phieuMuaHangRepository;

    public NhaCungCapServiceImpl(
        NhaCungCapRepository nhaCungCapRepository,
        PhieuMuaHangRepository phieuMuaHangRepository
    ) {
        this.nhaCungCapRepository = nhaCungCapRepository;
        this.phieuMuaHangRepository = phieuMuaHangRepository;
    }

    @Override
    public List<NhaCungCapResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<NhaCungCap> entities = normalized.isEmpty()
            ? nhaCungCapRepository.findAll()
            : nhaCungCapRepository.findByTenNhaCungCapContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public NhaCungCapResponse getById(String maNhaCungCap) {
        NhaCungCap entity = findByIdOrThrow(maNhaCungCap);
        return toResponse(entity);
    }

    @Override
    @Transactional
    public NhaCungCapResponse create(NhaCungCapRequest request) {
        String tenNhaCungCap = request.getTenNhaCungCap().trim();
        String soDienThoai = request.getSoDienThoai().trim();

        PhoneValidator.validateOrThrow(soDienThoai, "So dien thoai");

        if (nhaCungCapRepository.existsByTenNhaCungCapIgnoreCase(tenNhaCungCap)) {
            throw new BusinessException("Ten nha cung cap da ton tai");
        }

        if (nhaCungCapRepository.existsBySoDienThoai(soDienThoai)) {
            throw new BusinessException("So dien thoai da ton tai");
        }

        String maNhaCungCap = request.getMaNhaCungCap();
        if (maNhaCungCap == null || maNhaCungCap.isBlank()) {
            String currentMaxCode = nhaCungCapRepository
                .findTopByMaNhaCungCapStartingWithOrderByMaNhaCungCapDesc(PREFIX)
                .map(NhaCungCap::getMaNhaCungCap)
                .orElse(null);
            maNhaCungCap = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (nhaCungCapRepository.existsById(maNhaCungCap)) {
            throw new BusinessException("Ma nha cung cap da ton tai");
        }

        NhaCungCap entity = new NhaCungCap();
        entity.setMaNhaCungCap(maNhaCungCap);
        entity.setTenNhaCungCap(tenNhaCungCap);
        entity.setSoDienThoai(soDienThoai);
        entity.setDiaChi(emptyToNull(request.getDiaChi()));
        entity.setGhiChu(emptyToNull(request.getGhiChu()));

        return toResponse(nhaCungCapRepository.save(entity));
    }

    @Override
    @Transactional
    public NhaCungCapResponse update(String maNhaCungCap, NhaCungCapRequest request) {
        NhaCungCap entity = findByIdOrThrow(maNhaCungCap);
        String tenNhaCungCap = request.getTenNhaCungCap().trim();
        String soDienThoai = request.getSoDienThoai().trim();

        PhoneValidator.validateOrThrow(soDienThoai, "So dien thoai");

        if (nhaCungCapRepository.existsByTenNhaCungCapIgnoreCaseAndMaNhaCungCapNot(tenNhaCungCap, maNhaCungCap)) {
            throw new BusinessException("Ten nha cung cap da ton tai");
        }

        if (nhaCungCapRepository.existsBySoDienThoaiAndMaNhaCungCapNot(soDienThoai, maNhaCungCap)) {
            throw new BusinessException("So dien thoai da ton tai");
        }

        entity.setTenNhaCungCap(tenNhaCungCap);
        entity.setSoDienThoai(soDienThoai);
        entity.setDiaChi(emptyToNull(request.getDiaChi()));
        entity.setGhiChu(emptyToNull(request.getGhiChu()));

        return toResponse(nhaCungCapRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maNhaCungCap) {
        NhaCungCap entity = findByIdOrThrow(maNhaCungCap);
        if (phieuMuaHangRepository.existsByMaNhaCungCap(maNhaCungCap)) {
            throw new BusinessException("Khong the xoa nha cung cap da phat sinh phieu mua hang");
        }
        try {
            nhaCungCapRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa nha cung cap da co du lieu lien quan");
        }
    }

    private NhaCungCap findByIdOrThrow(String maNhaCungCap) {
        return nhaCungCapRepository.findById(maNhaCungCap)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nha cung cap: " + maNhaCungCap));
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private NhaCungCapResponse toResponse(NhaCungCap entity) {
        NhaCungCapResponse response = new NhaCungCapResponse();
        response.setMaNhaCungCap(entity.getMaNhaCungCap());
        response.setTenNhaCungCap(entity.getTenNhaCungCap());
        response.setSoDienThoai(entity.getSoDienThoai());
        response.setDiaChi(entity.getDiaChi());
        response.setGhiChu(entity.getGhiChu());
        return response;
    }
}
