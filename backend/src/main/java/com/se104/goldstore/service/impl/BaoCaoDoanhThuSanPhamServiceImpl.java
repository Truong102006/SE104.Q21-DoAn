package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.BaoCaoDoanhThuSanPhamRequest;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuSanPhamResponse;
import com.se104.goldstore.entity.BaoCaoDoanhThuSanPham;
import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuSanPham;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.BaoCaoDoanhThuSanPhamRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoDoanhThuSanPhamRepository;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.BaoCaoDoanhThuSanPhamService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BaoCaoDoanhThuSanPhamServiceImpl implements BaoCaoDoanhThuSanPhamService {

    private static final String PREFIX = "BCSP";
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final BaoCaoDoanhThuSanPhamRepository baoCaoDoanhThuSanPhamRepository;
    private final ChiTietBaoCaoDoanhThuSanPhamRepository chiTietBaoCaoDoanhThuSanPhamRepository;
    private final ChiTietPhieuBanRepository chiTietPhieuBanRepository;
    private final SanPhamRepository sanPhamRepository;

    public BaoCaoDoanhThuSanPhamServiceImpl(
        BaoCaoDoanhThuSanPhamRepository baoCaoDoanhThuSanPhamRepository,
        ChiTietBaoCaoDoanhThuSanPhamRepository chiTietBaoCaoDoanhThuSanPhamRepository,
        ChiTietPhieuBanRepository chiTietPhieuBanRepository,
        SanPhamRepository sanPhamRepository
    ) {
        this.baoCaoDoanhThuSanPhamRepository = baoCaoDoanhThuSanPhamRepository;
        this.chiTietBaoCaoDoanhThuSanPhamRepository = chiTietBaoCaoDoanhThuSanPhamRepository;
        this.chiTietPhieuBanRepository = chiTietPhieuBanRepository;
        this.sanPhamRepository = sanPhamRepository;
    }

    @Override
    public List<BaoCaoDoanhThuSanPhamResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<BaoCaoDoanhThuSanPham> entities = normalized.isEmpty()
            ? baoCaoDoanhThuSanPhamRepository.findAll()
            : baoCaoDoanhThuSanPhamRepository.findByMaBaoCaoDoanhThuSpContainingIgnoreCase(normalized);

        return entities.stream()
            .sorted(
                Comparator
                    .comparing(BaoCaoDoanhThuSanPham::getNam, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(BaoCaoDoanhThuSanPham::getThang, Comparator.nullsLast(Comparator.reverseOrder()))
            )
            .map(this::toHeaderResponse)
            .toList();
    }

    @Override
    public BaoCaoDoanhThuSanPhamResponse getByMonthYear(Integer thang, Integer nam) {
        validateThangNam(thang, nam);
        BaoCaoDoanhThuSanPham report = baoCaoDoanhThuSanPhamRepository.findByThangAndNam(thang, nam)
            .orElseThrow(
                () -> new ResourceNotFoundException(
                    "Không tìm thấy báo cáo doanh thu sản phẩm tháng " + thang + "/" + nam
                )
            );
        return toFullResponse(report);
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuSanPhamResponse generate(Integer thang, Integer nam) {
        validateThangNam(thang, nam);
        Optional<BaoCaoDoanhThuSanPham> existingReport = baoCaoDoanhThuSanPhamRepository.findByThangAndNam(thang, nam);

        BaoCaoDoanhThuSanPham report;
        List<ChiTietBaoCaoDoanhThuSanPham> existingDetails = new ArrayList<>();
        if (existingReport.isPresent()) {
            report = existingReport.get();
            existingDetails = chiTietBaoCaoDoanhThuSanPhamRepository.findByMaBaoCaoDoanhThuSp(report.getMaBaoCaoDoanhThuSp());
        } else {
            String currentMaxCode = baoCaoDoanhThuSanPhamRepository
                .findTopByMaBaoCaoDoanhThuSpStartingWithOrderByMaBaoCaoDoanhThuSpDesc(PREFIX)
                .map(BaoCaoDoanhThuSanPham::getMaBaoCaoDoanhThuSp)
                .orElse(null);
            String nextCode = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
            report = new BaoCaoDoanhThuSanPham();
            report.setMaBaoCaoDoanhThuSp(nextCode);
            report.setThang(thang);
            report.setNam(nam);
            report.setTongDoanhThuSanPham(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            report = baoCaoDoanhThuSanPhamRepository.save(report);
        }

        Map<String, ChiTietBaoCaoDoanhThuSanPham> existingMap = new HashMap<>();
        for (ChiTietBaoCaoDoanhThuSanPham d : existingDetails) {
            existingMap.put(d.getMaSanPham(), d);
        }

        List<Object[]> rows = chiTietPhieuBanRepository.sumRevenueBySanPhamInMonth(thang, nam);
        BigDecimal tongDoanhThu = rows.stream()
            .map(this::extractRevenue)
            .reduce(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);

        Set<String> productIds = rows.stream().map(this::extractProductId).collect(Collectors.toSet());
        Map<String, SanPham> productMap = sanPhamRepository.findAllById(productIds)
            .stream()
            .collect(Collectors.toMap(SanPham::getMaSanPham, product -> product));

        List<Object[]> sortedRows = new ArrayList<>(rows);
        sortedRows.sort(
            Comparator
                .comparing(this::extractRevenue, Comparator.reverseOrder())
                .thenComparing(this::extractProductId)
        );

        List<ChiTietBaoCaoDoanhThuSanPham> details = new ArrayList<>();
        for (Object[] row : sortedRows) {
            String maSanPham = extractProductId(row);
            BigDecimal doanhThu = extractRevenue(row);
            BigDecimal tiLe = calculateRatio(doanhThu, tongDoanhThu);

            ChiTietBaoCaoDoanhThuSanPham detail = existingMap.remove(maSanPham);
            if (detail == null) {
                detail = new ChiTietBaoCaoDoanhThuSanPham();
                detail.setMaBaoCaoDoanhThuSp(report.getMaBaoCaoDoanhThuSp());
                detail.setMaSanPham(maSanPham);
            }
            detail.setDoanhThuSanPham(doanhThu);
            detail.setTiLeSanPham(tiLe);
            detail.setSanPham(productMap.get(maSanPham));
            details.add(detail);
        }

        if (!existingMap.isEmpty()) {
            chiTietBaoCaoDoanhThuSanPhamRepository.deleteAll(existingMap.values());
        }

        chiTietBaoCaoDoanhThuSanPhamRepository.saveAll(details);
        report.setTongDoanhThuSanPham(tongDoanhThu);
        BaoCaoDoanhThuSanPham savedReport = baoCaoDoanhThuSanPhamRepository.save(report);
        return toFullResponse(savedReport);
    }

    @Override
    public BaoCaoDoanhThuSanPhamResponse getById(String maBaoCaoDoanhThuSp) {
        return toFullResponse(findByIdOrThrow(maBaoCaoDoanhThuSp));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuSanPhamResponse create(BaoCaoDoanhThuSanPhamRequest request) {
        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuSanPhamRepository.existsByThangAndNam(request.getThang(), request.getNam())) {
            throw new BusinessException("Báo cáo doanh thu sản phẩm tháng năm đã tồn tại");
        }

        String maBaoCaoDoanhThuSp = request.getMaBaoCaoDoanhThuSp();
        if (maBaoCaoDoanhThuSp == null || maBaoCaoDoanhThuSp.isBlank()) {
            String currentMaxCode = baoCaoDoanhThuSanPhamRepository
                .findTopByMaBaoCaoDoanhThuSpStartingWithOrderByMaBaoCaoDoanhThuSpDesc(PREFIX)
                .map(BaoCaoDoanhThuSanPham::getMaBaoCaoDoanhThuSp)
                .orElse(null);
            maBaoCaoDoanhThuSp = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (baoCaoDoanhThuSanPhamRepository.existsById(maBaoCaoDoanhThuSp)) {
            throw new BusinessException("Mã báo cáo doanh thu sản phẩm đã tồn tại");
        }

        BaoCaoDoanhThuSanPham entity = new BaoCaoDoanhThuSanPham();
        entity.setMaBaoCaoDoanhThuSp(maBaoCaoDoanhThuSp);
        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuSanPham(normalizeMoney(request.getTongDoanhThuSanPham()));

        return toHeaderResponse(baoCaoDoanhThuSanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuSanPhamResponse update(String maBaoCaoDoanhThuSp, BaoCaoDoanhThuSanPhamRequest request) {
        BaoCaoDoanhThuSanPham entity = findByIdOrThrow(maBaoCaoDoanhThuSp);

        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuSanPhamRepository.existsByThangAndNamAndMaBaoCaoDoanhThuSpNot(request.getThang(), request.getNam(), maBaoCaoDoanhThuSp)) {
            throw new BusinessException("Báo cáo doanh thu sản phẩm tháng năm đã tồn tại");
        }

        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuSanPham(normalizeMoney(request.getTongDoanhThuSanPham()));

        return toHeaderResponse(baoCaoDoanhThuSanPhamRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maBaoCaoDoanhThuSp) {
        BaoCaoDoanhThuSanPham entity = findByIdOrThrow(maBaoCaoDoanhThuSp);
        try {
            baoCaoDoanhThuSanPhamRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa báo cáo doanh thu sản phẩm đã có dữ liệu liên quan");
        }
    }

    private BaoCaoDoanhThuSanPham findByIdOrThrow(String maBaoCaoDoanhThuSp) {
        return baoCaoDoanhThuSanPhamRepository.findById(maBaoCaoDoanhThuSp)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy báo cáo doanh thu sản phẩm: " + maBaoCaoDoanhThuSp));
    }

    private void validateThangNam(Integer thang, Integer nam) {
        if (thang == null || thang < 1 || thang > 12) {
            throw new BusinessException("Tháng phải trong khoảng 1 đến 12");
        }
        if (nam == null || nam <= 0) {
            throw new BusinessException("Năm phải lớn hơn 0");
        }
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Tổng doanh thu sản phẩm phải >= 0");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String extractProductId(Object[] row) {
        return row[0] == null ? "" : row[0].toString();
    }

    private int extractQuantity(Object[] row) {
        if (row.length < 2 || !(row[1] instanceof Number number)) {
            return 0;
        }
        return Math.max(number.intValue(), 0);
    }

    private BigDecimal extractRevenue(Object[] row) {
        if (row.length < 3 || row[2] == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (row[2] instanceof BigDecimal bigDecimal) {
            return bigDecimal.setScale(2, RoundingMode.HALF_UP);
        }
        if (row[2] instanceof Number number) {
            return new BigDecimal(number.toString()).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRatio(BigDecimal partial, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return partial
            .multiply(ONE_HUNDRED)
            .divide(total, 2, RoundingMode.HALF_UP);
    }

    private BaoCaoDoanhThuSanPhamResponse toHeaderResponse(BaoCaoDoanhThuSanPham entity) {
        BaoCaoDoanhThuSanPhamResponse response = new BaoCaoDoanhThuSanPhamResponse();
        response.setMaBaoCaoDoanhThuSp(entity.getMaBaoCaoDoanhThuSp());
        response.setThang(entity.getThang());
        response.setNam(entity.getNam());
        response.setTongDoanhThuSanPham(entity.getTongDoanhThuSanPham());
        return response;
    }

    private BaoCaoDoanhThuSanPhamResponse toFullResponse(BaoCaoDoanhThuSanPham entity) {
        BaoCaoDoanhThuSanPhamResponse response = toHeaderResponse(entity);
        List<ChiTietBaoCaoDoanhThuSanPham> details = chiTietBaoCaoDoanhThuSanPhamRepository.findByMaBaoCaoDoanhThuSp(
            entity.getMaBaoCaoDoanhThuSp()
        );

        Map<String, SanPham> sanPhamMap = sanPhamRepository.findAllById(
            details.stream().map(ChiTietBaoCaoDoanhThuSanPham::getMaSanPham).collect(Collectors.toSet())
        )
            .stream()
            .collect(Collectors.toMap(SanPham::getMaSanPham, product -> product));

        List<BaoCaoDoanhThuSanPhamResponse.ChiTietDoanhThuSanPhamResponse> itemResponses = new ArrayList<>();
        List<ChiTietBaoCaoDoanhThuSanPham> sortedDetails = details.stream()
            .sorted(
                Comparator
                    .comparing(ChiTietBaoCaoDoanhThuSanPham::getDoanhThuSanPham, Comparator.reverseOrder())
                    .thenComparing(ChiTietBaoCaoDoanhThuSanPham::getMaSanPham)
            )
            .toList();

        List<Object[]> monthlyRows = chiTietPhieuBanRepository.sumRevenueBySanPhamInMonth(entity.getThang(), entity.getNam());
        Map<String, Integer> quantityMap = monthlyRows.stream()
            .collect(Collectors.toMap(this::extractProductId, this::extractQuantity));

        for (int index = 0; index < sortedDetails.size(); index++) {
            ChiTietBaoCaoDoanhThuSanPham detail = sortedDetails.get(index);
            BaoCaoDoanhThuSanPhamResponse.ChiTietDoanhThuSanPhamResponse item =
                new BaoCaoDoanhThuSanPhamResponse.ChiTietDoanhThuSanPhamResponse();
            item.setStt(index + 1);
            item.setMaSanPham(detail.getMaSanPham());
            item.setDoanhThu(detail.getDoanhThuSanPham());
            item.setTiLe(detail.getTiLeSanPham());
            item.setSoLuongBan(quantityMap.getOrDefault(detail.getMaSanPham(), 0));

            SanPham product = sanPhamMap.get(detail.getMaSanPham());
            if (product != null) {
                item.setTenSanPham(product.getTenSanPham());
            }
            itemResponses.add(item);
        }

        response.setChiTiet(itemResponses);
        return response;
    }
}
