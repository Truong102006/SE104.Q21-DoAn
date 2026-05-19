package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhieuMuaHang;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhieuMuaHangRepository extends JpaRepository<PhieuMuaHang, String> {

    boolean existsByMaNhaCungCap(String maNhaCungCap);

    List<PhieuMuaHang> findBySoPhieuMuaContainingIgnoreCase(String soPhieuMua);

    Optional<PhieuMuaHang> findTopBySoPhieuMuaStartingWithOrderBySoPhieuMuaDesc(String prefix);
}
