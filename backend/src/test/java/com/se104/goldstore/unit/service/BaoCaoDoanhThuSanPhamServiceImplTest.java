package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.response.BaoCaoDoanhThuSanPhamResponse;
import com.se104.goldstore.entity.BaoCaoDoanhThuSanPham;
import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuSanPham;
import com.se104.goldstore.entity.SanPham;
import com.se104.goldstore.repository.BaoCaoDoanhThuSanPhamRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoDoanhThuSanPhamRepository;
import com.se104.goldstore.repository.ChiTietPhieuBanRepository;
import com.se104.goldstore.repository.SanPhamRepository;
import com.se104.goldstore.service.impl.BaoCaoDoanhThuSanPhamServiceImpl;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class BaoCaoDoanhThuSanPhamServiceImplTest {

    @Mock
    private BaoCaoDoanhThuSanPhamRepository baoCaoDoanhThuSanPhamRepository;

    @Mock
    private ChiTietBaoCaoDoanhThuSanPhamRepository chiTietBaoCaoDoanhThuSanPhamRepository;

    @Mock
    private ChiTietPhieuBanRepository chiTietPhieuBanRepository;

    @Mock
    private SanPhamRepository sanPhamRepository;

    private BaoCaoDoanhThuSanPhamServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new BaoCaoDoanhThuSanPhamServiceImpl(
            baoCaoDoanhThuSanPhamRepository,
            chiTietBaoCaoDoanhThuSanPhamRepository,
            chiTietPhieuBanRepository,
            sanPhamRepository
        );
    }

    @Test
    void generateShouldCalculateRevenueRatioAndQuantityForProducts() {
        SanPham sp1 = new SanPham();
        sp1.setMaSanPham("SP001");
        sp1.setTenSanPham("Nhan vang");

        SanPham sp2 = new SanPham();
        sp2.setMaSanPham("SP002");
        sp2.setTenSanPham("Day chuyen");

        AtomicReference<List<ChiTietBaoCaoDoanhThuSanPham>> savedDetailsRef = new AtomicReference<>(List.of());

        when(baoCaoDoanhThuSanPhamRepository.findByThangAndNam(5, 2026)).thenReturn(Optional.empty());
        when(baoCaoDoanhThuSanPhamRepository.findTopByMaBaoCaoDoanhThuSpStartingWithOrderByMaBaoCaoDoanhThuSpDesc("BCSP"))
            .thenReturn(Optional.empty());
        when(baoCaoDoanhThuSanPhamRepository.save(any(BaoCaoDoanhThuSanPham.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Object[]> rows = new ArrayList<>();
        rows.add(new Object[] { "SP002", 5L, new BigDecimal("500000.00") });
        rows.add(new Object[] { "SP001", 2L, new BigDecimal("150000.00") });
        when(chiTietPhieuBanRepository.sumRevenueBySanPhamInMonth(5, 2026)).thenReturn(rows);

        when(sanPhamRepository.findAllById(any())).thenReturn(List.of(sp1, sp2));

        when(chiTietBaoCaoDoanhThuSanPhamRepository.saveAll(any())).thenAnswer(invocation -> {
            Iterable<ChiTietBaoCaoDoanhThuSanPham> iterable = invocation.getArgument(0);
            List<ChiTietBaoCaoDoanhThuSanPham> list = new ArrayList<>();
            iterable.forEach(list::add);
            savedDetailsRef.set(list);
            return list;
        });
        when(chiTietBaoCaoDoanhThuSanPhamRepository.findByMaBaoCaoDoanhThuSp("BCSP001"))
            .thenAnswer(invocation -> savedDetailsRef.get());

        BaoCaoDoanhThuSanPhamResponse response = service.generate(5, 2026);

        assertEquals("BCSP001", response.getMaBaoCaoDoanhThuSp());
        assertEquals(new BigDecimal("650000.00"), response.getTongDoanhThuSanPham());
        assertEquals(2, response.getChiTiet().size());
        assertEquals("SP002", response.getChiTiet().get(0).getMaSanPham());
        assertEquals(5, response.getChiTiet().get(0).getSoLuongBan());
        assertEquals(new BigDecimal("500000.00"), response.getChiTiet().get(0).getDoanhThu());
        assertEquals(new BigDecimal("76.92"), response.getChiTiet().get(0).getTiLe());
        assertEquals("SP001", response.getChiTiet().get(1).getMaSanPham());
        assertEquals(2, response.getChiTiet().get(1).getSoLuongBan());
        assertEquals(new BigDecimal("23.08"), response.getChiTiet().get(1).getTiLe());
    }
}
