package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class BaoCaoDoanhThuSanPhamResponse {

    private String maBaoCaoDoanhThuSp;
    private Integer thang;
    private Integer nam;
    private BigDecimal tongDoanhThuSanPham;
    private List<ChiTietDoanhThuSanPhamResponse> chiTiet;

    public String getMaBaoCaoDoanhThuSp() {
        return maBaoCaoDoanhThuSp;
    }

    public void setMaBaoCaoDoanhThuSp(String maBaoCaoDoanhThuSp) {
        this.maBaoCaoDoanhThuSp = maBaoCaoDoanhThuSp;
    }

    public Integer getThang() {
        return thang;
    }

    public void setThang(Integer thang) {
        this.thang = thang;
    }

    public Integer getNam() {
        return nam;
    }

    public void setNam(Integer nam) {
        this.nam = nam;
    }

    public BigDecimal getTongDoanhThuSanPham() {
        return tongDoanhThuSanPham;
    }

    public void setTongDoanhThuSanPham(BigDecimal tongDoanhThuSanPham) {
        this.tongDoanhThuSanPham = tongDoanhThuSanPham;
    }

    public List<ChiTietDoanhThuSanPhamResponse> getChiTiet() {
        return chiTiet;
    }

    public void setChiTiet(List<ChiTietDoanhThuSanPhamResponse> chiTiet) {
        this.chiTiet = chiTiet;
    }

    public static class ChiTietDoanhThuSanPhamResponse {

        private Integer stt;
        private String maSanPham;
        private String tenSanPham;
        private Integer soLuongBan;
        private BigDecimal doanhThu;
        private BigDecimal tiLe;

        public Integer getStt() {
            return stt;
        }

        public void setStt(Integer stt) {
            this.stt = stt;
        }

        public String getMaSanPham() {
            return maSanPham;
        }

        public void setMaSanPham(String maSanPham) {
            this.maSanPham = maSanPham;
        }

        public String getTenSanPham() {
            return tenSanPham;
        }

        public void setTenSanPham(String tenSanPham) {
            this.tenSanPham = tenSanPham;
        }

        public Integer getSoLuongBan() {
            return soLuongBan;
        }

        public void setSoLuongBan(Integer soLuongBan) {
            this.soLuongBan = soLuongBan;
        }

        public BigDecimal getDoanhThu() {
            return doanhThu;
        }

        public void setDoanhThu(BigDecimal doanhThu) {
            this.doanhThu = doanhThu;
        }

        public BigDecimal getTiLe() {
            return tiLe;
        }

        public void setTiLe(BigDecimal tiLe) {
            this.tiLe = tiLe;
        }
    }
}
