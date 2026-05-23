package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.DonViTinhRequest;
import com.se104.goldstore.dto.response.DonViTinhResponse;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.DonViTinhService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DonViTinhServiceImpl implements DonViTinhService {

    private static final String PREFIX = "DVT";

    private final DonViTinhRepository donViTinhRepository;
    private final SanPhamRepository sanPhamRepository;
    private final ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;

    public DonViTinhServiceImpl(
        DonViTinhRepository donViTinhRepository,
        SanPhamRepository sanPhamRepository,
        ChiTietPhieuMuaRepository chiTietPhieuMuaRepository
    ) {
        this.donViTinhRepository = donViTinhRepository;
        this.sanPhamRepository = sanPhamRepository;
        this.chiTietPhieuMuaRepository = chiTietPhieuMuaRepository;
    }

    @Override
    public List<DonViTinhResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<DonViTinh> entities = normalized.isEmpty()
            ? donViTinhRepository.findAll()
            : donViTinhRepository.findByTenDonViTinhContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public DonViTinhResponse getById(String maDonViTinh) {
        return toResponse(findByIdOrThrow(maDonViTinh));
    }

    @Override
    @Transactional
    public DonViTinhResponse create(DonViTinhRequest request) {
        if (donViTinhRepository.existsByTenDonViTinhIgnoreCase(request.getTenDonViTinh().trim())) {
            throw new BusinessException("Tên đơn vị tính đã tồn tại");
        }

        String maDonViTinh = request.getMaDonViTinh();
        if (maDonViTinh == null || maDonViTinh.isBlank()) {
            String currentMaxCode = donViTinhRepository
                .findTopByMaDonViTinhStartingWithOrderByMaDonViTinhDesc(PREFIX)
                .map(DonViTinh::getMaDonViTinh)
                .orElse(null);
            maDonViTinh = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (donViTinhRepository.existsById(maDonViTinh)) {
            throw new BusinessException("Mã đơn vị tính đã tồn tại");
        }

        DonViTinh entity = new DonViTinh();
        entity.setMaDonViTinh(maDonViTinh);
        entity.setTenDonViTinh(request.getTenDonViTinh().trim());
        entity.setLoaiDonVi(emptyToNull(request.getLoaiDonVi()));
        entity.setHeSoQuyDoi(request.getHeSoQuyDoi());
        entity.setGhiChu(emptyToNull(request.getGhiChu()));
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return toResponse(donViTinhRepository.save(entity));
    }

    @Override
    @Transactional
    public DonViTinhResponse update(String maDonViTinh, DonViTinhRequest request) {
        DonViTinh entity = findByIdOrThrow(maDonViTinh);

        if (donViTinhRepository.existsByTenDonViTinhIgnoreCaseAndMaDonViTinhNot(request.getTenDonViTinh().trim(), maDonViTinh)) {
            throw new BusinessException("Tên đơn vị tính đã tồn tại");
        }

        entity.setTenDonViTinh(request.getTenDonViTinh().trim());
        entity.setLoaiDonVi(emptyToNull(request.getLoaiDonVi()));
        entity.setHeSoQuyDoi(request.getHeSoQuyDoi());
        entity.setGhiChu(emptyToNull(request.getGhiChu()));
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        return toResponse(donViTinhRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maDonViTinh) {
        DonViTinh entity = findByIdOrThrow(maDonViTinh);
        if (sanPhamRepository.existsByMaDonViTinh(maDonViTinh) || chiTietPhieuMuaRepository.existsByMaDonViTinh(maDonViTinh)) {
            throw new BusinessException("Không thể xóa đơn vị tính đã được sử dụng trong sản phẩm hoặc phiếu mua");
        }
        try {
            donViTinhRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa đơn vị tính đã có dữ liệu liên quan");
        }
    }

    private DonViTinh findByIdOrThrow(String maDonViTinh) {
        return donViTinhRepository.findById(maDonViTinh)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị tính: " + maDonViTinh));
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private DonViTinhResponse toResponse(DonViTinh entity) {
        DonViTinhResponse response = new DonViTinhResponse();
        response.setMaDonViTinh(entity.getMaDonViTinh());
        response.setTenDonViTinh(entity.getTenDonViTinh());
        response.setLoaiDonVi(entity.getLoaiDonVi());
        response.setHeSoQuyDoi(entity.getHeSoQuyDoi());
        response.setGhiChu(entity.getGhiChu());
        response.setIsActive(entity.getIsActive());
        return response;
    }
}
