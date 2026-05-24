"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/dashboard/management";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonthPickerInput } from "@/components/ui/date-picker";
import { backendApi } from "@/services/backend-api";
import type {
  InventoryReportResponse,
  ProductRevenueReportResponse,
  ServiceRevenueReportResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { currentMonthYear, formatCurrency, formatNumber } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import {
  BarChart3,
  Boxes,
  Sparkles,
  Calendar,
  Wrench,
  PieChart,
  Info,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

// Professional & Clean Tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
        <p className="font-bold border-b pb-1 mb-1">{label}</p>
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

function DrillDownModal({ open, onOpenChange, type, id, name, month, year }: DrillDownProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (open && id) {
      setLoading(true);
      backendApi.search
        .drillDown({ type, id, month, year })
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [open, type, id, month, year]);

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
        <div className="flex-1 overflow-auto px-6 py-2">
          <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground animate-pulse font-bold">Đang truy xuất dữ liệu...</div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">Không có dữ liệu giao dịch trong khoảng thời gian này.</div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                  <TableRow>
                    <TableHead className="font-bold">Số Phiếu</TableHead>
                    <TableHead className="font-bold">Ngày Lập</TableHead>
                    <TableHead className="font-bold">{type.includes("purchase") ? "Nhà Cung Cấp" : "Khách Hàng"}</TableHead>
                    <TableHead className="text-right font-bold">Số Lượng</TableHead>
                    <TableHead className="text-right font-bold">Đơn Giá</TableHead>
                    <TableHead className="text-right font-bold">Thành Tiền</TableHead>
                    {type === "service" && <TableHead className="font-bold">Tình Trạng</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-blue-600">{item.soPhieu}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{item.ngayLap}</TableCell>
                      <TableCell className="font-medium">{item.khachHang || item.nhaCungCap}</TableCell>
                      <TableCell className="text-right font-bold">{formatNumber(item.soLuong)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{formatCurrency(item.donGia)}</TableCell>
                      <TableCell className="text-right font-black text-emerald-600">{formatCurrency(item.thanhTien)}</TableCell>
                      {type === "service" && (
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-black uppercase border",
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

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse p-4 rounded-xl border bg-card">
      <div className="h-4 w-1/3 bg-muted rounded" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-muted/50 rounded-lg" />
        <div className="h-16 bg-muted/50 rounded-lg" />
        <div className="h-16 bg-muted/50 rounded-lg" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-8 w-full bg-muted/30 rounded" />
        <div className="h-8 w-full bg-muted/30 rounded" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const now = currentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(now.month);
  const [selectedYear, setSelectedYear] = useState(now.year);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<InventoryReportResponse | null>(null);
  const [productRevenue, setProductRevenue] = useState<ProductRevenueReportResponse | null>(null);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenueReportResponse | null>(null);

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
  }, [selectedMonth, selectedYear]);

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
            <CardContent className="p-0">
              {!inventory ? (
                <div className="p-10"><EmptyState title="Dữ liệu kỳ này chưa chốt" description="Dữ liệu kho chưa được chốt cho tháng này." /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow>
                        <TableHead className="w-12 text-center font-bold">STT</TableHead>
                        <TableHead className="font-bold">Sản Phẩm</TableHead>
                        <TableHead className="text-right font-bold">Tồn Đầu</TableHead>
                        <TableHead className="text-right font-bold text-blue-600">Nhập</TableHead>
                        <TableHead className="text-right font-bold text-orange-600">Xuất</TableHead>
                        <TableHead className="text-right font-black">Tồn Cuối</TableHead>
                        <TableHead className="text-center font-bold">ĐVT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.chiTiet.map((item, idx) => (
                        <TableRow
                          key={idx}
                          className="hover:bg-muted/20 cursor-pointer h-14 transition-colors"
                          onClick={() => setDrillDown({ open: true, type: "product-purchase", id: item.maSanPham, name: item.tenSanPham })}
                        >
                          <TableCell className="text-center text-muted-foreground font-medium">{idx + 1}</TableCell>
                          <TableCell className="font-black text-slate-700 dark:text-slate-200">{item.tenSanPham}</TableCell>
                          <TableCell className="text-right font-medium">{formatNumber(item.tonDau)}</TableCell>
                          <TableCell className="text-right text-blue-600 font-bold">+{formatNumber(item.soLuongMuaVao)}</TableCell>
                          <TableCell className="text-right text-orange-600 font-bold">-{formatNumber(item.soLuongBanRa)}</TableCell>
                          <TableCell className="text-right font-black text-base">{formatNumber(item.tonCuoi)}</TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground font-black uppercase">{item.tenDonViTinh}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              </CardHeader>
              <CardContent className="p-6">
                {!productRevenue ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground italic font-medium">Chưa có số liệu kết toán doanh thu.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-[260px] w-full bg-muted/5 rounded-xl border border-dashed p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productRevenue.chiTiet.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="tenSanPham" type="category" width={100} fontSize={10} fontWeight={800} tick={{ fill: 'currentColor' }} />
                          <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05 }} />
                          <Bar
                            dataKey="doanhThu"
                            fill="oklch(0.56 0.18 261)"
                            radius={[0, 6, 6, 0]}
                            barSize={24}
                             onClick={(entry: any) => setDrillDown({ open: true, type: "product-sale", id: entry.maSanPham, name: entry.tenSanPham })}
                            className="cursor-pointer"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
                      <Table className="text-xs">
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="font-bold">Sản phẩm</TableHead>
                            <TableHead className="text-right font-bold">Doanh thu</TableHead>
                            <TableHead className="text-right font-bold w-16">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productRevenue.chiTiet.slice(0, 5).map((item, i) => (
                            <TableRow key={i} className="hover:bg-muted/20 cursor-pointer h-12 transition-colors" onClick={() => setDrillDown({ open: true, type: "product-sale", id: item.maSanPham, name: item.tenSanPham })}>
                              <TableCell className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.tenSanPham}</TableCell>
                              <TableCell className="text-right font-black text-emerald-600">{formatCurrency(item.doanhThu)}</TableCell>
                              <TableCell className="text-right font-black text-amber-600">{Math.round(Number(item.tiLe))}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 3: BM12 Service Revenue */}
            <Card className="border-none shadow-lg overflow-hidden border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5 bg-muted/5">
                <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                  <PieChart className="h-5 w-5 text-primary" />
                  Doanh Thu Dịch Vụ (BM12)
                </CardTitle>
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
              </CardHeader>
              <CardContent className="p-6">
                {!serviceRevenue ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground italic font-medium">Chưa có số liệu quyết toán dịch vụ.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-[260px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={serviceRevenue.chiTiet}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="doanhThu"
                            nameKey="tenLoaiDichVu"
                            stroke="none"
                             onClick={(entry: any) => setDrillDown({ open: true, type: "service", id: entry.maLoaiDichVu, name: entry.tenLoaiDichVu })}
                            className="cursor-pointer outline-none"
                          >
                            {serviceRevenue.chiTiet.map((_, i) => (
                              <Cell key={i} fill={["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"][i % 5]} className="hover:opacity-80 transition-opacity" />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<ChartTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
                      <Table className="text-xs">
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="font-bold">Dịch vụ</TableHead>
                            <TableHead className="text-right font-bold">Doanh thu</TableHead>
                            <TableHead className="text-right font-bold w-16">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceRevenue.chiTiet.slice(0, 5).map((item, i) => (
                            <TableRow key={i} className="hover:bg-muted/20 cursor-pointer h-12 transition-colors" onClick={() => setDrillDown({ open: true, type: "service", id: item.maLoaiDichVu, name: item.tenLoaiDichVu })}>
                              <TableCell className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{item.tenLoaiDichVu}</TableCell>
                              <TableCell className="text-right font-black text-emerald-600">{formatCurrency(item.doanhThu)}</TableCell>
                              <TableCell className="text-right font-black text-amber-600">{Math.round(Number(item.tiLe))}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
