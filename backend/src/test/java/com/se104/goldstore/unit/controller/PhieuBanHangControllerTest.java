package com.se104.goldstore.unit.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.se104.goldstore.controller.PhieuBanHangController;
import com.se104.goldstore.exception.BusinessException;
import com.se104.goldstore.exception.GlobalExceptionHandler;
import com.se104.goldstore.service.PhieuBanHangService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PhieuBanHangControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PhieuBanHangService phieuBanHangService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders
            .standaloneSetup(new PhieuBanHangController(phieuBanHangService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void createShouldReturnBadRequestWhenSellingExceedsStock() throws Exception {
        when(phieuBanHangService.create(any()))
            .thenThrow(new BusinessException("So luong ban vuot ton kho hien tai cho san pham: SP001"));

        mockMvc.perform(post("/api/sales")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "ngayLapPhieuBan": "2026-05-20",
                      "maKhachHang": "KH001",
                      "items": [
                        {
                          "maSanPham": "SP001",
                          "soLuong": 999
                        }
                      ]
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.errors[0].field").value("business"));
    }
}
