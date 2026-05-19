package com.se104.goldstore.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.se104.goldstore.dto.response.ApiError;
import com.se104.goldstore.dto.response.ApiResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
        jakarta.servlet.http.HttpServletRequest request,
        jakarta.servlet.http.HttpServletResponse response,
        AuthenticationException authException
    ) throws IOException {
        response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Object> body = ApiResponse.failure(
            "Unauthorized",
            List.of(new ApiError("auth", "Ban chua dang nhap hoac token khong hop le"))
        );
        objectMapper.writeValue(response.getWriter(), body);
    }
}
