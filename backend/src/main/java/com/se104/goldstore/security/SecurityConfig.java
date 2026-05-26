package com.se104.goldstore.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ENDPOINTS = {
        "/api/auth/login",
        "/api/auth/logout",
        "/api/v1/health",
        "/swagger-ui.html",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/error"
    };

    private static final String[] ADMIN_ONLY_ENDPOINTS = {
        "/api/users/**",
        "/api/roles/**",
        "/api/settings/**",
        "/api/reports/**",
        "/api/v1/nguoi-dung/**",
        "/api/v1/nhom-nguoi-dung/**",
        "/api/v1/phan-quyen/**",
        "/api/v1/chuc-nang/**",
        "/api/v1/tham-so/**",
        "/api/v1/bao-cao-ton-kho/**",
        "/api/v1/bao-cao-doanh-thu-san-pham/**",
        "/api/v1/bao-cao-doanh-thu-dich-vu/**"
    };

    private static final String[] STAFF_OR_ADMIN_ENDPOINTS = {
        "/api/suppliers/**",
        "/api/customers/**",
        "/api/units/**",
        "/api/service-types/**",
        "/api/product-types/**",
        "/api/products/**",
        "/api/purchases/**",
        "/api/sales/**",
        "/api/service-tickets/**",
        "/api/search/**",
        "/api/v1/nha-cung-cap/**",
        "/api/v1/khach-hang/**",
        "/api/v1/don-vi-tinh/**",
        "/api/v1/loai-dich-vu/**",
        "/api/v1/loai-san-pham/**",
        "/api/v1/san-pham/**",
        "/api/v1/phieu-mua-hang/**",
        "/api/v1/phieu-ban-hang/**",
        "/api/v1/phieu-dich-vu/**"
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthUserDetailsService authUserDetailsService;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    public SecurityConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter,
        AuthUserDetailsService authUserDetailsService,
        RestAuthenticationEntryPoint restAuthenticationEntryPoint,
        RestAccessDeniedHandler restAccessDeniedHandler
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authUserDetailsService = authUserDetailsService;
        this.restAuthenticationEntryPoint = restAuthenticationEntryPoint;
        this.restAccessDeniedHandler = restAccessDeniedHandler;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(authUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(restAuthenticationEntryPoint)
                .accessDeniedHandler(restAccessDeniedHandler))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                .requestMatchers("/api/settings/service-prepayment-rate").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(ADMIN_ONLY_ENDPOINTS).hasRole("ADMIN")
                .requestMatchers(STAFF_OR_ADMIN_ENDPOINTS).hasAnyRole("ADMIN", "STAFF")
                .anyRequest().authenticated());

        return http.build();
    }
}
