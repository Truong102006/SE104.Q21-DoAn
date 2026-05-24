package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietPhieuDichVu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChiTietPhieuDichVuRepository extends JpaRepository<ChiTietPhieuDichVu, ChiTietPhieuDichVu.ChiTietPhieuDichVuId> {

    boolean existsByMaLoaiDichVu(String maLoaiDichVu);

    List<ChiTietPhieuDichVu> findBySoPhieuDichVu(String soPhieuDichVu);

    List<ChiTietPhieuDichVu> findBySoPhieuDichVuIn(java.util.Collection<String> soPhieuDichVus);

    @Query(
        """
        SELECT ct
        FROM ChiTietPhieuDichVu ct
        JOIN FETCH ct.phieuDichVu pdv
        LEFT JOIN FETCH pdv.khachHang
        WHERE ct.maLoaiDichVu = :maLoaiDichVu
          AND MONTH(pdv.ngayLapPhieuDichVu) = :thang
          AND YEAR(pdv.ngayLapPhieuDichVu) = :nam
        """
    )
    List<ChiTietPhieuDichVu> findDrillDown(
        @Param("maLoaiDichVu") String maLoaiDichVu,
        @Param("thang") Integer thang,
        @Param("nam") Integer nam
    );

    @Query(
        """
        SELECT ct.maLoaiDichVu, COALESCE(SUM(ct.thanhTien), 0)
        FROM ChiTietPhieuDichVu ct
        JOIN ct.phieuDichVu pdv
        WHERE MONTH(pdv.ngayLapPhieuDichVu) = :thang
          AND YEAR(pdv.ngayLapPhieuDichVu) = :nam
        GROUP BY ct.maLoaiDichVu
        """
    )
    List<Object[]> sumRevenueByLoaiDichVuInMonth(@Param("thang") Integer thang, @Param("nam") Integer nam);
}
