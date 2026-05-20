package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuSanPham;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietBaoCaoDoanhThuSanPhamRepository extends JpaRepository<ChiTietBaoCaoDoanhThuSanPham, ChiTietBaoCaoDoanhThuSanPham.ChiTietBaoCaoDoanhThuSanPhamId> {

    boolean existsByMaSanPham(String maSanPham);

    List<ChiTietBaoCaoDoanhThuSanPham> findByMaBaoCaoDoanhThuSp(String maBaoCaoDoanhThuSp);

    void deleteByMaBaoCaoDoanhThuSp(String maBaoCaoDoanhThuSp);
}
