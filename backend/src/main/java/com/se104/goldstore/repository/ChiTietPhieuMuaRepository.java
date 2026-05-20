package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietPhieuMua;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChiTietPhieuMuaRepository extends JpaRepository<ChiTietPhieuMua, ChiTietPhieuMua.ChiTietPhieuMuaId> {

    boolean existsByMaDonViTinh(String maDonViTinh);

    boolean existsByMaSanPham(String maSanPham);

    List<ChiTietPhieuMua> findBySoPhieuMua(String soPhieuMua);

    @Query(
        """
        SELECT ct.maSanPham, COALESCE(SUM(ct.soLuongMua), 0)
        FROM ChiTietPhieuMua ct
        JOIN ct.phieuMuaHang pmh
        WHERE MONTH(pmh.ngayLapPhieuMua) = :thang
          AND YEAR(pmh.ngayLapPhieuMua) = :nam
        GROUP BY ct.maSanPham
        """
    )
    List<Object[]> sumSoLuongMuaBySanPhamInMonth(@Param("thang") Integer thang, @Param("nam") Integer nam);
}
