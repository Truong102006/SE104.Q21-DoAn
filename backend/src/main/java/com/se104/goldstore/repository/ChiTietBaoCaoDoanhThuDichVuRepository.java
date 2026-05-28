package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuDichVu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietBaoCaoDoanhThuDichVuRepository extends JpaRepository<ChiTietBaoCaoDoanhThuDichVu, ChiTietBaoCaoDoanhThuDichVu.ChiTietBaoCaoDoanhThuDichVuId> {

    List<ChiTietBaoCaoDoanhThuDichVu> findByMaBaoCaoDoanhThuDv(String maBaoCaoDoanhThuDv);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.data.jpa.repository.Query("DELETE FROM ChiTietBaoCaoDoanhThuDichVu c WHERE c.maBaoCaoDoanhThuDv = :maBaoCaoDoanhThuDv")
    void deleteByMaBaoCaoDoanhThuDv(@org.springframework.data.repository.query.Param("maBaoCaoDoanhThuDv") String maBaoCaoDoanhThuDv);
}
