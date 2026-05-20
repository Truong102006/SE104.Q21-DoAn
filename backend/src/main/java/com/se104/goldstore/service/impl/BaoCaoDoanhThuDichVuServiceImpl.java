package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.BaoCaoDoanhThuDichVuRequest;
import com.se104.goldstore.dto.response.BaoCaoDoanhThuDichVuResponse;
import com.se104.goldstore.entity.BaoCaoDoanhThuDichVu;
import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuDichVu;
import com.se104.goldstore.entity.LoaiDichVu;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.BaoCaoDoanhThuDichVuRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoDoanhThuDichVuRepository;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
import com.se104.goldstore.repository.LoaiDichVuRepository;
import com.se104.goldstore.service.BaoCaoDoanhThuDichVuService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
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
public class BaoCaoDoanhThuDichVuServiceImpl implements BaoCaoDoanhThuDichVuService {

    private static final String PREFIX = "BCDV";
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final BaoCaoDoanhThuDichVuRepository baoCaoDoanhThuDichVuRepository;
    private final ChiTietBaoCaoDoanhThuDichVuRepository chiTietBaoCaoDoanhThuDichVuRepository;
    private final ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;
    private final LoaiDichVuRepository loaiDichVuRepository;

    public BaoCaoDoanhThuDichVuServiceImpl(
        BaoCaoDoanhThuDichVuRepository baoCaoDoanhThuDichVuRepository,
        ChiTietBaoCaoDoanhThuDichVuRepository chiTietBaoCaoDoanhThuDichVuRepository,
        ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository,
        LoaiDichVuRepository loaiDichVuRepository
    ) {
        this.baoCaoDoanhThuDichVuRepository = baoCaoDoanhThuDichVuRepository;
        this.chiTietBaoCaoDoanhThuDichVuRepository = chiTietBaoCaoDoanhThuDichVuRepository;
        this.chiTietPhieuDichVuRepository = chiTietPhieuDichVuRepository;
        this.loaiDichVuRepository = loaiDichVuRepository;
    }

    @Override
    public List<BaoCaoDoanhThuDichVuResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<BaoCaoDoanhThuDichVu> entities = normalized.isEmpty()
            ? baoCaoDoanhThuDichVuRepository.findAll()
            : baoCaoDoanhThuDichVuRepository.findByMaBaoCaoDoanhThuDvContainingIgnoreCase(normalized);

        return entities.stream()
            .sorted(
                Comparator
                    .comparing(BaoCaoDoanhThuDichVu::getNam, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(BaoCaoDoanhThuDichVu::getThang, Comparator.nullsLast(Comparator.reverseOrder()))
            )
            .map(this::toHeaderResponse)
            .toList();
    }

    @Override
    public BaoCaoDoanhThuDichVuResponse getByMonthYear(Integer thang, Integer nam) {
        validateThangNam(thang, nam);
        BaoCaoDoanhThuDichVu report = baoCaoDoanhThuDichVuRepository.findByThangAndNam(thang, nam)
            .orElseThrow(
                () -> new ResourceNotFoundException(
                    "Khong tim thay bao cao doanh thu dich vu thang " + thang + "/" + nam
                )
            );
        return toFullResponse(report);
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuDichVuResponse generate(Integer thang, Integer nam) {
        validateThangNam(thang, nam);
        Optional<BaoCaoDoanhThuDichVu> existingReport = baoCaoDoanhThuDichVuRepository.findByThangAndNam(thang, nam);

        BaoCaoDoanhThuDichVu report;
        if (existingReport.isPresent()) {
            report = existingReport.get();
            chiTietBaoCaoDoanhThuDichVuRepository.deleteByMaBaoCaoDoanhThuDv(report.getMaBaoCaoDoanhThuDv());
        } else {
            String currentMaxCode = baoCaoDoanhThuDichVuRepository
                .findTopByMaBaoCaoDoanhThuDvStartingWithOrderByMaBaoCaoDoanhThuDvDesc(PREFIX)
                .map(BaoCaoDoanhThuDichVu::getMaBaoCaoDoanhThuDv)
                .orElse(null);
            String nextCode = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
            report = new BaoCaoDoanhThuDichVu();
            report.setMaBaoCaoDoanhThuDv(nextCode);
            report.setThang(thang);
            report.setNam(nam);
            report.setTongDoanhThuDichVu(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            report = baoCaoDoanhThuDichVuRepository.save(report);
        }

        List<Object[]> rows = chiTietPhieuDichVuRepository.sumRevenueByLoaiDichVuInMonth(thang, nam);
        BigDecimal tongDoanhThu = rows.stream()
            .map(this::extractRevenue)
            .reduce(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);

        Set<String> serviceTypeIds = rows.stream().map(this::extractServiceTypeId).collect(Collectors.toSet());
        Map<String, LoaiDichVu> serviceTypeMap = loaiDichVuRepository.findAllById(serviceTypeIds)
            .stream()
            .collect(Collectors.toMap(LoaiDichVu::getMaLoaiDichVu, type -> type));

        List<Object[]> sortedRows = new ArrayList<>(rows);
        sortedRows.sort(
            Comparator
                .comparing(this::extractRevenue, Comparator.reverseOrder())
                .thenComparing(this::extractServiceTypeId)
        );

        List<ChiTietBaoCaoDoanhThuDichVu> details = new ArrayList<>();
        for (Object[] row : sortedRows) {
            String maLoaiDichVu = extractServiceTypeId(row);
            BigDecimal doanhThu = extractRevenue(row);
            BigDecimal tiLe = calculateRatio(doanhThu, tongDoanhThu);

            ChiTietBaoCaoDoanhThuDichVu detail = new ChiTietBaoCaoDoanhThuDichVu();
            detail.setMaBaoCaoDoanhThuDv(report.getMaBaoCaoDoanhThuDv());
            detail.setMaLoaiDichVu(maLoaiDichVu);
            detail.setDoanhThuDichVu(doanhThu);
            detail.setTiLeDichVu(tiLe);
            detail.setLoaiDichVu(serviceTypeMap.get(maLoaiDichVu));
            details.add(detail);
        }

        chiTietBaoCaoDoanhThuDichVuRepository.saveAll(details);
        report.setTongDoanhThuDichVu(tongDoanhThu);
        BaoCaoDoanhThuDichVu savedReport = baoCaoDoanhThuDichVuRepository.save(report);
        return toFullResponse(savedReport);
    }

    @Override
    public BaoCaoDoanhThuDichVuResponse getById(String maBaoCaoDoanhThuDv) {
        return toFullResponse(findByIdOrThrow(maBaoCaoDoanhThuDv));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuDichVuResponse create(BaoCaoDoanhThuDichVuRequest request) {
        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuDichVuRepository.existsByThangAndNam(request.getThang(), request.getNam())) {
            throw new BusinessException("Bao cao doanh thu dich vu thang nam da ton tai");
        }

        String maBaoCaoDoanhThuDv = request.getMaBaoCaoDoanhThuDv();
        if (maBaoCaoDoanhThuDv == null || maBaoCaoDoanhThuDv.isBlank()) {
            String currentMaxCode = baoCaoDoanhThuDichVuRepository
                .findTopByMaBaoCaoDoanhThuDvStartingWithOrderByMaBaoCaoDoanhThuDvDesc(PREFIX)
                .map(BaoCaoDoanhThuDichVu::getMaBaoCaoDoanhThuDv)
                .orElse(null);
            maBaoCaoDoanhThuDv = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (baoCaoDoanhThuDichVuRepository.existsById(maBaoCaoDoanhThuDv)) {
            throw new BusinessException("Ma bao cao doanh thu dich vu da ton tai");
        }

        BaoCaoDoanhThuDichVu entity = new BaoCaoDoanhThuDichVu();
        entity.setMaBaoCaoDoanhThuDv(maBaoCaoDoanhThuDv);
        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuDichVu(normalizeMoney(request.getTongDoanhThuDichVu()));

        return toHeaderResponse(baoCaoDoanhThuDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public BaoCaoDoanhThuDichVuResponse update(String maBaoCaoDoanhThuDv, BaoCaoDoanhThuDichVuRequest request) {
        BaoCaoDoanhThuDichVu entity = findByIdOrThrow(maBaoCaoDoanhThuDv);

        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoDoanhThuDichVuRepository.existsByThangAndNamAndMaBaoCaoDoanhThuDvNot(request.getThang(), request.getNam(), maBaoCaoDoanhThuDv)) {
            throw new BusinessException("Bao cao doanh thu dich vu thang nam da ton tai");
        }

        entity.setThang(request.getThang());
        entity.setNam(request.getNam());
        entity.setTongDoanhThuDichVu(normalizeMoney(request.getTongDoanhThuDichVu()));

        return toHeaderResponse(baoCaoDoanhThuDichVuRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maBaoCaoDoanhThuDv) {
        BaoCaoDoanhThuDichVu entity = findByIdOrThrow(maBaoCaoDoanhThuDv);
        try {
            baoCaoDoanhThuDichVuRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Khong the xoa bao cao doanh thu dich vu da co du lieu lien quan");
        }
    }

    private BaoCaoDoanhThuDichVu findByIdOrThrow(String maBaoCaoDoanhThuDv) {
        return baoCaoDoanhThuDichVuRepository.findById(maBaoCaoDoanhThuDv)
            .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bao cao doanh thu dich vu: " + maBaoCaoDoanhThuDv));
    }

    private void validateThangNam(Integer thang, Integer nam) {
        if (thang == null || thang < 1 || thang > 12) {
            throw new BusinessException("Thang phai trong khoang 1 den 12");
        }
        if (nam == null || nam <= 0) {
            throw new BusinessException("Nam phai lon hon 0");
        }
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Tong doanh thu dich vu phai >= 0");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String extractServiceTypeId(Object[] row) {
        return row[0] == null ? "" : row[0].toString();
    }

    private BigDecimal extractRevenue(Object[] row) {
        if (row.length < 2 || row[1] == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (row[1] instanceof BigDecimal bigDecimal) {
            return bigDecimal.setScale(2, RoundingMode.HALF_UP);
        }
        if (row[1] instanceof Number number) {
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

    private BaoCaoDoanhThuDichVuResponse toHeaderResponse(BaoCaoDoanhThuDichVu entity) {
        BaoCaoDoanhThuDichVuResponse response = new BaoCaoDoanhThuDichVuResponse();
        response.setMaBaoCaoDoanhThuDv(entity.getMaBaoCaoDoanhThuDv());
        response.setThang(entity.getThang());
        response.setNam(entity.getNam());
        response.setTongDoanhThuDichVu(entity.getTongDoanhThuDichVu());
        return response;
    }

    private BaoCaoDoanhThuDichVuResponse toFullResponse(BaoCaoDoanhThuDichVu entity) {
        BaoCaoDoanhThuDichVuResponse response = toHeaderResponse(entity);
        List<ChiTietBaoCaoDoanhThuDichVu> details = chiTietBaoCaoDoanhThuDichVuRepository.findByMaBaoCaoDoanhThuDv(
            entity.getMaBaoCaoDoanhThuDv()
        );

        Map<String, LoaiDichVu> serviceTypeMap = loaiDichVuRepository.findAllById(
            details.stream().map(ChiTietBaoCaoDoanhThuDichVu::getMaLoaiDichVu).collect(Collectors.toSet())
        )
            .stream()
            .collect(Collectors.toMap(LoaiDichVu::getMaLoaiDichVu, type -> type));

        List<ChiTietBaoCaoDoanhThuDichVu> sortedDetails = details.stream()
            .sorted(
                Comparator
                    .comparing(ChiTietBaoCaoDoanhThuDichVu::getDoanhThuDichVu, Comparator.reverseOrder())
                    .thenComparing(ChiTietBaoCaoDoanhThuDichVu::getMaLoaiDichVu)
            )
            .toList();
        List<BaoCaoDoanhThuDichVuResponse.ChiTietDoanhThuDichVuResponse> itemResponses = new ArrayList<>();

        for (int index = 0; index < sortedDetails.size(); index++) {
            ChiTietBaoCaoDoanhThuDichVu detail = sortedDetails.get(index);
            BaoCaoDoanhThuDichVuResponse.ChiTietDoanhThuDichVuResponse item =
                new BaoCaoDoanhThuDichVuResponse.ChiTietDoanhThuDichVuResponse();
            item.setStt(index + 1);
            item.setMaLoaiDichVu(detail.getMaLoaiDichVu());
            item.setDoanhThu(detail.getDoanhThuDichVu());
            item.setTiLe(detail.getTiLeDichVu());

            LoaiDichVu serviceType = serviceTypeMap.get(detail.getMaLoaiDichVu());
            if (serviceType != null) {
                item.setTenLoaiDichVu(serviceType.getTenLoaiDichVu());
            }
            itemResponses.add(item);
        }
        response.setChiTiet(itemResponses);
        return response;
    }
}
