package com.se104.goldstore.controller;

import com.se104.goldstore.dto.request.AuthLoginRequest;
import com.se104.goldstore.dto.response.ApiResponse;
import com.se104.goldstore.dto.response.AuthLoginResponse;
import com.se104.goldstore.dto.response.AuthMeResponse;
import com.se104.goldstore.exception.UnauthorizedException;
import com.se104.goldstore.service.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthLoginResponse>> login(@Valid @RequestBody AuthLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Dang nhap thanh cong", authService.login(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Dang xuat thanh cong", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthMeResponse>> me(Principal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Ban chua dang nhap");
        }
        return ResponseEntity.ok(ApiResponse.success("Lay thong tin nguoi dung thanh cong", authService.me(principal.getName())));
    }
}
