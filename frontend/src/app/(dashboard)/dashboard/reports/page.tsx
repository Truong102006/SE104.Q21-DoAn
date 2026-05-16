"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, FileSpreadsheet, FileText, Printer, TrendingUp, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPickerInput } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND, MOCK_PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface InventoryHistoryRecord {
  month: string;
  productId: number;
  openingStock: number;
  purchasedQty: number;
  soldQty: number;
}

interface ServiceRevenueRecord {
  month: string;
  serviceName: string;
  revenue: number;
}

type ReportSection = "bm10" | "bm11" | "bm12";

const INVENTORY_HISTORY: InventoryHistoryRecord[] = [
  { month: "2026-04", productId: 1, openingStock: 9, purchasedQty: 5, soldQty: 2 },
  { month: "2026-04", productId: 2, openingStock: 7, purchasedQty: 3, soldQty: 2 },
  { month: "2026-04", productId: 4, openingStock: 2, purchasedQty: 2, soldQty: 1 },
  { month: "2026-05", productId: 1, openingStock: 12, purchasedQty: 3, soldQty: 4 },
  { month: "2026-05", productId: 2, openingStock: 8, purchasedQty: 4, soldQty: 3 },
  { month: "2026-05", productId: 4, openingStock: 3, purchasedQty: 1, soldQty: 1 },
  { month: "2026-05", productId: 8, openingStock: 16, purchasedQty: 8, soldQty: 4 },
];

const SERVICE_REVENUE_HISTORY: ServiceRevenueRecord[] = [
  { month: "2026-04", serviceName: "Đánh bóng trang sức", revenue: 6_000_000 },
  { month: "2026-04", serviceName: "Khắc tên trên nhẫn", revenue: 4_200_000 },
  { month: "2026-04", serviceName: "Thu mua vàng cũ", revenue: 2_800_000 },
  { month: "2026-05", serviceName: "Đánh bóng trang sức", revenue: 7_300_000 },
  { month: "2026-05", serviceName: "Khắc tên trên nhẫn", revenue: 5_400_000 },
  { month: "2026-05", serviceName: "Thu mua vàng cũ", revenue: 3_200_000 },
];

function getCurrentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}

function formatMonthLabel(value: string): string {
  if (!value.includes("-")) {
    return value;
  }
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function toCsvCell(value: string | number): string {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [
    headers.map(toCsvCell).join(","),
    ...rows.map((row) => row.map(toCsvCell).join(",")),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);
  const [activeSection, setActiveSection] = useState<ReportSection>("bm10");

  const bm10Rows = useMemo(() => {
    return INVENTORY_HISTORY
      .filter((record) => record.month === selectedMonth)
      .map((record) => {
        const product = MOCK_PRODUCTS.find((item) => item.id === record.productId);
        if (!product) {
          return null;
        }
        const closingStock = record.openingStock + record.purchasedQty - record.soldQty;
        return {
          id: product.id,
          productName: product.name,
          unit: product.weightUnit,
          openingStock: record.openingStock,
          purchasedQty: record.purchasedQty,
          soldQty: record.soldQty,
          closingStock,
        };
      })
      .filter((record): record is NonNullable<typeof record> => record !== null);
  }, [selectedMonth]);

  const bm11Rows = useMemo(() => {
    const rows = bm10Rows.map((record) => {
      const product = MOCK_PRODUCTS.find((item) => item.id === record.id) ?? MOCK_PRODUCTS[0];
      const revenue = record.soldQty * product.sellingPrice;
      return {
        id: record.id,
        productName: record.productName,
        soldQty: record.soldQty,
        revenue,
      };
    });

    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    return rows.map((row) => ({
      ...row,
      ratio: totalRevenue <= 0 ? 0 : (row.revenue / totalRevenue) * 100,
    }));
  }, [bm10Rows]);

  const bm12Rows = useMemo(() => {
    const rows = SERVICE_REVENUE_HISTORY
      .filter((record) => record.month === selectedMonth)
      .map((record, index) => ({
        id: `${record.month}-${index}-${record.serviceName}`,
        serviceName: record.serviceName,
        revenue: record.revenue,
      }));

    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    return rows.map((row) => ({
      ...row,
      ratio: totalRevenue <= 0 ? 0 : (row.revenue / totalRevenue) * 100,
    }));
  }, [selectedMonth]);

  const bm11TotalRevenue = useMemo(
    () => bm11Rows.reduce((sum, row) => sum + row.revenue, 0),
    [bm11Rows],
  );
  const bm12TotalRevenue = useMemo(
    () => bm12Rows.reduce((sum, row) => sum + row.revenue, 0),
    [bm12Rows],
  );

  const totalClosingStock = useMemo(
    () => bm10Rows.reduce((sum, row) => sum + row.closingStock, 0),
    [bm10Rows],
  );
  const totalInventoryMovement = useMemo(
    () => bm10Rows.reduce((sum, row) => sum + row.purchasedQty + row.soldQty, 0),
    [bm10Rows],
  );
  const totalRevenue = bm11TotalRevenue + bm12TotalRevenue;

  const topProduct = useMemo(
    () => [...bm11Rows].sort((a, b) => b.revenue - a.revenue)[0] ?? null,
    [bm11Rows],
  );
  const topService = useMemo(
    () => [...bm12Rows].sort((a, b) => b.revenue - a.revenue)[0] ?? null,
    [bm12Rows],
  );

  function jumpTo(section: ReportSection) {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleExportBm10Csv() {
    downloadCsv(
      `BM10_ton-kho_${selectedMonth}.csv`,
      ["STT", "Sản phẩm", "Tồn đầu", "Mua vào", "Bán ra", "Tồn cuối", "Đơn vị tính"],
      bm10Rows.map((row, index) => [
        index + 1,
        row.productName,
        row.openingStock,
        row.purchasedQty,
        row.soldQty,
        row.closingStock,
        row.unit,
      ]),
    );
  }

  function handleExportBm11Csv() {
    downloadCsv(
      `BM11_doanh-thu-san-pham_${selectedMonth}.csv`,
      ["STT", "Sản phẩm", "Số lượng bán", "Doanh thu", "Tỉ lệ"],
      [
        ...bm11Rows.map((row, index) => [
          index + 1,
          row.productName,
          row.soldQty,
          row.revenue,
          formatPercent(row.ratio),
        ]),
        ["", "Tổng doanh thu", "", bm11TotalRevenue, bm11TotalRevenue > 0 ? "100%" : "0%"],
      ],
    );
  }

  function handleExportBm12Csv() {
    downloadCsv(
      `BM12_doanh-thu-dich-vu_${selectedMonth}.csv`,
      ["STT", "Dịch vụ", "Doanh thu", "Tỉ lệ"],
      [
        ...bm12Rows.map((row, index) => [index + 1, row.serviceName, row.revenue, formatPercent(row.ratio)]),
        ["", "Tổng doanh thu", bm12TotalRevenue, bm12TotalRevenue > 0 ? "100%" : "0%"],
      ],
    );
  }

  function handleExportAllCsv() {
    handleExportBm10Csv();
    handleExportBm11Csv();
    handleExportBm12Csv();
  }

  function handleExportPdf() {
    const generatedAt = new Date().toLocaleString("vi-VN");
    const monthLabel = formatMonthLabel(selectedMonth);

    const bm10RowsHtml =
      bm10Rows.length === 0
        ? `<tr><td colspan="7" style="text-align:center;color:#6b7280;padding:10px;">Không có dữ liệu</td></tr>`
        : bm10Rows
            .map(
              (row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeHtml(row.productName)}</td>
                  <td style="text-align:right">${row.openingStock}</td>
                  <td style="text-align:right">${row.purchasedQty}</td>
                  <td style="text-align:right">${row.soldQty}</td>
                  <td style="text-align:right;font-weight:600">${row.closingStock}</td>
                  <td>${escapeHtml(row.unit)}</td>
                </tr>`,
            )
            .join("");

    const bm11RowsHtml =
      bm11Rows.length === 0
        ? `<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:10px;">Không có dữ liệu</td></tr>`
        : bm11Rows
            .map(
              (row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeHtml(row.productName)}</td>
                  <td style="text-align:right">${row.soldQty}</td>
                  <td style="text-align:right">${formatVND(row.revenue)}</td>
                  <td style="text-align:right">${formatPercent(row.ratio)}</td>
                </tr>`,
            )
            .join("");

    const bm12RowsHtml =
      bm12Rows.length === 0
        ? `<tr><td colspan="4" style="text-align:center;color:#6b7280;padding:10px;">Không có dữ liệu</td></tr>`
        : bm12Rows
            .map(
              (row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeHtml(row.serviceName)}</td>
                  <td style="text-align:right">${formatVND(row.revenue)}</td>
                  <td style="text-align:right">${formatPercent(row.ratio)}</td>
                </tr>`,
            )
            .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <title>Báo cáo BM10-BM12 ${monthLabel}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
            .header { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
            .brand { font-weight: 700; font-size: 20px; }
            .meta { font-size: 12px; color: #4b5563; text-align: right; }
            .title { margin: 0; font-size: 18px; }
            .subtitle { margin: 2px 0 0; font-size: 13px; color: #4b5563; }
            .kpi { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 12px 0; }
            .kpi-item { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; }
            .kpi-label { font-size: 11px; color: #6b7280; }
            .kpi-value { margin-top: 4px; font-size: 14px; font-weight: 700; }
            .section { margin-top: 14px; }
            .section-title { font-size: 14px; font-weight: 700; margin: 0 0 6px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 6px 8px; }
            th { background: #f3f4f6; text-align: left; font-weight: 600; }
            .signatures { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
            .sign-box { text-align: center; font-size: 12px; }
            .sign-line { margin-top: 54px; border-top: 1px solid #9ca3af; }
            @media print {
              body { margin: 12mm; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Gold Store Management</div>
              <h1 class="title">Báo cáo kết xuất BM10 - BM12</h1>
              <p class="subtitle">Kỳ báo cáo: ${monthLabel}</p>
            </div>
            <div class="meta">
              <div>Ngày xuất: ${generatedAt}</div>
              <div>Người lập: ____________________</div>
            </div>
          </div>

          <div class="kpi">
            <div class="kpi-item">
              <div class="kpi-label">Tổng doanh thu</div>
              <div class="kpi-value">${formatVND(totalRevenue)}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">Tồn kho cuối kỳ</div>
              <div class="kpi-value">${totalClosingStock}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">Doanh thu sản phẩm</div>
              <div class="kpi-value">${formatVND(bm11TotalRevenue)}</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-label">Doanh thu dịch vụ</div>
              <div class="kpi-value">${formatVND(bm12TotalRevenue)}</div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">BM10 - Báo cáo tồn kho</h2>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Tồn đầu</th>
                  <th>Mua vào</th>
                  <th>Bán ra</th>
                  <th>Tồn cuối</th>
                  <th>Đơn vị tính</th>
                </tr>
              </thead>
              <tbody>${bm10RowsHtml}</tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">BM11 - Doanh thu theo sản phẩm</h2>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Số lượng bán</th>
                  <th>Doanh thu</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                ${bm11RowsHtml}
                <tr>
                  <td colspan="3" style="font-weight:600;">Tổng doanh thu</td>
                  <td style="text-align:right;font-weight:700;">${formatVND(bm11TotalRevenue)}</td>
                  <td style="text-align:right;">${bm11TotalRevenue > 0 ? "100%" : "0%"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">BM12 - Doanh thu theo dịch vụ</h2>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Dịch vụ</th>
                  <th>Doanh thu</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                ${bm12RowsHtml}
                <tr>
                  <td colspan="2" style="font-weight:600;">Tổng doanh thu</td>
                  <td style="text-align:right;font-weight:700;">${formatVND(bm12TotalRevenue)}</td>
                  <td style="text-align:right;">${bm12TotalRevenue > 0 ? "100%" : "0%"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="signatures">
            <div class="sign-box">
              <div><strong>Người lập báo cáo</strong></div>
              <div class="sign-line"></div>
            </div>
            <div class="sign-box">
              <div><strong>Quản lý phê duyệt</strong></div>
              <div class="sign-line"></div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1100,height=800");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base tracking-tight">Trung tâm kết xuất báo cáo</CardTitle>
              <CardDescription className="text-xs">
                BM10, BM11, BM12 - Tổng hợp tồn kho và doanh thu theo tháng.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="h-6 border-border/80 bg-card px-2 text-[10px]">
                Kỳ báo cáo: {formatMonthLabel(selectedMonth)}
              </Badge>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="report-month" className="text-xs text-muted-foreground">
                  Tháng
                </Label>
                <MonthPickerInput
                  id="report-month"
                  value={selectedMonth}
                  onValueChange={(value) => setSelectedMonth(value || getCurrentMonthValue())}
                  className="h-8 w-[146px]"
                />
              </div>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={handleExportAllCsv}>
                <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                Xuất CSV
              </Button>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={handleExportPdf}>
                <FileText className="mr-1.5 h-4 w-4" />
                Xuất PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() => window.print()}
              >
                <Printer className="mr-1.5 h-4 w-4" />
                In báo cáo
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 p-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Tổng doanh thu tháng</p>
                <TrendingUp className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-1 text-base font-semibold">{formatVND(totalRevenue)}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Tồn kho cuối kỳ</p>
                <Warehouse className="h-4 w-4 text-sky-700" />
              </div>
              <p className="mt-1 text-base font-semibold">{totalClosingStock}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Sản phẩm nổi bật</p>
                <BarChart3 className="h-4 w-4 text-violet-700" />
              </div>
              <p className="mt-1 truncate text-sm font-semibold">
                {topProduct ? topProduct.productName : "Chưa có dữ liệu"}
              </p>
              <p className="text-xs text-muted-foreground">
                {topProduct ? formatVND(topProduct.revenue) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Dịch vụ nổi bật</p>
                <Download className="h-4 w-4 text-amber-700" />
              </div>
              <p className="mt-1 truncate text-sm font-semibold">
                {topService ? topService.serviceName : "Chưa có dữ liệu"}
              </p>
              <p className="text-xs text-muted-foreground">
                {topService ? formatVND(topService.revenue) : "-"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 p-1">
            {[
              { key: "bm10", label: "BM10 - Tồn kho" },
              { key: "bm11", label: "BM11 - Doanh thu sản phẩm" },
              { key: "bm12", label: "BM12 - Doanh thu dịch vụ" },
            ].map((item) => (
              <Button
                key={item.key}
                size="sm"
                variant="ghost"
                onClick={() => jumpTo(item.key as ReportSection)}
                className={cn(
                  "h-7 cursor-pointer px-2.5 text-xs",
                  activeSection === item.key ? "bg-card shadow-sm" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Button>
            ))}
            <span className="ml-auto px-1 text-[11px] text-muted-foreground">
              Lượt biến động kỳ này: <span className="font-semibold text-foreground">{totalInventoryMovement}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card id="bm10" className="scroll-mt-24 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded border border-border/70 bg-card px-2 py-0.5 text-[10px] font-semibold">BM10</span>
              <CardTitle className="text-base tracking-tight">Báo cáo tồn kho</CardTitle>
            </div>
            <Button size="sm" variant="outline" className="h-7 cursor-pointer text-xs" onClick={handleExportBm10Csv}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              Xuất BM10
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead className="w-[34%]">Sản phẩm</TableHead>
                <TableHead className="w-[11%] text-right">Tồn đầu</TableHead>
                <TableHead className="w-[13%] text-right">Mua vào</TableHead>
                <TableHead className="w-[11%] text-right">Bán ra</TableHead>
                <TableHead className="w-[11%] text-right">Tồn cuối</TableHead>
                <TableHead className="w-[14%]">Đơn vị tính</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bm10Rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    Không có dữ liệu tồn kho cho tháng đã chọn.
                  </TableCell>
                </TableRow>
              ) : (
                bm10Rows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="truncate font-medium">{row.productName}</TableCell>
                    <TableCell className="text-right">{row.openingStock}</TableCell>
                    <TableCell className="text-right">{row.purchasedQty}</TableCell>
                    <TableCell className="text-right">{row.soldQty}</TableCell>
                    <TableCell className="text-right font-semibold">{row.closingStock}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card id="bm11" className="scroll-mt-24 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded border border-border/70 bg-card px-2 py-0.5 text-[10px] font-semibold">BM11</span>
              <CardTitle className="text-base tracking-tight">Báo cáo doanh thu theo sản phẩm</CardTitle>
            </div>
            <Button size="sm" variant="outline" className="h-7 cursor-pointer text-xs" onClick={handleExportBm11Csv}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              Xuất BM11
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead className="w-[44%]">Sản phẩm</TableHead>
                <TableHead className="w-[16%] text-right">Số lượng bán</TableHead>
                <TableHead className="w-[24%] text-right">Doanh thu</TableHead>
                <TableHead className="w-[10%] text-right">Tỉ lệ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bm11Rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    Không có dữ liệu doanh thu cho tháng đã chọn.
                  </TableCell>
                </TableRow>
              ) : (
                bm11Rows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="truncate font-medium">{row.productName}</TableCell>
                    <TableCell className="text-right">{row.soldQty}</TableCell>
                    <TableCell className="text-right">{formatVND(row.revenue)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatPercent(row.ratio)}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell colSpan={3} className="font-semibold">
                  Tổng doanh thu
                </TableCell>
                <TableCell className="text-right text-base font-bold">{formatVND(bm11TotalRevenue)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {bm11TotalRevenue > 0 ? "100%" : "0%"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card id="bm12" className="scroll-mt-24 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded border border-border/70 bg-card px-2 py-0.5 text-[10px] font-semibold">BM12</span>
              <CardTitle className="text-base tracking-tight">Báo cáo doanh thu theo dịch vụ</CardTitle>
            </div>
            <Button size="sm" variant="outline" className="h-7 cursor-pointer text-xs" onClick={handleExportBm12Csv}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              Xuất BM12
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead className="w-[54%]">Dịch vụ</TableHead>
                <TableHead className="w-[28%] text-right">Doanh thu</TableHead>
                <TableHead className="w-[12%] text-right">Tỉ lệ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bm12Rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    Không có dữ liệu doanh thu dịch vụ cho tháng đã chọn.
                  </TableCell>
                </TableRow>
              ) : (
                bm12Rows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="truncate font-medium">{row.serviceName}</TableCell>
                    <TableCell className="text-right">{formatVND(row.revenue)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatPercent(row.ratio)}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">
                  Tổng doanh thu
                </TableCell>
                <TableCell className="text-right text-base font-bold">{formatVND(bm12TotalRevenue)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {bm12TotalRevenue > 0 ? "100%" : "0%"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
