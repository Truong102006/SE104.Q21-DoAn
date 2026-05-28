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
import java.math.BigDecimal;

@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 21) // Màu xanh Teal sang trọng
@HeadFontStyle(fontName = "Arial", fontHeightInPoints = 11, bold = BooleanEnum.TRUE, color = 9) // Chữ trắng bold
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
public class BaoCaoDoanhThuSanPhamExcelDto {

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

    @ExcelProperty(value = "Số Lượng Bán", index = 3)
    @ColumnWidth(14)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private Integer soLuongBan;

    @ExcelProperty(value = "Doanh Thu (VND)", index = 4)
    @ColumnWidth(18)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private BigDecimal doanhThu;

    @ExcelProperty(value = "Tỉ Lệ (%)", index = 5)
    @ColumnWidth(12)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private BigDecimal tiLe;

    // Constructors
    public BaoCaoDoanhThuSanPhamExcelDto() {
    }

    public BaoCaoDoanhThuSanPhamExcelDto(Integer stt, String maSanPham, String tenSanPham,
                                        Integer soLuongBan, BigDecimal doanhThu, BigDecimal tiLe) {
        this.stt = stt;
        this.maSanPham = maSanPham;
        this.tenSanPham = tenSanPham;
        this.soLuongBan = soLuongBan;
        this.doanhThu = doanhThu;
        this.tiLe = tiLe;
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
