package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.PhieuDichVuRequest;
import com.se104.goldstore.dto.response.PhieuDichVuResponse;
import com.se104.goldstore.entity.ChiTietPhieuDichVu;
import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.entity.LoaiDichVu;
import com.se104.goldstore.entity.PhieuDichVu;
import com.se104.goldstore.entity.ThamSo;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.LoaiDichVuRepository;
import com.se104.goldstore.repository.PhieuDichVuRepository;
import com.se104.goldstore.repository.ThamSoRepository;
import com.se104.goldstore.service.PhieuDichVuService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
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
public class PhieuDichVuServiceImpl implements PhieuDichVuService {

    private static final String PREFIX = "DV";
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final String PREPAYMENT_RATE_KEY = "SERVICE_PREPAYMENT_RATE";
    private static final BigDecimal DEFAULT_PREPAYMENT_RATE = BigDecimal.valueOf(50);
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final String TINH_TRANG_DA_GIAO = "Da giao";
    private static final String TINH_TRANG_CHUA_GIAO = "Chua giao";
    private static final String TINH_TRANG_HOAN_THANH = "Hoan thanh";
    private static final String TINH_TRANG_CHUA_HOAN_THANH = "Chua hoan thanh";
    private static final String TINH_TRANG_DANG_GIAO = "Dang giao";

    private final PhieuDichVuRepository phieuDichVuRepository;
    private final ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;
    private final KhachHangRepository khachHangRepository;
    private final LoaiDichVuRepository loaiDichVuRepository;
    private final ThamSoRepository thamSoRepository;

    public PhieuDichVuServiceImpl(
        PhieuDichVuRepository phieuDichVuRepository,
        ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository,
        KhachHangRepository khachHangRepository,
        LoaiDichVuRepository loaiDichVuRepository,
        ThamSoRepository thamSoRepository
    ) {
        this.phieuDichVuRepository = phieuDichVuRepository;
        this.chiTietPhieuDichVuRepository = chiTietPhieuDichVuRepository;
        this.khachHangRepository = khachHangRepository;
        this.loaiDichVuRepository = loaiDichVuRepository;
        this.thamSoRepository = thamSoRepository;
    }

    @Override
    public List<PhieuDichVuResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<PhieuDichVu> entities = phieuDichVuRepository.findAllByKeyword(normalized);

        // Optimization: Do not load items/details for list view to avoid N+1 and heavy mapping
        return entities.stream().map(entity -> buildResponse(entity, List.of())).toList();
    }

    @Override
    public Page<PhieuDichVuResponse> getAllPaginated(String keyword, int page, int size) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        PageRequest pageRequest = PageRequest.of(
            Math.max(page, 0),
            Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
            Sort.by(Sort.Direction.DESC, "ngayLapPhieuDichVu").and(Sort.by(Sort.Direction.DESC, "soPhieuDichVu"))
        );

        return phieuDichVuRepository.findByKeyword(normalized, pageRequest)
            .map(entity -> buildResponse(entity, List.of()));
    }

    @Override
    public PhieuDichVuResponse getById(String soPhieuDichVu) {
        PhieuDichVu phieuDichVu = findByIdOrThrow(soPhieuDichVu);
        return buildResponse(phieuDichVu, loadDetails(soPhieuDichVu));
    }

    @Override
    @Transactional
    public PhieuDichVuResponse create(PhieuDichVuRequest request) {
        KhachHang khachHang = validateKhachHang(request.getMaKhachHang().trim());
        String soPhieuDichVu = normalizeVoucherCode(request.getSoPhieuDichVu());
        if (phieuDichVuRepository.existsById(soPhieuDichVu)) {
            throw new BusinessException("Số phiếu dịch vụ đã tồn tại");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("Danh sách dịch vụ không được để trống");
        }

        BigDecimal prepaymentRate = getServicePrepaymentRate();
        Set<String> seenServiceTypes = new HashSet<>();
        List<ChiTietPhieuDichVu> details = new ArrayList<>();
        BigDecimal tongTien = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal tongTienTraTruoc = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal tongTienConLai = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (PhieuDichVuRequest.ItemRequest item : request.getItems()) {
            String maLoaiDichVu = item.getMaLoaiDichVu().trim();
            if (!seenServiceTypes.add(maLoaiDichVu)) {
                throw new BusinessException("Loại dịch vụ bị trùng trong cùng một phiếu: " + maLoaiDichVu);
            }

            LoaiDichVu loaiDichVu = loaiDichVuRepository.findById(maLoaiDichVu)
                .orElseThrow(() -> new BusinessException("Mã loại dịch vụ không tồn tại: " + maLoaiDichVu));
            BigDecimal donGiaDichVu = normalizeMoney(loaiDichVu.getDonGiaDichVu(), "Đơn giá dịch vụ phải >= 0");
            BigDecimal donGiaDuocTinh = resolveDonGiaDuocTinh(item, donGiaDichVu);
            Integer soLuongDichVu = item.getSoLuongDichVu();
            BigDecimal thanhTien = donGiaDuocTinh
                .multiply(BigDecimal.valueOf(soLuongDichVu.longValue()))
                .setScale(2, RoundingMode.HALF_UP);
            BigDecimal tienTraTruoc = normalizeMoney(item.getTienTraTruoc(), "Tiền trả trước phải >= 0");
            BigDecimal minPrepayment = calculateMinPrepayment(thanhTien, prepaymentRate);
            if (tienTraTruoc.compareTo(minPrepayment) < 0) {
                throw new BusinessException(
                    "Tiền trả trước của loại dịch vụ " + maLoaiDichVu + " phải >= " + minPrepayment.toPlainString()
                );
            }
            if (tienTraTruoc.compareTo(thanhTien) > 0) {
                throw new BusinessException("Tiền trả trước không được lớn hơn thành tiền của loại dịch vụ: " + maLoaiDichVu);
            }
            if (item.getNgayGiao() == null) {
                throw new BusinessException("Ngày hẹn giao không được để trống cho loại dịch vụ: " + maLoaiDichVu);
            }
            BigDecimal tienConLai = thanhTien.subtract(tienTraTruoc).setScale(2, RoundingMode.HALF_UP);

            ChiTietPhieuDichVu detail = new ChiTietPhieuDichVu();
            detail.setSoPhieuDichVu(soPhieuDichVu);
            detail.setMaLoaiDichVu(maLoaiDichVu);
            detail.setSoLuongDichVu(soLuongDichVu);
            detail.setDonGiaDuocTinh(donGiaDuocTinh);
            detail.setThanhTien(thanhTien);
            detail.setTienTraTruoc(tienTraTruoc);
            detail.setTienConLai(tienConLai);
            detail.setNgayGiao(item.getNgayGiao());
            detail.setTinhTrang(TINH_TRANG_CHUA_GIAO);
            details.add(detail);

            tongTien = tongTien.add(thanhTien).setScale(2, RoundingMode.HALF_UP);
            tongTienTraTruoc = tongTienTraTruoc.add(tienTraTruoc).setScale(2, RoundingMode.HALF_UP);
            tongTienConLai = tongTienConLai.add(tienConLai).setScale(2, RoundingMode.HALF_UP);
        }

        PhieuDichVu voucher = new PhieuDichVu();
        voucher.setSoPhieuDichVu(soPhieuDichVu);
        voucher.setNgayLapPhieuDichVu(request.getNgayLapPhieuDichVu());
        voucher.setMaKhachHang(khachHang.getMaKhachHang());
        voucher.setTongTien(tongTien);
        voucher.setTongTienTraTruoc(tongTienTraTruoc);
        voucher.setTongTienConLai(tongTienConLai);
        voucher.setTinhTrangDichVu(TINH_TRANG_CHUA_HOAN_THANH);

        PhieuDichVu savedVoucher = phieuDichVuRepository.save(voucher);
        List<ChiTietPhieuDichVu> savedDetails = chiTietPhieuDichVuRepository.saveAll(details);
        return buildResponse(savedVoucher, savedDetails, khachHang);
    }

    @Override
    @Transactional
    public PhieuDichVuResponse deliverItem(String soPhieuDichVu, String maLoaiDichVu, LocalDate ngayGiao) {
        PhieuDichVu voucher = findByIdOrThrow(soPhieuDichVu);
        List<ChiTietPhieuDichVu> details = loadDetails(soPhieuDichVu);

        String targetMa = maLoaiDichVu == null ? "" : maLoaiDichVu.trim();
        ChiTietPhieuDichVu detail = details.stream()
            .filter(d -> d.getMaLoaiDichVu().equalsIgnoreCase(targetMa))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết phiếu dịch vụ: " + soPhieuDichVu + " - " + targetMa));

        if (!TINH_TRANG_DA_GIAO.equalsIgnoreCase(detail.getTinhTrang())) {
            detail.setTinhTrang(TINH_TRANG_DA_GIAO);
            detail.setNgayGiao(ngayGiao != null ? ngayGiao : LocalDate.now());
            detail.setTienTraTruoc(normalizeMoney(detail.getThanhTien(), "Thành tiền phải >= 0"));
            detail.setTienConLai(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            chiTietPhieuDichVuRepository.save(detail);
        }

        recalculateVoucher(voucher, details);
        PhieuDichVu savedVoucher = phieuDichVuRepository.save(voucher);
        return buildResponse(savedVoucher, details);
    }

    @Override
    @Transactional
    public PhieuDichVuResponse deliverAll(String soPhieuDichVu, LocalDate ngayGiao) {
        PhieuDichVu voucher = findByIdOrThrow(soPhieuDichVu);
        List<ChiTietPhieuDichVu> details = loadDetails(soPhieuDichVu);
        if (details.isEmpty()) {
            throw new BusinessException("Phiếu dịch vụ không có chi tiết để giao");
        }

        LocalDate deliveryDate = ngayGiao != null ? ngayGiao : LocalDate.now();
        for (ChiTietPhieuDichVu detail : details) {
            if (!TINH_TRANG_DA_GIAO.equalsIgnoreCase(detail.getTinhTrang())) {
                detail.setTinhTrang(TINH_TRANG_DA_GIAO);
                detail.setNgayGiao(deliveryDate);
                detail.setTienTraTruoc(normalizeMoney(detail.getThanhTien(), "Thành tiền phải >= 0"));
                detail.setTienConLai(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
                chiTietPhieuDichVuRepository.save(detail);
            }
        }

        recalculateVoucher(voucher, details);
        PhieuDichVu savedVoucher = phieuDichVuRepository.save(voucher);
        return buildResponse(savedVoucher, details);
    }

    private PhieuDichVu findByIdOrThrow(String soPhieuDichVu) {
        return phieuDichVuRepository.findById(soPhieuDichVu)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu dịch vụ: " + soPhieuDichVu));
    }

    private KhachHang validateKhachHang(String maKhachHang) {
        return khachHangRepository.findById(maKhachHang)
            .orElseThrow(() -> new BusinessException("Mã khách hàng không tồn tại"));
    }

    private String normalizeVoucherCode(String requestedCode) {
        if (requestedCode == null || requestedCode.isBlank()) {
            String currentMaxCode = phieuDichVuRepository
                .findTopBySoPhieuDichVuStartingWithOrderBySoPhieuDichVuDesc(PREFIX)
                .map(PhieuDichVu::getSoPhieuDichVu)
                .orElse(null);
            return CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }
        return requestedCode.trim();
    }

    private BigDecimal getServicePrepaymentRate() {
        BigDecimal rate = thamSoRepository.findByTenThamSoIgnoreCase(PREPAYMENT_RATE_KEY)
            .map(ThamSo::getGiaTri)
            .orElse(DEFAULT_PREPAYMENT_RATE);
        if (rate == null) {
            rate = DEFAULT_PREPAYMENT_RATE;
        }
        if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(ONE_HUNDRED) > 0) {
            throw new BusinessException("Giá trị tham số SERVICE_PREPAYMENT_RATE phải nằm trong khoảng [0, 100]");
        }
        return rate;
    }

    private BigDecimal normalizeMoney(BigDecimal value, String errorMessage) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(errorMessage);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveDonGiaDuocTinh(PhieuDichVuRequest.ItemRequest item, BigDecimal donGiaDichVu) {
        if (item.getChiPhiRieng() != null) {
            BigDecimal chiPhiRieng = normalizeMoney(item.getChiPhiRieng(), "Chi phí riêng phải >= 0");
            return donGiaDichVu.add(chiPhiRieng).setScale(2, RoundingMode.HALF_UP);
        }

        if (item.getDonGiaDuocTinh() != null) {
            BigDecimal donGiaDuocTinh = normalizeMoney(item.getDonGiaDuocTinh(), "Đơn giá được tính phải >= 0");
            if (donGiaDuocTinh.compareTo(donGiaDichVu) < 0) {
                throw new BusinessException("Đơn giá được tính phải >= đơn giá dịch vụ");
            }
            return donGiaDuocTinh;
        }

        return donGiaDichVu;
    }

    private BigDecimal calculateMinPrepayment(BigDecimal thanhTien, BigDecimal prepaymentRate) {
        return thanhTien
            .multiply(prepaymentRate)
            .divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP)
            .setScale(2, RoundingMode.HALF_UP);
    }

    private List<ChiTietPhieuDichVu> loadDetails(String soPhieuDichVu) {
        return chiTietPhieuDichVuRepository.findBySoPhieuDichVu(soPhieuDichVu)
            .stream()
            .sorted(Comparator.comparing(ChiTietPhieuDichVu::getMaLoaiDichVu))
            .toList();
    }

    private void recalculateVoucher(PhieuDichVu voucher, List<ChiTietPhieuDichVu> details) {
        BigDecimal tongTien = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal tongTienTraTruoc = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal tongTienConLai = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        int totalItems = details.size();
        int deliveredItems = 0;

        for (ChiTietPhieuDichVu detail : details) {
            BigDecimal thanhTien = normalizeMoney(detail.getThanhTien(), "Thành tiền phải >= 0");
            BigDecimal tienTraTruoc = normalizeMoney(detail.getTienTraTruoc(), "Tiền trả trước phải >= 0");
            BigDecimal tienConLai = normalizeMoney(detail.getTienConLai(), "Tiền còn lại phải >= 0");

            if (tienTraTruoc.compareTo(thanhTien) > 0) {
                throw new BusinessException("Tiền trả trước không được lớn hơn thành tiền");
            }
            if (thanhTien.subtract(tienTraTruoc).setScale(2, RoundingMode.HALF_UP).compareTo(tienConLai) != 0) {
                throw new BusinessException("Dữ liệu tiền còn lại không hợp lệ trong chi tiết phiếu dịch vụ");
            }

            tongTien = tongTien.add(thanhTien).setScale(2, RoundingMode.HALF_UP);
            tongTienTraTruoc = tongTienTraTruoc.add(tienTraTruoc).setScale(2, RoundingMode.HALF_UP);
            tongTienConLai = tongTienConLai.add(tienConLai).setScale(2, RoundingMode.HALF_UP);

            if (TINH_TRANG_DA_GIAO.equalsIgnoreCase(detail.getTinhTrang())) {
                deliveredItems++;
            }
        }

        voucher.setTongTien(tongTien);
        voucher.setTongTienTraTruoc(tongTienTraTruoc);
        voucher.setTongTienConLai(tongTienConLai);

        if (totalItems > 0 && deliveredItems == totalItems) {
            voucher.setTinhTrangDichVu(TINH_TRANG_HOAN_THANH);
        } else {
            voucher.setTinhTrangDichVu(TINH_TRANG_CHUA_HOAN_THANH);
        }
    }

    private PhieuDichVuResponse buildResponse(PhieuDichVu voucher, List<ChiTietPhieuDichVu> details) {
        return buildResponse(voucher, details, voucher.getKhachHang());
    }

    private PhieuDichVuResponse buildResponse(
        PhieuDichVu voucher,
        List<ChiTietPhieuDichVu> details,
        KhachHang khachHang
    ) {
        PhieuDichVuResponse response = new PhieuDichVuResponse();
        response.setSoPhieuDichVu(voucher.getSoPhieuDichVu());
        response.setNgayLapPhieuDichVu(voucher.getNgayLapPhieuDichVu());
        response.setMaKhachHang(voucher.getMaKhachHang());
        response.setTongTienTraTruoc(voucher.getTongTienTraTruoc());
        response.setTongTienConLai(voucher.getTongTienConLai());
        response.setTongTien(voucher.getTongTien());
        response.setTinhTrangDichVu(voucher.getTinhTrangDichVu());

        if (khachHang != null) {
            PhieuDichVuResponse.KhachHangInfo khachHangInfo = new PhieuDichVuResponse.KhachHangInfo();
            khachHangInfo.setMaKhachHang(khachHang.getMaKhachHang());
            khachHangInfo.setTenKhachHang(khachHang.getTenKhachHang());
            khachHangInfo.setSoDienThoai(khachHang.getSoDienThoaiKhachHang());
            khachHangInfo.setDiaChi(khachHang.getDiaChiKhachHang());
            response.setKhachHang(khachHangInfo);
        }

        Set<String> maLoaiDichVuSet = details.stream().map(ChiTietPhieuDichVu::getMaLoaiDichVu).collect(Collectors.toSet());
        Map<String, LoaiDichVu> loaiDichVuMap = loaiDichVuRepository.findAllById(maLoaiDichVuSet)
            .stream()
            .collect(Collectors.toMap(LoaiDichVu::getMaLoaiDichVu, loaiDichVu -> loaiDichVu));

        List<PhieuDichVuResponse.ItemResponse> itemResponses = details
            .stream()
            .map(detail -> toItemResponse(detail, loaiDichVuMap))
            .toList();
        response.setItems(itemResponses);

        return response;
    }

    private PhieuDichVuResponse.ItemResponse toItemResponse(
        ChiTietPhieuDichVu detail,
        Map<String, LoaiDichVu> loaiDichVuMap
    ) {
        PhieuDichVuResponse.ItemResponse item = new PhieuDichVuResponse.ItemResponse();
        item.setMaLoaiDichVu(detail.getMaLoaiDichVu());
        item.setSoLuongDichVu(detail.getSoLuongDichVu());
        item.setDonGiaDuocTinh(detail.getDonGiaDuocTinh());
        item.setThanhTien(detail.getThanhTien());
        item.setTienTraTruoc(detail.getTienTraTruoc());
        item.setTienConLai(detail.getTienConLai());
        item.setNgayGiao(detail.getNgayGiao());
        item.setTinhTrang(detail.getTinhTrang());

        LoaiDichVu loaiDichVu = loaiDichVuMap.get(detail.getMaLoaiDichVu());
        if (loaiDichVu != null) {
            item.setTenLoaiDichVu(loaiDichVu.getTenLoaiDichVu());
            item.setDonGiaDichVu(normalizeMoney(loaiDichVu.getDonGiaDichVu(), "Đơn giá dịch vụ phải >= 0"));
        }

        return item;
    }
}
