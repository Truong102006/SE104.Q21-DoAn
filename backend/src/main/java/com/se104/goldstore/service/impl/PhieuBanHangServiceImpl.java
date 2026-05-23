package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.PricingUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.PhieuBanHangRequest;
import com.se104.goldstore.dto.response.PhieuBanHangResponse;
import com.se104.goldstore.entity.ChiTietPhieuBan;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.PhieuBanHang;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.PhieuBanHangRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.PhieuBanHangService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PhieuBanHangServiceImpl implements PhieuBanHangService {

    private static final String PREFIX = "PB";

    private final PhieuBanHangRepository phieuBanHangRepository;
    private final ChiTietPhieuBanRepository chiTietPhieuBanRepository;
    private final KhachHangRepository khachHangRepository;
    private final SanPhamRepository sanPhamRepository;
    private final DonViTinhRepository donViTinhRepository;
    private final LoaiSanPhamRepository loaiSanPhamRepository;

    public PhieuBanHangServiceImpl(
        PhieuBanHangRepository phieuBanHangRepository,
        ChiTietPhieuBanRepository chiTietPhieuBanRepository,
        KhachHangRepository khachHangRepository,
        SanPhamRepository sanPhamRepository,
        DonViTinhRepository donViTinhRepository,
        LoaiSanPhamRepository loaiSanPhamRepository
    ) {
        this.phieuBanHangRepository = phieuBanHangRepository;
        this.chiTietPhieuBanRepository = chiTietPhieuBanRepository;
        this.khachHangRepository = khachHangRepository;
        this.sanPhamRepository = sanPhamRepository;
        this.donViTinhRepository = donViTinhRepository;
        this.loaiSanPhamRepository = loaiSanPhamRepository;
    }

    @Override
    public List<PhieuBanHangResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<PhieuBanHang> entities = phieuBanHangRepository.findByKeyword(normalized);

        return entities.stream().map(entity -> buildResponse(entity, loadDetails(entity.getSoPhieuBan()))).toList();
    }

    @Override
    public PhieuBanHangResponse getById(String soPhieuBan) {
        PhieuBanHang phieuBanHang = findByIdOrThrow(soPhieuBan);
        return buildResponse(phieuBanHang, loadDetails(soPhieuBan));
    }

    @Override
    @Transactional
    public PhieuBanHangResponse create(PhieuBanHangRequest request) {
        String maKhachHang = request.getMaKhachHang().trim();
        KhachHang khachHang = khachHangRepository.findById(maKhachHang)
            .orElseThrow(() -> new BusinessException("Mã khách hàng không tồn tại"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("Danh sách sản phẩm bán không được để trống");
        }

        String soPhieuBan = normalizeVoucherCode(request.getSoPhieuBan());
        if (phieuBanHangRepository.existsById(soPhieuBan)) {
            throw new BusinessException("Số phiếu bán đã tồn tại");
        }

        List<ChiTietPhieuBan> detailsToSave = new ArrayList<>();
        Map<String, SanPham> updatedSanPhams = new HashMap<>();
        Set<String> seenProducts = new HashSet<>();
        BigDecimal tongTien = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (PhieuBanHangRequest.ItemRequest item : request.getItems()) {
            String maSanPham = item.getMaSanPham().trim();
            Integer soLuong = item.getSoLuong();

            if (!seenProducts.add(maSanPham)) {
                throw new BusinessException("Sản phẩm bị trùng trong cùng một phiếu bán: " + maSanPham);
            }

            SanPham sanPham = sanPhamRepository.findByIdForUpdate(maSanPham)
                .orElseThrow(() -> new BusinessException("Mã sản phẩm không tồn tại: " + maSanPham));

            int tonKhoHienTai = sanPham.getTonKho() == null ? 0 : sanPham.getTonKho();
            if (soLuong > tonKhoHienTai) {
                throw new BusinessException("Số lượng bán vượt tồn kho hiện tại cho sản phẩm: " + maSanPham);
            }

            if (sanPham.getDonGiaMua() == null || sanPham.getDonGiaMua().compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException("Đơn giá mua của sản phẩm không hợp lệ: " + maSanPham);
            }

            LoaiSanPham loaiSanPham = loaiSanPhamRepository.findById(sanPham.getMaLoaiSanPham())
                .orElseThrow(() -> new BusinessException("Loại sản phẩm không tồn tại cho sản phẩm: " + maSanPham));

            BigDecimal donGiaBan = PricingUtils.calculateSellingPrice(sanPham.getDonGiaMua(), loaiSanPham.getTiLeLoiNhuan());
            BigDecimal thanhTien = donGiaBan
                .multiply(BigDecimal.valueOf(soLuong.longValue()))
                .setScale(2, RoundingMode.HALF_UP);

            ChiTietPhieuBan detail = new ChiTietPhieuBan();
            detail.setSoPhieuBan(soPhieuBan);
            detail.setMaSanPham(maSanPham);
            detail.setSoLuong(soLuong);
            detail.setDonGia(donGiaBan);
            detail.setThanhTien(thanhTien);
            detailsToSave.add(detail);

            sanPham.setTonKho(tonKhoHienTai - soLuong);
            sanPham.setDonGiaBan(donGiaBan);
            updatedSanPhams.put(maSanPham, sanPham);

            tongTien = tongTien.add(thanhTien).setScale(2, RoundingMode.HALF_UP);
        }

        PhieuBanHang phieuBanHang = new PhieuBanHang();
        phieuBanHang.setSoPhieuBan(soPhieuBan);
        phieuBanHang.setNgayLapPhieuBan(request.getNgayLapPhieuBan());
        phieuBanHang.setMaKhachHang(maKhachHang);
        phieuBanHang.setTongTien(tongTien);

        PhieuBanHang savedVoucher = phieuBanHangRepository.save(phieuBanHang);
        List<ChiTietPhieuBan> savedDetails = chiTietPhieuBanRepository.saveAll(detailsToSave);
        sanPhamRepository.saveAll(updatedSanPhams.values());

        return buildResponse(savedVoucher, savedDetails, khachHang);
    }

    private PhieuBanHang findByIdOrThrow(String soPhieuBan) {
        return phieuBanHangRepository.findById(soPhieuBan)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu bán hàng: " + soPhieuBan));
    }

    private String normalizeVoucherCode(String requestedCode) {
        if (requestedCode == null || requestedCode.isBlank()) {
            String currentMaxCode = phieuBanHangRepository
                .findTopBySoPhieuBanStartingWithOrderBySoPhieuBanDesc(PREFIX)
                .map(PhieuBanHang::getSoPhieuBan)
                .orElse(null);
            return CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }
        return requestedCode.trim();
    }

    private List<ChiTietPhieuBan> loadDetails(String soPhieuBan) {
        return chiTietPhieuBanRepository.findBySoPhieuBan(soPhieuBan);
    }

    private PhieuBanHangResponse buildResponse(PhieuBanHang voucher, List<ChiTietPhieuBan> details) {
        KhachHang khachHang = khachHangRepository.findById(voucher.getMaKhachHang()).orElse(null);
        return buildResponse(voucher, details, khachHang);
    }

    private PhieuBanHangResponse buildResponse(
        PhieuBanHang voucher,
        List<ChiTietPhieuBan> details,
        KhachHang khachHang
    ) {
        PhieuBanHangResponse response = new PhieuBanHangResponse();
        response.setSoPhieuBan(voucher.getSoPhieuBan());
        response.setNgayLapPhieuBan(voucher.getNgayLapPhieuBan());
        response.setMaKhachHang(voucher.getMaKhachHang());
        response.setTongTien(voucher.getTongTien());

        if (khachHang != null) {
            PhieuBanHangResponse.KhachHangInfo khachHangInfo = new PhieuBanHangResponse.KhachHangInfo();
            khachHangInfo.setMaKhachHang(khachHang.getMaKhachHang());
            khachHangInfo.setTenKhachHang(khachHang.getTenKhachHang());
            khachHangInfo.setSoDienThoai(khachHang.getSoDienThoaiKhachHang());
            khachHangInfo.setDiaChi(khachHang.getDiaChiKhachHang());
            response.setKhachHang(khachHangInfo);
        }

        Map<String, SanPham> sanPhamMap = sanPhamRepository.findAllById(
            details.stream().map(ChiTietPhieuBan::getMaSanPham).collect(Collectors.toSet())
        )
            .stream()
            .collect(Collectors.toMap(SanPham::getMaSanPham, sanPham -> sanPham));

        Set<String> maDonViTinhSet = sanPhamMap.values().stream().map(SanPham::getMaDonViTinh).collect(Collectors.toSet());
        Map<String, DonViTinh> donViTinhMap = donViTinhRepository.findAllById(maDonViTinhSet)
            .stream()
            .collect(Collectors.toMap(DonViTinh::getMaDonViTinh, donViTinh -> donViTinh));

        Set<String> maLoaiSanPhamSet = sanPhamMap.values().stream().map(SanPham::getMaLoaiSanPham).collect(Collectors.toSet());
        Map<String, LoaiSanPham> loaiSanPhamMap = loaiSanPhamRepository.findAllById(maLoaiSanPhamSet)
            .stream()
            .collect(Collectors.toMap(LoaiSanPham::getMaLoaiSanPham, loaiSanPham -> loaiSanPham));

        List<PhieuBanHangResponse.ItemResponse> items = details
            .stream()
            .map(detail -> toItemResponse(detail, sanPhamMap, donViTinhMap, loaiSanPhamMap))
            .toList();
        response.setItems(items);

        return response;
    }

    private PhieuBanHangResponse.ItemResponse toItemResponse(
        ChiTietPhieuBan detail,
        Map<String, SanPham> sanPhamMap,
        Map<String, DonViTinh> donViTinhMap,
        Map<String, LoaiSanPham> loaiSanPhamMap
    ) {
        PhieuBanHangResponse.ItemResponse item = new PhieuBanHangResponse.ItemResponse();
        item.setMaSanPham(detail.getMaSanPham());
        item.setSoLuong(detail.getSoLuong());
        item.setDonGia(detail.getDonGia());
        item.setThanhTien(detail.getThanhTien());

        SanPham sanPham = sanPhamMap.get(detail.getMaSanPham());
        if (sanPham != null) {
            item.setTenSanPham(sanPham.getTenSanPham());
            item.setMaLoaiSanPham(sanPham.getMaLoaiSanPham());
            item.setMaDonViTinh(sanPham.getMaDonViTinh());

            DonViTinh donViTinh = donViTinhMap.get(sanPham.getMaDonViTinh());
            if (donViTinh != null) {
                item.setTenDonViTinh(donViTinh.getTenDonViTinh());
            }

            LoaiSanPham loaiSanPham = loaiSanPhamMap.get(sanPham.getMaLoaiSanPham());
            if (loaiSanPham != null) {
                item.setTenLoaiSanPham(loaiSanPham.getTenLoaiSanPham());
            }
        }

        return item;
    }
}
