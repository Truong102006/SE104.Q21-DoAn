package com.se104.goldstore.repository;

import com.se104.goldstore.entity.KhachHang;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KhachHangRepository extends JpaRepository<KhachHang, String> {

    boolean existsByTenKhachHangIgnoreCase(String tenKhachHang);

    boolean existsByTenKhachHangIgnoreCaseAndSoDienThoaiKhachHang(String tenKhachHang, String soDienThoaiKhachHang);

    boolean existsByTenKhachHangIgnoreCaseAndSoDienThoaiKhachHangAndMaKhachHangNot(
        String tenKhachHang,
        String soDienThoaiKhachHang,
        String maKhachHang
    );

    boolean existsBySoDienThoaiKhachHang(String soDienThoaiKhachHang);

    boolean existsBySoDienThoaiKhachHangAndMaKhachHangNot(String soDienThoaiKhachHang, String maKhachHang);

    List<KhachHang> findByTenKhachHangContainingIgnoreCase(String tenKhachHang);

    List<KhachHang> findByTenKhachHangContainingIgnoreCaseOrSoDienThoaiKhachHangContaining(String tenKhachHang, String soDienThoaiKhachHang);

    Page<KhachHang> findByTenKhachHangContainingIgnoreCaseOrSoDienThoaiKhachHangContaining(String tenKhachHang, String soDienThoaiKhachHang, Pageable pageable);

    Optional<KhachHang> findTopByMaKhachHangStartingWithOrderByMaKhachHangDesc(String prefix);
}
