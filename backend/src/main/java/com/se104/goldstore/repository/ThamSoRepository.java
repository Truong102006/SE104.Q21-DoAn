package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ThamSo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThamSoRepository extends JpaRepository<ThamSo, String> {

    boolean existsByTenThamSoIgnoreCase(String tenThamSo);

    boolean existsByTenThamSoIgnoreCaseAndMaThamSoNot(String tenThamSo, String maThamSo);

    List<ThamSo> findByTenThamSoContainingIgnoreCase(String tenThamSo);

    Optional<ThamSo> findTopByMaThamSoStartingWithOrderByMaThamSoDesc(String prefix);
}
