package com.se104.goldstore.dto.response;

import java.util.List;

public class BaoCaoTonKhoResponse {

    private String maBaoCaoTonKho;
    private Integer thang;
    private Integer nam;
    private List<ChiTietTonKhoResponse> chiTiet;

    public String getMaBaoCaoTonKho() {
        return maBaoCaoTonKho;
    }

    public void setMaBaoCaoTonKho(String maBaoCaoTonKho) {
        this.maBaoCaoTonKho = maBaoCaoTonKho;
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

    public List<ChiTietTonKhoResponse> getChiTiet() {
        return chiTiet;
    }

    public void setChiTiet(List<ChiTietTonKhoResponse> chiTiet) {
        this.chiTiet = chiTiet;
    }

    public static class ChiTietTonKhoResponse {

        private Integer stt;
        private String maSanPham;
        private String tenSanPham;
        private Integer tonDau;
        private Integer soLuongMuaVao;
        private Integer soLuongBanRa;
        private Integer tonCuoi;
        private String tenDonViTinh;

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

        public Integer getTonDau() {
            return tonDau;
        }

        public void setTonDau(Integer tonDau) {
            this.tonDau = tonDau;
        }

        public Integer getSoLuongMuaVao() {
            return soLuongMuaVao;
        }

        public void setSoLuongMuaVao(Integer soLuongMuaVao) {
            this.soLuongMuaVao = soLuongMuaVao;
        }

        public Integer getSoLuongBanRa() {
            return soLuongBanRa;
        }

        public void setSoLuongBanRa(Integer soLuongBanRa) {
            this.soLuongBanRa = soLuongBanRa;
        }

        public Integer getTonCuoi() {
            return tonCuoi;
        }

        public void setTonCuoi(Integer tonCuoi) {
            this.tonCuoi = tonCuoi;
        }

        public String getTenDonViTinh() {
            return tenDonViTinh;
        }

        public void setTenDonViTinh(String tenDonViTinh) {
            this.tenDonViTinh = tenDonViTinh;
        }
    }
}
