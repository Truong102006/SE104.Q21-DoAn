package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.common.SearchUtils;
import com.se104.goldstore.dto.request.BaoCaoTonKhoRequest;
import com.se104.goldstore.dto.response.BaoCaoTonKhoResponse;
import com.se104.goldstore.entity.BaoCaoTonKho;
import com.se104.goldstore.entity.ChiTietBaoCaoTonKho;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.ResourceNotFoundException;
import com.se104.goldstore.repository.BaoCaoTonKhoRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoTonKhoRepository;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.BaoCaoTonKhoService;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BaoCaoTonKhoServiceImpl implements BaoCaoTonKhoService {

    private static final String PREFIX = "BCTK";

    private final BaoCaoTonKhoRepository baoCaoTonKhoRepository;
    private final ChiTietBaoCaoTonKhoRepository chiTietBaoCaoTonKhoRepository;
    private final ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;
    private final ChiTietPhieuBanRepository chiTietPhieuBanRepository;
    private final SanPhamRepository sanPhamRepository;

    public BaoCaoTonKhoServiceImpl(
        BaoCaoTonKhoRepository baoCaoTonKhoRepository,
        ChiTietBaoCaoTonKhoRepository chiTietBaoCaoTonKhoRepository,
        ChiTietPhieuMuaRepository chiTietPhieuMuaRepository,
        ChiTietPhieuBanRepository chiTietPhieuBanRepository,
        SanPhamRepository sanPhamRepository
    ) {
        this.baoCaoTonKhoRepository = baoCaoTonKhoRepository;
        this.chiTietBaoCaoTonKhoRepository = chiTietBaoCaoTonKhoRepository;
        this.chiTietPhieuMuaRepository = chiTietPhieuMuaRepository;
        this.chiTietPhieuBanRepository = chiTietPhieuBanRepository;
        this.sanPhamRepository = sanPhamRepository;
    }

    @Override
    public List<BaoCaoTonKhoResponse> getAll(String keyword) {
        String normalized = SearchUtils.normalizeKeyword(keyword);
        List<BaoCaoTonKho> entities = normalized.isEmpty()
            ? baoCaoTonKhoRepository.findAll()
            : baoCaoTonKhoRepository.findByMaBaoCaoTonKhoContainingIgnoreCase(normalized);

        return entities.stream()
            .sorted(
                Comparator
                    .comparing(BaoCaoTonKho::getNam, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(BaoCaoTonKho::getThang, Comparator.nullsLast(Comparator.reverseOrder()))
            )
            .map(this::toHeaderResponse)
            .toList();
    }

    @Override
    public BaoCaoTonKhoResponse getByMonthYear(Integer thang, Integer nam) {
        validateThangNam(thang, nam);
        BaoCaoTonKho report = baoCaoTonKhoRepository.findByThangAndNam(thang, nam)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy báo cáo tồn kho tháng " + thang + "/" + nam)
            );
        return toFullResponse(report);
    }

    @Override
    @Transactional
    public BaoCaoTonKhoResponse generate(Integer thang, Integer nam) {
        validateThangNam(thang, nam);
        YearMonth period = YearMonth.of(nam, thang);
        Optional<BaoCaoTonKho> existingReport = baoCaoTonKhoRepository.findByThangAndNam(thang, nam);

        BaoCaoTonKho report;
        if (existingReport.isPresent()) {
            report = existingReport.get();
            chiTietBaoCaoTonKhoRepository.deleteByMaBaoCaoTonKho(report.getMaBaoCaoTonKho());
        } else {
            String currentMaxCode = baoCaoTonKhoRepository
                .findTopByMaBaoCaoTonKhoStartingWithOrderByMaBaoCaoTonKhoDesc(PREFIX)
                .map(BaoCaoTonKho::getMaBaoCaoTonKho)
                .orElse(null);
            String nextCode = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
            report = new BaoCaoTonKho();
            report.setMaBaoCaoTonKho(nextCode);
            report.setThang(thang);
            report.setNam(nam);
            report = baoCaoTonKhoRepository.save(report);
        }

        Map<String, Integer> muaMap = toQuantityMap(chiTietPhieuMuaRepository.sumSoLuongMuaBySanPhamInMonth(thang, nam));
        Map<String, Integer> banMap = toQuantityMap(chiTietPhieuBanRepository.sumSoLuongBanBySanPhamInMonth(thang, nam));
        Map<String, Integer> previousTonCuoiMap = loadPreviousTonCuoiMap(period.minusMonths(1));

        List<SanPham> products = sanPhamRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(SanPham::getMaSanPham))
            .toList();

        List<ChiTietBaoCaoTonKho> details = new ArrayList<>();
        for (SanPham product : products) {
            String maSanPham = product.getMaSanPham();
            int soLuongMuaVao = nonNegative(muaMap.get(maSanPham));
            int soLuongBanRa = nonNegative(banMap.get(maSanPham));

            Integer previousTonCuoi = previousTonCuoiMap.get(maSanPham);
            int tonDau;
            int tonCuoi;
            if (previousTonCuoi != null) {
                tonDau = nonNegative(previousTonCuoi);
                tonCuoi = nonNegative(tonDau + soLuongMuaVao - soLuongBanRa);
            } else {
                tonCuoi = nonNegative(product.getTonKho());
                tonDau = nonNegative(tonCuoi - soLuongMuaVao + soLuongBanRa);
            }

            ChiTietBaoCaoTonKho detail = new ChiTietBaoCaoTonKho();
            detail.setMaBaoCaoTonKho(report.getMaBaoCaoTonKho());
            detail.setMaSanPham(maSanPham);
            detail.setTonDau(tonDau);
            detail.setSoLuongMuaVao(soLuongMuaVao);
            detail.setSoLuongBanRa(soLuongBanRa);
            detail.setTonCuoi(tonCuoi);
            details.add(detail);
        }

        chiTietBaoCaoTonKhoRepository.saveAll(details);
        return toFullResponse(report);
    }

    @Override
    public BaoCaoTonKhoResponse getById(String maBaoCaoTonKho) {
        return toFullResponse(findByIdOrThrow(maBaoCaoTonKho));
    }

    @Override
    @Transactional
    public BaoCaoTonKhoResponse create(BaoCaoTonKhoRequest request) {
        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoTonKhoRepository.existsByThangAndNam(request.getThang(), request.getNam())) {
            throw new BusinessException("Báo cáo tồn kho tháng năm đã tồn tại");
        }

        String maBaoCaoTonKho = request.getMaBaoCaoTonKho();
        if (maBaoCaoTonKho == null || maBaoCaoTonKho.isBlank()) {
            String currentMaxCode = baoCaoTonKhoRepository
                .findTopByMaBaoCaoTonKhoStartingWithOrderByMaBaoCaoTonKhoDesc(PREFIX)
                .map(BaoCaoTonKho::getMaBaoCaoTonKho)
                .orElse(null);
            maBaoCaoTonKho = CodeGeneratorUtils.generateNextCode(PREFIX, currentMaxCode);
        }

        if (baoCaoTonKhoRepository.existsById(maBaoCaoTonKho)) {
            throw new BusinessException("Mã báo cáo tồn kho đã tồn tại");
        }

        BaoCaoTonKho entity = new BaoCaoTonKho();
        entity.setMaBaoCaoTonKho(maBaoCaoTonKho);
        entity.setThang(request.getThang());
        entity.setNam(request.getNam());

        return toHeaderResponse(baoCaoTonKhoRepository.save(entity));
    }

    @Override
    @Transactional
    public BaoCaoTonKhoResponse update(String maBaoCaoTonKho, BaoCaoTonKhoRequest request) {
        BaoCaoTonKho entity = findByIdOrThrow(maBaoCaoTonKho);

        validateThangNam(request.getThang(), request.getNam());
        if (baoCaoTonKhoRepository.existsByThangAndNamAndMaBaoCaoTonKhoNot(request.getThang(), request.getNam(), maBaoCaoTonKho)) {
            throw new BusinessException("Báo cáo tồn kho tháng năm đã tồn tại");
        }

        entity.setThang(request.getThang());
        entity.setNam(request.getNam());

        return toHeaderResponse(baoCaoTonKhoRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String maBaoCaoTonKho) {
        BaoCaoTonKho entity = findByIdOrThrow(maBaoCaoTonKho);
        try {
            baoCaoTonKhoRepository.delete(entity);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Không thể xóa báo cáo tồn kho đã có dữ liệu liên quan");
        }
    }

    private BaoCaoTonKho findByIdOrThrow(String maBaoCaoTonKho) {
        return baoCaoTonKhoRepository.findById(maBaoCaoTonKho)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy báo cáo tồn kho: " + maBaoCaoTonKho));
    }

    private void validateThangNam(Integer thang, Integer nam) {
        if (thang == null || thang < 1 || thang > 12) {
            throw new BusinessException("Tháng phải trong khoảng 1 đến 12");
        }
        if (nam == null || nam <= 0) {
            throw new BusinessException("Năm phải lớn hơn 0");
        }
    }

    private Map<String, Integer> loadPreviousTonCuoiMap(YearMonth previousMonth) {
        return baoCaoTonKhoRepository.findByThangAndNam(previousMonth.getMonthValue(), previousMonth.getYear())
            .map(previousReport -> {
                Map<String, Integer> result = new HashMap<>();
                for (ChiTietBaoCaoTonKho detail : chiTietBaoCaoTonKhoRepository.findByMaBaoCaoTonKho(
                    previousReport.getMaBaoCaoTonKho()
                )) {
                    result.put(detail.getMaSanPham(), nonNegative(detail.getTonCuoi()));
                }
                return result;
            })
            .orElseGet(HashMap::new);
    }

    private Map<String, Integer> toQuantityMap(List<Object[]> rows) {
        Map<String, Integer> result = new HashMap<>();
        for (Object[] row : rows) {
            if (row == null || row.length < 2 || row[0] == null) {
                continue;
            }
            String maSanPham = row[0].toString();
            Number quantity = row[1] instanceof Number number ? number : 0;
            result.put(maSanPham, quantity.intValue());
        }
        return result;
    }

    private int nonNegative(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(value, 0);
    }

    private BaoCaoTonKhoResponse toHeaderResponse(BaoCaoTonKho entity) {
        BaoCaoTonKhoResponse response = new BaoCaoTonKhoResponse();
        response.setMaBaoCaoTonKho(entity.getMaBaoCaoTonKho());
        response.setThang(entity.getThang());
        response.setNam(entity.getNam());
        return response;
    }

    private BaoCaoTonKhoResponse toFullResponse(BaoCaoTonKho entity) {
        BaoCaoTonKhoResponse response = toHeaderResponse(entity);
        List<ChiTietBaoCaoTonKho> details = chiTietBaoCaoTonKhoRepository.findByMaBaoCaoTonKho(entity.getMaBaoCaoTonKho())
            .stream()
            .sorted(Comparator.comparing(ChiTietBaoCaoTonKho::getMaSanPham))
            .toList();

        List<BaoCaoTonKhoResponse.ChiTietTonKhoResponse> itemResponses = new ArrayList<>();
        for (int index = 0; index < details.size(); index++) {
            ChiTietBaoCaoTonKho detail = details.get(index);
            BaoCaoTonKhoResponse.ChiTietTonKhoResponse item = new BaoCaoTonKhoResponse.ChiTietTonKhoResponse();
            item.setStt(index + 1);
            item.setMaSanPham(detail.getMaSanPham());
            item.setTonDau(nonNegative(detail.getTonDau()));
            item.setSoLuongMuaVao(nonNegative(detail.getSoLuongMuaVao()));
            item.setSoLuongBanRa(nonNegative(detail.getSoLuongBanRa()));
            item.setTonCuoi(nonNegative(detail.getTonCuoi()));

            if (detail.getSanPham() != null) {
                item.setTenSanPham(detail.getSanPham().getTenSanPham());
                if (detail.getSanPham().getDonViTinh() != null) {
                    item.setTenDonViTinh(detail.getSanPham().getDonViTinh().getTenDonViTinh());
                }
            }

            itemResponses.add(item);
        }

        response.setChiTiet(itemResponses);
        return response;
    }
}
