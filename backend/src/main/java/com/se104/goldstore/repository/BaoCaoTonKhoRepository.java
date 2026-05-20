package com.se104.goldstore.repository;

import com.se104.goldstore.entity.BaoCaoTonKho;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaoCaoTonKhoRepository extends JpaRepository<BaoCaoTonKho, String> {

    List<BaoCaoTonKho> findByMaBaoCaoTonKhoContainingIgnoreCase(String maBaoCaoTonKho);

    boolean existsByThangAndNam(Integer thang, Integer nam);

    boolean existsByThangAndNamAndMaBaoCaoTonKhoNot(Integer thang, Integer nam, String maBaoCaoTonKho);

    Optional<BaoCaoTonKho> findTopByMaBaoCaoTonKhoStartingWithOrderByMaBaoCaoTonKhoDesc(String prefix);

    Optional<BaoCaoTonKho> findByThangAndNam(Integer thang, Integer nam);
}
