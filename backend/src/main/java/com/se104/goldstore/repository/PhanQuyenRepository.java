package com.se104.goldstore.repository;

import com.se104.goldstore.entity.PhanQuyen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhanQuyenRepository extends JpaRepository<PhanQuyen, PhanQuyen.PhanQuyenId> {
}
