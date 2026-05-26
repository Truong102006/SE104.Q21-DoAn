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

    List<ChiTietPhieuMua> findBySoPhieuMuaIn(java.util.Collection<String> soPhieuMuas);

    @Query(
        """
        SELECT ct
        FROM ChiTietPhieuMua ct
        JOIN FETCH ct.phieuMuaHang pmh
        LEFT JOIN FETCH pmh.nhaCungCap
        WHERE ct.maSanPham = :maSanPham
          AND MONTH(pmh.ngayLapPhieuMua) = :thang
          AND YEAR(pmh.ngayLapPhieuMua) = :nam
        """
    )
    List<ChiTietPhieuMua> findDrillDown(
        @Param("maSanPham") String maSanPham,
        @Param("thang") Integer thang,
        @Param("nam") Integer nam
    );

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
