package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.SanPhamRequest;
import com.se104.goldstore.dto.response.SanPhamResponse;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.repository.ChiTietBaoCaoDoanhThuSanPhamRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoTonKhoRepository;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.SanPhamServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class SanPhamServiceImplTest {

    @Mock
    private SanPhamRepository sanPhamRepository;

    @Mock
    private LoaiSanPhamRepository loaiSanPhamRepository;

    @Mock
    private DonViTinhRepository donViTinhRepository;

    @Mock
    private ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;

    @Mock
    private ChiTietPhieuBanRepository chiTietPhieuBanRepository;

    @Mock
    private ChiTietBaoCaoTonKhoRepository chiTietBaoCaoTonKhoRepository;

    @Mock
    private ChiTietBaoCaoDoanhThuSanPhamRepository chiTietBaoCaoDoanhThuSanPhamRepository;

    private SanPhamServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new SanPhamServiceImpl(
            sanPhamRepository,
            loaiSanPhamRepository,
            donViTinhRepository,
            chiTietPhieuMuaRepository,
            chiTietPhieuBanRepository,
            chiTietBaoCaoTonKhoRepository,
            chiTietBaoCaoDoanhThuSanPhamRepository
        );
    }

    @Test
    void createShouldCalculateSellingPriceFromProfitRate() {
        SanPhamRequest request = new SanPhamRequest();
        request.setTenSanPham("Nhan vang");
        request.setMaLoaiSanPham("LSP001");
        request.setMaDonViTinh("DVT001");
        request.setDonGiaMua(new BigDecimal("1000000"));

        LoaiSanPham loaiSanPham = new LoaiSanPham();
        loaiSanPham.setMaLoaiSanPham("LSP001");
        loaiSanPham.setTiLeLoiNhuan(new BigDecimal("5"));

        DonViTinh donViTinh = new DonViTinh();
        donViTinh.setMaDonViTinh("DVT001");
        donViTinh.setLoaiDonVi("Khoi luong");

        when(loaiSanPhamRepository.findById("LSP001")).thenReturn(Optional.of(loaiSanPham));
        when(donViTinhRepository.findById("DVT001")).thenReturn(Optional.of(donViTinh));
        when(sanPhamRepository.findFirstByMaLoaiSanPham("LSP001")).thenReturn(Optional.empty());
        when(sanPhamRepository.findTopByMaSanPhamStartingWithOrderByMaSanPhamDesc("SP")).thenReturn(Optional.empty());
        when(sanPhamRepository.existsById("SP001")).thenReturn(false);
        when(sanPhamRepository.save(any(SanPham.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SanPhamResponse response = service.create(request);

        assertEquals(new BigDecimal("1050000.00"), response.getDonGiaBan());
        assertEquals(0, response.getTonKho());
    }

    @Test
    void updateShouldRecalculateSellingPriceWhenPurchasePriceChanges() {
        SanPham existing = new SanPham();
        existing.setMaSanPham("SP001");
        existing.setTenSanPham("Nhan vang");
        existing.setMaLoaiSanPham("LSP001");
        existing.setMaDonViTinh("DVT001");
        existing.setDonGiaMua(new BigDecimal("100000"));
        existing.setDonGiaBan(new BigDecimal("105000.00"));
        existing.setTonKho(12);

        SanPhamRequest request = new SanPhamRequest();
        request.setTenSanPham("Nhan vang cap nhat");
        request.setMaLoaiSanPham("LSP001");
        request.setMaDonViTinh("DVT001");
        request.setDonGiaMua(new BigDecimal("200000"));
        request.setTonKho(12);

        LoaiSanPham loaiSanPham = new LoaiSanPham();
        loaiSanPham.setMaLoaiSanPham("LSP001");
        loaiSanPham.setTiLeLoiNhuan(new BigDecimal("12.5"));

        DonViTinh donViTinh = new DonViTinh();
        donViTinh.setMaDonViTinh("DVT001");
        donViTinh.setLoaiDonVi("Khoi luong");

        when(sanPhamRepository.findById("SP001")).thenReturn(Optional.of(existing));
        when(loaiSanPhamRepository.findById("LSP001")).thenReturn(Optional.of(loaiSanPham));
        when(donViTinhRepository.findById("DVT001")).thenReturn(Optional.of(donViTinh));
        when(sanPhamRepository.findFirstByMaLoaiSanPhamAndMaSanPhamNot("LSP001", "SP001")).thenReturn(Optional.empty());
        when(sanPhamRepository.save(any(SanPham.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SanPhamResponse response = service.update("SP001", request);

        assertEquals(new BigDecimal("225000.00"), response.getDonGiaBan());
        assertEquals(12, response.getTonKho());
    }
}
