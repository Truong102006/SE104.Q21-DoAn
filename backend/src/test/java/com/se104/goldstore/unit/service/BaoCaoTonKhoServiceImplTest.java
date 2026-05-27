package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.response.BaoCaoTonKhoResponse;
import com.se104.goldstore.entity.BaoCaoTonKho;
import com.se104.goldstore.entity.ChiTietBaoCaoTonKho;
import com.se104.goldstore.entity.DonViTinh;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.repository.BaoCaoTonKhoRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoTonKhoRepository;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.ChiTietPhieuMuaRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.BaoCaoTonKhoServiceImpl;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class BaoCaoTonKhoServiceImplTest {

    @Mock
    private BaoCaoTonKhoRepository baoCaoTonKhoRepository;

    @Mock
    private ChiTietBaoCaoTonKhoRepository chiTietBaoCaoTonKhoRepository;

    @Mock
    private ChiTietPhieuMuaRepository chiTietPhieuMuaRepository;

    @Mock
    private ChiTietPhieuBanRepository chiTietPhieuBanRepository;

    @Mock
    private SanPhamRepository sanPhamRepository;

    private BaoCaoTonKhoServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new BaoCaoTonKhoServiceImpl(
            baoCaoTonKhoRepository,
            chiTietBaoCaoTonKhoRepository,
            chiTietPhieuMuaRepository,
            chiTietPhieuBanRepository,
            sanPhamRepository
        );
    }

    @Test
    void generateShouldCalculateTonKhoForProductWithMonthlyPurchaseAndSale() {
        DonViTinh donViTinh = new DonViTinh();
        donViTinh.setMaDonViTinh("DVT001");
        donViTinh.setTenDonViTinh("Chi");

        com.se104.goldstore.entity.LoaiSanPham loaiSanPham = new com.se104.goldstore.entity.LoaiSanPham();
        loaiSanPham.setMaLoaiSanPham("LSP001");
        loaiSanPham.setTenLoaiSanPham("Vang");
        loaiSanPham.setMaDonViTinh("DVT001");
        loaiSanPham.setDonViTinh(donViTinh);

        SanPham sanPham = new SanPham();
        sanPham.setMaSanPham("SP001");
        sanPham.setTenSanPham("Nhan vang");
        sanPham.setTonKho(20);
        sanPham.setMaLoaiSanPham("LSP001");
        sanPham.setLoaiSanPham(loaiSanPham);

        AtomicReference<List<ChiTietBaoCaoTonKho>> savedDetailsRef = new AtomicReference<>(List.of());

        when(baoCaoTonKhoRepository.findByThangAndNam(5, 2026)).thenReturn(Optional.empty());
        when(baoCaoTonKhoRepository.findByThangAndNam(4, 2026)).thenReturn(Optional.empty());
        when(baoCaoTonKhoRepository.findTopByMaBaoCaoTonKhoStartingWithOrderByMaBaoCaoTonKhoDesc("BCTK"))
            .thenReturn(Optional.empty());
        when(baoCaoTonKhoRepository.save(any(BaoCaoTonKho.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Object[]> muaRows = Collections.singletonList(new Object[] { "SP001", 10L });
        List<Object[]> banRows = Collections.singletonList(new Object[] { "SP001", 4L });
        when(chiTietPhieuMuaRepository.sumSoLuongMuaBySanPhamInMonth(5, 2026)).thenReturn(muaRows);
        when(chiTietPhieuBanRepository.sumSoLuongBanBySanPhamInMonth(5, 2026)).thenReturn(banRows);
        when(sanPhamRepository.findAll()).thenReturn(List.of(sanPham));

        when(chiTietBaoCaoTonKhoRepository.saveAll(any())).thenAnswer(invocation -> {
            Iterable<ChiTietBaoCaoTonKho> iterable = invocation.getArgument(0);
            List<ChiTietBaoCaoTonKho> list = new ArrayList<>();
            iterable.forEach(list::add);
            list.forEach(detail -> detail.setSanPham(sanPham));
            savedDetailsRef.set(list);
            return list;
        });

        when(chiTietBaoCaoTonKhoRepository.findByMaBaoCaoTonKho(eq("BCTK001"))).thenAnswer(invocation -> savedDetailsRef.get());

        BaoCaoTonKhoResponse response = service.generate(5, 2026);

        assertEquals("BCTK001", response.getMaBaoCaoTonKho());
        assertEquals(5, response.getThang());
        assertEquals(2026, response.getNam());
        assertEquals(1, response.getChiTiet().size());
        assertEquals("SP001", response.getChiTiet().get(0).getMaSanPham());
        assertEquals("Nhan vang", response.getChiTiet().get(0).getTenSanPham());
        assertEquals("Chi", response.getChiTiet().get(0).getTenDonViTinh());
        assertEquals(14, response.getChiTiet().get(0).getTonDau());
        assertEquals(10, response.getChiTiet().get(0).getSoLuongMuaVao());
        assertEquals(4, response.getChiTiet().get(0).getSoLuongBanRa());
        assertEquals(20, response.getChiTiet().get(0).getTonCuoi());
    }
}
