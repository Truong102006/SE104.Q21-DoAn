package com.se104.goldstore.repository;

import com.se104.goldstore.entity.NguoiDung;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, String> {

    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    @Query(
        """
        SELECT nd FROM NguoiDung nd
        LEFT JOIN nd.nhomNguoiDung nnd
        WHERE (:keyword = '' OR LOWER(nd.tenDangNhap) LIKE CONCAT('%', LOWER(:keyword), '%')
            OR LOWER(nnd.tenNhom) LIKE CONCAT('%', LOWER(:keyword), '%'))
        """
    )
    List<NguoiDung> findByKeyword(@Param("keyword") String keyword);
}
