package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhanQuyen;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhanQuyenRepository extends JpaRepository<PhanQuyen, PhanQuyen.PhanQuyenId> {

    boolean existsByMaNhomAndMaChucNang(String maNhom, String maChucNang);

    java.util.List<PhanQuyen> findByMaNhom(String maNhom);

    List<PhanQuyen> findByMaNhomContainingIgnoreCaseOrMaChucNangContainingIgnoreCase(String maNhom, String maChucNang);
}
