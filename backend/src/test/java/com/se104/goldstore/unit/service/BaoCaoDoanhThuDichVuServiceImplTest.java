package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.response.BaoCaoDoanhThuDichVuResponse;
import com.se104.goldstore.entity.BaoCaoDoanhThuDichVu;
import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuDichVu;
import com.se104.goldstore.entity.LoaiDichVu;
import com.se104.goldstore.repository.BaoCaoDoanhThuDichVuRepository;
import com.se104.goldstore.repository.ChiTietBaoCaoDoanhThuDichVuRepository;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
import com.se104.goldstore.repository.LoaiDichVuRepository;
import com.se104.goldstore.service.impl.BaoCaoDoanhThuDichVuServiceImpl;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class BaoCaoDoanhThuDichVuServiceImplTest {

    @Mock
    private BaoCaoDoanhThuDichVuRepository baoCaoDoanhThuDichVuRepository;

    @Mock
    private ChiTietBaoCaoDoanhThuDichVuRepository chiTietBaoCaoDoanhThuDichVuRepository;

    @Mock
    private ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;

    @Mock
    private LoaiDichVuRepository loaiDichVuRepository;

    private BaoCaoDoanhThuDichVuServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new BaoCaoDoanhThuDichVuServiceImpl(
            baoCaoDoanhThuDichVuRepository,
            chiTietBaoCaoDoanhThuDichVuRepository,
            chiTietPhieuDichVuRepository,
            loaiDichVuRepository
        );
    }

    @Test
    void generateShouldCalculateRevenueAndRatioForServices() {
        LoaiDichVu ldv1 = new LoaiDichVu();
        ldv1.setMaLoaiDichVu("LDV001");
        ldv1.setTenLoaiDichVu("Can thu vang");

        LoaiDichVu ldv2 = new LoaiDichVu();
        ldv2.setMaLoaiDichVu("LDV002");
        ldv2.setTenLoaiDichVu("Gia cong nu trang");

        AtomicReference<List<ChiTietBaoCaoDoanhThuDichVu>> savedDetailsRef = new AtomicReference<>(List.of());

        when(baoCaoDoanhThuDichVuRepository.findByThangAndNam(5, 2026)).thenReturn(Optional.empty());
        when(baoCaoDoanhThuDichVuRepository.findTopByMaBaoCaoDoanhThuDvStartingWithOrderByMaBaoCaoDoanhThuDvDesc("BCDV"))
            .thenReturn(Optional.empty());
        when(baoCaoDoanhThuDichVuRepository.save(any(BaoCaoDoanhThuDichVu.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Object[]> rows = new ArrayList<>();
        rows.add(new Object[] { "LDV001", new BigDecimal("300000.00") });
        rows.add(new Object[] { "LDV002", new BigDecimal("100000.00") });
        when(chiTietPhieuDichVuRepository.sumRevenueByLoaiDichVuInMonth(5, 2026)).thenReturn(rows);

        when(loaiDichVuRepository.findAllById(any())).thenReturn(List.of(ldv1, ldv2));

        when(chiTietBaoCaoDoanhThuDichVuRepository.saveAll(any())).thenAnswer(invocation -> {
            Iterable<ChiTietBaoCaoDoanhThuDichVu> iterable = invocation.getArgument(0);
            List<ChiTietBaoCaoDoanhThuDichVu> list = new ArrayList<>();
            iterable.forEach(list::add);
            savedDetailsRef.set(list);
            return list;
        });
        when(chiTietBaoCaoDoanhThuDichVuRepository.findByMaBaoCaoDoanhThuDv("BCDV001"))
            .thenAnswer(invocation -> savedDetailsRef.get());

        BaoCaoDoanhThuDichVuResponse response = service.generate(5, 2026);

        assertEquals("BCDV001", response.getMaBaoCaoDoanhThuDv());
        assertEquals(new BigDecimal("400000.00"), response.getTongDoanhThuDichVu());
        assertEquals(2, response.getChiTiet().size());
        assertEquals("LDV001", response.getChiTiet().get(0).getMaLoaiDichVu());
        assertEquals(new BigDecimal("300000.00"), response.getChiTiet().get(0).getDoanhThu());
        assertEquals(new BigDecimal("75.00"), response.getChiTiet().get(0).getTiLe());
        assertEquals("LDV002", response.getChiTiet().get(1).getMaLoaiDichVu());
        assertEquals(new BigDecimal("100000.00"), response.getChiTiet().get(1).getDoanhThu());
        assertEquals(new BigDecimal("25.00"), response.getChiTiet().get(1).getTiLe());
    }
}
