package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.PhieuBanHangRequest;
import com.se104.goldstore.dto.response.PhieuBanHangResponse;
import com.se104.goldstore.entity.ChiTietPhieuBan;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.PhieuBanHang;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.PhieuBanHangRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.PhieuBanHangServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class PhieuBanHangServiceImplTest {

    @Mock
    private PhieuBanHangRepository phieuBanHangRepository;

    @Mock
    private ChiTietPhieuBanRepository chiTietPhieuBanRepository;

    @Mock
    private KhachHangRepository khachHangRepository;

    @Mock
    private SanPhamRepository sanPhamRepository;

    @Mock
    private DonViTinhRepository donViTinhRepository;

    @Mock
    private LoaiSanPhamRepository loaiSanPhamRepository;

    private PhieuBanHangServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PhieuBanHangServiceImpl(
            phieuBanHangRepository,
            chiTietPhieuBanRepository,
            khachHangRepository,
            sanPhamRepository,
            donViTinhRepository,
            loaiSanPhamRepository
        );
    }

    @Test
    void createShouldDecreaseStockWhenSaleSuccess() {
        Fixture fixture = fixtureForSuccess();
        fixture.item.setSoLuong(3);

        PhieuBanHangResponse response = service.create(fixture.request);

        assertEquals(7, fixture.sanPham.getTonKho());
        assertEquals(new BigDecimal("1155000.00"), response.getTongTien());
        assertEquals(1, response.getItems().size());
        assertEquals(new BigDecimal("385000.00"), response.getItems().get(0).getDonGia());
    }

    @Test
    void createShouldThrowWhenQuantityExceedsStockAndKeepStock() {
        Fixture fixture = fixtureForSuccess();
        fixture.item.setSoLuong(20);
        int tonKhoBanDau = fixture.sanPham.getTonKho();

        assertThrows(BusinessException.class, () -> service.create(fixture.request));
        assertEquals(tonKhoBanDau, fixture.sanPham.getTonKho());
    }

    @Test
    void createShouldUseSellingPriceFormulaFromCostAndProfitRate() {
        Fixture fixture = fixtureForSuccess();
        fixture.item.setSoLuong(1);
        fixture.sanPham.setDonGiaMua(new BigDecimal("200000"));
        fixture.loaiSanPham.setTiLeLoiNhuan(new BigDecimal("12.5"));

        PhieuBanHangResponse response = service.create(fixture.request);

        assertEquals(new BigDecimal("225000.00"), response.getItems().get(0).getDonGia());
        assertEquals(new BigDecimal("225000.00"), response.getTongTien());
    }

    private Fixture fixtureForSuccess() {
        PhieuBanHangRequest.ItemRequest item = new PhieuBanHangRequest.ItemRequest();
        item.setMaSanPham("SP001");
        item.setSoLuong(1);

        PhieuBanHangRequest request = new PhieuBanHangRequest();
        request.setNgayLapPhieuBan(LocalDate.of(2026, 5, 20));
        request.setMaKhachHang("KH001");
        request.setItems(List.of(item));

        KhachHang khachHang = new KhachHang();
        khachHang.setMaKhachHang("KH001");
        khachHang.setTenKhachHang("Nguyen Van A");
        khachHang.setSoDienThoaiKhachHang("0901234567");
        khachHang.setDiaChiKhachHang("TP HCM");

        LoaiSanPham loaiSanPham = new LoaiSanPham();
        loaiSanPham.setMaLoaiSanPham("LSP001");
        loaiSanPham.setTenLoaiSanPham("Vang 24K");
        loaiSanPham.setTiLeLoiNhuan(new BigDecimal("10"));
        loaiSanPham.setMaDonViTinh("DVT001");

        DonViTinh donViTinh = new DonViTinh();
        donViTinh.setMaDonViTinh("DVT001");
        donViTinh.setTenDonViTinh("chi");
        loaiSanPham.setDonViTinh(donViTinh);

        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP001");
        sanPham.setTenSanPham("Nhan vang");
        sanPham.setMaLoaiSanPham("LSP001");
        sanPham.setTonKho(10);
        sanPham.setDonGiaMua(new BigDecimal("350000"));
        sanPham.setDonGiaBan(new BigDecimal("385000.00"));
        sanPham.setLoaiSanPham(loaiSanPham);

        when(khachHangRepository.findById("KH001")).thenReturn(Optional.of(khachHang));
        when(phieuBanHangRepository.findTopBySoPhieuBanStartingWithOrderBySoPhieuBanDesc("PB")).thenReturn(Optional.empty());
        when(phieuBanHangRepository.existsById("PB001")).thenReturn(false);
        when(sanPhamRepository.findByIdForUpdate("SP001")).thenReturn(Optional.of(sanPham));
        when(loaiSanPhamRepository.findById("LSP001")).thenReturn(Optional.of(loaiSanPham));
        when(phieuBanHangRepository.save(any(PhieuBanHang.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(chiTietPhieuBanRepository.saveAll(anyIterable())).thenAnswer(invocation -> {
            Iterable<ChiTietPhieuBan> iterable = invocation.getArgument(0);
            List<ChiTietPhieuBan> result = new ArrayList<>();
            iterable.forEach(result::add);
            return result;
        });
        when(sanPhamRepository.saveAll(anyIterable())).thenAnswer(invocation -> {
            Iterable<SanPham> iterable = invocation.getArgument(0);
            List<SanPham> result = new ArrayList<>();
            iterable.forEach(result::add);
            return result;
        });
        when(sanPhamRepository.findAllById(anyIterable())).thenReturn(List.of(sanPham));
        when(donViTinhRepository.findAllById(anyIterable())).thenReturn(List.of(donViTinh));
        when(loaiSanPhamRepository.findAllById(anyIterable())).thenReturn(List.of(loaiSanPham));

        Fixture fixture = new Fixture();
        fixture.request = request;
        fixture.item = item;
        fixture.sanPham = sanPham;
        fixture.loaiSanPham = loaiSanPham;
        return fixture;
    }

    private static class Fixture {
        private PhieuBanHangRequest request;
        private PhieuBanHangRequest.ItemRequest item;
        private SanPham sanPham;
        private LoaiSanPham loaiSanPham;
    }
}
