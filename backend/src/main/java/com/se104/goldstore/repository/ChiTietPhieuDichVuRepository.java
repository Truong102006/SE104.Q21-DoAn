package com.se104.goldstore.repository;

import com.se104.goldstore.entity.ChiTietPhieuDichVu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietPhieuDichVuRepository extends JpaRepository<ChiTietPhieuDichVu, ChiTietPhieuDichVu.ChiTietPhieuDichVuId> {

    boolean existsByMaLoaiDichVu(String maLoaiDichVu);

    List<ChiTietPhieuDichVu> findBySoPhieuDichVu(String soPhieuDichVu);
}
