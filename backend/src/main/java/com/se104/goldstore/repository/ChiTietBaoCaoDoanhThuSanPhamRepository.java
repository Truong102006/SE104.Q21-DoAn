package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuSanPham;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietBaoCaoDoanhThuSanPhamRepository extends JpaRepository<ChiTietBaoCaoDoanhThuSanPham, ChiTietBaoCaoDoanhThuSanPham.ChiTietBaoCaoDoanhThuSanPhamId> {

    boolean existsByMaSanPham(String maSanPham);
}
