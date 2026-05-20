package com.se104.goldstore.repository;

import com.se104.goldstore.entity.BaoCaoDoanhThuDichVu;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaoCaoDoanhThuDichVuRepository extends JpaRepository<BaoCaoDoanhThuDichVu, String> {

    List<BaoCaoDoanhThuDichVu> findByMaBaoCaoDoanhThuDvContainingIgnoreCase(String maBaoCaoDoanhThuDv);

    boolean existsByThangAndNam(Integer thang, Integer nam);

    boolean existsByThangAndNamAndMaBaoCaoDoanhThuDvNot(Integer thang, Integer nam, String maBaoCaoDoanhThuDv);

    Optional<BaoCaoDoanhThuDichVu> findTopByMaBaoCaoDoanhThuDvStartingWithOrderByMaBaoCaoDoanhThuDvDesc(String prefix);

    Optional<BaoCaoDoanhThuDichVu> findByThangAndNam(Integer thang, Integer nam);
}
