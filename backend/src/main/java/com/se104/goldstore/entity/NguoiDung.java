package com.se104.goldstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "nguoi_dung")
public class NguoiDung {

    @Id
    @Column(name = "ten_dang_nhap", length = 50, nullable = false)
    private String tenDangNhap;

    @Column(name = "mat_khau", length = 255, nullable = false)
    private String matKhau;

    @Column(name = "ma_nhom", length = 20)
    private String maNhom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_nhom", referencedColumnName = "ma_nhom", insertable = false, updatable = false)
    private NhomNguoiDung nhomNguoiDung;

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }

    public String getMaNhom() {
        return maNhom;
    }

    public void setMaNhom(String maNhom) {
        this.maNhom = maNhom;
    }

    public NhomNguoiDung getNhomNguoiDung() {
        return nhomNguoiDung;
    }

    public void setNhomNguoiDung(NhomNguoiDung nhomNguoiDung) {
        this.nhomNguoiDung = nhomNguoiDung;
    }
}
