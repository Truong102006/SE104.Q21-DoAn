package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietPhieuMua;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietPhieuMuaRepository extends JpaRepository<ChiTietPhieuMua, ChiTietPhieuMua.ChiTietPhieuMuaId> {

    boolean existsByMaDonViTinh(String maDonViTinh);

    boolean existsByMaSanPham(String maSanPham);

    List<ChiTietPhieuMua> findBySoPhieuMua(String soPhieuMua);
}
