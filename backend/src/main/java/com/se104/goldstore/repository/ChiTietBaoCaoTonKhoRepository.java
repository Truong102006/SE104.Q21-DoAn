package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietBaoCaoTonKho;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietBaoCaoTonKhoRepository extends JpaRepository<ChiTietBaoCaoTonKho, ChiTietBaoCaoTonKho.ChiTietBaoCaoTonKhoId> {

    boolean existsByMaSanPham(String maSanPham);

    List<ChiTietBaoCaoTonKho> findByMaBaoCaoTonKho(String maBaoCaoTonKho);

    void deleteByMaBaoCaoTonKho(String maBaoCaoTonKho);
}
