package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.PhieuDichVuRequest;
import com.se104.goldstore.dto.response.PhieuDichVuResponse;
import com.se104.goldstore.entity.ChiTietPhieuDichVu;
import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.entity.LoaiDichVu;
import com.se104.goldstore.entity.PhieuDichVu;
import com.se104.goldstore.entity.ThamSo;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.ChiTietPhieuDichVuRepository;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.LoaiDichVuRepository;
import com.se104.goldstore.repository.PhieuDichVuRepository;
import com.se104.goldstore.repository.ThamSoRepository;
import com.se104.goldstore.service.impl.PhieuDichVuServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class PhieuDichVuServiceImplTest {

    @Mock
    private PhieuDichVuRepository phieuDichVuRepository;

    @Mock
    private ChiTietPhieuDichVuRepository chiTietPhieuDichVuRepository;

    @Mock
    private KhachHangRepository khachHangRepository;

    @Mock
    private LoaiDichVuRepository loaiDichVuRepository;

    @Mock
    private ThamSoRepository thamSoRepository;

    private PhieuDichVuServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new PhieuDichVuServiceImpl(
            phieuDichVuRepository,
            chiTietPhieuDichVuRepository,
            khachHangRepository,
            loaiDichVuRepository,
            thamSoRepository
        );
    }

    @Test
    void createShouldThrowWhenPrepaymentBelowMinimumRate() {
        PhieuDichVuRequest.ItemRequest item = new PhieuDichVuRequest.ItemRequest();
        item.setMaLoaiDichVu("LDV001");
        item.setSoLuongDichVu(2);
        item.setTienTraTruoc(new BigDecimal("90000"));

        PhieuDichVuRequest request = new PhieuDichVuRequest();
        request.setNgayLapPhieuDichVu(LocalDate.of(2026, 5, 20));
        request.setMaKhachHang("KH001");
        request.setItems(List.of(item));

        KhachHang khachHang = new KhachHang();
        khachHang.setMaKhachHang("KH001");

        LoaiDichVu loaiDichVu = new LoaiDichVu();
        loaiDichVu.setMaLoaiDichVu("LDV001");
        loaiDichVu.setTenLoaiDichVu("Gia cong");
        loaiDichVu.setDonGiaDichVu(new BigDecimal("100000"));

        ThamSo thamSo = new ThamSo();
        thamSo.setTenThamSo("SERVICE_PREPAYMENT_RATE");
        thamSo.setGiaTri(new BigDecimal("50"));

        when(khachHangRepository.findById("KH001")).thenReturn(Optional.of(khachHang));
        when(phieuDichVuRepository.findTopBySoPhieuDichVuStartingWithOrderBySoPhieuDichVuDesc("DV")).thenReturn(Optional.empty());
        when(phieuDichVuRepository.existsById("DV001")).thenReturn(false);
        when(loaiDichVuRepository.findById("LDV001")).thenReturn(Optional.of(loaiDichVu));
        when(thamSoRepository.findByTenThamSoIgnoreCase("SERVICE_PREPAYMENT_RATE")).thenReturn(Optional.of(thamSo));

        assertThrows(BusinessException.class, () -> service.create(request));
    }

    @Test
    void createShouldValidateUpdatedPrepaymentRateToSixtyPercent() {
        PhieuDichVuRequest.ItemRequest item = new PhieuDichVuRequest.ItemRequest();
        item.setMaLoaiDichVu("LDV001");
        item.setSoLuongDichVu(1);
        item.setTienTraTruoc(new BigDecimal("55000"));

        PhieuDichVuRequest request = new PhieuDichVuRequest();
        request.setNgayLapPhieuDichVu(LocalDate.of(2026, 5, 20));
        request.setMaKhachHang("KH001");
        request.setItems(List.of(item));

        KhachHang khachHang = new KhachHang();
        khachHang.setMaKhachHang("KH001");

        LoaiDichVu loaiDichVu = new LoaiDichVu();
        loaiDichVu.setMaLoaiDichVu("LDV001");
        loaiDichVu.setTenLoaiDichVu("Gia cong");
        loaiDichVu.setDonGiaDichVu(new BigDecimal("100000"));

        ThamSo thamSo = new ThamSo();
        thamSo.setTenThamSo("SERVICE_PREPAYMENT_RATE");
        thamSo.setGiaTri(new BigDecimal("60"));

        when(khachHangRepository.findById("KH001")).thenReturn(Optional.of(khachHang));
        when(phieuDichVuRepository.findTopBySoPhieuDichVuStartingWithOrderBySoPhieuDichVuDesc("DV")).thenReturn(Optional.empty());
        when(phieuDichVuRepository.existsById("DV001")).thenReturn(false);
        when(loaiDichVuRepository.findById("LDV001")).thenReturn(Optional.of(loaiDichVu));
        when(thamSoRepository.findByTenThamSoIgnoreCase("SERVICE_PREPAYMENT_RATE")).thenReturn(Optional.of(thamSo));

        assertThrows(BusinessException.class, () -> service.create(request));
    }

    @Test
    void deliverItemShouldSetRemainingToZero() {
        KhachHang khachHang = buildKhachHang("KH001");
        PhieuDichVu voucher = buildVoucher("DV001", "KH001");
        ChiTietPhieuDichVu detail = buildDetail("DV001", "LDV001", 1, "120000", "60000", "60000", "Chua giao");
        LoaiDichVu loaiDichVu = buildLoaiDichVu("LDV001", "Can thu vang", "100000");

        when(phieuDichVuRepository.findById("DV001")).thenReturn(Optional.of(voucher));
        when(chiTietPhieuDichVuRepository.findById(any(ChiTietPhieuDichVu.ChiTietPhieuDichVuId.class)))
            .thenReturn(Optional.of(detail));
        when(chiTietPhieuDichVuRepository.save(any(ChiTietPhieuDichVu.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(chiTietPhieuDichVuRepository.findBySoPhieuDichVu("DV001")).thenReturn(List.of(detail));
        when(phieuDichVuRepository.save(any(PhieuDichVu.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(khachHangRepository.findById("KH001")).thenReturn(Optional.of(khachHang));
        when(loaiDichVuRepository.findAllById(anyIterable())).thenReturn(List.of(loaiDichVu));

        PhieuDichVuResponse response = service.deliverItem("DV001", "LDV001", LocalDate.of(2026, 5, 20));

        assertEquals(new BigDecimal("120000.00"), detail.getTienTraTruoc());
        assertEquals(new BigDecimal("0.00"), detail.getTienConLai());
        assertEquals("Da giao", detail.getTinhTrang());
        assertEquals(new BigDecimal("0.00"), response.getItems().get(0).getTienConLai());
    }

    @Test
    void deliverAllShouldMarkTicketCompletedWhenAllItemsDelivered() {
        KhachHang khachHang = buildKhachHang("KH002");
        PhieuDichVu voucher = buildVoucher("DV002", "KH002");
        ChiTietPhieuDichVu detail1 = buildDetail("DV002", "LDV001", 1, "100000", "50000", "50000", "Chua giao");
        ChiTietPhieuDichVu detail2 = buildDetail("DV002", "LDV002", 2, "200000", "100000", "100000", "Chua giao");
        List<ChiTietPhieuDichVu> details = new ArrayList<>(List.of(detail1, detail2));

        LoaiDichVu loaiDichVu1 = buildLoaiDichVu("LDV001", "Can thu vang", "100000");
        LoaiDichVu loaiDichVu2 = buildLoaiDichVu("LDV002", "Gia cong nu trang", "80000");

        when(phieuDichVuRepository.findById("DV002")).thenReturn(Optional.of(voucher));
        when(chiTietPhieuDichVuRepository.findBySoPhieuDichVu("DV002")).thenReturn(details);
        when(chiTietPhieuDichVuRepository.saveAll(anyIterable())).thenAnswer(invocation -> {
            Iterable<ChiTietPhieuDichVu> iterable = invocation.getArgument(0);
            List<ChiTietPhieuDichVu> result = new ArrayList<>();
            iterable.forEach(result::add);
            return result;
        });
        when(phieuDichVuRepository.save(any(PhieuDichVu.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(khachHangRepository.findById("KH002")).thenReturn(Optional.of(khachHang));
        when(loaiDichVuRepository.findAllById(anyIterable())).thenReturn(List.of(loaiDichVu1, loaiDichVu2));

        PhieuDichVuResponse response = service.deliverAll("DV002", LocalDate.of(2026, 5, 20));

        assertEquals("Hoan thanh", voucher.getTinhTrangDichVu());
        assertEquals(new BigDecimal("0.00"), voucher.getTongTienConLai());
        assertEquals("Hoan thanh", response.getTinhTrangDichVu());
        assertEquals(2, response.getItems().stream().filter(item -> "Da giao".equals(item.getTinhTrang())).count());
    }

    private KhachHang buildKhachHang(String maKhachHang) {
        KhachHang khachHang = new KhachHang();
        khachHang.setMaKhachHang(maKhachHang);
        khachHang.setTenKhachHang("Nguyen Van A");
        khachHang.setSoDienThoaiKhachHang("0901234567");
        khachHang.setDiaChiKhachHang("TP HCM");
        return khachHang;
    }

    private PhieuDichVu buildVoucher(String soPhieuDichVu, String maKhachHang) {
        PhieuDichVu voucher = new PhieuDichVu();
        voucher.setSoPhieuDichVu(soPhieuDichVu);
        voucher.setNgayLapPhieuDichVu(LocalDate.of(2026, 5, 20));
        voucher.setMaKhachHang(maKhachHang);
        voucher.setTongTien(BigDecimal.ZERO.setScale(2));
        voucher.setTongTienTraTruoc(BigDecimal.ZERO.setScale(2));
        voucher.setTongTienConLai(BigDecimal.ZERO.setScale(2));
        voucher.setTinhTrangDichVu("Chua hoan thanh");
        return voucher;
    }

    private ChiTietPhieuDichVu buildDetail(
        String soPhieuDichVu,
        String maLoaiDichVu,
        Integer soLuong,
        String donGiaDuocTinh,
        String tienTraTruoc,
        String tienConLai,
        String tinhTrang
    ) {
        ChiTietPhieuDichVu detail = new ChiTietPhieuDichVu();
        detail.setSoPhieuDichVu(soPhieuDichVu);
        detail.setMaLoaiDichVu(maLoaiDichVu);
        detail.setSoLuongDichVu(soLuong);
        detail.setDonGiaDuocTinh(new BigDecimal(donGiaDuocTinh));
        BigDecimal thanhTien = new BigDecimal(donGiaDuocTinh)
            .multiply(BigDecimal.valueOf(soLuong.longValue()))
            .setScale(2);
        detail.setThanhTien(thanhTien);
        detail.setTienTraTruoc(new BigDecimal(tienTraTruoc).setScale(2));
        detail.setTienConLai(new BigDecimal(tienConLai).setScale(2));
        detail.setTinhTrang(tinhTrang);
        return detail;
    }

    private LoaiDichVu buildLoaiDichVu(String maLoaiDichVu, String tenLoaiDichVu, String donGiaDichVu) {
        LoaiDichVu loaiDichVu = new LoaiDichVu();
        loaiDichVu.setMaLoaiDichVu(maLoaiDichVu);
        loaiDichVu.setTenLoaiDichVu(tenLoaiDichVu);
        loaiDichVu.setDonGiaDichVu(new BigDecimal(donGiaDichVu));
        return loaiDichVu;
    }
}
