package com.se104.goldstore.repository;

import com.se104.goldstore.entity.DonViTinh;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonViTinhRepository extends JpaRepository<DonViTinh, String> {

    boolean existsByTenDonViTinhIgnoreCase(String tenDonViTinh);

    boolean existsByTenDonViTinhIgnoreCaseAndMaDonViTinhNot(String tenDonViTinh, String maDonViTinh);

    List<DonViTinh> findByTenDonViTinhContainingIgnoreCase(String tenDonViTinh);

    Optional<DonViTinh> findTopByMaDonViTinhStartingWithOrderByMaDonViTinhDesc(String prefix);
}
