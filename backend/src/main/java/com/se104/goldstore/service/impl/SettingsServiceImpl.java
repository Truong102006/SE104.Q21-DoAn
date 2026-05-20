package com.se104.goldstore.service.impl;

import com.se104.goldstore.common.CodeGeneratorUtils;
import com.se104.goldstore.dto.request.ServicePrepaymentRateRequest;
import com.se104.goldstore.dto.response.DonViTinhResponse;
import com.se104.goldstore.dto.response.LoaiDichVuResponse;
import com.se104.goldstore.dto.response.LoaiSanPhamResponse;
import com.se104.goldstore.dto.response.ServicePrepaymentRateResponse;
import com.se104.goldstore.entity.ThamSo;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.ThamSoRepository;
import com.se104.goldstore.service.DonViTinhService;
import com.se104.goldstore.service.LoaiDichVuService;
import com.se104.goldstore.service.LoaiSanPhamService;
import com.se104.goldstore.service.SettingsService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SettingsServiceImpl implements SettingsService {

    private static final String PREPAYMENT_RATE_KEY = "SERVICE_PREPAYMENT_RATE";
    private static final String THAM_SO_PREFIX = "TS";
    private static final BigDecimal DEFAULT_PREPAYMENT_RATE = BigDecimal.valueOf(50);
    private static final BigDecimal MIN_RATE = BigDecimal.ZERO;
    private static final BigDecimal MAX_RATE = BigDecimal.valueOf(100);

    private final LoaiSanPhamService loaiSanPhamService;
    private final DonViTinhService donViTinhService;
    private final LoaiDichVuService loaiDichVuService;
    private final ThamSoRepository thamSoRepository;

    public SettingsServiceImpl(
        LoaiSanPhamService loaiSanPhamService,
        DonViTinhService donViTinhService,
        LoaiDichVuService loaiDichVuService,
        ThamSoRepository thamSoRepository
    ) {
        this.loaiSanPhamService = loaiSanPhamService;
        this.donViTinhService = donViTinhService;
        this.loaiDichVuService = loaiDichVuService;
        this.thamSoRepository = thamSoRepository;
    }

    @Override
    public List<LoaiSanPhamResponse> getProductTypes(String keyword) {
        return loaiSanPhamService.getAll(keyword);
    }

    @Override
    public List<DonViTinhResponse> getUnits(String keyword) {
        return donViTinhService.getAll(keyword);
    }

    @Override
    public List<LoaiDichVuResponse> getServiceTypes(String keyword) {
        return loaiDichVuService.getAll(keyword);
    }

    @Override
    public ServicePrepaymentRateResponse getServicePrepaymentRate() {
        BigDecimal value = thamSoRepository.findByTenThamSoIgnoreCase(PREPAYMENT_RATE_KEY)
            .map(ThamSo::getGiaTri)
            .orElse(DEFAULT_PREPAYMENT_RATE);
        return toResponse(normalizeRate(value));
    }

    @Override
    @Transactional
    public ServicePrepaymentRateResponse updateServicePrepaymentRate(ServicePrepaymentRateRequest request) {
        BigDecimal rate = normalizeRate(request.getValue());
        ThamSo thamSo = thamSoRepository.findByTenThamSoIgnoreCase(PREPAYMENT_RATE_KEY)
            .orElseGet(this::buildNewPrepaymentRateSetting);
        thamSo.setTenThamSo(PREPAYMENT_RATE_KEY);
        thamSo.setGiaTri(rate);
        ThamSo saved = thamSoRepository.save(thamSo);
        return toResponse(saved.getGiaTri());
    }

    private ThamSo buildNewPrepaymentRateSetting() {
        String currentMaxCode = thamSoRepository
            .findTopByMaThamSoStartingWithOrderByMaThamSoDesc(THAM_SO_PREFIX)
            .map(ThamSo::getMaThamSo)
            .orElse(null);
        String nextCode = CodeGeneratorUtils.generateNextCode(THAM_SO_PREFIX, currentMaxCode);
        ThamSo thamSo = new ThamSo();
        thamSo.setMaThamSo(nextCode);
        return thamSo;
    }

    private BigDecimal normalizeRate(BigDecimal value) {
        if (value == null) {
            throw new BusinessException("Gia tri ti le tra truoc khong duoc de trong");
        }
        if (value.compareTo(MIN_RATE) < 0 || value.compareTo(MAX_RATE) > 0) {
            throw new BusinessException("Gia tri ti le tra truoc phai nam trong khoang [0, 100]");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private ServicePrepaymentRateResponse toResponse(BigDecimal value) {
        ServicePrepaymentRateResponse response = new ServicePrepaymentRateResponse();
        response.setKey(PREPAYMENT_RATE_KEY);
        response.setValue(normalizeRate(value));
        return response;
    }
}
