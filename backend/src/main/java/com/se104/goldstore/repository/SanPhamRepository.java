package com.se104.goldstore.repository;

import com.se104.goldstore.entity.SanPham;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SanPhamRepository extends JpaRepository<SanPham, String> {

    List<SanPham> findByTenSanPhamContainingIgnoreCase(String tenSanPham);

    Optional<SanPham> findTopByMaSanPhamStartingWithOrderByMaSanPhamDesc(String prefix);

    boolean existsByMaLoaiSanPham(String maLoaiSanPham);

    boolean existsByMaDonViTinh(String maDonViTinh);
}
