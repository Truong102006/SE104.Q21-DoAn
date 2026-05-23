package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.PricingUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.SanPhamRequest;
import com.se104.goldstore.dto.response.SanPhamResponse;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChiTietBaoCaoDoanhThuSanPhamRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoTonKhoRepository;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.SanPhamService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SanPhamServiceImpl implements SanPhamService {

    private static final String PREFIX = "SP";
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final SanPhamRepository sanPhamRepository;
    private final LoaiSanPhamRepository loaiSanPhamRepository;
    private final DonViTinhRepository donViTinhRepository;
    private final ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;
    private final ChiTietPhieuBanRepository chiTietPhieuBanRepository;
    private final ChiTietBaoCaoTonKhoRepository chiTietBaoCaoTonKhoRepository;
    private final ChiTietBaoCaoDoanhThuSanPhamRepository chiTietBaoCaoDoanhThuSanPhamRepository;

    public SanPhamServiceImpl(
        SanPhamRepository sanPhamRepository,
        LoaiSanPhamRepository loaiSanPhamRepository,
        DonViTinhRepository donViTinhRepository,
        ChiTietPhieuMuaRepository chiTietPhieuMuaRepository,
        ChiTietPhieuBanRepository chiTietPhieuBanRepository,
        ChiTietBaoCaoTonKhoRepository chiTietBaoCaoTonKhoRepository,
        ChiTietBaoCaoDoanhThuSanPhamRepository chiTietBaoCaoDoanhThuSanPhamRepository
    ) {
        this.sanPhamRepository = sanPhamRepository;
        this.loaiSanPhamRepository = loaiSanPhamRepository;
        this.donViTinhRepository = donViTinhRepository;
        this.chiTietPhieuMuaRepository = chiTietPhieuMuaRepository;
        this.chiTietPhieuBanRepository = chiTietPhieuBanRepository;
        this.chiTietBaoCaoTonKhoRepository = chiTietBaoCaoTonKhoRepository;
        this.chiTietBaoCaoDoanhThuSanPhamRepository = chiTietBaoCaoDoanhThuSanPhamRepository;
    }

    @Override
    public Page<SanPhamResponse> getAll(String keyword, String productTypeId, int page, int size) {
        String normalizedKeyword = SearchUtils.normalizeKeyword(keyword);
        String normalizedProductTypeId = normalizeNullable(productTypeId);

        PageRequest pageRequest = PageRequest.of(
            Math.max(page, 0),
            normalizePageSize(size),
            Sort.by(Sort.Direction.ASC, "maSanPham")
        );

        Page<SanPham> entities = sanPhamRepository.search(
            normalizedKeyword,
            normalizedProductTypeId,
            pageRequest
        );
        return entities.map(this::toResponse);
    }

    @Override
    public List<SanPhamResponse> search(String keyword) {
        String normalizedKeyword = SearchUtils.normalizeKeyword(keyword);
        if (normalizedKeyword.isEmpty()) {
            return List.of();
        }
        return sanPhamRepository.searchByKeyword(normalizedKeyword).stream().map(this::toResponse).toList();
    }

    @Override
    public SanPhamResponse getById(String maSanPham) {
        return toResponse(findByIdOrThrow(maSanPham));
    }

    @Override
    @Transactional
    public SanPhamResponse create(SanPhamRequest request) {
        String maLoaiSanPham = request.getMaLoaiSanPham().trim();
        String maDonViTinh = request.getMaDonViTinh().trim();
        LoaiSanPham loaiSanPham = findLoaiSanPhamOrThrow(maLoaiSanPham);
        DonViTinh donViTinh = findDonViTinhOrThrow(maDonViTinh);
        validateUnitCompatibility(null, maLoaiSanPham, donViTinh);
        validateTonKhoOnCreate(request.getTonKho());

        String maSanPham = normalizeNullable(request.getMaSanPham());
        if (maSanPham == null) {
            String currentMaxCode = sanPhamRepository
                .findTopByMaSanPhamStartingWithOrderByMaSanPhamDesc(PREFIX)
                .map(SanPham::getMaSanPham)
                .orElse(null);
            maSanPham = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (sanPhamRepository.existsById(maSanPham)) {
            throw new BusinessException("Mã sản phẩm đã tồn tại");
        }

        SanPham entity = new SanPham();
        entity.setMaSanPham(maSanPham);
        entity.setTenSanPham(request.getTenSanPham().trim());
        entity.setMaLoaiSanPham(maLoaiSanPham);
        entity.setMaDonViTinh(maDonViTinh);
        entity.setDonGiaMua(normalizePrice(request.getDonGiaMua()));
        entity.setDonGiaBan(calculateSellingPrice(entity.getDonGiaMua(), loaiSanPham.getTiLeLoiNhuan()));
        entity.setTonKho(0);
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return toResponse(sanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public SanPhamResponse update(String maSanPham, SanPhamRequest request) {
        SanPham entity = findByIdOrThrow(maSanPham);
        String maLoaiSanPham = request.getMaLoaiSanPham().trim();
        String maDonViTinh = request.getMaDonViTinh().trim();
        LoaiSanPham loaiSanPham = findLoaiSanPhamOrThrow(maLoaiSanPham);
        DonViTinh donViTinh = findDonViTinhOrThrow(maDonViTinh);
        validateUnitCompatibility(maSanPham, maLoaiSanPham, donViTinh);
        validateTonKhoOnUpdate(entity.getTonKho(), request.getTonKho());

        entity.setTenSanPham(request.getTenSanPham().trim());
        entity.setMaLoaiSanPham(maLoaiSanPham);
        entity.setMaDonViTinh(maDonViTinh);
        entity.setDonGiaMua(normalizePrice(request.getDonGiaMua()));
        entity.setDonGiaBan(calculateSellingPrice(entity.getDonGiaMua(), loaiSanPham.getTiLeLoiNhuan()));
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

        return toResponse(sanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maSanPham) {
        SanPham entity = findByIdOrThrow(maSanPham);
        if (hasRelatedTransactionsOrReports(maSanPham)) {
            throw new BusinessException("Không thể xóa sản phẩm đã có giao dịch hoặc báo cáo liên quan");
        }
        try {
            sanPhamRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa sản phẩm đã có dữ liệu liên quan");
        }
    }

    private SanPham findByIdOrThrow(String maSanPham) {
        return sanPhamRepository.findById(maSanPham)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm: " + maSanPham));
    }

    private LoaiSanPham findLoaiSanPhamOrThrow(String maLoaiSanPham) {
        return loaiSanPhamRepository.findById(maLoaiSanPham)
            .orElseThrow(() -> new BusinessException("Mã loại sản phẩm không tồn tại"));
    }

    private DonViTinh findDonViTinhOrThrow(String maDonViTinh) {
        return donViTinhRepository.findById(maDonViTinh)
            .orElseThrow(() -> new BusinessException("Mã đơn vị tính không tồn tại"));
    }

    private void validateUnitCompatibility(String currentProductId, String maLoaiSanPham, DonViTinh selectedDonViTinh) {
        Optional<SanPham> referenceProduct = currentProductId == null
            ? sanPhamRepository.findFirstByMaLoaiSanPham(maLoaiSanPham)
            : sanPhamRepository.findFirstByMaLoaiSanPhamAndMaSanPhamNot(maLoaiSanPham, currentProductId);
        if (referenceProduct.isEmpty()) {
            return;
        }

        DonViTinh referenceDonViTinh = donViTinhRepository.findById(referenceProduct.get().getMaDonViTinh()).orElse(null);
        if (referenceDonViTinh == null) {
            return;
        }

        String referenceCategory = normalizeNullable(referenceDonViTinh.getLoaiDonVi());
        String selectedCategory = normalizeNullable(selectedDonViTinh.getLoaiDonVi());

        if (referenceCategory != null && selectedCategory != null && !referenceCategory.equalsIgnoreCase(selectedCategory)) {
            throw new BusinessException("Đơn vị tính không phù hợp với loại sản phẩm này");
        }
    }

    private void validateTonKhoOnCreate(Integer tonKhoRequest) {
        if (tonKhoRequest != null && tonKhoRequest != 0) {
            throw new BusinessException("Tồn kho ban đầu phải mặc định là 0 và chỉ cập nhật qua phiếu mua/bán");
        }
    }

    private void validateTonKhoOnUpdate(Integer currentTonKho, Integer tonKhoRequest) {
        if (currentTonKho != null && currentTonKho < 0) {
            throw new BusinessException("Tồn kho không hợp lệ");
        }
        if (tonKhoRequest != null && !tonKhoRequest.equals(currentTonKho)) {
            throw new BusinessException("Tồn kho chỉ được cập nhật qua phiếu mua/bán");
        }
    }

    private boolean hasRelatedTransactionsOrReports(String maSanPham) {
        return chiTietPhieuMuaRepository.existsByMaSanPham(maSanPham)
            || chiTietPhieuBanRepository.existsByMaSanPham(maSanPham)
            || chiTietBaoCaoTonKhoRepository.existsByMaSanPham(maSanPham)
            || chiTietBaoCaoDoanhThuSanPhamRepository.existsByMaSanPham(maSanPham);
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private BigDecimal normalizePrice(BigDecimal value) {
        if (value == null) {
            throw new BusinessException("Đơn giá mua không được để trống");
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Đơn giá mua phải >= 0");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateSellingPrice(BigDecimal donGiaMua, BigDecimal tiLeLoiNhuan) {
        return PricingUtils.calculateSellingPrice(donGiaMua, tiLeLoiNhuan);
    }

    private SanPhamResponse toResponse(SanPham entity) {
        SanPhamResponse response = new SanPhamResponse();
        response.setMaSanPham(entity.getMaSanPham());
        response.setTenSanPham(entity.getTenSanPham());
        response.setMaLoaiSanPham(entity.getMaLoaiSanPham());
        response.setMaDonViTinh(entity.getMaDonViTinh());
        response.setDonGiaMua(entity.getDonGiaMua());
        response.setDonGiaBan(entity.getDonGiaBan());
        response.setTonKho(entity.getTonKho());
        response.setIsActive(entity.getIsActive());

        if (entity.getLoaiSanPham() != null) {
            SanPhamResponse.LoaiSanPhamInfo loaiSanPhamInfo = new SanPhamResponse.LoaiSanPhamInfo();
            loaiSanPhamInfo.setMaLoaiSanPham(entity.getLoaiSanPham().getMaLoaiSanPham());
            loaiSanPhamInfo.setTenLoaiSanPham(entity.getLoaiSanPham().getTenLoaiSanPham());
            response.setLoaiSanPham(loaiSanPhamInfo);
        }

        if (entity.getDonViTinh() != null) {
            SanPhamResponse.DonViTinhInfo donViTinhInfo = new SanPhamResponse.DonViTinhInfo();
            donViTinhInfo.setMaDonViTinh(entity.getDonViTinh().getMaDonViTinh());
            donViTinhInfo.setTenDonViTinh(entity.getDonViTinh().getTenDonViTinh());
            donViTinhInfo.setLoaiDonVi(entity.getDonViTinh().getLoaiDonVi());
            response.setDonViTinh(donViTinhInfo);
        }
        return response;
    }
}
