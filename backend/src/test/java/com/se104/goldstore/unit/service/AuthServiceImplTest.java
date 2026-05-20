package com.se104.goldstore.unit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.se104.goldstore.dto.request.AuthLoginRequest;
import com.se104.goldstore.dto.response.AuthLoginResponse;
import com.se104.goldstore.exception.UnauthorizedException;
import com.se104.goldstore.security.AuthUserDetailsService;
import com.se104.goldstore.security.AuthUserPrincipal;
import com.se104.goldstore.security.JwtService;
import com.se104.goldstore.service.impl.AuthServiceImpl;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthUserDetailsService authUserDetailsService;

    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new AuthServiceImpl(authenticationManager, jwtService, authUserDetailsService);
    }

    @Test
    void loginShouldSucceedForAdmin() {
        AuthLoginRequest request = new AuthLoginRequest();
        request.setUsername("admin");
        request.setPassword("admin123");

        AuthUserPrincipal principal = new AuthUserPrincipal(
            "admin",
            "hashed",
            "ADMIN",
            List.of("ADMIN"),
            List.of("QL_BC", "QL_ND"),
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
            principal,
            null,
            principal.getAuthorities()
        );

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtService.generateAccessToken(principal)).thenReturn("jwt-admin-token");

        AuthLoginResponse response = service.login(request);

        assertEquals("jwt-admin-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("admin", response.getUsername());
        assertEquals("ADMIN", response.getGroupCode());
    }

    @Test
    void loginShouldFailWhenPasswordIncorrect() {
        AuthLoginRequest request = new AuthLoginRequest();
        request.setUsername("admin");
        request.setPassword("wrong-password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(UnauthorizedException.class, () -> service.login(request));
    }
}
