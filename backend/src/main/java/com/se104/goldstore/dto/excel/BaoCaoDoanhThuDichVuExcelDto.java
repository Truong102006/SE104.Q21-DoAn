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
public class BaoCaoDoanhThuDichVuExcelDto {

    @ExcelProperty(value = "STT", index = 0)
    @ColumnWidth(8)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.CENTER)
    private Integer stt;

    @ExcelProperty(value = "Mã Loại Dịch Vụ", index = 1)
    @ColumnWidth(18)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.CENTER)
    private String maLoaiDichVu;

    @ExcelProperty(value = "Tên Loại Dịch Vụ", index = 2)
    @ColumnWidth(32)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.LEFT)
    private String tenLoaiDichVu;

    @ExcelProperty(value = "Doanh Thu (VND)", index = 3)
    @ColumnWidth(18)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private BigDecimal doanhThu;

    @ExcelProperty(value = "Tỉ Lệ (%)", index = 4)
    @ColumnWidth(12)
    @ContentStyle(horizontalAlignment = HorizontalAlignmentEnum.RIGHT)
    private BigDecimal tiLe;

    // Constructors
    public BaoCaoDoanhThuDichVuExcelDto() {
    }

    public BaoCaoDoanhThuDichVuExcelDto(Integer stt, String maLoaiDichVu, String tenLoaiDichVu,
                                       BigDecimal doanhThu, BigDecimal tiLe) {
        this.stt = stt;
        this.maLoaiDichVu = maLoaiDichVu;
        this.tenLoaiDichVu = tenLoaiDichVu;
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
