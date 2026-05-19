package com.se104.goldstore.service.impl;

import com.se104.goldstore.dto.request.AuthLoginRequest;
import com.se104.goldstore.dto.response.AuthLoginResponse;
import com.se104.goldstore.dto.response.AuthMeResponse;
import com.se104.goldstore.exception.UnauthorizedException;
import com.se104.goldstore.security.AuthUserDetailsService;
import com.se104.goldstore.security.AuthUserPrincipal;
import com.se104.goldstore.security.JwtService;
import com.se104.goldstore.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthUserDetailsService authUserDetailsService;

    public AuthServiceImpl(
        AuthenticationManager authenticationManager,
        JwtService jwtService,
        AuthUserDetailsService authUserDetailsService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.authUserDetailsService = authUserDetailsService;
    }

    @Override
    public AuthLoginResponse login(AuthLoginRequest request) {
        String username = normalizeUsername(request.getUsername());
        String password = request.getPassword();

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            AuthUserPrincipal principal = extractPrincipal(authentication.getPrincipal(), username);
            String accessToken = jwtService.generateAccessToken(principal);

            AuthLoginResponse response = new AuthLoginResponse();
            response.setAccessToken(accessToken);
            response.setTokenType(TOKEN_TYPE);
            response.setUsername(principal.getUsername());
            response.setGroupCode(principal.getGroupCode());
            response.setRoles(principal.getRoles());
            response.setPermissions(principal.getPermissions());
            return response;
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Ten dang nhap hoac mat khau khong dung");
        }
    }

    @Override
    public AuthMeResponse me(String username) {
        String normalizedUsername = normalizeUsername(username);
        UserDetails userDetails = authUserDetailsService.loadUserByUsername(normalizedUsername);
        AuthUserPrincipal principal = extractPrincipal(userDetails, normalizedUsername);

        AuthMeResponse response = new AuthMeResponse();
        response.setUsername(principal.getUsername());
        response.setGroupCode(principal.getGroupCode());
        response.setRoles(principal.getRoles());
        response.setPermissions(principal.getPermissions());
        return response;
    }

    @Override
    public void logout() {
        // JWT stateless mode: frontend removes token at client-side.
    }

    private String normalizeUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new UnauthorizedException("Ten dang nhap khong hop le");
        }
        return username.trim();
    }

    private AuthUserPrincipal extractPrincipal(Object principalObject, String username) {
        if (principalObject instanceof AuthUserPrincipal principal) {
            return principal;
        }
        UserDetails userDetails = authUserDetailsService.loadUserByUsername(username);
        if (userDetails instanceof AuthUserPrincipal principal) {
            return principal;
        }
        throw new UnauthorizedException("Khong the xac dinh thong tin nguoi dung");
    }
}
