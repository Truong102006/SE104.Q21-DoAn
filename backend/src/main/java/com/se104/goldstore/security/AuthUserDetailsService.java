package com.se104.goldstore.security;

import com.se104.goldstore.entity.NguoiDung;
import com.se104.goldstore.repository.NguoiDungRepository;
import com.se104.goldstore.repository.PhanQuyenRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthUserDetailsService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PhanQuyenRepository phanQuyenRepository;

    public AuthUserDetailsService(
        NguoiDungRepository nguoiDungRepository,
        PhanQuyenRepository phanQuyenRepository
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.phanQuyenRepository = phanQuyenRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedUsername = normalizeUsername(username);
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(normalizedUsername)
            .orElseThrow(() -> new UsernameNotFoundException("Khong tim thay nguoi dung"));

        String roleCode = normalizeRoleCode(nguoiDung.getMaNhom());
        List<String> roles = List.of(roleCode);
        List<String> permissions = phanQuyenRepository.findByMaNhom(roleCode).stream()
            .map(phanQuyen -> phanQuyen.getMaChucNang())
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(value -> value.toUpperCase(Locale.ROOT))
            .distinct()
            .sorted()
            .toList();

        Set<GrantedAuthority> authorities = new LinkedHashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleCode));
        permissions.forEach(permission -> authorities.add(new SimpleGrantedAuthority("PERM_" + permission)));

        return new AuthUserPrincipal(
            nguoiDung.getTenDangNhap(),
            nguoiDung.getMatKhau(),
            roleCode,
            roles,
            permissions,
            authorities
        );
    }

    private String normalizeUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new UsernameNotFoundException("Ten dang nhap khong hop le");
        }
        return username.trim();
    }

    private String normalizeRoleCode(String groupCode) {
        if (groupCode == null || groupCode.isBlank()) {
            throw new UsernameNotFoundException("Nguoi dung chua duoc gan nhom quyen");
        }
        String normalized = groupCode.trim().toUpperCase(Locale.ROOT);
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring(5);
        }
        return normalized;
    }
}
