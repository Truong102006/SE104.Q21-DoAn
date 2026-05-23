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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NguoiDungServiceImpl implements NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final NhomNguoiDungRepository nhomNguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    public NguoiDungServiceImpl(
        NguoiDungRepository nguoiDungRepository,
        NhomNguoiDungRepository nhomNguoiDungRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.nhomNguoiDungRepository = nhomNguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<NguoiDungResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<NguoiDung> entities = nguoiDungRepository.findByKeyword(normalized);

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
            throw new BusinessException("Tên đăng nhập không được để trống");
        }
        tenDangNhap = tenDangNhap.trim();

        if (nguoiDungRepository.existsById(tenDangNhap)) {
            throw new BusinessException("Tên đăng nhập đã tồn tại");
        }

        String maNhom = normalizeAndValidateNhom(request.getMaNhom());
        if (request.getMatKhau() == null || request.getMatKhau().isBlank()) {
            throw new BusinessException("Mật khẩu không được để trống");
        }

        NguoiDung entity = new NguoiDung();
        entity.setTenDangNhap(tenDangNhap);
        entity.setMatKhau(passwordEncoder.encode(request.getMatKhau().trim()));
        entity.setMaNhom(maNhom);
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return toResponse(nguoiDungRepository.save(entity));
    }

    @Override
    @Transactional
    public NguoiDungResponse update(String tenDangNhap, NguoiDungRequest request) {
        NguoiDung entity = findByIdOrThrow(tenDangNhap);

        // Ràng buộc 1: Không thể tự khóa tài khoản của chính mình
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String currentUsername = authentication.getName();
            if (currentUsername.equalsIgnoreCase(tenDangNhap) && request.getIsActive() != null && !request.getIsActive()) {
                throw new BusinessException("Không thể tự ngưng hoạt động tài khoản của chính mình!");
            }
        }

        // Ràng buộc 2: Không thể ngưng hoạt động tài khoản cuối cùng hoạt động trong nhóm
        if (request.getIsActive() != null && !request.getIsActive()) {
            String role = entity.getMaNhom();
            long activeCount = nguoiDungRepository.findAll().stream()
                .filter(u -> role.equals(u.getMaNhom()) && u.getIsActive())
                .count();
            if (activeCount <= 1) {
                String roleName = "ADMIN".equals(role) ? "Quản trị viên (ADMIN)" : "Nhân viên (STAFF)";
                throw new BusinessException("Không thể ngưng hoạt động tài khoản " + roleName + " hoạt động duy nhất trong hệ thống!");
            }
        }

        String maNhom = normalizeAndValidateNhom(request.getMaNhom());

        // Ràng buộc 3: Không thể chuyển nhóm tài khoản hoạt động duy nhất của nhóm sang nhóm khác
        if (maNhom != null && !entity.getMaNhom().equals(maNhom)) {
            String originalRole = entity.getMaNhom();
            long activeCount = nguoiDungRepository.findAll().stream()
                .filter(u -> originalRole.equals(u.getMaNhom()) && u.getIsActive())
                .count();
            if (activeCount <= 1) {
                String roleName = "ADMIN".equals(originalRole) ? "Quản trị viên (ADMIN)" : "Nhân viên (STAFF)";
                throw new BusinessException("Không thể chuyển nhóm tài khoản " + roleName + " hoạt động duy nhất sang nhóm khác!");
            }
        }

        if (request.getMatKhau() != null && !request.getMatKhau().isBlank()) {
            entity.setMatKhau(passwordEncoder.encode(request.getMatKhau().trim()));
        }
        entity.setMaNhom(maNhom);
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        return toResponse(nguoiDungRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String tenDangNhap) {
        NguoiDung entity = findByIdOrThrow(tenDangNhap);

        // Ràng buộc 4: Không thể tự xóa tài khoản của chính mình
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String currentUsername = authentication.getName();
            if (currentUsername.equalsIgnoreCase(tenDangNhap)) {
                throw new BusinessException("Không thể tự xóa tài khoản của chính mình!");
            }
        }

        // Ràng buộc 5: Không thể xóa tài khoản hoạt động duy nhất trong nhóm
        String role = entity.getMaNhom();
        long activeCount = nguoiDungRepository.findAll().stream()
            .filter(u -> role.equals(u.getMaNhom()) && u.getIsActive())
            .count();
        if (activeCount <= 1) {
            String roleName = "ADMIN".equals(role) ? "Quản trị viên (ADMIN)" : "Nhân viên (STAFF)";
            throw new BusinessException("Không thể xóa tài khoản " + roleName + " hoạt động duy nhất trong hệ thống!");
        }

        try {
            nguoiDungRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa người dùng đã có dữ liệu liên quan (giao dịch hoặc báo cáo)");
        }
    }

    private NguoiDung findByIdOrThrow(String tenDangNhap) {
        return nguoiDungRepository.findById(tenDangNhap)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + tenDangNhap));
    }

    private String normalizeAndValidateNhom(String maNhom) {
        if (maNhom == null || maNhom.isBlank()) {
            return null;
        }
        String normalized = maNhom.trim();
        if (!nhomNguoiDungRepository.existsById(normalized)) {
            throw new BusinessException("Mã nhóm không tồn tại");
        }
        return normalized;
    }

    private NguoiDungResponse toResponse(NguoiDung entity) {
        NguoiDungResponse response = new NguoiDungResponse();
        response.setTenDangNhap(entity.getTenDangNhap());
        response.setMaNhom(entity.getMaNhom());
        response.setIsActive(entity.getIsActive());
        return response;
    }
}
