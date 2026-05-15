package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhieuBanHang;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhieuBanHangRepository extends JpaRepository<PhieuBanHang, String> {

    List<PhieuBanHang> findBySoPhieuBanContainingIgnoreCase(String soPhieuBan);

    Optional<PhieuBanHang> findTopBySoPhieuBanStartingWithOrderBySoPhieuBanDesc(String prefix);
}
