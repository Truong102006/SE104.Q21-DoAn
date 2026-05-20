package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuDichVu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietBaoCaoDoanhThuDichVuRepository extends JpaRepository<ChiTietBaoCaoDoanhThuDichVu, ChiTietBaoCaoDoanhThuDichVu.ChiTietBaoCaoDoanhThuDichVuId> {

    List<ChiTietBaoCaoDoanhThuDichVu> findByMaBaoCaoDoanhThuDv(String maBaoCaoDoanhThuDv);

    void deleteByMaBaoCaoDoanhThuDv(String maBaoCaoDoanhThuDv);
}
