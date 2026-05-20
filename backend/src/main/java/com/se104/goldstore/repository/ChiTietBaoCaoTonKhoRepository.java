package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietBaoCaoTonKho;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietBaoCaoTonKhoRepository extends JpaRepository<ChiTietBaoCaoTonKho, ChiTietBaoCaoTonKho.ChiTietBaoCaoTonKhoId> {

    boolean existsByMaSanPham(String maSanPham);
}
