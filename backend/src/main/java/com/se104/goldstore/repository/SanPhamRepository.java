package com.se104.goldstore.repository;

import com.se104.goldstore.entity.SanPham;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SanPhamRepository extends JpaRepository<SanPham, String> {

    List<SanPham> findByTenSanPhamContainingIgnoreCase(String tenSanPham);

    Optional<SanPham> findTopByMaSanPhamStartingWithOrderByMaSanPhamDesc(String prefix);

    boolean existsByMaLoaiSanPham(String maLoaiSanPham);

    boolean existsByMaDonViTinh(String maDonViTinh);

    List<SanPham> findByMaLoaiSanPham(String maLoaiSanPham);

    Optional<SanPham> findFirstByMaLoaiSanPham(String maLoaiSanPham);

    Optional<SanPham> findFirstByMaLoaiSanPhamAndMaSanPhamNot(String maLoaiSanPham, String maSanPham);

    @Query(
        """
        SELECT sp
        FROM SanPham sp
        LEFT JOIN sp.loaiSanPham lsp
        WHERE (:keyword IS NULL OR LOWER(sp.maSanPham) LIKE CONCAT('%', :keyword, '%')
            OR LOWER(sp.tenSanPham) LIKE CONCAT('%', :keyword, '%')
            OR LOWER(lsp.tenLoaiSanPham) LIKE CONCAT('%', :keyword, '%'))
          AND (:maLoaiSanPham IS NULL OR sp.maLoaiSanPham = :maLoaiSanPham)
        """
    )
    Page<SanPham> search(
        @Param("keyword") String keyword,
        @Param("maLoaiSanPham") String maLoaiSanPham,
        Pageable pageable
    );

    @Query(
        """
        SELECT sp
        FROM SanPham sp
        LEFT JOIN sp.loaiSanPham lsp
        WHERE :keyword IS NULL OR LOWER(sp.maSanPham) LIKE CONCAT('%', :keyword, '%')
            OR LOWER(sp.tenSanPham) LIKE CONCAT('%', :keyword, '%')
            OR LOWER(lsp.tenLoaiSanPham) LIKE CONCAT('%', :keyword, '%')
        """
    )
    List<SanPham> searchByKeyword(@Param("keyword") String keyword);
}
