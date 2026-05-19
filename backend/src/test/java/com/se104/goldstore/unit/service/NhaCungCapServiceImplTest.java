package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.NhaCungCapRequest;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.repository.NhaCungCapRepository;
import com.se104.goldstore.repository.PhieuMuaHangRepository;
import com.se104.goldstore.service.impl.NhaCungCapServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class NhaCungCapServiceImplTest {

    @Mock
    private NhaCungCapRepository nhaCungCapRepository;

    @Mock
    private PhieuMuaHangRepository phieuMuaHangRepository;

    private NhaCungCapServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new NhaCungCapServiceImpl(nhaCungCapRepository, phieuMuaHangRepository);
    }

    @Test
    void createShouldThrowWhenNameDuplicate() {
        NhaCungCapRequest request = new NhaCungCapRequest();
        request.setTenNhaCungCap("Cong ty A");
        request.setSoDienThoai("0901234567");

        when(nhaCungCapRepository.existsByTenNhaCungCapIgnoreCase("Cong ty A")).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request));
    }

    @Test
    void createShouldThrowWhenPhoneDuplicate() {
        NhaCungCapRequest request = new NhaCungCapRequest();
        request.setTenNhaCungCap("Cong ty B");
        request.setSoDienThoai("0901234567");

        when(nhaCungCapRepository.existsByTenNhaCungCapIgnoreCase("Cong ty B")).thenReturn(false);
        when(nhaCungCapRepository.existsBySoDienThoai("0901234567")).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request));
    }
}
