"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Package, 
  Wrench, 
  PieChart, 
  Info,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function safeRatio(value: number): string {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

// Visual Skeleton screen card loader
function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse p-4 rounded-xl border bg-card">
      <div className="flex justify-between items-center pb-2 border-b">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-6 w-20 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-muted/65 rounded-lg" />
        <div className="h-16 bg-muted/65 rounded-lg" />
        <div className="h-16 bg-muted/65 rounded-lg" />
      </div>
      <div className="space-y-2.5 pt-2">
        <div className="h-8 w-full bg-muted/50 rounded" />
        <div className="h-8 w-full bg-muted/30 rounded" />
        <div className="h-8 w-full bg-muted/30 rounded" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const now = currentMonthYear();
  const [month, setMonth] = useState(String(now.month));
  const [year, setYear] = useState(String(now.year));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<InventoryReportResponse | null>(null);
  const [productRevenue, setProductRevenue] = useState<ProductRevenueReportResponse | null>(null);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenueReportResponse | null>(null);

  // Hover states for SVG charts
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  function parseMonthYear() {
    return {
      m: Math.max(1, Math.min(12, Number.parseInt(month, 10) || now.month)),
      y: Math.max(1, Number.parseInt(year, 10) || now.year),
    };
  }

  async function runReport(action: "inventory" | "product-revenue" | "service-revenue", mode: "generate" | "get") {
    setLoading(true);
    setError(null);
    const { m, y } = parseMonthYear();

    try {
      if (action === "inventory") {
        const data = mode === "generate" ? await backendApi.reports.inventoryGenerate(m, y) : await backendApi.reports.inventoryGet(m, y);
        setInventory(data);
      }

      if (action === "product-revenue") {
        const data =
          mode === "generate"
            ? await backendApi.reports.revenueProductsGenerate(m, y)
            : await backendApi.reports.revenueProductsGet(m, y);
        setProductRevenue(data);
      }

      if (action === "service-revenue") {
        const data =
          mode === "generate"
            ? await backendApi.reports.revenueServicesGenerate(m, y)
            : await backendApi.reports.revenueServicesGet(m, y);
        setServiceRevenue(data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t("reports.reportError")));
    } finally {
      setLoading(false);
    }
  }

  // Pre-calculate summary stats for reports
  const inventorySummary = useMemo(() => {
    if (!inventory) return null;
    const totalOpening = inventory.chiTiet.reduce((sum, item) => sum + Number(item.tonDau ?? 0), 0);
    const totalIn = inventory.chiTiet.reduce((sum, item) => sum + Number(item.soLuongMuaVao ?? 0), 0);
    const totalOut = inventory.chiTiet.reduce((sum, item) => sum + Number(item.soLuongBanRa ?? 0), 0);
    const totalClosing = inventory.chiTiet.reduce((sum, item) => sum + Number(item.tonCuoi ?? 0), 0);
    const lowStockCount = inventory.chiTiet.filter((item) => Number(item.tonCuoi ?? 0) < 10).length;

    return { totalOpening, totalIn, totalOut, totalClosing, lowStockCount };
  }, [inventory]);

  const productSummary = useMemo(() => {
    if (!productRevenue) return null;
    const totalSales = productRevenue.chiTiet.reduce((sum, item) => sum + Number(item.soLuongBan ?? 0), 0);
    const topProduct = productRevenue.chiTiet.reduce(
      (max, item) => (Number(item.doanhThu ?? 0) > Number(max.doanhThu ?? 0) ? item : max),
      productRevenue.chiTiet[0]
    );

    return { totalSales, topProduct };
  }, [productRevenue]);

  const serviceSummary = useMemo(() => {
    if (!serviceRevenue) return null;
    const totalServices = serviceRevenue.chiTiet.length;
    const topService = serviceRevenue.chiTiet.reduce(
      (max, item) => (Number(item.doanhThu ?? 0) > Number(max.doanhThu ?? 0) ? item : max),
      serviceRevenue.chiTiet[0]
    );

    return { totalServices, topService };
  }, [serviceRevenue]);

  // Color schemes for charts segments
  const donutColors = ["#f59e0b", "#6366f1", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];

  // Custom SVG Donut calculations
  const donutSegments = useMemo(() => {
    if (!serviceRevenue) return [];
    let cumulativePercent = 0;
    const r = 50;
    const circumference = 2 * Math.PI * r; // ~314.16

    return serviceRevenue.chiTiet.map((item, idx) => {
      const percentage = Number(item.tiLe ?? 0);
      const strokeLength = (percentage / 100) * circumference;
      const strokeOffset = circumference - (cumulativePercent / 100) * circumference;
      cumulativePercent += percentage;

      return {
        ...item,
        color: donutColors[idx % donutColors.length],
        strokeDash: `${strokeLength} ${circumference - strokeLength}`,
        strokeOffset,
      };
    });
  }, [serviceRevenue]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="BM10 - BM12 Operations Audit"
        title={t("reports.title") || "Báo Biểu Vận Hành & Doanh Số"}
        description={t("reports.description") || "Kiểm toán tồn kho sản phẩm, doanh số bán hàng trang sức và hiệu quả dịch vụ gia công."}
        badges={
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full px-2 py-0.5 text-[10px] font-semibold">
            <Sparkles className="h-3 w-3" />
            ADMIN PRIVILEGE
          </div>
        }
      />

      {/* Audit Period Filter Card */}
      <Card className="shadow-xs border-border/70 overflow-hidden">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-12 items-center bg-muted/10">
          <div className="sm:col-span-3 space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              {t("reports.month") || "Tháng Lập"}
            </Label>
            <Input 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="bg-background focus-visible:ring-amber-500/35 h-9" 
              placeholder="e.g. 5"
            />
          </div>
          <div className="sm:col-span-3 space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              {t("reports.year") || "Năm Lập"}
            </Label>
            <Input 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="bg-background focus-visible:ring-amber-500/35 h-9" 
              placeholder="e.g. 2026"
            />
          </div>
          <div className="sm:col-span-6 flex items-end h-full text-xs font-medium text-muted-foreground py-1">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex gap-2 w-full">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>Nhập Tháng/Năm và bấm <b>Lấy Dữ Liệu</b> để xem dữ liệu hiện tại, hoặc bấm <b>Lập Báo Cáo</b> để thiết lập kỳ kết toán sổ sách mới.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm font-medium text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Skeleton screen layer when loading */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <div className="space-y-6">
          {/* SECTION 1: BM10 Inventory Audit Report */}
          <Card className="shadow-xs border-border/70 overflow-hidden hover-elevate">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b bg-muted/15 py-3.5 px-4 gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Boxes className="h-4.5 w-4.5 text-amber-500" />
                  {t("reports.inventoryTitle") || "Báo Cáo Tồn Kho Sản Phẩm (BM10)"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Theo dõi chênh lệch xuất-nhập-tồn định kỳ hàng tháng.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={() => runReport("inventory", "get")} className="text-xs">
                  {t("common.getData") || "Lấy Dữ Liệu"}
                </Button>
                <Button size="sm" disabled={loading} onClick={() => runReport("inventory", "generate")} className="text-xs bg-gold-gradient text-gold-foreground font-semibold">
                  {t("common.generate") || "Lập Báo Cáo"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!inventory ? (
                <div className="p-5">
                  <EmptyState title={t("reports.inventoryEmpty") || "Chưa có dữ liệu tồn kho"} description={t("reports.inventoryEmptyDesc") || "Vui lòng bấm lấy dữ liệu hoặc lập báo cáo kết toán."} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Inventory quick metrics grid */}
                  {inventorySummary && (
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4 p-4 border-b bg-muted/5">
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Tổng Tồn Đầu</span>
                        <span className="mt-1 block text-lg font-extrabold text-foreground">{formatNumber(inventorySummary.totalOpening)}</span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center justify-center gap-1">
                          <ArrowDownToLine className="h-3 w-3 text-emerald-600" /> Nhập Vào
                        </span>
                        <span className="mt-1 block text-lg font-extrabold text-emerald-600">{formatNumber(inventorySummary.totalIn)}</span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center justify-center gap-1">
                          <ArrowUpFromLine className="h-3 w-3 text-amber-600" /> Xuất Bán
                        </span>
                        <span className="mt-1 block text-lg font-extrabold text-amber-600">{formatNumber(inventorySummary.totalOut)}</span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Tổng Tồn Cuối</span>
                        <span className="mt-1 block text-lg font-extrabold text-foreground">{formatNumber(inventorySummary.totalClosing)}</span>
                      </div>
                    </div>
                  )}

                  {/* Table content */}
                  <div className="overflow-x-auto px-4 pb-4">
                    <div className="rounded-lg border border-border/70 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-12 text-center">STT</TableHead>
                            <TableHead>Sản Phẩm</TableHead>
                            <TableHead className="text-right">Tồn Đầu</TableHead>
                            <TableHead className="text-right">Nhập Vào</TableHead>
                            <TableHead className="text-right">Xuất Bán</TableHead>
                            <TableHead className="text-right">Tồn Cuối</TableHead>
                            <TableHead className="text-center w-28">Hạn Mức Kho</TableHead>
                            <TableHead className="text-center">ĐVT</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory.chiTiet.map((item, idx) => {
                            const lowStock = Number(item.tonCuoi ?? 0) < 10;
                            const totalCap = Number(item.tonDau ?? 0) + Number(item.soLuongMuaVao ?? 0) || 1;
                            const stockPercent = Math.min(100, Math.max(0, (Number(item.tonCuoi ?? 0) / totalCap) * 100));

                            return (
                              <TableRow key={`${inventory.maBaoCaoTonKho}-${item.stt}`} className="table-row-hover">
                                <TableCell className="text-center font-medium text-muted-foreground">{item.stt}</TableCell>
                                <TableCell className="font-bold text-foreground">{item.tenSanPham}</TableCell>
                                <TableCell className="text-right font-medium">{formatNumber(item.tonDau)}</TableCell>
                                <TableCell className="text-right text-emerald-600 font-semibold">{formatNumber(item.soLuongMuaVao)}</TableCell>
                                <TableCell className="text-right text-amber-600 font-semibold">{formatNumber(item.soLuongBanRa)}</TableCell>
                                <TableCell className={`text-right font-extrabold ${lowStock ? "text-rose-600" : "text-foreground"}`}>
                                  {formatNumber(item.tonCuoi)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {/* Progress bar visual indicator */}
                                  <div className="space-y-1">
                                    <div className="h-2 w-full rounded-full bg-muted/65 overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all ${
                                          lowStock ? "bg-rose-500" : "bg-emerald-500"
                                        }`}
                                        style={{ width: `${stockPercent}%` }}
                                      />
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-[9px] py-0 px-1.5 ${
                                        lowStock 
                                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20" 
                                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      }`}
                                    >
                                      {lowStock ? "Nhập gấp" : "An toàn"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground font-semibold">{item.tenDonViTinh}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 2: BM11 Product Revenue Report & SVG Charts */}
          <Card className="shadow-xs border-border/70 overflow-hidden hover-elevate">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b bg-muted/15 py-3.5 px-4 gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-amber-500" />
                  {t("reports.productRevenueTitle") || "Báo Cáo Doanh Thu Bán Hàng (BM11)"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Phân tích mặt hàng bán chạy và tỷ trọng doanh thu trang sức.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={() => runReport("product-revenue", "get")} className="text-xs">
                  {t("common.getData") || "Lấy Dữ Liệu"}
                </Button>
                <Button size="sm" disabled={loading} onClick={() => runReport("product-revenue", "generate")} className="text-xs bg-gold-gradient text-gold-foreground font-semibold">
                  {t("common.generate") || "Lập Báo Cáo"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!productRevenue ? (
                <div className="p-5">
                  <EmptyState title={t("reports.productRevenueEmpty") || "Chưa có dữ liệu doanh số"} description={t("reports.inventoryEmptyDesc") || "Vui lòng bấm lấy dữ liệu hoặc lập báo cáo."} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Product Revenue Summary Metrics */}
                  {productSummary && (
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-3 p-4 border-b bg-muted/5">
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center justify-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Doanh Thu Sản Phẩm
                        </span>
                        <span className="mt-1 block text-lg font-extrabold text-amber-600">{formatCurrency(productRevenue.tongDoanhThuSanPham)}</span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Tổng Đã Bán</span>
                        <span className="mt-1 block text-lg font-extrabold text-foreground">{formatNumber(productSummary.totalSales)} sản phẩm</span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Sản Phẩm Chủ Lực</span>
                        <span className="mt-1 block text-xs font-bold text-foreground truncate px-1">
                          {productSummary.topProduct ? `${productSummary.topProduct.tenSanPham} (${safeRatio(productSummary.topProduct.tiLe)})` : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SVG Bar Chart Panel & Legend */}
                  <div className="grid gap-4 md:grid-cols-12 p-4 items-center">
                    {/* SVG Bar Ticker Column */}
                    <div className="md:col-span-7 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center md:text-left">
                        Biểu Đồ Thị Phần Doanh Thu Trang Sức
                      </h4>
                      <svg 
                        viewBox="0 0 450 140" 
                        className="w-full overflow-visible h-36"
                      >
                        <defs>
                          <linearGradient id="bar-gold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.71 0.12 74)" />
                            <stop offset="100%" stopColor="oklch(0.62 0.14 58)" />
                          </linearGradient>
                          <linearGradient id="bar-gold-hover" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.56 0.18 261)" />
                            <stop offset="100%" stopColor="oklch(0.71 0.12 74)" />
                          </linearGradient>
                        </defs>

                        {/* Baseline */}
                        <line x1="20" y1="120" x2="430" y2="120" stroke="#ddd" strokeWidth="1" />

                        {productRevenue.chiTiet.slice(0, 5).map((item, idx) => {
                          const maxRevenue = Math.max(...productRevenue.chiTiet.map(t => Number(t.doanhThu || 1))) || 1;
                          const barHeight = (Number(item.doanhThu) / maxRevenue) * 90;
                          const x = 30 + idx * 80;
                          const y = 120 - barHeight;
                          const isHovered = hoveredBar === idx;

                          return (
                            <g 
                              key={item.stt}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredBar(idx)}
                              onMouseLeave={() => setHoveredBar(null)}
                            >
                              {/* Glowing background on hover */}
                              {isHovered && (
                                <rect 
                                  x={x - 8} 
                                  y="10" 
                                  width="36" 
                                  height="115" 
                                  fill="oklch(0.71 0.12 74 / 6%)" 
                                  rx="5"
                                />
                              )}
                              
                              {/* Main bar */}
                              <motion.rect 
                                x={x}
                                y={y}
                                width="20"
                                height={Math.max(2, barHeight)}
                                fill={isHovered ? "url(#bar-gold-hover)" : "url(#bar-gold)"}
                                rx="3"
                                initial={{ scaleY: 0, y: 120 }}
                                animate={{ scaleY: 1, y }}
                                style={{ transformOrigin: "bottom" }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                              />

                              {/* Hover text label */}
                              {isHovered && (
                                <text 
                                  x={x + 10} 
                                  y={y - 8} 
                                  textAnchor="middle" 
                                  fontSize="9" 
                                  fontWeight="bold" 
                                  fill="oklch(0.56 0.18 261)"
                                >
                                  {formatNumber(Number(item.doanhThu) / 1000000)}M
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Chart Legend list */}
                    <div className="md:col-span-5 space-y-2">
                      <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">
                        Sản phẩm doanh số cao nhất
                      </span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto app-scrollbar pr-2">
                        {productRevenue.chiTiet.slice(0, 5).map((item, idx) => (
                          <div 
                            key={item.tenSanPham} 
                            className={`flex items-center justify-between p-1.5 rounded-lg border text-xs transition-all ${
                              hoveredBar === idx 
                                ? "bg-amber-500/10 border-amber-500/30 font-bold scale-[1.01]" 
                                : "bg-card border-border/40"
                            }`}
                            onMouseEnter={() => setHoveredBar(idx)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                              <span className="truncate">{item.tenSanPham}</span>
                            </div>
                            <span className="shrink-0 text-muted-foreground font-semibold ml-2">
                              {safeRatio(item.tiLe)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Raw Data List Grid */}
                  <div className="overflow-x-auto px-4 pb-4">
                    <div className="rounded-lg border border-border/70 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-12 text-center">STT</TableHead>
                            <TableHead>Tên Sản Phẩm</TableHead>
                            <TableHead className="text-right">Số Lượng Đã Bán</TableHead>
                            <TableHead className="text-right">Doanh Thu Thu Hoạch</TableHead>
                            <TableHead className="text-right">Tỷ Trọng Doanh Số</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productRevenue.chiTiet.map((item) => (
                            <TableRow key={`${productRevenue.maBaoCaoDoanhThuSp}-${item.stt}`} className="table-row-hover">
                              <TableCell className="text-center font-medium text-muted-foreground">{item.stt}</TableCell>
                              <TableCell className="font-bold text-foreground">{item.tenSanPham}</TableCell>
                              <TableCell className="text-right font-medium">{formatNumber(item.soLuongBan)}</TableCell>
                              <TableCell className="text-right text-emerald-600 font-extrabold">{formatCurrency(item.doanhThu)}</TableCell>
                              <TableCell className="text-right font-semibold text-amber-600">{safeRatio(item.tiLe)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 3: BM12 Service Revenue Donut Charts */}
          <Card className="shadow-xs border-border/70 overflow-hidden hover-elevate">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b bg-muted/15 py-3.5 px-4 gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <PieChart className="h-4.5 w-4.5 text-amber-500" />
                  {t("reports.serviceRevenueTitle") || "Báo Cáo Doanh Thu Dịch Vụ Gia Công (BM12)"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Theo dõi dòng tiền từ dịch vụ gia công và tiền công chế tác.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={() => runReport("service-revenue", "get")} className="text-xs">
                  {t("common.getData") || "Lấy Dữ Liệu"}
                </Button>
                <Button size="sm" disabled={loading} onClick={() => runReport("service-revenue", "generate")} className="text-xs bg-gold-gradient text-gold-foreground font-semibold">
                  {t("common.generate") || "Lập Báo Cáo"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!serviceRevenue ? (
                <div className="p-5">
                  <EmptyState title={t("reports.serviceRevenueEmpty") || "Chưa có dữ liệu dịch vụ"} description={t("reports.inventoryEmptyDesc") || "Vui lòng bấm lấy dữ liệu hoặc lập báo cáo."} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Service Revenue Summary Grid */}
                  {serviceSummary && (
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-3 p-4 border-b bg-muted/5">
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center justify-center gap-1">
                          <Wrench className="h-3.5 w-3.5 text-amber-500" /> Doanh Thu Dịch Vụ
                        </span>
                        <span className="mt-1 block text-lg font-extrabold text-amber-600">{formatCurrency(serviceRevenue.tongDoanhThuDichVu)}</span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Hạng Mục Kỹ Thuật</span>
                        <span className="mt-1 block text-lg font-extrabold text-foreground">{serviceSummary.totalServices} loại hình</span>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                        <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Dịch Vụ Phổ Biến Nhất</span>
                        <span className="mt-1 block text-xs font-bold text-foreground truncate px-1">
                          {serviceSummary.topService ? `${serviceSummary.topService.tenLoaiDichVu} (${safeRatio(serviceSummary.topService.tiLe)})` : "N/A"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SVG Segmented Donut Chart Panel */}
                  <div className="grid gap-4 md:grid-cols-12 p-4 items-center">
                    {/* SVG Segmented Donut Render */}
                    <div className="md:col-span-7 flex justify-center">
                      <div className="relative h-32 w-32">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          {donutSegments.length === 0 ? (
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                          ) : (
                            donutSegments.map((seg, idx) => {
                              const isHovered = hoveredSegment === idx;
                              return (
                                <motion.circle
                                  key={seg.tenLoaiDichVu}
                                  cx="60"
                                  cy="60"
                                  r="50"
                                  fill="none"
                                  stroke={seg.color}
                                  strokeWidth={isHovered ? 16 : 12}
                                  strokeDasharray={seg.strokeDash}
                                  strokeDashoffset={seg.strokeOffset}
                                  className="transition-all duration-300 cursor-pointer"
                                  onMouseEnter={() => setHoveredSegment(idx)}
                                  onMouseLeave={() => setHoveredSegment(null)}
                                  initial={{ strokeDasharray: `0 314.16` }}
                                  animate={{ strokeDasharray: seg.strokeDash }}
                                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                                />
                              );
                            })
                          )}
                        </svg>

                        {/* Interactive middle label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground">Tỷ Lệ</span>
                          <span className="text-sm font-extrabold text-foreground">
                            {hoveredSegment !== null 
                              ? safeRatio(donutSegments[hoveredSegment].tiLe) 
                              : "100%"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="md:col-span-5 space-y-2">
                      <span className="block text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">
                        Cơ Cấu Hạng Mục Dịch Vụ
                      </span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto app-scrollbar pr-2">
                        {donutSegments.map((seg, idx) => (
                          <div 
                            key={seg.tenLoaiDichVu} 
                            className={`flex items-center justify-between p-1.5 rounded-lg border text-xs transition-all ${
                              hoveredSegment === idx 
                                ? "bg-muted border-border/80 font-bold scale-[1.01]" 
                                : "bg-card border-border/40"
                            }`}
                            onMouseEnter={() => setHoveredSegment(idx)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span 
                                className="h-2.5 w-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: seg.color }}
                              />
                              <span className="truncate">{seg.tenLoaiDichVu}</span>
                            </div>
                            <span className="shrink-0 text-muted-foreground font-semibold ml-2">
                              {safeRatio(seg.tiLe)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Raw Data List Grid */}
                  <div className="overflow-x-auto px-4 pb-4">
                    <div className="rounded-lg border border-border/70 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-12 text-center">STT</TableHead>
                            <TableHead>Hạng Mục Kỹ Thuật</TableHead>
                            <TableHead className="text-right">Doanh Thu Khai Thác</TableHead>
                            <TableHead className="text-right">Tỷ Trọng Đóng Góp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceRevenue.chiTiet.map((item) => (
                            <TableRow key={`${serviceRevenue.maBaoCaoDoanhThuDv}-${item.stt}`} className="table-row-hover">
                              <TableCell className="text-center font-medium text-muted-foreground">{item.stt}</TableCell>
                              <TableCell className="font-bold text-foreground">{item.tenLoaiDichVu}</TableCell>
                              <TableCell className="text-right text-emerald-600 font-extrabold">{formatCurrency(item.doanhThu)}</TableCell>
                              <TableCell className="text-right font-semibold text-amber-600">{safeRatio(item.tiLe)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
