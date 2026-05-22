package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.PhanQuyenRequest;
import com.se104.goldstore.dto.response.PhanQuyenResponse;
import com.se104.goldstore.entity.PhanQuyen;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChucNangRepository;
import com.se104.goldstore.repository.NhomNguoiDungRepository;
import com.se104.goldstore.repository.PhanQuyenRepository;
import com.se104.goldstore.service.PhanQuyenService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PhanQuyenServiceImpl implements PhanQuyenService {

    private final PhanQuyenRepository phanQuyenRepository;
    private final NhomNguoiDungRepository nhomNguoiDungRepository;
    private final ChucNangRepository chucNangRepository;

    public PhanQuyenServiceImpl(
        PhanQuyenRepository phanQuyenRepository,
        NhomNguoiDungRepository nhomNguoiDungRepository,
        ChucNangRepository chucNangRepository
    ) {
        this.phanQuyenRepository = phanQuyenRepository;
        this.nhomNguoiDungRepository = nhomNguoiDungRepository;
        this.chucNangRepository = chucNangRepository;
    }

    @Override
    public List<PhanQuyenResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<PhanQuyen> entities = normalized.isEmpty()
            ? phanQuyenRepository.findAll()
            : phanQuyenRepository.findByMaNhomContainingIgnoreCaseOrMaChucNangContainingIgnoreCase(normalized, normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public PhanQuyenResponse getById(String maNhom, String maChucNang) {
        return toResponse(findByIdOrThrow(maNhom, maChucNang));
    }

    @Override
    @Transactional
    public PhanQuyenResponse create(PhanQuyenRequest request) {
        String maNhom = request.getMaNhom().trim();
        String maChucNang = request.getMaChucNang().trim();

        validateReferences(maNhom, maChucNang);

        if (phanQuyenRepository.existsByMaNhomAndMaChucNang(maNhom, maChucNang)) {
            throw new BusinessException("Phân quyền đã tồn tại");
        }

        PhanQuyen entity = new PhanQuyen();
        entity.setMaNhom(maNhom);
        entity.setMaChucNang(maChucNang);

        return toResponse(phanQuyenRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maNhom, String maChucNang) {
        PhanQuyen entity = findByIdOrThrow(maNhom, maChucNang);
        try {
            phanQuyenRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa phân quyền đã có dữ liệu liên quan");
        }
    }

    private PhanQuyen findByIdOrThrow(String maNhom, String maChucNang) {
        PhanQuyen.PhanQuyenId id = new PhanQuyen.PhanQuyenId(maNhom, maChucNang);
        return phanQuyenRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phân quyền: " + maNhom + " - " + maChucNang));
    }

    private void validateReferences(String maNhom, String maChucNang) {
        if (!nhomNguoiDungRepository.existsById(maNhom)) {
            throw new BusinessException("Mã nhóm không tồn tại");
        }
        if (!chucNangRepository.existsById(maChucNang)) {
            throw new BusinessException("Mã chức năng không tồn tại");
        }
    }

    private PhanQuyenResponse toResponse(PhanQuyen entity) {
        PhanQuyenResponse response = new PhanQuyenResponse();
        response.setMaNhom(entity.getMaNhom());
        response.setMaChucNang(entity.getMaChucNang());
        return response;
    }
}