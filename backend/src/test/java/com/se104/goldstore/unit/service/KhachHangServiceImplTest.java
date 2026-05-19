package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.KhachHangRequest;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.KhachHangRepository;
import com.se104.goldstore.repository.PhieuBanHangRepository;
import com.se104.goldstore.repository.PhieuDichVuRepository;
import com.se104.goldstore.service.impl.KhachHangServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class KhachHangServiceImplTest {

    @Mock
    private KhachHangRepository khachHangRepository;

    @Mock
    private PhieuBanHangRepository phieuBanHangRepository;

    @Mock
    private PhieuDichVuRepository phieuDichVuRepository;

    private KhachHangServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new KhachHangServiceImpl(khachHangRepository, phieuBanHangRepository, phieuDichVuRepository);
    }

    @Test
    void createShouldThrowWhenDuplicateNameAndPhone() {
        KhachHangRequest request = new KhachHangRequest();
        request.setTenKhachHang("Nguyen Van A");
        request.setSoDienThoaiKhachHang("0901234567");

        when(khachHangRepository.existsByTenKhachHangIgnoreCaseAndSoDienThoaiKhachHang("Nguyen Van A", "0901234567"))
            .thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request));
    }

    @Test
    void createShouldThrowWhenPhoneDuplicate() {
        KhachHangRequest request = new KhachHangRequest();
        request.setTenKhachHang("Nguyen Van B");
        request.setSoDienThoaiKhachHang("0901234567");

        when(khachHangRepository.existsByTenKhachHangIgnoreCaseAndSoDienThoaiKhachHang("Nguyen Van B", "0901234567"))
            .thenReturn(false);
        when(khachHangRepository.existsBySoDienThoaiKhachHang("0901234567")).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request));
    }
}
