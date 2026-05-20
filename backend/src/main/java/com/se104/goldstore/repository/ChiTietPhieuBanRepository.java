package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietPhieuBan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietPhieuBanRepository extends JpaRepository<ChiTietPhieuBan, ChiTietPhieuBan.ChiTietPhieuBanId> {

    boolean existsByMaSanPham(String maSanPham);

    List<ChiTietPhieuBan> findBySoPhieuBan(String soPhieuBan);
}
