package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.ServicePrepaymentRateRequest;
import com.se104.goldstore.dto.response.ServicePrepaymentRateResponse;
import com.se104.goldstore.entity.ThamSo;
import com.se104.goldstore.repository.ThamSoRepository;
import com.se104.goldstore.service.DonViTinhService;
import com.se104.goldstore.service.LoaiDichVuService;
import com.se104.goldstore.service.LoaiSanPhamService;
import com.se104.goldstore.service.impl.SettingsServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class SettingsServiceImplTest {

    @Mock
    private LoaiSanPhamService loaiSanPhamService;

    @Mock
    private DonViTinhService donViTinhService;

    @Mock
    private LoaiDichVuService loaiDichVuService;

    @Mock
    private ThamSoRepository thamSoRepository;

    private SettingsServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new SettingsServiceImpl(
            loaiSanPhamService,
            donViTinhService,
            loaiDichVuService,
            thamSoRepository
        );
    }

    @Test
    void updateServicePrepaymentRateShouldUseUpdatedValue() {
        ServicePrepaymentRateRequest request = new ServicePrepaymentRateRequest();
        request.setValue(new BigDecimal("60"));

        ThamSo thamSo = new ThamSo();
        thamSo.setMaThamSo("TS_PREPAY_RATE");
        thamSo.setTenThamSo("SERVICE_PREPAYMENT_RATE");
        thamSo.setGiaTri(new BigDecimal("50"));

        when(thamSoRepository.findByTenThamSoIgnoreCase("SERVICE_PREPAYMENT_RATE")).thenReturn(Optional.of(thamSo));
        when(thamSoRepository.save(any(ThamSo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ServicePrepaymentRateResponse response = service.updateServicePrepaymentRate(request);

        assertEquals("SERVICE_PREPAYMENT_RATE", response.getKey());
        assertEquals(new BigDecimal("60.00"), response.getValue());
        assertEquals(new BigDecimal("60.00"), thamSo.getGiaTri());
    }
}
