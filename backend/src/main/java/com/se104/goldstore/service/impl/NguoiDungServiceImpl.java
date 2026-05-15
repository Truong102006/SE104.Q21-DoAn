package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.NguoiDungRequest;
import com.se104.goldstore.dto.response.NguoiDungResponse;
import com.se104.goldstore.entity.NguoiDung;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.NguoiDungRepository;
import com.se104.goldstore.repository.NhomNguoiDungRepository;
import com.se104.goldstore.service.NguoiDungService;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NguoiDungServiceImpl implements NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final NhomNguoiDungRepository nhomNguoiDungRepository;

    public NguoiDungServiceImpl(
        NguoiDungRepository nguoiDungRepository,
        NhomNguoiDungRepository nhomNguoiDungRepository
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.nhomNguoiDungRepository = nhomNguoiDungRepository;
    }

    @Override
    public List<NguoiDungResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<NguoiDung> entities = normalized.isEmpty()
            ? nguoiDungRepository.findAll()
            : nguoiDungRepository.findByTenDangNhapContainingIgnoreCase(normalized);

        return entities.stream().map(this::toResponse).toList();
    }

    @Override
    public NguoiDungResponse getById(String tenDangNhap) {
        return toResponse(findByIdOrThrow(tenDangNhap));
    }

    @Override
    @Transactional
    public NguoiDungResponse create(NguoiDungRequest request) {
        String tenDangNhap = request.getTenDangNhap();
        if (tenDangNhap == null || tenDangNhap.isBlank()) {
            throw new BusinessException("Ten dang nhap khong duoc de trong");
        }
        tenDangNhap = tenDangNhap.trim();

        if (nguoiDungRepository.existsById(tenDangNhap)) {
            throw new BusinessException("Ten dang nhap da ton tai");
        }

        String maNhom = normalizeAndValidateNhom(request.getMaNhom());

        NguoiDung entity = new NguoiDung();
        entity.setTenDangNhap(tenDangNhap);
        entity.setMatKhau(request.getMatKhau().trim());
        entity.setMaNhom(maNhom);

        return toResponse(nguoiDungRepository.save(entity));
    }

    @Override
    @Transactional
    public NguoiDungResponse update(String tenDangNhap, NguoiDungRequest request) {
        NguoiDung entity = findByIdOrThrow(tenDangNhap);

        String maNhom = normalizeAndValidateNhom(request.getMaNhom());

        entity.setMatKhau(request.getMatKhau().trim());
        entity.setMaNhom(maNhom);

        return toResponse(nguoiDungRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String tenDangNhap) {
        NguoiDung entity = findByIdOrThrow(tenDangNhap);
        try {
            nguoiDungRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa nguoi dung da co du lieu lien quan");
        }
    }

    private NguoiDung findByIdOrThrow(String tenDangNhap) {
        return nguoiDungRepository.findById(tenDangNhap)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung: " + tenDangNhap));
    }

    private String normalizeAndValidateNhom(String maNhom) {
        if (maNhom == null || maNhom.isBlank()) {
            return null;
        }
        String normalized = maNhom.trim();
        if (!nhomNguoiDungRepository.existsById(normalized)) {
            throw new BusinessException("Ma nhom khong ton tai");
        }
        return normalized;
    }

    private NguoiDungResponse toResponse(NguoiDung entity) {
        NguoiDungResponse response = new NguoiDungResponse();
        response.setTenDangNhap(entity.getTenDangNhap());
        response.setMaNhom(entity.getMaNhom());
        return response;
    }
}