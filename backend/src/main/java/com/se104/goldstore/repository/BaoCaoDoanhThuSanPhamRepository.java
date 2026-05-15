package com.se104.goldstore.repository;

import com.se104.goldstore.entity.BaoCaoDoanhThuSanPham;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BaoCaoDoanhThuSanPhamRepository extends JpaRepository<BaoCaoDoanhThuSanPham, String> {

    List<BaoCaoDoanhThuSanPham> findByMaBaoCaoDoanhThuSpContainingIgnoreCase(String maBaoCaoDoanhThuSp);

    boolean existsByThangAndNam(Integer thang, Integer nam);

    boolean existsByThangAndNamAndMaBaoCaoDoanhThuSpNot(Integer thang, Integer nam, String maBaoCaoDoanhThuSp);

    Optional<BaoCaoDoanhThuSanPham> findTopByMaBaoCaoDoanhThuSpStartingWithOrderByMaBaoCaoDoanhThuSpDesc(String prefix);
}
