package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhieuBanHang;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PhieuBanHangRepository extends JpaRepository<PhieuBanHang, String> {

    @Query(
        """
        SELECT pb FROM PhieuBanHang pb
        LEFT JOIN pb.khachHang kh
        WHERE (:keyword = '' OR LOWER(pb.soPhieuBan) LIKE CONCAT('%', LOWER(:keyword), '%')
            OR LOWER(kh.tenKhachHang) LIKE CONCAT('%', LOWER(:keyword), '%'))
        """
    )
    List<PhieuBanHang> findByKeyword(@Param("keyword") String keyword);

    boolean existsByMaKhachHang(String maKhachHang);

    Optional<PhieuBanHang> findTopBySoPhieuBanStartingWithOrderBySoPhieuBanDesc(String prefix);
}
