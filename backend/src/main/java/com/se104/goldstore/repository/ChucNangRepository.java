package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChucNang;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChucNangRepository extends JpaRepository<ChucNang, String> {

    boolean existsByTenChucNangIgnoreCase(String tenChucNang);

    boolean existsByTenChucNangIgnoreCaseAndMaChucNangNot(String tenChucNang, String maChucNang);

    List<ChucNang> findByTenChucNangContainingIgnoreCase(String tenChucNang);

    Optional<ChucNang> findTopByMaChucNangStartingWithOrderByMaChucNangDesc(String prefix);
}
