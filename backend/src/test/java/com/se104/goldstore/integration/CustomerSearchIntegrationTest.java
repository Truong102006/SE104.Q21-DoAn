package com.se104.goldstore.integration;

import com.se104.goldstore.entity.KhachHang;
import com.se104.goldstore.repository.KhachHangRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

@SpringBootTest
@ActiveProfiles("supabase")
public class CustomerSearchIntegrationTest {

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Test
    public void testSearch() {
        System.out.println("=== CustomerSearchIntegrationTest - STARTING ===");
        
        List<KhachHang> all = khachHangRepository.findAll();
        System.out.println("All customers count: " + all.size());
        for (KhachHang kh : all) {
            System.out.println(String.format("- ID: %s, Name: %s, Phone: [%s] (Length: %d)", 
                kh.getMaKhachHang(), kh.getTenKhachHang(), kh.getSoDienThoaiKhachHang(), 
                kh.getSoDienThoaiKhachHang() != null ? kh.getSoDienThoaiKhachHang().length() : 0));
        }

        String searchKeyword = "09022";
        System.out.println("Searching containing: " + searchKeyword);
        List<KhachHang> matched = khachHangRepository.findByTenKhachHangContainingIgnoreCaseOrSoDienThoaiKhachHangContaining(searchKeyword, searchKeyword);
        System.out.println("Matched containing count: " + matched.size());
        for (KhachHang kh : matched) {
            System.out.println("- Matched: " + kh.getTenKhachHang());
        }

        System.out.println("=== CustomerSearchIntegrationTest - END ===");
    }
}
