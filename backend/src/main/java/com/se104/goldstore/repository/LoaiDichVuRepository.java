package com.se104.goldstore.repository;

import com.se104.goldstore.entity.LoaiDichVu;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoaiDichVuRepository extends JpaRepository<LoaiDichVu, String> {

    boolean existsByTenLoaiDichVuIgnoreCase(String tenLoaiDichVu);

    boolean existsByTenLoaiDichVuIgnoreCaseAndMaLoaiDichVuNot(String tenLoaiDichVu, String maLoaiDichVu);

    List<LoaiDichVu> findByTenLoaiDichVuContainingIgnoreCase(String tenLoaiDichVu);

    Optional<LoaiDichVu> findTopByMaLoaiDichVuStartingWithOrderByMaLoaiDichVuDesc(String prefix);
}
