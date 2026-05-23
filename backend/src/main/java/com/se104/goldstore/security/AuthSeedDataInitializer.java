package com.se104.goldstore.security;

import com.se104.goldstore.entity.NguoiDung;
import com.se104.goldstore.entity.NhomNguoiDung;
import com.se104.goldstore.repository.NguoiDungRepository;
import com.se104.goldstore.repository.NhomNguoiDungRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AuthSeedDataInitializer implements ApplicationRunner {

    private final NhomNguoiDungRepository nhomNguoiDungRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${application.security.seed.admin.username:admin}")
    private String adminUsername;

    @Value("${application.security.seed.admin.password:admin123}")
    private String adminPassword;

    @Value("${application.security.seed.staff.username:staff}")
    private String staffUsername;

    @Value("${application.security.seed.staff.password:staff123}")
    private String staffPassword;

    public AuthSeedDataInitializer(
        NhomNguoiDungRepository nhomNguoiDungRepository,
        NguoiDungRepository nguoiDungRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.nhomNguoiDungRepository = nhomNguoiDungRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureGroup("ADMIN", "Quan tri vien");
        ensureGroup("STAFF", "Nhan vien");

        ensureSeedUser(adminUsername, adminPassword, "ADMIN");
        ensureSeedUser(staffUsername, staffPassword, "STAFF");
        migrateLegacyPlainPasswords();
    }

    private void ensureGroup(String maNhom, String tenNhom) {
        if (nhomNguoiDungRepository.existsById(maNhom)) {
            return;
        }
        NhomNguoiDung entity = new NhomNguoiDung();
        entity.setMaNhom(maNhom);
        entity.setTenNhom(tenNhom);
        nhomNguoiDungRepository.save(entity);
    }

    private void ensureSeedUser(String username, String rawPassword, String groupCode) {
        String normalizedUsername = normalizeRequired(username, "Tên đăng nhập mẫu không được để trống");
        String normalizedPassword = normalizeRequired(rawPassword, "Mật khẩu mẫu không được để trống");

        NguoiDung user = nguoiDungRepository.findById(normalizedUsername).orElseGet(() -> {
            NguoiDung entity = new NguoiDung();
            entity.setTenDangNhap(normalizedUsername);
            return entity;
        });

        user.setMaNhom(groupCode);
        if (user.getMatKhau() == null || user.getMatKhau().isBlank()) {
            user.setMatKhau(passwordEncoder.encode(normalizedPassword));
        } else if (!isBcryptHash(user.getMatKhau())) {
            user.setMatKhau(passwordEncoder.encode(user.getMatKhau().trim()));
        }

        nguoiDungRepository.save(user);
    }

    private void migrateLegacyPlainPasswords() {
        List<NguoiDung> users = nguoiDungRepository.findAll();
        for (NguoiDung user : users) {
            String password = user.getMatKhau();
            if (password != null && !password.isBlank() && !isBcryptHash(password)) {
                user.setMatKhau(passwordEncoder.encode(password.trim()));
                nguoiDungRepository.save(user);
            }
        }
    }

    private boolean isBcryptHash(String value) {
        return value != null && value.startsWith("$2") && value.length() == 60;
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
