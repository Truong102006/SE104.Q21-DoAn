package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
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
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

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
        request.setImageUrl("https://res.cloudinary.com/demo/image/upload/ring.jpg");

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
        assertEquals("https://res.cloudinary.com/demo/image/upload/ring.jpg", response.getImageUrl());
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
        existing.setImageUrl("https://res.cloudinary.com/demo/image/upload/old.jpg");

        SanPhamRequest request = new SanPhamRequest();
        request.setTenSanPham("Nhan vang cap nhat");
        request.setMaLoaiSanPham("LSP001");
        request.setMaDonViTinh("DVT001");
        request.setDonGiaMua(new BigDecimal("200000"));
        request.setTonKho(12);
        request.setImageUrl("");

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
        assertNull(response.getImageUrl());
    }

    @Test
    void getAllShouldSupportRelativeSearchByKeywordAndProductType() {
        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP001");
        sanPham.setTenSanPham("Nhan vang 24K");
        sanPham.setMaLoaiSanPham("LSP001");
        sanPham.setMaDonViTinh("DVT001");
        sanPham.setDonGiaMua(new BigDecimal("1000000"));
        sanPham.setDonGiaBan(new BigDecimal("1020000"));
        sanPham.setTonKho(5);
        sanPham.setImageUrl("https://res.cloudinary.com/demo/image/upload/a.jpg");

        Page<SanPham> page = new PageImpl<>(List.of(sanPham));

        when(sanPhamRepository.search(eq("nhan vang"), eq("LSP001"), any(Pageable.class))).thenReturn(page);

        Page<SanPhamResponse> result = service.getAll("  Nhan   Vang  ", " LSP001 ", 0, 20);

        assertEquals(1, result.getTotalElements());
        assertEquals("SP001", result.getContent().getFirst().getMaSanPham());
        assertEquals("https://res.cloudinary.com/demo/image/upload/a.jpg", result.getContent().getFirst().getImageUrl());
        verify(sanPhamRepository).search(eq("nhan vang"), eq("LSP001"), any(Pageable.class));
    }

    @Test
    void getCatalogShouldFilterByStockStatusAndSort() {
        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP009");
        sanPham.setTenSanPham("Vong tay");
        sanPham.setMaLoaiSanPham("LSP001");
        sanPham.setMaDonViTinh("DVT001");
        sanPham.setDonGiaMua(new BigDecimal("1000000"));
        sanPham.setDonGiaBan(new BigDecimal("1200000"));
        sanPham.setTonKho(2);

        when(sanPhamRepository.searchCatalog(eq("vong"), eq("LSP001"), eq("LOW_STOCK"), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(sanPham)));

        Page<SanPhamResponse> result = service.getCatalog("vong", "LSP001", "low_stock", "priceDesc", 0, 20);

        assertEquals(1, result.getTotalElements());
        assertEquals("SP009", result.getContent().getFirst().getMaSanPham());
        verify(sanPhamRepository).searchCatalog(eq("vong"), eq("LSP001"), eq("LOW_STOCK"), any(Pageable.class));
    }
}
