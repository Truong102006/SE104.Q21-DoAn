"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/management";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonthPickerInput } from "@/components/ui/date-picker";
import { backendApi } from "@/services/backend-api";
import { Pagination } from "@/components/dashboard/pagination";
import { useAuthStore } from "@/stores/auth-store";
import type {
  InventoryReportResponse,
  ProductRevenueReportResponse,
  ServiceRevenueReportResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { currentMonthYear, formatCurrency, formatNumber } from "@/lib/format";
import {
  BarChart3,
  Boxes,
  Calendar,
  PieChart,
  Info,
  Layers,
  FileDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LabelList,
  Sector,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function safeRatio(value: number): string {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function truncateChartLabel(value: string | number | null | undefined, maxChars = 18): string {
  const text = String(value ?? "").trim();
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars).trimEnd()}...`;
}

function formatCompactVND(value: number): string {
  const safe = Number(value ?? 0);
  if (safe === 0) return "0 ₫";
  if (safe >= 1_000_000_000) {
    return `${(safe / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} Tỷ`;
  }
  if (safe >= 1_000_000) {
    return `${(safe / 1_000_000).toFixed(1).replace(/\.0$/, "")} Tr`;
  }
  if (safe >= 1_000) {
    return `${(safe / 1_000).toFixed(0)}k`;
  }
  return `${safe} ₫`;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

// Professional & Clean Tooltip
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
        <p className="font-bold border-b pb-1 mb-1">{label || payload[0].name}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Doanh thu:</span>
          <span className="font-bold text-primary">{formatCurrency(payload[0].value)}</span>
        </div>
        {payload[0].payload.tiLe && (
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-muted-foreground">Tỷ lệ:</span>
            <span className="font-medium">{safeRatio(payload[0].payload.tiLe)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function exportToCsv(filename: string, rows: any[]) {
  if (!rows || !rows.length) return;
  const separator = ",";
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? "" : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

interface DrillDownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  id: string;
  name: string;
  month: number;
  year: number;
}

interface DrillDownItem {
  soPhieu: string;
  ngayLap: string;
  khachHang?: string;
  nhaCungCap?: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  tinhTrang?: string;
}

function DrillDownModal({ open, onOpenChange, type, id, name, month, year }: DrillDownProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DrillDownItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (open && id) {
      setLoading(true);
      backendApi.search
        .drillDown({ type, id, month, year })
        .then((res) => {
          setData(res as DrillDownItem[]);
          setCurrentPage(1);
        })
        .finally(() => setLoading(false));
    }
  }, [open, type, id, month, year]);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Layers className="h-5 w-5 text-emerald-600" />
            Chi tiết giao dịch: <span className="text-emerald-700">{name}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-medium">Kỳ báo cáo: Tháng {month}/{year}</p>
        </DialogHeader>
        <div className="flex-1 overflow-auto px-6 py-2 flex flex-col">
          <div className="rounded-xl border shadow-sm bg-card overflow-hidden flex-1">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground animate-pulse font-bold">Đang truy xuất dữ liệu...</div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">Không có dữ liệu giao dịch trong khoảng thời gian này.</div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Số phiếu</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Ngày lập</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">{type.includes("purchase") ? "Nhà cung cấp" : "Khách hàng"}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">Số lượng</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">Đơn giá</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">Thành tiền</TableHead>
                    {type === "service" && <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Tình trạng</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b border-border/60">
                      <TableCell className="py-1.5 px-3 text-xs text-blue-600">{item.soPhieu}</TableCell>
                      <TableCell className="py-1.5 px-3 text-muted-foreground text-xs">{item.ngayLap}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs text-foreground">{item.khachHang || item.nhaCungCap}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs text-right text-foreground">{formatNumber(item.soLuong)}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs text-right text-muted-foreground">{formatCurrency(item.donGia)}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs text-right text-emerald-600">{formatCurrency(item.thanhTien)}</TableCell>
                      {type === "service" && (
                        <TableCell className="py-1.5 px-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-black uppercase border px-1.5 py-0.5",
                              item.tinhTrang === "Da giao"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            )}
                          >
                            {item.tinhTrang === "Da giao" ? "Đã xong" : "Đang chờ"}
                          </Badge>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {data.length > itemsPerPage && (
            <div className="flex items-center justify-center py-4 mt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
        <div className="p-6 flex justify-end gap-3 border-t bg-muted/20">
          <Button
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/20 rounded-xl px-6 h-11"
            onClick={() => exportToCsv(`chi_tiet_${id}_${month}_${year}.csv`, data)}
          >
            <FileDown className="h-5 w-5" />
            TẢI FILE EXCEL (CSV)
          </Button>
          <Button variant="outline" className="px-8 rounded-xl font-bold h-11" onClick={() => onOpenChange(false)}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReportsPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const isAdmin = role === "ADMIN";

  const now = currentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(now.month);
  const [selectedYear, setSelectedYear] = useState(now.year);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<InventoryReportResponse | null>(null);
  const [productRevenue, setProductRevenue] = useState<ProductRevenueReportResponse | null>(null);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenueReportResponse | null>(null);
  const [bm11ChartType, setBm11ChartType] = useState<"bar" | "pie">("bar");
  const [bm12ChartType, setBm12ChartType] = useState<"pie" | "bar">("pie");

  const [productHoveredIndex, setProductHoveredIndex] = useState<number | null>(null);
  const [serviceHoveredIndex, setServiceHoveredIndex] = useState<number | null>(null);

  const [productMousePos, setProductMousePos] = useState<{ x: number; y: number } | null>(null);
  const [serviceMousePos, setServiceMousePos] = useState<{ x: number; y: number } | null>(null);

  // Pagination states
  const [inventoryPage, setInventoryPage] = useState(1);
  const inventoryItemsPerPage = 10;

  const [productRevenuePage, setProductRevenuePage] = useState(1);
  const productRevenueItemsPerPage = 5;

  const [serviceRevenuePage, setServiceRevenuePage] = useState(1);
  const serviceRevenueItemsPerPage = 5;

  // Reset pagination on data change
  useEffect(() => {
    setInventoryPage(1);
  }, [inventory]);

  useEffect(() => {
    setProductRevenuePage(1);
  }, [productRevenue]);

  useEffect(() => {
    setServiceRevenuePage(1);
  }, [serviceRevenue]);

  const [drillDown, setDrillDown] = useState<{
    open: boolean;
    type: string;
    id: string;
    name: string;
  }>({
    open: false,
    type: "",
    id: "",
    name: "",
  });

  useEffect(() => {
    if (!isAdmin) return;

    const loadAllReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const [inv, prod, serv] = await Promise.all([
          backendApi.reports.inventoryGet(selectedMonth, selectedYear).catch(() => null),
          backendApi.reports.revenueProductsGet(selectedMonth, selectedYear).catch(() => null),
          backendApi.reports.revenueServicesGet(selectedMonth, selectedYear).catch(() => null),
        ]);
        setInventory(inv);
        setProductRevenue(prod);
        setServiceRevenue(serv);
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể nạp dữ liệu kỳ này"));
      } finally {
        setLoading(false);
      }
    };
    loadAllReports();
  }, [selectedMonth, selectedYear, isAdmin]);

  // Client-side pagination calculations
  const totalInventoryPages = useMemo(() => {
    return Math.ceil((inventory?.chiTiet?.length ?? 0) / inventoryItemsPerPage) || 1;
  }, [inventory, inventoryItemsPerPage]);

  const paginatedInventory = useMemo(() => {
    if (!inventory?.chiTiet) return [];
    const start = (inventoryPage - 1) * inventoryItemsPerPage;
    return inventory.chiTiet.slice(start, start + inventoryItemsPerPage);
  }, [inventory, inventoryPage, inventoryItemsPerPage]);

  const totalProductRevenuePages = useMemo(() => {
    return Math.ceil((productRevenue?.chiTiet?.length ?? 0) / productRevenueItemsPerPage) || 1;
  }, [productRevenue, productRevenueItemsPerPage]);

  const paginatedProductRevenue = useMemo(() => {
    if (!productRevenue?.chiTiet) return [];
    const start = (productRevenuePage - 1) * productRevenueItemsPerPage;
    return productRevenue.chiTiet.slice(start, start + productRevenueItemsPerPage);
  }, [productRevenue, productRevenuePage, productRevenueItemsPerPage]);

  const totalServiceRevenuePages = useMemo(() => {
    return Math.ceil((serviceRevenue?.chiTiet?.length ?? 0) / serviceRevenueItemsPerPage) || 1;
  }, [serviceRevenue, serviceRevenueItemsPerPage]);

  const paginatedServiceRevenue = useMemo(() => {
    if (!serviceRevenue?.chiTiet) return [];
    const start = (serviceRevenuePage - 1) * serviceRevenueItemsPerPage;
    return serviceRevenue.chiTiet.slice(start, start + serviceRevenueItemsPerPage);
  }, [serviceRevenue, serviceRevenuePage, serviceRevenueItemsPerPage]);

  async function runGenerate(action: "inventory" | "product-revenue" | "service-revenue") {
    setLoading(true);
    try {
      if (action === "inventory") {
        setInventory(await backendApi.reports.inventoryGenerate(selectedMonth, selectedYear));
      } else if (action === "product-revenue") {
        setProductRevenue(await backendApi.reports.revenueProductsGenerate(selectedMonth, selectedYear));
      } else if (action === "service-revenue") {
        setServiceRevenue(await backendApi.reports.revenueServicesGenerate(selectedMonth, selectedYear));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Thao tác không thành công"));
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <EmptyState
          title="Quyền truy cập bị từ chối"
          description="Chỉ quản trị viên (Admin) mới có quyền xem các báo cáo doanh thu và tồn kho của hệ thống."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Date Filter & Global Action Card */}
      <Card className="border-none shadow-sm">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/10 rounded-2xl border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-black text-foreground uppercase tracking-wider">Kỳ báo cáo:</span>
            </div>
            <div className="w-48">
              <MonthPickerInput
                value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
                onValueChange={(val) => {
                  if (val) {
                    const [year, month] = val.split("-").map(Number);
                    setSelectedYear(year);
                    setSelectedMonth(month);
                  }
                }}
              />
            </div>
          </div>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/20 rounded-xl h-11 px-6 gap-2 w-full sm:w-auto"
            onClick={() => {
              if (inventory) exportToCsv(`baocao_tonghop_${selectedMonth}_${selectedYear}.csv`, inventory.chiTiet);
            }}
            disabled={!inventory}
          >
            <FileDown className="h-5 w-5" />
            XUẤT TỔNG HỢP
          </Button>
        </CardContent>
      </Card>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 text-sm font-bold flex items-center gap-2"><Info className="h-4 w-4" />{error}</div>}

      {!loading && (
        <div className="space-y-8">
          {/* SECTION 1: BM10 Inventory */}
          <Card className="border-none shadow-lg overflow-hidden border rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5 bg-muted/5">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                <Boxes className="h-5 w-5 text-primary" />
                Tồn Kho Sản Phẩm (BM10)
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl h-9 px-4 gap-2"
                  onClick={() => inventory && exportToCsv(`kho_${selectedMonth}_${selectedYear}.csv`, inventory.chiTiet)}
                >
                  <FileDown className="h-4 w-4" /> Xuất Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => runGenerate("inventory")} className="font-bold rounded-xl h-9 border-primary/50 text-primary">Chốt Kho</Button>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {!inventory ? (
                <div className="p-10"><EmptyState title="Dữ liệu kỳ này chưa chốt" description="Dữ liệu kho chưa được chốt cho tháng này." /></div>
              ) : (
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-14 text-center py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">STT</TableHead>
                          <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Mã SP</TableHead>
                          <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Sản phẩm</TableHead>
                          <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">Tồn đầu</TableHead>
                          <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right text-blue-600">Nhập</TableHead>
                          <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right text-orange-600">Xuất</TableHead>
                          <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right text-foreground">Tồn cuối</TableHead>
                          <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-center">ĐVT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedInventory.map((item, idx) => (
                          <TableRow
                            key={idx}
                            className="hover:bg-muted/20 cursor-pointer transition-colors border-b border-border/60"
                            onClick={() => setDrillDown({ open: true, type: "product-purchase", id: item.maSanPham, name: item.tenSanPham })}
                          >
                            <TableCell className="py-1.5 px-3 text-center text-xs text-muted-foreground">{(inventoryPage - 1) * inventoryItemsPerPage + idx + 1}</TableCell>
                            <TableCell className="py-1.5 px-3 text-[10px] font-mono font-bold text-blue-600">{item.maSanPham}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs text-foreground">{item.tenSanPham}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs text-right text-foreground">{formatNumber(item.tonDau)}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs text-right text-blue-600">+{formatNumber(item.soLuongMuaVao)}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs text-right text-orange-600">-{formatNumber(item.soLuongBanRa)}</TableCell>
                            <TableCell className="py-1.5 px-3 text-xs text-right text-foreground">{formatNumber(item.tonCuoi)}</TableCell>
                            <TableCell className="py-1.5 px-3 text-center text-xs text-muted-foreground">{item.tenDonViTinh}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {inventory.chiTiet.length > inventoryItemsPerPage && (
                    <div className="flex items-center justify-center border-t border-border/60 py-4">
                      <Pagination
                        currentPage={inventoryPage}
                        totalPages={totalInventoryPages}
                        onPageChange={setInventoryPage}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* SECTION 2: BM11 Product Revenue */}
            <Card className="border-none shadow-lg overflow-hidden border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5 bg-muted/5">
                <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Doanh Thu Bán Hàng (BM11)
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex border rounded-lg overflow-hidden p-0.5 bg-muted/50">
                    <button
                      onClick={() => setBm11ChartType("bar")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wider",
                        bm11ChartType === "bar" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      Cột ngang
                    </button>
                    <button
                      onClick={() => setBm11ChartType("pie")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wider",
                        bm11ChartType === "pie" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      Hình tròn
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-black gap-1 p-0 px-2"
                      onClick={() => productRevenue && exportToCsv(`doanh_thu_sp_${selectedMonth}_${selectedYear}.csv`, productRevenue.chiTiet)}
                    >
                      <FileDown className="h-4 w-4" /> EXCEL
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => runGenerate("product-revenue")} className="text-[10px] font-black rounded-lg h-7">KẾT TOÁN</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!productRevenue ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground italic font-medium">Chưa có số liệu kết toán doanh thu.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-[260px] w-full bg-muted/5 rounded-xl border border-dashed p-2">
                      {bm11ChartType === "bar" ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={productRevenue.chiTiet.slice(0, 5)}
                            layout="vertical"
                            margin={{ top: 5, right: 55, left: 10, bottom: 5 }}
                            onMouseMove={(state: any) => {
                              if (state && state.chartX !== undefined && state.chartY !== undefined) {
                                setProductMousePos({ x: state.chartX + 15, y: state.chartY + 15 });
                              }
                            }}
                            onMouseLeave={() => setProductMousePos(null)}
                          >
                            <defs>
                              <linearGradient id="productBarGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.85} />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis
                              dataKey="tenSanPham"
                              type="category"
                              width={140}
                              fontSize={10}
                              fontWeight={800}
                              tick={{ fill: "currentColor" }}
                              tickFormatter={(value) => truncateChartLabel(value, 18)}
                            />
                            <RechartsTooltip
                              content={<ChartTooltip />}
                              cursor={{ fill: 'currentColor', opacity: 0.04 }}
                              isAnimationActive={true}
                              animationDuration={100}
                              animationEasing="ease-out"
                              useTranslate3d={true}
                              shared={true}
                              position={productMousePos !== null ? productMousePos : undefined}
                            />
                            <Bar
                              dataKey="doanhThu"
                              fill="url(#productBarGradient)"
                              radius={[0, 6, 6, 0]}
                              barSize={18}
                              onClick={(entry: any) => setDrillDown({ open: true, type: "product-sale", id: entry.maSanPham, name: entry.tenSanPham })}
                              className="cursor-pointer"
                            >
                              <LabelList
                                dataKey="doanhThu"
                                position="right"
                                formatter={(val: any) => formatCompactVND(Number(val))}
                                style={{ fontSize: '10px', fontWeight: 'bold', fill: 'currentColor', opacity: 0.8 }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between h-full w-full gap-4 px-2">
                          <div className="w-full sm:w-1/2 h-[180px] sm:h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart
                                onMouseMove={(state: any) => {
                                  if (state && state.chartX !== undefined && state.chartY !== undefined) {
                                    setProductMousePos({ x: state.chartX + 15, y: state.chartY + 15 });
                                  }
                                }}
                                onMouseLeave={() => setProductMousePos(null)}
                              >
                                <Pie
                                  data={productRevenue.chiTiet.slice(0, 5)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={0}
                                  dataKey="doanhThu"
                                  nameKey="tenSanPham"
                                  stroke="var(--card)"
                                  strokeWidth={2}
                                  isAnimationActive={true}
                                  animationDuration={300}
                                  animationEasing="ease-out"
                                  onMouseEnter={(_, index) => setProductHoveredIndex(index)}
                                  onMouseLeave={() => setProductHoveredIndex(null)}
                                  onClick={(entry: any) => setDrillDown({ open: true, type: "product-sale", id: entry.maSanPham, name: entry.tenSanPham })}
                                  className="cursor-pointer outline-none"
                                  {...({ activeIndex: productHoveredIndex !== null ? productHoveredIndex : undefined, activeShape: renderActiveShape } as any)}
                                >
                                  {productRevenue.chiTiet.slice(0, 5).map((_, i) => (
                                    <Cell key={i} fill={["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"][i % 7]} className="hover:opacity-80 transition-opacity" />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  content={<ChartTooltip />}
                                  isAnimationActive={true}
                                  animationDuration={100}
                                  animationEasing="ease-out"
                                  useTranslate3d={true}
                                  position={productMousePos !== null ? productMousePos : undefined}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full sm:w-1/2 flex flex-col justify-center gap-2 max-h-full overflow-y-auto pr-2">
                            {productRevenue.chiTiet.slice(0, 5).map((item, i) => {
                              const colors = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];
                              return (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => setDrillDown({ open: true, type: "product-sale", id: item.maSanPham, name: item.tenSanPham })}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="w-3 h-3 rounded-full shrink-0 border border-background shadow-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                                    <span className="text-[11px] font-black text-foreground truncate">{item.tenSanPham}</span>
                                  </div>
                                  <span className="text-[11px] font-bold text-muted-foreground shrink-0">{Math.round(Number(item.tiLe))}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Mã SP</TableHead>
                            <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Sản phẩm</TableHead>
                            <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">Doanh thu</TableHead>
                            <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right w-16">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedProductRevenue.map((item, i) => (
                            <TableRow key={i} className="hover:bg-muted/20 cursor-pointer transition-colors border-b border-border/60" onClick={() => setDrillDown({ open: true, type: "product-sale", id: item.maSanPham, name: item.tenSanPham })}>
                              <TableCell className="py-1.5 px-3 text-[10px] font-mono font-bold text-blue-600">{item.maSanPham}</TableCell>
                              <TableCell className="py-1.5 px-3 text-xs text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.tenSanPham}</TableCell>
                              <TableCell className="py-1.5 px-3 text-xs text-right text-emerald-600">{formatCurrency(item.doanhThu)}</TableCell>
                              <TableCell className="py-1.5 px-3 text-xs text-right text-amber-600">{Math.round(Number(item.tiLe))}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {productRevenue.chiTiet.length > productRevenueItemsPerPage && (
                        <div className="flex items-center justify-center border-t border-border/60 py-3 bg-muted/5">
                          <Pagination
                            currentPage={productRevenuePage}
                            totalPages={totalProductRevenuePages}
                            onPageChange={setProductRevenuePage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5 bg-muted/5">
                <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                  <PieChart className="h-5 w-5 text-primary" />
                  Doanh Thu Dịch Vụ (BM12)
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex border rounded-lg overflow-hidden p-0.5 bg-muted/50">
                    <button
                      onClick={() => setBm12ChartType("pie")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wider",
                        bm12ChartType === "pie" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      Hình tròn
                    </button>
                    <button
                      onClick={() => setBm12ChartType("bar")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wider",
                        bm12ChartType === "bar" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      Cột ngang
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-black gap-1 p-0 px-2"
                      onClick={() => serviceRevenue && exportToCsv(`doanh_thu_dv_${selectedMonth}_${selectedYear}.csv`, serviceRevenue.chiTiet)}
                    >
                      <FileDown className="h-4 w-4" /> EXCEL
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => runGenerate("service-revenue")} className="text-[10px] font-black rounded-lg h-7">QUYẾT TOÁN</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!serviceRevenue ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground italic font-medium">Chưa có số liệu quyết toán dịch vụ.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-[260px] w-full flex items-center justify-center">
                      {bm12ChartType === "pie" ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between h-full w-full gap-4 px-2">
                          <div className="w-full sm:w-1/2 h-[180px] sm:h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart
                                onMouseMove={(state: any) => {
                                  if (state && state.chartX !== undefined && state.chartY !== undefined) {
                                    setServiceMousePos({ x: state.chartX + 15, y: state.chartY + 15 });
                                  }
                                }}
                                onMouseLeave={() => setServiceMousePos(null)}
                              >
                                <Pie
                                  data={serviceRevenue.chiTiet}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={0}
                                  dataKey="doanhThu"
                                  nameKey="tenLoaiDichVu"
                                  stroke="var(--card)"
                                  strokeWidth={2}
                                  isAnimationActive={true}
                                  animationDuration={300}
                                  animationEasing="ease-out"
                                  onMouseEnter={(_, index) => setServiceHoveredIndex(index)}
                                  onMouseLeave={() => setServiceHoveredIndex(null)}
                                  onClick={(entry: any) => setDrillDown({ open: true, type: "service", id: entry.maLoaiDichVu, name: entry.tenLoaiDichVu })}
                                  className="cursor-pointer outline-none"
                                  {...({ activeIndex: serviceHoveredIndex !== null ? serviceHoveredIndex : undefined, activeShape: renderActiveShape } as any)}
                                >
                                  {serviceRevenue.chiTiet.map((_, i) => (
                                    <Cell key={i} fill={["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"][i % 5]} className="hover:opacity-80 transition-opacity" />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  content={<ChartTooltip />}
                                  isAnimationActive={true}
                                  animationDuration={100}
                                  animationEasing="ease-out"
                                  useTranslate3d={true}
                                  position={serviceMousePos !== null ? serviceMousePos : undefined}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full sm:w-1/2 flex flex-col justify-center gap-2 max-h-full overflow-y-auto pr-2">
                            {serviceRevenue.chiTiet.map((item, i) => {
                              const colors = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];
                              return (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => setDrillDown({ open: true, type: "service", id: item.maLoaiDichVu, name: item.tenLoaiDichVu })}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="w-3 h-3 rounded-full shrink-0 border border-background shadow-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                                    <span className="text-[11px] font-black text-foreground truncate">{item.tenLoaiDichVu}</span>
                                  </div>
                                  <span className="text-[11px] font-bold text-muted-foreground shrink-0">{Math.round(Number(item.tiLe))}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={serviceRevenue.chiTiet}
                            layout="vertical"
                            margin={{ top: 5, right: 55, left: 10, bottom: 5 }}
                            onMouseMove={(state: any) => {
                              if (state && state.chartX !== undefined && state.chartY !== undefined) {
                                setServiceMousePos({ x: state.chartX + 15, y: state.chartY + 15 });
                              }
                            }}
                            onMouseLeave={() => setServiceMousePos(null)}
                          >
                            <defs>
                              <linearGradient id="serviceBarGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                                <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis
                              dataKey="tenLoaiDichVu"
                              type="category"
                              width={140}
                              fontSize={10}
                              fontWeight={800}
                              tick={{ fill: "currentColor" }}
                              tickFormatter={(value) => truncateChartLabel(value, 18)}
                            />
                            <RechartsTooltip
                              content={<ChartTooltip />}
                              cursor={{ fill: 'currentColor', opacity: 0.04 }}
                              isAnimationActive={true}
                              animationDuration={100}
                              animationEasing="ease-out"
                              useTranslate3d={true}
                              shared={true}
                              position={serviceMousePos !== null ? serviceMousePos : undefined}
                            />
                            <Bar
                              dataKey="doanhThu"
                              fill="url(#serviceBarGradient)"
                              radius={[0, 6, 6, 0]}
                              barSize={18}
                              onClick={(entry: any) => setDrillDown({ open: true, type: "service", id: entry.maLoaiDichVu, name: entry.tenLoaiDichVu })}
                              className="cursor-pointer"
                            >
                              <LabelList
                                dataKey="doanhThu"
                                position="right"
                                formatter={(val: any) => formatCompactVND(Number(val))}
                                style={{ fontSize: '10px', fontWeight: 'bold', fill: 'currentColor', opacity: 0.8 }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400">Dịch vụ</TableHead>
                            <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">Doanh thu</TableHead>
                            <TableHead className="py-2 px-3 h-8 text-xs font-bold text-slate-500 dark:text-slate-400 text-right w-16">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedServiceRevenue.map((item, i) => (
                            <TableRow key={i} className="hover:bg-muted/20 cursor-pointer transition-colors border-b border-border/60" onClick={() => setDrillDown({ open: true, type: "service", id: item.maLoaiDichVu, name: item.tenLoaiDichVu })}>
                              <TableCell className="py-1.5 px-3 text-xs text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.tenLoaiDichVu}</TableCell>
                              <TableCell className="py-1.5 px-3 text-xs text-right text-emerald-600">{formatCurrency(item.doanhThu)}</TableCell>
                              <TableCell className="py-1.5 px-3 text-xs text-right text-amber-600">{Math.round(Number(item.tiLe))}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {serviceRevenue.chiTiet.length > serviceRevenueItemsPerPage && (
                        <div className="flex items-center justify-center border-t border-border/60 py-3 bg-muted/5">
                          <Pagination
                            currentPage={serviceRevenuePage}
                            totalPages={totalServiceRevenuePages}
                            onPageChange={setServiceRevenuePage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <DrillDownModal
        open={drillDown.open}
        onOpenChange={(open) => setDrillDown((prev) => ({ ...prev, open }))}
        type={drillDown.type}
        id={drillDown.id}
        name={drillDown.name}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  );
}
