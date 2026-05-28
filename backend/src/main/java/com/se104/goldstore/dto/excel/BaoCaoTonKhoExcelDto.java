package com.se104.goldstore.dto.excel;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.ContentFontStyle;
import com.alibaba.excel.annotation.write.style.ContentStyle;
import com.alibaba.excel.annotation.write.style.HeadFontStyle;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import com.alibaba.excel.enums.BooleanEnum;
import com.alibaba.excel.enums.poi.BorderStyleEnum;
import com.alibaba.excel.enums.poi.FillPatternTypeEnum;
import com.alibaba.excel.enums.poi.HorizontalAlignmentEnum;
import com.alibaba.excel.enums.poi.VerticalAlignmentEnum;

@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 21) // Màu xanh Teal (21) sang trọng, tương phản cao
@HeadFontStyle(fontName = "Arial", fontHeightInPoints = 11, bold = BooleanEnum.TRUE, color = 9) // Chữ trắng (9)
@ContentStyle(
    borderLeft = BorderStyleEnum.THIN,
    borderRight = BorderStyleEnum.THIN,
    borderTop = BorderStyleEnum.THIN,
    borderBottom = BorderStyleEnum.THIN,
    leftBorderColor = 22,   // Màu viền xám nhạt (22 - GREY_25_PERCENT)
    rightBorderColor = 22,
    topBorderColor = 22,
    bottomBorderColor = 22,
    verticalAlignment = VerticalAlignmentEnum.CENTER
)
@ContentFontStyle(fontName = "Arial", fontHeightInPoints = 10)
public class BaoCaoTonKhoExcelDto {

    @ExcelProperty(value = "STT", index = 0)
    @ColumnWidth(8)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.CENTER)
    private Integer stt;

    @ExcelProperty(value = "Mã Sản Phẩm", index = 1)
    @ColumnWidth(16)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.CENTER)
    private String maSanPham;

    @ExcelProperty(value = "Tên Sản Phẩm", index = 2)
    @ColumnWidth(32)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.LEFT)
    private String tenSanPham;

    @ExcelProperty(value = "Tồn Đầu", index = 3)
    @ColumnWidth(14)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private Integer tonDau;

    @ExcelProperty(value = "Nhập Vào", index = 4)
    @ColumnWidth(14)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private Integer soLuongMuaVao;

    @ExcelProperty(value = "Xuất Ra", index = 5)
    @ColumnWidth(14)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private Integer soLuongBanRa;

    @ExcelProperty(value = "Tồn Cuối", index = 6)
    @ColumnWidth(14)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private Integer tonCuoi;

    @ExcelProperty(value = "Đơn Vị Tính", index = 7)
    @ColumnWidth(14)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.CENTER)
    private String tenDonViTinh;

    // Constructors
    public BaoCaoTonKhoExcelDto() {
    }

    public BaoCaoTonKhoExcelDto(Integer stt, String maSanPham, String tenSanPham, Integer tonDau,
                               Integer soLuongMuaVao, Integer soLuongBanRa, Integer tonCuoi,
                               String tenDonViTinh) {
        this.stt = stt;
        this.maSanPham = maSanPham;
        this.tenSanPham = tenSanPham;
        this.tonDau = tonDau;
        this.soLuongMuaVao = soLuongMuaVao;
        this.soLuongBanRa = soLuongBanRa;
        this.tonCuoi = tonCuoi;
        this.tenDonViTinh = tenDonViTinh;
    }

    // Getters and Setters
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
