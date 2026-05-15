package com.se104.goldstore.repository;

import com.se104.goldstore.entity.NhomNguoiDung;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhomNguoiDungRepository extends JpaRepository<NhomNguoiDung, String> {

    boolean existsByTenNhomIgnoreCase(String tenNhom);

    boolean existsByTenNhomIgnoreCaseAndMaNhomNot(String tenNhom, String maNhom);

    List<NhomNguoiDung> findByTenNhomContainingIgnoreCase(String tenNhom);

    Optional<NhomNguoiDung> findTopByMaNhomStartingWithOrderByMaNhomDesc(String prefix);
}
