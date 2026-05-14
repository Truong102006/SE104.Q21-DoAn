package com.se104.goldstore.repository;

import com.se104.goldstore.entity.LoaiSanPham;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoaiSanPhamRepository extends JpaRepository<LoaiSanPham, String> {

    boolean existsByTenLoaiSanPhamIgnoreCase(String tenLoaiSanPham);

    boolean existsByTenLoaiSanPhamIgnoreCaseAndMaLoaiSanPhamNot(String tenLoaiSanPham, String maLoaiSanPham);

    List<LoaiSanPham> findByTenLoaiSanPhamContainingIgnoreCase(String tenLoaiSanPham);

    Optional<LoaiSanPham> findTopByMaLoaiSanPhamStartingWithOrderByMaLoaiSanPhamDesc(String prefix);
}
