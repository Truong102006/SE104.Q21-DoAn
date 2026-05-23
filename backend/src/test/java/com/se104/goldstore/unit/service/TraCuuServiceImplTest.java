package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.response.TraCuuPhieuDichVuResponse;
import com.se104.goldstore.dto.response.TraCuuSanPhamResponse;
import com.se104.goldstore.entity.ChiTietPhieuDichVu;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.entity.LoaiSanPham;
import com.se104.goldstore.entity.PhieuDichVu;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
import com.se104.goldstore.repository.PhieuDichVuRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.TraCuuServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

class TraCuuServiceImplTest {

    @Mock
    private SanPhamRepository sanPhamRepository;

    @Mock
    private PhieuDichVuRepository phieuDichVuRepository;

    @Mock
    private ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;

    @Mock
    private ChiTietPhieuBanRepository chiTietPhieuBanRepository;

    @Mock
    private ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;

    private TraCuuServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new TraCuuServiceImpl(
            sanPhamRepository,
            phieuDichVuRepository,
            chiTietPhieuDichVuRepository,
            chiTietPhieuBanRepository,
            chiTietPhieuMuaRepository
        );
    }

    @Test
    void searchProductsShouldSupportRelativeKeyword() {
        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP001");
        sanPham.setTenSanPham("Nhan vang 9999");
        sanPham.setDonGiaBan(new BigDecimal("2100000.00"));
        sanPham.setTonKho(5);

        LoaiSanPham loaiSanPham = new LoaiSanPham();
        loaiSanPham.setTenLoaiSanPham("Nhan");
        sanPham.setLoaiSanPham(loaiSanPham);

        DonViTinh donViTinh = new DonViTinh();
        donViTinh.setTenDonViTinh("Chiec");
        sanPham.setDonViTinh(donViTinh);

        Page<SanPham> sanPhamPage = new PageImpl<>(List.of(sanPham));
        when(sanPhamRepository.search(eq("nhan vang"), eq(null), any(Pageable.class))).thenReturn(sanPhamPage);

        Page<TraCuuSanPhamResponse> response = service.searchProducts("  Nhan   Vang  ", 0, 20);

        assertEquals(1, response.getTotalElements());
        assertEquals("SP001", response.getContent().get(0).getMaSanPham());
        assertEquals("Nhan", response.getContent().get(0).getTenLoaiSanPham());
        assertEquals("Chiec", response.getContent().get(0).getTenDonViTinh());
        verify(sanPhamRepository).search(eq("nhan vang"), eq(null), any(Pageable.class));
    }

    @Test
    void searchServiceTicketsShouldComputeStatusFromDetails() {
        PhieuDichVu phieu = new PhieuDichVu();
        phieu.setSoPhieuDichVu("DV001");
        phieu.setNgayLapPhieuDichVu(LocalDate.of(2026, 5, 20));
        phieu.setTongTien(new BigDecimal("300000.00"));
        phieu.setTongTienTraTruoc(new BigDecimal("150000.00"));
        phieu.setTongTienConLai(new BigDecimal("150000.00"));
        phieu.setTinhTrangDichVu("Chua hoan thanh");

        KhachHang khachHang = new KhachHang();
        khachHang.setMaKhachHang("KH001");
        khachHang.setTenKhachHang("Nguyen Van A");
        phieu.setKhachHang(khachHang);

        ChiTietPhieuDichVu item = new ChiTietPhieuDichVu();
        item.setSoPhieuDichVu("DV001");
        item.setMaLoaiDichVu("LDV001");
        item.setTinhTrang("Da giao");

        Page<PhieuDichVu> page = new PageImpl<>(List.of(phieu));
        when(phieuDichVuRepository.search(eq(""), eq("Hoan thanh"), eq(null), eq(null), any(Pageable.class)))
            .thenReturn(page);
        when(chiTietPhieuDichVuRepository.findBySoPhieuDichVu("DV001")).thenReturn(List.of(item));

        Page<TraCuuPhieuDichVuResponse> response = service.searchServiceTickets(" ", "Hoàn thành", null, null, 0, 20);

        assertEquals(1, response.getTotalElements());
        assertEquals("DV001", response.getContent().get(0).getSoPhieuDichVu());
        assertEquals("Nguyen Van A", response.getContent().get(0).getTenKhachHang());
        assertEquals("Hoan thanh", response.getContent().get(0).getTinhTrangDichVu());
    }
}
