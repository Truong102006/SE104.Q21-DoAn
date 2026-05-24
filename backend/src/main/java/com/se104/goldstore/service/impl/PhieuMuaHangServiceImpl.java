package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.PricingUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.PhieuMuaHangRequest;
import com.se104.goldstore.dto.response.PhieuMuaHangResponse;
import com.se104.goldstore.entity.ChiTietPhieuMua;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.NhaCungCap;
import com.se104.goldstore.entity.PhieuMuaHang;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.NhaCungCapRepository;
import com.se104.goldstore.repository.PhieuMuaHangRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.PhieuMuaHangService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PhieuMuaHangServiceImpl implements PhieuMuaHangService {

    private static final String PREFIX = "PM";
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final PhieuMuaHangRepository phieuMuaHangRepository;
    private final ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final SanPhamRepository sanPhamRepository;
    private final DonViTinhRepository donViTinhRepository;
    private final LoaiSanPhamRepository loaiSanPhamRepository;

    public PhieuMuaHangServiceImpl(
        PhieuMuaHangRepository phieuMuaHangRepository,
        ChiTietPhieuMuaRepository chiTietPhieuMuaRepository,
        NhaCungCapRepository nhaCungCapRepository,
        SanPhamRepository sanPhamRepository,
        DonViTinhRepository donViTinhRepository,
        LoaiSanPhamRepository loaiSanPhamRepository
    ) {
        this.phieuMuaHangRepository = phieuMuaHangRepository;
        this.chiTietPhieuMuaRepository = chiTietPhieuMuaRepository;
        this.nhaCungCapRepository = nhaCungCapRepository;
        this.sanPhamRepository = sanPhamRepository;
        this.donViTinhRepository = donViTinhRepository;
        this.loaiSanPhamRepository = loaiSanPhamRepository;
    }

    @Override
    public List<PhieuMuaHangResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<PhieuMuaHang> entities = phieuMuaHangRepository.findAllByKeyword(normalized);

        // Optimization: Do not load items/details for list view to avoid N+1 and heavy mapping
        return entities.stream().map(entity -> buildResponse(entity, List.of())).toList();
    }

    @Override
    public Page<PhieuMuaHangResponse> getAllPaginated(String keyword, int page, int size) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        PageRequest pageRequest = PageRequest.of(
            Math.max(page, 0),
            Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "ngayLapPhieuMua").and(Sort.by(Sort.Direction.DESC, "soPhieuMua"))
        );

        return phieuMuaHangRepository.findByKeyword(normalized, pageRequest)
            .map(entity -> buildResponse(entity, List.of()));
    }

    @Override
    public PhieuMuaHangResponse getById(String soPhieuMua) {
        PhieuMuaHang phieuMuaHang = findByIdOrThrow(soPhieuMua);
        return buildResponse(phieuMuaHang, loadDetails(soPhieuMua));
    }

    @Override
    public PhieuMuaHangResponse getPrintData(String soPhieuMua) {
        return getById(soPhieuMua);
    }

    @Override
    @Transactional
    public PhieuMuaHangResponse create(PhieuMuaHangRequest request) {
        String maNhaCungCap = request.getMaNhaCungCap().trim();
        NhaCungCap nhaCungCap = nhaCungCapRepository.findById(maNhaCungCap)
            .orElseThrow(() -> new BusinessException("Mã nhà cung cấp không tồn tại"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("Danh sách sản phẩm mua không được để trống");
        }

        String soPhieuMua = normalizeVoucherCode(request.getSoPhieuMua());
        if (phieuMuaHangRepository.existsById(soPhieuMua)) {
            throw new BusinessException("Số phiếu mua đã tồn tại");
        }

        List<ChiTietPhieuMua> detailsToSave = new ArrayList<>();
        Map<String, SanPham> updatedSanPhams = new HashMap<>();
        Set<String> seenProducts = new HashSet<>();
        BigDecimal tongTien = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (PhieuMuaHangRequest.ItemRequest item : request.getItems()) {
            String maSanPham = item.getMaSanPham().trim();
            String maDonViTinh = item.getMaDonViTinh().trim();

            if (!seenProducts.add(maSanPham)) {
                throw new BusinessException("Sản phẩm bị trùng trong cùng một phiếu mua: " + maSanPham);
            }

            SanPham sanPham = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new BusinessException("Mã sản phẩm không tồn tại: " + maSanPham));
            DonViTinh donViTinh = donViTinhRepository.findById(maDonViTinh)
                .orElseThrow(() -> new BusinessException("Mã đơn vị tính không tồn tại: " + maDonViTinh));

            Integer soLuongMua = item.getSoLuongMua();
            BigDecimal donGia = normalizeMoney(item.getDonGia(), "Đơn giá mua phải >= 0");
            BigDecimal thanhTien = donGia
                .multiply(BigDecimal.valueOf(soLuongMua.longValue()))
                .setScale(2, RoundingMode.HALF_UP);

            ChiTietPhieuMua detail = new ChiTietPhieuMua();
            detail.setSoPhieuMua(soPhieuMua);
            detail.setMaSanPham(maSanPham);
            detail.setSoLuongMua(soLuongMua);
            detail.setMaDonViTinh(donViTinh.getMaDonViTinh());
            detail.setDonGia(donGia);
            detail.setThanhTien(thanhTien);
            detailsToSave.add(detail);

            LoaiSanPham loaiSanPham = loaiSanPhamRepository.findById(sanPham.getMaLoaiSanPham())
                .orElseThrow(() -> new BusinessException("Loại sản phẩm không tồn tại cho sản phẩm: " + maSanPham));

            int tonKhoHienTai = sanPham.getTonKho() == null ? 0 : sanPham.getTonKho();
            sanPham.setTonKho(tonKhoHienTai + soLuongMua);
            sanPham.setDonGiaMua(donGia);
            sanPham.setDonGiaBan(PricingUtils.calculateSellingPrice(donGia, loaiSanPham.getTiLeLoiNhuan()));
            updatedSanPhams.put(maSanPham, sanPham);

            tongTien = tongTien.add(thanhTien).setScale(2, RoundingMode.HALF_UP);
        }

        PhieuMuaHang phieuMuaHang = new PhieuMuaHang();
        phieuMuaHang.setSoPhieuMua(soPhieuMua);
        phieuMuaHang.setNgayLapPhieuMua(request.getNgayLapPhieuMua());
        phieuMuaHang.setMaNhaCungCap(maNhaCungCap);
        phieuMuaHang.setTongTien(tongTien);

        PhieuMuaHang savedVoucher = phieuMuaHangRepository.save(phieuMuaHang);
        List<ChiTietPhieuMua> savedDetails = chiTietPhieuMuaRepository.saveAll(detailsToSave);
        sanPhamRepository.saveAll(updatedSanPhams.values());

        return buildResponse(savedVoucher, savedDetails, nhaCungCap);
    }

    private PhieuMuaHang findByIdOrThrow(String soPhieuMua) {
        return phieuMuaHangRepository.findById(soPhieuMua)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu mua hàng: " + soPhieuMua));
    }

    private String normalizeVoucherCode(String requestedCode) {
        if (requestedCode == null || requestedCode.isBlank()) {
            String currentMaxCode = phieuMuaHangRepository
                .findTopBySoPhieuMuaStartingWithOrderBySoPhieuMuaDesc(PREFIX)
                .map(PhieuMuaHang::getSoPhieuMua)
                .orElse(null);
            return CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }
        return requestedCode.trim();
    }

    private BigDecimal normalizeMoney(BigDecimal value, String errorMessage) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(errorMessage);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private List<ChiTietPhieuMua> loadDetails(String soPhieuMua) {
        return chiTietPhieuMuaRepository.findBySoPhieuMua(soPhieuMua);
    }

    private PhieuMuaHangResponse buildResponse(PhieuMuaHang voucher, List<ChiTietPhieuMua> details) {
        return buildResponse(voucher, details, voucher.getNhaCungCap());
    }

    private PhieuMuaHangResponse buildResponse(
        PhieuMuaHang voucher,
        List<ChiTietPhieuMua> details,
        NhaCungCap nhaCungCap
    ) {
        PhieuMuaHangResponse response = new PhieuMuaHangResponse();
        response.setSoPhieuMua(voucher.getSoPhieuMua());
        response.setNgayLapPhieuMua(voucher.getNgayLapPhieuMua());
        response.setMaNhaCungCap(voucher.getMaNhaCungCap());
        response.setTongTien(voucher.getTongTien());

        if (nhaCungCap != null) {
            PhieuMuaHangResponse.NhaCungCapInfo nhaCungCapInfo = new PhieuMuaHangResponse.NhaCungCapInfo();
            nhaCungCapInfo.setMaNhaCungCap(nhaCungCap.getMaNhaCungCap());
            nhaCungCapInfo.setTenNhaCungCap(nhaCungCap.getTenNhaCungCap());
            nhaCungCapInfo.setSoDienThoai(nhaCungCap.getSoDienThoai());
            nhaCungCapInfo.setDiaChi(nhaCungCap.getDiaChi());
            response.setNhaCungCap(nhaCungCapInfo);
        }

        Map<String, SanPham> sanPhamMap = sanPhamRepository.findAllById(
            details.stream().map(ChiTietPhieuMua::getMaSanPham).collect(Collectors.toSet())
        )
            .stream()
            .collect(Collectors.toMap(SanPham::getMaSanPham, sanPham -> sanPham));
        Map<String, DonViTinh> donViTinhMap = donViTinhRepository.findAllById(
            details.stream().map(ChiTietPhieuMua::getMaDonViTinh).collect(Collectors.toSet())
        )
            .stream()
            .collect(Collectors.toMap(DonViTinh::getMaDonViTinh, donViTinh -> donViTinh));

        Set<String> maLoaiSanPhamSet = sanPhamMap.values()
            .stream()
            .map(SanPham::getMaLoaiSanPham)
            .collect(Collectors.toSet());
        Map<String, LoaiSanPham> loaiSanPhamMap = loaiSanPhamRepository.findAllById(maLoaiSanPhamSet)
            .stream()
            .collect(Collectors.toMap(LoaiSanPham::getMaLoaiSanPham, loaiSanPham -> loaiSanPham));

        List<PhieuMuaHangResponse.ItemResponse> items = details
            .stream()
            .map(detail -> toItemResponse(detail, sanPhamMap, donViTinhMap, loaiSanPhamMap))
            .toList();
        response.setItems(items);

        return response;
    }

    private PhieuMuaHangResponse.ItemResponse toItemResponse(
        ChiTietPhieuMua detail,
        Map<String, SanPham> sanPhamMap,
        Map<String, DonViTinh> donViTinhMap,
        Map<String, LoaiSanPham> loaiSanPhamMap
    ) {
        PhieuMuaHangResponse.ItemResponse item = new PhieuMuaHangResponse.ItemResponse();
        item.setMaSanPham(detail.getMaSanPham());
        item.setSoLuongMua(detail.getSoLuongMua());
        item.setMaDonViTinh(detail.getMaDonViTinh());
        item.setDonGia(detail.getDonGia());
        item.setThanhTien(detail.getThanhTien());

        SanPham sanPham = sanPhamMap.get(detail.getMaSanPham());
        if (sanPham != null) {
            item.setTenSanPham(sanPham.getTenSanPham());
            item.setMaLoaiSanPham(sanPham.getMaLoaiSanPham());
            LoaiSanPham loaiSanPham = loaiSanPhamMap.get(sanPham.getMaLoaiSanPham());
            if (loaiSanPham != null) {
                item.setTenLoaiSanPham(loaiSanPham.getTenLoaiSanPham());
            }
        }

        DonViTinh donViTinh = donViTinhMap.get(detail.getMaDonViTinh());
        if (donViTinh != null) {
            item.setTenDonViTinh(donViTinh.getTenDonViTinh());
        }

        return item;
    }
}
