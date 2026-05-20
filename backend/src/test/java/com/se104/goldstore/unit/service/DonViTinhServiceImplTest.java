package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.DonViTinhRequest;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.DonViTinhServiceImpl;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class DonViTinhServiceImplTest {

    @Mock
    private DonViTinhRepository donViTinhRepository;

    @Mock
    private SanPhamRepository sanPhamRepository;

    @Mock
    private ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;

    private DonViTinhServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new DonViTinhServiceImpl(donViTinhRepository, sanPhamRepository, chiTietPhieuMuaRepository);
    }

    @Test
    void createShouldThrowWhenUnitNameDuplicate() {
        DonViTinhRequest request = new DonViTinhRequest();
        request.setTenDonViTinh("gram");
        request.setLoaiDonVi("Khoi luong");
        request.setHeSoQuyDoi(BigDecimal.ONE);

        when(donViTinhRepository.existsByTenDonViTinhIgnoreCase("gram")).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request));
    }
}
