package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietBaoCaoDoanhThuSanPham;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietBaoCaoDoanhThuSanPhamRepository extends JpaRepository<ChiTietBaoCaoDoanhThuSanPham, ChiTietBaoCaoDoanhThuSanPham.ChiTietBaoCaoDoanhThuSanPhamId> {

    boolean existsByMaSanPham(String maSanPham);

    List<ChiTietBaoCaoDoanhThuSanPham> findByMaBaoCaoDoanhThuSp(String maBaoCaoDoanhThuSp);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.data.jpa.repository.Query("DELETE FROM ChiTietBaoCaoDoanhThuSanPham c WHERE c.maBaoCaoDoanhThuSp = :maBaoCaoDoanhThuSp")
    void deleteByMaBaoCaoDoanhThuSp(@org.springframework.data.repository.query.Param("maBaoCaoDoanhThuSp") String maBaoCaoDoanhThuSp);
}
