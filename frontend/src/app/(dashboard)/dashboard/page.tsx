"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, MetricCard, PageHeader } from "@/components/dashboard/management";
import { backendApi } from "@/services/backend-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  BarChart3,
  Boxes,
  FileClock,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Sparkles,
  Zap,
  Clock,
  PlusCircle,
  Eye,
  FileText,
  Settings,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SaleResponse, ServiceTicketResponse } from "@/types/backend";
import { useTranslation } from "@/i18n/i18n-context";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface GoldPrice {
  type: string;
  buy: number;
  sell: number;
  change: number;
}

interface ChartPoint {
  label: string;
  sales: number;
  services: number;
  combined: number;
}

function isCurrentMonth(dateText: string): boolean {
  const now = new Date();
  const target = new Date(dateText);
  return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
}

function isServiceTicketCompleted(ticket: ServiceTicketResponse): boolean {
  const s = ticket.tinhTrangDichVu.toLowerCase();
  return s.includes("hoàn thành") || s.includes("hoan thanh");
}

function formatServiceStatus(status: string, t: any): string {
  const s = status.toLowerCase();
  if (s.includes("hoàn thành") || s.includes("hoan thanh")) return t("serviceLookup.completed") || "Hoàn thành";
  return t("serviceLookup.incomplete") || "Chưa hoàn thành";
}

function calcCurrentMonthRevenue(sales: SaleResponse[]): number {
  return sales
    .filter((item) => isCurrentMonth(item.ngayLapPhieuBan))
    .reduce((sum, item) => sum + Number(item.tongTien ?? 0), 0);
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productCount, setProductCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [pendingServiceTickets, setPendingServiceTickets] = useState(0);

  const [salesList, setSalesList] = useState<SaleResponse[]>([]);
  const [servicesList, setServicesList] = useState<ServiceTicketResponse[]>([]);

  // Gold Price Ticker State
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([
    { type: "Vàng SJC (99.99)", buy: 82500000, sell: 84500000, change: 0 },
    { type: "Vàng Nhẫn 9999", buy: 73200000, sell: 74800000, change: 0 },
    { type: "Vàng Nữ Trang 24K", buy: 72100000, sell: 73600000, change: 0 },
    { type: "Vàng Nữ Trang 18K", buy: 53500000, sell: 55500000, change: 0 },
  ]);
  const [flashRow, setFlashRow] = useState<string | null>(null);
  const [flashDirection, setFlashDirection] = useState<"up" | "down" | null>(null);

  // Time filter for chart
  const [timeFilter, setTimeFilter] = useState<"thisWeek" | "lastWeek" | "last30Days">("thisWeek");

  // Active chart view tab
  const [chartMode, setChartMode] = useState<"sales" | "services" | "combined">("sales");
  const [hoveredChartPoint, setHoveredChartPoint] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Simulate Live Gold Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const targetIndex = Math.floor(Math.random() * goldPrices.length);
      const isUp = Math.random() > 0.4;
      const amount = (isUp ? 1 : -1) * 10000;

      setGoldPrices((prev) =>
        prev.map((item, idx) => {
          if (idx === targetIndex) {
            return {
              ...item,
              buy: item.buy + amount,
              sell: item.sell + amount,
              change: amount,
            };
          }
          return { ...item, change: 0 };
        })
      );

      setFlashRow(goldPrices[targetIndex].type);
      setFlashDirection(isUp ? "up" : "down");

      // Reset flash highlight after 1.5s
      setTimeout(() => {
        setFlashRow(null);
        setFlashDirection(null);
      }, 1500);
    }, 8000);

    return () => clearInterval(interval);
  }, [goldPrices]);

  // Load Data
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [productsPage, sales, serviceTickets] = await Promise.all([
          backendApi.products.list({ page: 0, size: 100 }),
          backendApi.sales.list(),
          backendApi.serviceTickets.list(),
        ]);

        if (!mounted) return;

        const products = productsPage.content;
        setSalesList(sales);
        setServicesList(serviceTickets);
        setProductCount(products.length);
        setTotalStock(products.reduce((sum, item) => sum + Number(item.tonKho ?? 0), 0));
        setCurrentMonthRevenue(calcCurrentMonthRevenue(sales));
        setPendingServiceTickets(serviceTickets.filter((item) => !isServiceTicketCompleted(item)).length);
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err, t("dashboard.loadFailed")));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [t]);

  // Generate chart data based on time filter
  const chartData = useMemo<ChartPoint[]>(() => {
    const list: ChartPoint[] = [];
    const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const now = new Date();
    let startDate = new Date(now);
    let daysCount = 7;

    if (timeFilter === "thisWeek") {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(now.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === "lastWeek") {
      const dayOfWeek = now.getDay();
      const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + 7;
      startDate.setDate(now.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === "last30Days") {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      daysCount = 30;
    }

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      let dayLabel = "";
      if (daysCount === 7) {
        dayLabel = t(`dashboard.${dayKeys[i]}`);
      } else {
        dayLabel = `${day}/${month}`;
      }

      const isFuture = d > now && d.toDateString() !== now.toDateString();

      const dailySales = isFuture ? 0 : salesList
        .filter((s) => s.ngayLapPhieuBan && s.ngayLapPhieuBan.startsWith(dateStr))
        .reduce((sum, s) => sum + Number(s.tongTien || 0), 0);

      const dailyServices = isFuture ? 0 : servicesList
        .filter((s) => s.ngayLapPhieuDichVu && s.ngayLapPhieuDichVu.startsWith(dateStr))
        .reduce((sum, s) => sum + Number(s.tongTien || 0), 0);

      list.push({
        label: dayLabel,
        sales: dailySales,
        services: dailyServices,
        combined: dailySales + dailyServices,
      });
    }

    return list;
  }, [salesList, servicesList, t, timeFilter]);

  // Custom SVG Chart Coordinates calculations
  const chartPathData = useMemo(() => {
    if (chartData.length === 0) {
      return {
        points: [],
        baseY: 290,
        yAxisLabels: [],
        startX: 62,
        endX: 680,
        width: 700,
        height: 340
      };
    }

    const width = 700;
    const height = 340;
    const paddingLeft = 62;
    const paddingRight = 20;
    const paddingBottom = 50;
    const paddingTop = 25;

    const values = chartData.map((d) => {
      if (chartMode === "sales") return d.sales;
      if (chartMode === "services") return d.services;
      return d.combined;
    });

    const maxValue = Math.max(...values, 100000) * 1.05;
    const minValue = 0;
    const valueRange = maxValue - minValue || 1;

    // Generate Y axis labels (5 ticks)
    const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const val = maxValue * (1 - ratio);
        const y = paddingTop + ratio * (height - paddingBottom - paddingTop);
        let label = "";
        const mUnit = t("common.million") || "Tr";
        const kUnit = t("common.thousand") || "k";

        if (val >= 1000000) label = (val / 1000000).toFixed(1) + mUnit;
        else if (val >= 1000) label = (val / 1000).toFixed(0) + kUnit;
        else label = val.toFixed(0);
        return { y, label, val };
    });

    const chartW = width - paddingLeft - paddingRight;
    const count = chartData.length;
    const slotW = chartW / count;

    const points = chartData.map((d, idx) => {
      const val = chartMode === "sales" ? d.sales : chartMode === "services" ? d.services : d.combined;
      const x = paddingLeft + slotW * idx + slotW / 2;
      const y = (height - paddingBottom) - ((val - minValue) / valueRange) * (height - paddingBottom - paddingTop);
      return { x, y, value: val, label: d.label, slotW };
    });

    return {
        points,
        baseY: height - paddingBottom,
        yAxisLabels,
        startX: paddingLeft,
        endX: width - paddingRight,
        width,
        height
    };
  }, [chartData, chartMode, t]);

  // Handle Chart Interaction Hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current || chartPathData.points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Convert mouseX to SVG coordinate space
    const svgX = (mouseX / rect.width) * chartPathData.width;

    // Find the closest point index based on X distance
    let closestIndex = 0;
    let minDistance = Math.abs(svgX - chartPathData.points[0].x);

    for (let i = 1; i < chartPathData.points.length; i++) {
      const distance = Math.abs(svgX - chartPathData.points[i].x);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    setHoveredChartPoint(closestIndex);
  };

  // Recent activity list
  const activities = useMemo(() => {
    const list: Array<{
      type: "sale" | "service" | "system";
      id: string;
      title: string;
      desc: string;
      time: string;
      tagColor: string;
      label: string;
    }> = [];

    // Map real sales to timeline
    salesList.slice(0, 3).forEach((s, idx) => {
      list.push({
        type: "sale",
        id: s.soPhieuBan,
        title: `${t("common.retailInvoice")} #${s.soPhieuBan}`,
        desc: `${t("common.customer")}: ${s.khachHang?.tenKhachHang || t("common.guest")} • ${t("common.total")}: ${formatCurrency(s.tongTien)}`,
        time: t("common.minutesAgo").replace("{n}", String(idx * 15 + 8)),
        tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        label: t("common.sale"),
      });
    });

    // Map real service orders to timeline
    servicesList.slice(0, 2).forEach((s, idx) => {
      list.push({
        type: "service",
        id: s.soPhieuDichVu,
        title: `${t("common.serviceOrder")} #${s.soPhieuDichVu}`,
        desc: `${t("common.customer")}: ${s.khachHang?.tenKhachHang || t("common.guest")} • ${t("common.status")}: ${formatServiceStatus(s.tinhTrangDichVu, t)}`,
        time: t("common.minutesAgo").replace("{n}", String(idx * 25 + 22)),
        tagColor: "bg-primary/10 text-primary border-primary/20",
        label: t("common.service"),
      });
    });

    // Fallbacks to guarantee rich timeline
    if (list.length < 5) {
      const systemLogs = [
        {
          type: "system" as const,
          id: "SYS-01",
          title: t("common.autoGoldSync"),
          desc: t("common.autoGoldSyncDesc"),
          time: t("common.hoursAgo").replace("{n}", "2"),
          tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          label: t("common.system"),
        },
        {
          type: "system" as const,
          id: "SYS-02",
          title: t("common.inventoryCheck"),
          desc: t("common.inventoryCheckDesc"),
          time: t("common.yesterday"),
          tagColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          label: t("common.system"),
        },
      ];
      systemLogs.forEach((log) => list.push(log));
    }

    return list.slice(0, 5);
  }, [salesList, servicesList]);

  const summaryMetrics = useMemo(
    () => [
      {
        label: t("dashboard.productCount"),
        value: formatNumber(productCount),
        icon: Package,
        tone: "neutral" as const,
        growth: t("dashboard.growthProduct"),
      },
      {
        label: t("dashboard.totalStock"),
        value: formatNumber(totalStock),
        icon: Boxes,
        tone: "warning" as const,
        growth: t("dashboard.growthStock"),
      },
      {
        label: t("dashboard.monthRevenue"),
        value: formatCurrency(currentMonthRevenue),
        icon: BarChart3,
        tone: "success" as const,
        growth: t("dashboard.growthRevenue"),
      },
      {
        label: t("dashboard.pendingService"),
        value: formatNumber(pendingServiceTickets),
        icon: FileClock,
        tone: "danger" as const,
        growth: t("dashboard.growthUrgent"),
      },
    ],
    [currentMonthRevenue, pendingServiceTickets, productCount, totalStock, t]
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        eyebrow={t("nav.dashboard")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        badges={
          <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t("dashboard.realtime").toUpperCase()}
          </div>
        }
      />

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm font-medium text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Premium Dashboard Metrics Panel */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryMetrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="hover-elevate cursor-pointer rounded-xl border border-border/70 bg-card p-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
                    {loading ? (
                      <span className="inline-block h-6 w-16 animate-pulse rounded bg-muted" />
                    ) : (
                      item.value
                    )}
                  </h3>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
                  <Icon className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className={`mt-3 flex items-center gap-1.5 text-[11px] font-bold ${idx === 3 ? "text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full w-fit border border-rose-500/20" : "text-emerald-600"}`}>
                <Sparkles className="h-3 w-3" />
                <span>{item.growth}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Middle Sections Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Visual Revenue Sparkline Chart */}
        <Card className="col-span-12 lg:col-span-8 shadow-xs border-border/70 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3 border-b bg-muted/10">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                {t("dashboard.revenueAnalysis")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{t("dashboard.revenueDesc")}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Time filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 px-2.5 border-dashed">
                    {t(`dashboard.${timeFilter}`)}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem onClick={() => setTimeFilter("thisWeek")}>{t("dashboard.thisWeek")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeFilter("lastWeek")}>{t("dashboard.lastWeek")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeFilter("last30Days")}>{t("dashboard.last30Days")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tab switch controller */}
              <div className="flex items-center gap-1 rounded-lg border bg-muted/45 p-0.5">
                <Button
                  variant={chartMode === "sales" ? "default" : "ghost"}
                  size="xs"
                  className="text-[10px] h-6 px-2.5"
                  onClick={() => setChartMode("sales")}
                >
                  {t("common.sale")}
                </Button>
                <Button
                  variant={chartMode === "services" ? "default" : "ghost"}
                  size="xs"
                  className="text-[10px] h-6 px-2.5"
                  onClick={() => setChartMode("services")}
                >
                  {t("common.service")}
                </Button>
                <Button
                  variant={chartMode === "combined" ? "default" : "ghost"}
                  size="xs"
                  className="text-[10px] h-6 px-2.5"
                  onClick={() => setChartMode("combined")}
                >
                  {t("common.total")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 pb-4 px-2 sm:px-4">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="relative">
                {/* SVG Bar Chart Render */}
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${chartPathData.width} ${chartPathData.height}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full overflow-visible cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredChartPoint(null)}
                >
                  <defs>
                    <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.65 0.16 261)" />
                      <stop offset="50%" stopColor="oklch(0.60 0.17 280)" />
                      <stop offset="100%" stopColor="oklch(0.71 0.12 74)" />
                    </linearGradient>
                    <linearGradient id="bar-gradient-hover" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.56 0.20 261)" />
                      <stop offset="100%" stopColor="oklch(0.62 0.16 74)" />
                    </linearGradient>
                    <filter id="bar-shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="oklch(0.56 0.18 261)" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Horizontal gridlines and Y-axis labels */}
                  {chartPathData.yAxisLabels.map((item, index) => (
                    <g key={index}>
                      <text
                        x={chartPathData.startX - 10}
                        y={item.y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-muted-foreground/50 font-medium"
                      >
                        {item.label}
                      </text>
                      <line
                        x1={chartPathData.startX}
                        y1={item.y}
                        x2={chartPathData.endX}
                        y2={item.y}
                        stroke="currentColor"
                        strokeOpacity="0.06"
                        strokeWidth="1"
                        strokeDasharray={index === 4 ? "0" : "4 3"}
                      />
                    </g>
                  ))}

                  {/* Baseline axis */}
                  <line
                    x1={chartPathData.startX}
                    y1={chartPathData.baseY}
                    x2={chartPathData.endX}
                    y2={chartPathData.baseY}
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="1"
                  />

                  {/* Data Bars */}
                  {chartPathData.points.map((pt, idx) => {
                    const isHovered = hoveredChartPoint === idx;
                    const slotW = pt.slotW;
                    const barWidth = Math.min(48, slotW * 0.55);
                    const barHeight = Math.max(2, chartPathData.baseY - pt.y);
                    const barRadius = Math.min(6, barWidth / 3);

                    return (
                      <g key={idx}>
                        {/* Hover Column Background */}
                        {isHovered && (
                          <rect
                            x={pt.x - slotW / 2}
                            y={chartPathData.yAxisLabels[0]?.y ?? 20}
                            width={slotW}
                            height={chartPathData.baseY - (chartPathData.yAxisLabels[0]?.y ?? 20)}
                            fill="currentColor"
                            fillOpacity="0.03"
                            rx="6"
                          />
                        )}

                        <motion.rect
                          x={pt.x - barWidth / 2}
                          y={pt.y}
                          width={barWidth}
                          height={barHeight}
                          fill={isHovered ? "url(#bar-gradient-hover)" : "url(#bar-gradient)"}
                          fillOpacity={isHovered ? 1 : 0.88}
                          rx={barRadius}
                          filter={isHovered ? "url(#bar-shadow)" : undefined}
                          className="transition-colors duration-200"
                          style={{ originY: 1 }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.025 }}
                        />

                        {/* Value label above bar on hover */}
                        {isHovered && (
                          <text
                            x={pt.x}
                            y={pt.y - 8}
                            textAnchor="middle"
                            className="text-[10px] fill-primary font-bold"
                          >
                            {formatCurrency(
                              chartMode === "sales"
                                ? chartData[idx].sales
                                : chartMode === "services"
                                ? chartData[idx].services
                                : chartData[idx].combined
                            )}
                          </text>
                        )}

                        {/* X-axis day label */}
                        <text
                          x={pt.x}
                          y={chartPathData.baseY + 18}
                          textAnchor="middle"
                          className={`text-[10px] font-semibold transition-colors duration-200 ${isHovered ? "fill-primary" : "fill-muted-foreground/65"}`}
                        >
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip Overlay */}
                <AnimatePresence>
                  {hoveredChartPoint !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-card/95 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs shadow-xl flex items-center gap-4 border border-border/80 ring-1 ring-amber-500/10"
                    >
                      <div className="text-left space-y-0.5">
                        <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          {t("common.date")} {chartData[hoveredChartPoint].label}
                        </span>
                        <span className="text-sm font-extrabold text-foreground">
                          {formatCurrency(
                            chartMode === "sales"
                              ? chartData[hoveredChartPoint].sales
                              : chartMode === "services"
                              ? chartData[hoveredChartPoint].services
                              : chartData[hoveredChartPoint].combined
                          )}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px] capitalize text-amber-600 bg-amber-500/10 border-amber-500/20 font-bold">
                        {chartMode === "sales" ? t("common.sale") : chartMode === "services" ? t("common.service") : t("common.total")}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Gold Price Board */}
        <Card className="col-span-12 lg:col-span-4 shadow-xs border-border/70 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {t("dashboard.goldPriceLive")}
                </span>
                <Badge variant="outline" className="animate-pulse bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[9px] py-0.5 px-2">
                  {t("dashboard.live").toUpperCase()}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">{t("dashboard.goldPriceDesc")}</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {goldPrices.map((gold) => {
                  const isFlashing = flashRow === gold.type;
                  return (
                    <div
                      key={gold.type}
                      className={`flex items-center justify-between p-3.5 transition-colors duration-500 ${
                        isFlashing
                          ? flashDirection === "up"
                            ? "bg-emerald-500/10"
                            : "bg-rose-500/10"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-foreground">{gold.type}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {t("common.updatedJustNow")}
                        </span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-muted-foreground">{t("common.buy")}</span>
                          <span className="text-xs font-bold">{formatNumber(gold.buy / 1000)}k</span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-muted-foreground">{t("common.sell")}</span>
                          <span className={`text-xs font-bold transition-all duration-300 ${
                            isFlashing
                              ? flashDirection === "up"
                                ? "text-emerald-600 font-extrabold"
                                : "text-rose-600 font-extrabold"
                              : "text-foreground"
                          }`}>
                            {formatNumber(gold.sell / 1000)}k
                          </span>
                        </div>
                      </div>
                      {/* Fluctuating mini indicator */}
                      <div className="w-14 flex flex-col items-end justify-center">
                        {gold.change !== 0 && (
                          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${gold.change > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {gold.change > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                            {formatNumber(Math.abs(gold.change) / 1000)}k
                          </div>
                        )}
                        {gold.change === 0 && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/35" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </div>
          <div className="p-3 border-t bg-muted/10 text-center">
            <Link href="/dashboard/gold-prices">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:bg-muted">
                {t("dashboard.manageGoldPrices")}
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Bottom Layout Row */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Recent Transactions & Operations Timeline */}
        <Card className="col-span-12 lg:col-span-8 shadow-xs border-border/70">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              {t("dashboard.activityLog")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{t("dashboard.activityDesc")}</p>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            {loading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3.5 w-1/4 rounded bg-muted" />
                      <div className="h-3 w-3/4 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8">
                <EmptyState title="Chưa có giao dịch" description="Chưa ghi nhận hoạt động giao dịch nào hôm nay." />
              </div>
            ) : (
              <div className="relative border-l border-border/60 pl-5 ml-2.5 space-y-5 py-2">
                {activities.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Bullet marker */}
                    <span className="absolute -left-[26px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-background border border-border group-hover:border-amber-500/50 transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="space-y-0.5 min-w-0">
                        <span className="block text-xs font-bold text-foreground leading-tight">
                          {act.title}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate leading-relaxed">
                          {act.desc}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border ${act.tagColor}`}>
                          {act.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" />
                          {act.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Operations panel */}
        <Card className="col-span-12 lg:col-span-4 shadow-xs border-border/70 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              {t("dashboard.quickActions")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{t("dashboard.quickActionsDesc")}</p>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-3 w-full">
              <Link href="/dashboard/orders">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-amber-500/40 hover:bg-amber-500/5 group shadow-xs">
                  <div className="rounded-full bg-amber-500/10 p-2 group-hover:bg-amber-500/20 transition-colors">
                    <PlusCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-bold text-foreground">{t("nav.salesOrders")}</span>
                </Button>
              </Link>

              <Link href="/dashboard/service-orders">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-primary/40 hover:bg-primary/5 group shadow-xs">
                  <div className="rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                    <FileClock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-foreground">{t("nav.serviceOrders")}</span>
                </Button>
              </Link>

              <Link href="/dashboard/service-voucher-lookup">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-emerald-500/40 hover:bg-emerald-500/5 group shadow-xs">
                  <div className="rounded-full bg-emerald-500/10 p-2 group-hover:bg-emerald-500/20 transition-colors">
                    <Eye className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-foreground">{t("common.serviceSearch")}</span>
                </Button>
              </Link>

              <Link href="/dashboard/reports">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-blue-500/40 hover:bg-blue-500/5 group shadow-xs">
                  <div className="rounded-full bg-blue-500/10 p-2 group-hover:bg-blue-500/20 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-foreground">{t("common.reportsMonthly")}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
          <div className="p-3 border-t bg-muted/10 text-center">
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                {t("dashboard.configSystem")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
