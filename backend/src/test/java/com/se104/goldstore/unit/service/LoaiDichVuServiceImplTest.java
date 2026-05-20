package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.LoaiDichVuRequest;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
import com.se104.goldstore.repository.LoaiDichVuRepository;
import com.se104.goldstore.service.impl.LoaiDichVuServiceImpl;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class LoaiDichVuServiceImplTest {

    @Mock
    private LoaiDichVuRepository loaiDichVuRepository;

    @Mock
    private ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;

    private LoaiDichVuServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new LoaiDichVuServiceImpl(loaiDichVuRepository, chiTietPhieuDichVuRepository);
    }

    @Test
    void createShouldThrowWhenServiceTypeNameDuplicate() {
        LoaiDichVuRequest request = new LoaiDichVuRequest();
        request.setTenLoaiDichVu("Can thu vang");
        request.setDonGiaDichVu(new BigDecimal("50000"));

        when(loaiDichVuRepository.existsByTenLoaiDichVuIgnoreCase("Can thu vang")).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request));
    }
}
