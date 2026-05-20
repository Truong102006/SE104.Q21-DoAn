package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietPhieuBan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChiTietPhieuBanRepository extends JpaRepository<ChiTietPhieuBan, ChiTietPhieuBan.ChiTietPhieuBanId> {

    boolean existsByMaSanPham(String maSanPham);

    List<ChiTietPhieuBan> findBySoPhieuBan(String soPhieuBan);

    @Query(
        """
        SELECT ct.maSanPham, COALESCE(SUM(ct.soLuong), 0)
        FROM ChiTietPhieuBan ct
        JOIN ct.phieuBanHang pbh
        WHERE MONTH(pbh.ngayLapPhieuBan) = :thang
          AND YEAR(pbh.ngayLapPhieuBan) = :nam
        GROUP BY ct.maSanPham
        """
    )
    List<Object[]> sumSoLuongBanBySanPhamInMonth(@Param("thang") Integer thang, @Param("nam") Integer nam);

    @Query(
        """
        SELECT ct.maSanPham, COALESCE(SUM(ct.soLuong), 0), COALESCE(SUM(ct.thanhTien), 0)
        FROM ChiTietPhieuBan ct
        JOIN ct.phieuBanHang pbh
        WHERE MONTH(pbh.ngayLapPhieuBan) = :thang
          AND YEAR(pbh.ngayLapPhieuBan) = :nam
        GROUP BY ct.maSanPham
        """
    )
    List<Object[]> sumRevenueBySanPhamInMonth(@Param("thang") Integer thang, @Param("nam") Integer nam);
}
