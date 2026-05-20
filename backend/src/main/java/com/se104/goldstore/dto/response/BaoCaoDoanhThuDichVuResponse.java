package com.se104.goldstore.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class BaoCaoDoanhThuDichVuResponse {

    private String maBaoCaoDoanhThuDv;
    private Integer thang;
    private Integer nam;
    private BigDecimal tongDoanhThuDichVu;
    private List<ChiTietDoanhThuDichVuResponse> chiTiet;

    public String getMaBaoCaoDoanhThuDv() {
        return maBaoCaoDoanhThuDv;
    }

    public void setMaBaoCaoDoanhThuDv(String maBaoCaoDoanhThuDv) {
        this.maBaoCaoDoanhThuDv = maBaoCaoDoanhThuDv;
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

    public BigDecimal getTongDoanhThuDichVu() {
        return tongDoanhThuDichVu;
    }

    public void setTongDoanhThuDichVu(BigDecimal tongDoanhThuDichVu) {
        this.tongDoanhThuDichVu = tongDoanhThuDichVu;
    }

    public List<ChiTietDoanhThuDichVuResponse> getChiTiet() {
        return chiTiet;
    }

    public void setChiTiet(List<ChiTietDoanhThuDichVuResponse> chiTiet) {
        this.chiTiet = chiTiet;
    }

    public static class ChiTietDoanhThuDichVuResponse {

        private Integer stt;
        private String maLoaiDichVu;
        private String tenLoaiDichVu;
        private BigDecimal doanhThu;
        private BigDecimal tiLe;

        public Integer getStt() {
            return stt;
        }

        public void setStt(Integer stt) {
            this.stt = stt;
        }

        public String getMaLoaiDichVu() {
            return maLoaiDichVu;
        }

        public void setMaLoaiDichVu(String maLoaiDichVu) {
            this.maLoaiDichVu = maLoaiDichVu;
        }

        public String getTenLoaiDichVu() {
            return tenLoaiDichVu;
        }

        public void setTenLoaiDichVu(String tenLoaiDichVu) {
            this.tenLoaiDichVu = tenLoaiDichVu;
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
