package com.se104.goldstore.unit.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.se104.goldstore.controller.BaoCaoTonKhoReportController;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.BaoCaoTonKhoResponse;
import com.se104.goldstore.service.BaoCaoTonKhoService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig(classes = BaoCaoTonKhoReportControllerSecurityTest.TestConfig.class)
class BaoCaoTonKhoReportControllerSecurityTest {

    @Autowired
    private BaoCaoTonKhoReportController controller;

    @Autowired
    private BaoCaoTonKhoService baoCaoTonKhoService;

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void adminShouldAccessInventoryReportEndpoint() {
        BaoCaoTonKhoResponse response = new BaoCaoTonKhoResponse();
        response.setMaBaoCaoTonKho("BCTK052026");
        response.setThang(5);
        response.setNam(2026);
        response.setChiTiet(List.of());
        when(baoCaoTonKhoService.getByMonthYear(5, 2026)).thenReturn(response);

        ResponseEntity<ApiResponse<BaoCaoTonKhoResponse>> result = controller.getByMonthYear(5, 2026);

        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().isSuccess()).isTrue();
        assertThat(result.getBody().getData()).isNotNull();
        assertThat(result.getBody().getData().getMaBaoCaoTonKho()).isEqualTo("BCTK052026");
    }

    @Test
    @WithMockUser(username = "staff", roles = "STAFF")
    void staffShouldBeForbiddenForAdminInventoryReportEndpoint() {
        assertThatThrownBy(() -> controller.getByMonthYear(5, 2026))
            .isInstanceOf(AccessDeniedException.class);
    }

    @Configuration
    @EnableMethodSecurity
    static class TestConfig {

        @Bean
        BaoCaoTonKhoService baoCaoTonKhoService() {
            return mock(BaoCaoTonKhoService.class);
        }

        @Bean
        BaoCaoTonKhoReportController baoCaoTonKhoReportController(BaoCaoTonKhoService baoCaoTonKhoService) {
            return new BaoCaoTonKhoReportController(baoCaoTonKhoService);
        }
    }
}
