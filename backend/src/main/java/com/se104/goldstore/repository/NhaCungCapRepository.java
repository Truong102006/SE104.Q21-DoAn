package com.se104.goldstore.repository;

import com.se104.goldstore.entity.NhaCungCap;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, String> {

    boolean existsByTenNhaCungCapIgnoreCase(String tenNhaCungCap);

    boolean existsByTenNhaCungCapIgnoreCaseAndMaNhaCungCapNot(String tenNhaCungCap, String maNhaCungCap);

    boolean existsBySoDienThoai(String soDienThoai);

    boolean existsBySoDienThoaiAndMaNhaCungCapNot(String soDienThoai, String maNhaCungCap);

    List<NhaCungCap> findByTenNhaCungCapContainingIgnoreCase(String tenNhaCungCap);

    Optional<NhaCungCap> findTopByMaNhaCungCapStartingWithOrderByMaNhaCungCapDesc(String prefix);
}
