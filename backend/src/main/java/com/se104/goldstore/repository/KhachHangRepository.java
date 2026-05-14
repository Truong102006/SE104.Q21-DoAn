package com.se104.goldstore.repository;

import com.se104.goldstore.entity.KhachHang;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KhachHangRepository extends JpaRepository<KhachHang, String> {

    boolean existsBySoDienThoaiKhachHang(String soDienThoaiKhachHang);

    boolean existsBySoDienThoaiKhachHangAndMaKhachHangNot(String soDienThoaiKhachHang, String maKhachHang);

    List<KhachHang> findByTenKhachHangContainingIgnoreCase(String tenKhachHang);

    Optional<KhachHang> findTopByMaKhachHangStartingWithOrderByMaKhachHangDesc(String prefix);
}
