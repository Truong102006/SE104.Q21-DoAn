package com.se104.goldstore.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

//Định nghĩa file cấu hình cho Spring
@Configuration
public class SecurityConfig {

    // Nơi cấu hình bảo mật cho web/API
    // Mọi rq vào BE sẽ đi qua bộ lọc này trước
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // tắt csrf để tránh lỗi khi put/post...
                .csrf(AbstractHttpConfigurer::disable)
                // tắt để spring k tự động hiện trang login
                .formLogin(AbstractHttpConfigurer::disable)
                // tắt trình duyệt popup y/c user/pass
                .httpBasic(AbstractHttpConfigurer::disable)
                // ko dùng session để lưu t.thai login
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // để tất cả api đều gọi được, k cần login
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/error").permitAll()
                        .anyRequest().permitAll());
        return http.build();
    }
}
