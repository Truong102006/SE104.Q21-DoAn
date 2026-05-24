package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhieuMuaHang;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PhieuMuaHangRepository extends JpaRepository<PhieuMuaHang, String> {

    @Query(
        """
        SELECT pm FROM PhieuMuaHang pm
        LEFT JOIN FETCH pm.nhaCungCap ncc
        WHERE (:keyword = '' OR LOWER(pm.soPhieuMua) LIKE CONCAT('%', LOWER(:keyword), '%')
            OR LOWER(ncc.tenNhaCungCap) LIKE CONCAT('%', LOWER(:keyword), '%'))
        """
    )
    Page<PhieuMuaHang> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query(
        """
        SELECT pm FROM PhieuMuaHang pm
        LEFT JOIN FETCH pm.nhaCungCap ncc
        WHERE (:keyword = '' OR LOWER(pm.soPhieuMua) LIKE CONCAT('%', LOWER(:keyword), '%')
            OR LOWER(ncc.tenNhaCungCap) LIKE CONCAT('%', LOWER(:keyword), '%'))
        """
    )
    List<PhieuMuaHang> findAllByKeyword(@Param("keyword") String keyword);

    boolean existsByMaNhaCungCap(String maNhaCungCap);

    Optional<PhieuMuaHang> findTopBySoPhieuMuaStartingWithOrderBySoPhieuMuaDesc(String prefix);
}
