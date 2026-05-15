package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhieuDichVu;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhieuDichVuRepository extends JpaRepository<PhieuDichVu, String> {

    List<PhieuDichVu> findBySoPhieuDichVuContainingIgnoreCase(String soPhieuDichVu);

    Optional<PhieuDichVu> findTopBySoPhieuDichVuStartingWithOrderBySoPhieuDichVuDesc(String prefix);
}
