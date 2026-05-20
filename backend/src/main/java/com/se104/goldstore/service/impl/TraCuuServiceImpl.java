package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.response.TraCuuPhieuDichVuResponse;
import com.se104.goldstore.dto.response.TraCuuSanPhamResponse;
import com.se104.goldstore.entity.ChiTietPhieuDichVu;
import com.se104.goldstore.entity.PhieuDichVu;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
import com.se104.goldstore.repository.PhieuDichVuRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.TraCuuService;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TraCuuServiceImpl implements TraCuuService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final String TINH_TRANG_DA_GIAO = "Da giao";
    private static final String TINH_TRANG_HOAN_THANH = "Hoan thanh";
    private static final String TINH_TRANG_CHUA_HOAN_THANH = "Chua hoan thanh";

    private final SanPhamRepository sanPhamRepository;
    private final PhieuDichVuRepository phieuDichVuRepository;
    private final ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;

    public TraCuuServiceImpl(
        SanPhamRepository sanPhamRepository,
        PhieuDichVuRepository phieuDichVuRepository,
        ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository
    ) {
        this.sanPhamRepository = sanPhamRepository;
        this.phieuDichVuRepository = phieuDichVuRepository;
        this.chiTietPhieuDichVuRepository = chiTietPhieuDichVuRepository;
    }

    @Override
    public Page<TraCuuSanPhamResponse> searchProducts(String keyword, int page, int size) {
        String normalizedKeyword = SearchUtils.normalizeKeyword(keyword);
        PageRequest pageRequest = PageRequest.of(
            Math.max(page, 0),
            normalizePageSize(size),
            Sort.by(Sort.Direction.ASC, "maSanPham")
        );
        return sanPhamRepository.search(normalizedKeyword, null, pageRequest).map(this::toProductResponse);
    }

    @Override
    public Page<TraCuuPhieuDichVuResponse> searchServiceTickets(
        String keyword,
        String status,
        LocalDate fromDate,
        LocalDate toDate,
        int page,
        int size
    ) {
        validateDateRange(fromDate, toDate);
        String normalizedKeyword = SearchUtils.normalizeKeyword(keyword);
        String normalizedStatus = normalizeStatusFilter(status);
        PageRequest pageRequest = PageRequest.of(
            Math.max(page, 0),
            normalizePageSize(size),
            Sort.by(Sort.Direction.DESC, "ngayLapPhieuDichVu").and(Sort.by(Sort.Direction.DESC, "soPhieuDichVu"))
        );
        return phieuDichVuRepository.search(normalizedKeyword, normalizedStatus, fromDate, toDate, pageRequest)
            .map(this::toServiceTicketResponse);
    }

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new BusinessException("Khoang ngay lap khong hop le: fromDate phai <= toDate");
        }
    }

    private String normalizeStatusFilter(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String normalized = removeAccent(SearchUtils.normalizeKeyword(status));
        if ("chua hoan thanh".equals(normalized)) {
            return TINH_TRANG_CHUA_HOAN_THANH;
        }
        if ("hoan thanh".equals(normalized)) {
            return TINH_TRANG_HOAN_THANH;
        }
        throw new BusinessException("Tinh trang dich vu khong hop le. Ho tro: Hoan thanh, Chua hoan thanh");
    }

    private String removeAccent(String input) {
        return Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }

    private TraCuuSanPhamResponse toProductResponse(SanPham entity) {
        TraCuuSanPhamResponse response = new TraCuuSanPhamResponse();
        response.setMaSanPham(entity.getMaSanPham());
        response.setTenSanPham(entity.getTenSanPham());
        response.setDonGiaBan(entity.getDonGiaBan());
        response.setTonKho(entity.getTonKho());
        response.setTenLoaiSanPham(entity.getLoaiSanPham() != null ? entity.getLoaiSanPham().getTenLoaiSanPham() : null);
        response.setTenDonViTinh(entity.getDonViTinh() != null ? entity.getDonViTinh().getTenDonViTinh() : null);
        return response;
    }

    private TraCuuPhieuDichVuResponse toServiceTicketResponse(PhieuDichVu entity) {
        List<ChiTietPhieuDichVu> details = chiTietPhieuDichVuRepository.findBySoPhieuDichVu(entity.getSoPhieuDichVu());
        String computedStatus = resolveTicketStatus(details);

        TraCuuPhieuDichVuResponse response = new TraCuuPhieuDichVuResponse();
        response.setSoPhieuDichVu(entity.getSoPhieuDichVu());
        response.setNgayLapPhieuDichVu(entity.getNgayLapPhieuDichVu());
        response.setTongTien(entity.getTongTien());
        response.setTongTienTraTruoc(entity.getTongTienTraTruoc());
        response.setTongTienConLai(entity.getTongTienConLai());
        response.setTinhTrangDichVu(computedStatus);
        response.setTenKhachHang(entity.getKhachHang() != null ? entity.getKhachHang().getTenKhachHang() : null);
        return response;
    }

    private String resolveTicketStatus(List<ChiTietPhieuDichVu> details) {
        if (details.isEmpty()) {
            return TINH_TRANG_CHUA_HOAN_THANH;
        }
        boolean allDelivered = details.stream().allMatch(item -> TINH_TRANG_DA_GIAO.equalsIgnoreCase(item.getTinhTrang()));
        return allDelivered ? TINH_TRANG_HOAN_THANH : TINH_TRANG_CHUA_HOAN_THANH;
    }
}
