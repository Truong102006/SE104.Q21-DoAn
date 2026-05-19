package com.se104.goldstore.unit.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.se104.goldstore.controller.AuthController;
import com.se104.goldstore.dto.response.AuthLoginResponse;
import com.se104.goldstore.dto.response.AuthMeResponse;
import com.se104.goldstore.exception.GlobalExceptionHandler;
import com.se104.goldstore.service.AuthService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders
            .standaloneSetup(new AuthController(authService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void loginShouldReturnTokenAndUserInfo() throws Exception {
        AuthLoginResponse response = new AuthLoginResponse();
        response.setAccessToken("jwt-token");
        response.setTokenType("Bearer");
        response.setUsername("admin");
        response.setGroupCode("ADMIN");
        response.setRoles(List.of("ADMIN"));
        response.setPermissions(List.of("QL_BC", "QL_ND"));

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "admin",
                      "password": "admin123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.accessToken").value("jwt-token"))
            .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.data.username").value("admin"))
            .andExpect(jsonPath("$.data.groupCode").value("ADMIN"));
    }

    @Test
    void meShouldReturnCurrentUserInfo() throws Exception {
        AuthMeResponse response = new AuthMeResponse();
        response.setUsername("admin");
        response.setGroupCode("ADMIN");
        response.setRoles(List.of("ADMIN"));
        response.setPermissions(List.of("QL_BC", "QL_ND"));

        when(authService.me("admin")).thenReturn(response);

        mockMvc.perform(get("/api/auth/me").principal(() -> "admin"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.username").value("admin"))
            .andExpect(jsonPath("$.data.groupCode").value("ADMIN"));
    }
}
