package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.PhieuMuaHangRequest;
import com.se104.goldstore.dto.response.PhieuMuaHangResponse;
import com.se104.goldstore.entity.ChiTietPhieuMua;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.NhaCungCap;
import com.se104.goldstore.entity.PhieuMuaHang;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.DonViTinhRepository;
import com.se104.goldstore.repository.LoaiSanPhamRepository;
import com.se104.goldstore.repository.NhaCungCapRepository;
import com.se104.goldstore.repository.PhieuMuaHangRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.PhieuMuaHangServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class PhieuMuaHangServiceImplTest {

    @Mock
    private PhieuMuaHangRepository phieuMuaHangRepository;

    @Mock
    private ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;

    @Mock
    private NhaCungCapRepository nhaCungCapRepository;

    @Mock
    private SanPhamRepository sanPhamRepository;

    @Mock
    private DonViTinhRepository donViTinhRepository;

    @Mock
    private LoaiSanPhamRepository loaiSanPhamRepository;

    private PhieuMuaHangServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PhieuMuaHangServiceImpl(
            phieuMuaHangRepository,
            chiTietPhieuMuaRepository,
            nhaCungCapRepository,
            sanPhamRepository,
            donViTinhRepository,
            loaiSanPhamRepository
        );
    }

    @Test
    void createShouldIncreaseStockAfterPurchaseCreated() {
        PhieuMuaHangRequest.ItemRequest itemRequest = new PhieuMuaHangRequest.ItemRequest();
        itemRequest.setMaSanPham("SP001");
        itemRequest.setSoLuongMua(10);
        itemRequest.setMaDonViTinh("DVT001");
        itemRequest.setDonGia(new BigDecimal("1000000"));

        PhieuMuaHangRequest request = new PhieuMuaHangRequest();
        request.setNgayLapPhieuMua(LocalDate.of(2026, 5, 20));
        request.setMaNhaCungCap("NCC001");
        request.setItems(List.of(itemRequest));

        NhaCungCap nhaCungCap = new NhaCungCap();
        nhaCungCap.setMaNhaCungCap("NCC001");
        nhaCungCap.setTenNhaCungCap("Cong ty vang A");
        nhaCungCap.setSoDienThoai("0901234567");
        nhaCungCap.setDiaChi("TP HCM");

        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP001");
        sanPham.setTenSanPham("Nhan vang");
        sanPham.setMaLoaiSanPham("LSP001");
        sanPham.setTonKho(5);
        sanPham.setDonGiaMua(new BigDecimal("900000"));
        sanPham.setDonGiaBan(new BigDecimal("945000.00"));

        DonViTinh donViTinh = new DonViTinh();
        donViTinh.setMaDonViTinh("DVT001");
        donViTinh.setTenDonViTinh("chi");

        LoaiSanPham loaiSanPham = new LoaiSanPham();
        loaiSanPham.setMaLoaiSanPham("LSP001");
        loaiSanPham.setTenLoaiSanPham("Vang 24K");
        loaiSanPham.setTiLeLoiNhuan(new BigDecimal("10"));

        when(nhaCungCapRepository.findById("NCC001")).thenReturn(Optional.of(nhaCungCap));
        when(phieuMuaHangRepository.findTopBySoPhieuMuaStartingWithOrderBySoPhieuMuaDesc("PM")).thenReturn(Optional.empty());
        when(phieuMuaHangRepository.existsById("PM001")).thenReturn(false);
        when(sanPhamRepository.findById("SP001")).thenReturn(Optional.of(sanPham));
        when(donViTinhRepository.findById("DVT001")).thenReturn(Optional.of(donViTinh));
        when(loaiSanPhamRepository.findById("LSP001")).thenReturn(Optional.of(loaiSanPham));
        when(phieuMuaHangRepository.save(any(PhieuMuaHang.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(chiTietPhieuMuaRepository.saveAll(anyIterable())).thenAnswer(invocation -> {
            Iterable<ChiTietPhieuMua> iterable = invocation.getArgument(0);
            List<ChiTietPhieuMua> result = new ArrayList<>();
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

        PhieuMuaHangResponse response = service.create(request);

        assertEquals(15, sanPham.getTonKho());
        assertEquals(new BigDecimal("1000000.00"), sanPham.getDonGiaMua());
        assertEquals(new BigDecimal("1100000.00"), sanPham.getDonGiaBan());
        assertEquals(new BigDecimal("10000000.00"), response.getTongTien());
        assertEquals(1, response.getItems().size());
        assertEquals(new BigDecimal("10000000.00"), response.getItems().get(0).getThanhTien());
    }
}
