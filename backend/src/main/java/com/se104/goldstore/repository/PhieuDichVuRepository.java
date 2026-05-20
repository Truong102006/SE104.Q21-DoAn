package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhieuDichVu;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PhieuDichVuRepository extends JpaRepository<PhieuDichVu, String> {

    boolean existsByMaKhachHang(String maKhachHang);

    List<PhieuDichVu> findBySoPhieuDichVuContainingIgnoreCase(String soPhieuDichVu);

    Optional<PhieuDichVu> findTopBySoPhieuDichVuStartingWithOrderBySoPhieuDichVuDesc(String prefix);

    @Query(
        """
        SELECT pdv
        FROM PhieuDichVu pdv
        LEFT JOIN pdv.khachHang kh
        WHERE (:keyword = '' OR LOWER(pdv.soPhieuDichVu) LIKE CONCAT('%', :keyword, '%')
            OR LOWER(kh.tenKhachHang) LIKE CONCAT('%', :keyword, '%')
            OR LOWER(kh.soDienThoaiKhachHang) LIKE CONCAT('%', :keyword, '%'))
          AND (:status IS NULL OR pdv.tinhTrangDichVu = :status)
          AND (:fromDate IS NULL OR pdv.ngayLapPhieuDichVu >= :fromDate)
          AND (:toDate IS NULL OR pdv.ngayLapPhieuDichVu <= :toDate)
        """
    )
    Page<PhieuDichVu> search(
        @Param("keyword") String keyword,
        @Param("status") String status,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        Pageable pageable
    );
}
