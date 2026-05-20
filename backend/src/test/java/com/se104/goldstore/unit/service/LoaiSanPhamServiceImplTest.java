package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.LoaiSanPhamRequest;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.LoaiSanPhamServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class LoaiSanPhamServiceImplTest {

    @Mock
    private LoaiSanPhamRepository loaiSanPhamRepository;

    @Mock
    private SanPhamRepository sanPhamRepository;

    private LoaiSanPhamServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new LoaiSanPhamServiceImpl(loaiSanPhamRepository, sanPhamRepository);
    }

    @Test
    void updateShouldRecalculateSellingPriceForProductsInType() {
        LoaiSanPham loaiSanPham = new LoaiSanPham();
        loaiSanPham.setMaLoaiSanPham("LSP001");
        loaiSanPham.setTenLoaiSanPham("Vang 24K");
        loaiSanPham.setTiLeLoiNhuan(new BigDecimal("5"));

        LoaiSanPhamRequest request = new LoaiSanPhamRequest();
        request.setTenLoaiSanPham("Vang 24K");
        request.setTiLeLoiNhuan(new BigDecimal("10"));

        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP001");
        sanPham.setMaLoaiSanPham("LSP001");
        sanPham.setDonGiaMua(new BigDecimal("100000"));
        sanPham.setDonGiaBan(new BigDecimal("105000.00"));

        when(loaiSanPhamRepository.findById("LSP001")).thenReturn(Optional.of(loaiSanPham));
        when(loaiSanPhamRepository.existsByTenLoaiSanPhamIgnoreCaseAndMaLoaiSanPhamNot("Vang 24K", "LSP001")).thenReturn(false);
        when(loaiSanPhamRepository.save(any(LoaiSanPham.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(sanPhamRepository.findByMaLoaiSanPham("LSP001")).thenReturn(List.of(sanPham));
        when(sanPhamRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.update("LSP001", request);

        assertEquals(new BigDecimal("110000.00"), sanPham.getDonGiaBan());
    }
}
