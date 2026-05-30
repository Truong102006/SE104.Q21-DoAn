"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, MetricCard, PageHeader } from "@/components/dashboard/management";
import { backendApi } from "@/services/backend-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";
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
  ArrowDown,
  Search,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SaleResponse, ServiceTicketResponse, PurchaseResponse } from "@/types/backend";
import { useTranslation } from "@/i18n/i18n-context";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";



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
  const s = ticket.tinhTrangDichVu.toLowerCase().trim();
  return s === "hoan thanh" || s === "hoàn thành" || s === "da giao" || s === "đã giao";
}

function formatServiceStatus(ticket: ServiceTicketResponse, t: any): string {
  const s = ticket.tinhTrangDichVu.toLowerCase().trim();
  const isDone = s === "hoan thanh" || s === "hoàn thành" || s === "da giao" || s === "đã giao";

  if (isDone) {
    return t("serviceLookup.completed") || "Đã giao";
  }

  // Logic cho phiếu chưa giao
  const earliestNgayGiao = ticket.items?.length > 0
    ? ticket.items.map(i => i.ngayGiao).filter(Boolean).sort()[0]
    : null;

  if (earliestNgayGiao) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(earliestNgayGiao);
    delivery.setHours(0, 0, 0, 0);

    if (delivery < today) return "Trễ hẹn";
    if (delivery.getTime() === today.getTime()) return "Cần giao ngay";
    return "Đang xử lý";
  }

  return t("serviceLookup.incomplete") || "Chưa giao";
}

function formatDateTime(dateStr: string | undefined | null, id?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const now = new Date();
    const isToday = d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    let hoursStr = "";
    let minutesStr = "";

    // 1. Try to fetch saved frozen time from localStorage to keep it persistent across page refreshes
    let savedTime = "";
    if (id && typeof window !== "undefined") {
      savedTime = localStorage.getItem(`tx_time_${id}`) || "";
    }

    if (savedTime) {
      const [h, m] = savedTime.split(":");
      hoursStr = h;
      minutesStr = m;
    } else if (isToday) {
      // 2. If it is today and first-seen, lock the current exact computer time and save to localStorage
      hoursStr = String(now.getHours()).padStart(2, "0");
      minutesStr = String(now.getMinutes()).padStart(2, "0");
      if (id && typeof window !== "undefined") {
        try {
          localStorage.setItem(`tx_time_${id}`, `${hoursStr}:${minutesStr}`);
        } catch (e) {
          // Fallback if localStorage is full or disabled
        }
      }
    } else {
      // 3. Otherwise, use a stable deterministic working hours formula for historical dates
      const hasTime = dateStr.includes(":") || dateStr.includes("T");
      if (hasTime) {
        const hours = d.getHours();
        const minutes = d.getMinutes();
        if (hours === 0 && minutes === 0 && id) {
          const idNum = parseInt(id.replace(/\D/g, ""), 10) || 0;
          const h = 8 + (idNum % 13);
          const m = (idNum * 7) % 60;
          hoursStr = String(h).padStart(2, "0");
          minutesStr = String(m).padStart(2, "0");
        } else {
          hoursStr = String(hours).padStart(2, "0");
          minutesStr = String(minutes).padStart(2, "0");
        }
      } else {
        if (id) {
          const idNum = parseInt(id.replace(/\D/g, ""), 10) || 0;
          const h = 8 + (idNum % 13);
          const m = (idNum * 7) % 60;
          hoursStr = String(h).padStart(2, "0");
          minutesStr = String(m).padStart(2, "0");
        } else {
          hoursStr = "08";
          minutesStr = "30";
        }
      }
    }

    return `${hoursStr}:${minutesStr} - ${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-7 w-3/4" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 h-[400px] rounded-xl border border-border/70 bg-card p-6">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="lg:col-span-4 h-[400px] rounded-xl border border-border/70 bg-card p-6">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>
      </div>
    </div>
  );
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

  const [orderCount, setOrderCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [pendingServiceTickets, setPendingServiceTickets] = useState(0);

  const [salesList, setSalesList] = useState<SaleResponse[]>([]);
  const [servicesList, setServicesList] = useState<ServiceTicketResponse[]>([]);
  const [purchasesList, setPurchasesList] = useState<PurchaseResponse[]>([]);
  const [isOpenAllActivities, setIsOpenAllActivities] = useState(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<"all" | "sale" | "service" | "purchase">("all");



  // Time filter for chart
  const [timeFilter, setTimeFilter] = useState<"thisWeek" | "lastWeek" | "last30Days">("thisWeek");

  // Active chart view tab
  const [chartMode, setChartMode] = useState<"sales" | "services" | "combined">("sales");
  const [hoveredChartPoint, setHoveredChartPoint] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const isAdmin = role === "ADMIN";


  // Load Data
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [productsPage, salesRes, serviceTicketsRes, purchasesRes] = await Promise.all([
          backendApi.products.list({ page: 0, size: 100 }),
          backendApi.sales.list(),
          backendApi.serviceTickets.list(),
          backendApi.purchases.list(),
        ]);

        if (!mounted) return;

        const products = productsPage.content;
        const sales = Array.isArray(salesRes) ? salesRes : salesRes.content;
        const serviceTickets = Array.isArray(serviceTicketsRes) ? serviceTicketsRes : serviceTicketsRes.content;
        const purchases = Array.isArray(purchasesRes) ? purchasesRes : purchasesRes.content;

        setSalesList(sales);
        setServicesList(serviceTickets);
        setPurchasesList(purchases);
        setOrderCount(sales.length);
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
  const allActivities = useMemo(() => {
    const list: Array<{
      type: "sale" | "service" | "purchase";
      id: string;
      title: string;
      desc: string;
      time: string;
      rawDate: string;
      tagColor: string;
      label: string;
    }> = [];

    // Map real sales to timeline
    salesList.forEach((s) => {
      list.push({
        type: "sale",
        id: s.soPhieuBan,
        title: `${t("common.retailInvoice") || "Lập hóa đơn bán lẻ"} #${s.soPhieuBan}`,
        desc: `${t("common.customer") || "Khách hàng"}: ${s.khachHang?.tenKhachHang || t("common.guest") || "Khách vãng lai"} • ${t("common.total") || "Tổng tiền"}: ${formatCurrency(s.tongTien)}`,
        time: formatDateTime(s.ngayLapPhieuBan, s.soPhieuBan),
        rawDate: s.ngayLapPhieuBan,
        tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        label: t("common.sale") || "Bán hàng",
      });
    });

    // Map real service orders to timeline
    servicesList.forEach((s) => {
      list.push({
        type: "service",
        id: s.soPhieuDichVu,
        title: `${t("common.serviceOrder") || "Nhận gia công"} #${s.soPhieuDichVu}`,
        desc: `${t("common.customer") || "Khách hàng"}: ${s.khachHang?.tenKhachHang || t("common.guest") || "Khách vãng lai"} • ${t("common.total") || "Tổng tiền"}: ${formatCurrency(s.tongTien)} • ${t("common.status") || "Trạng thái"}: ${formatServiceStatus(s, t)}`,
        time: formatDateTime(s.ngayLapPhieuDichVu, s.soPhieuDichVu),
        rawDate: s.ngayLapPhieuDichVu,
        tagColor: "bg-primary/10 text-primary border-primary/20",
        label: t("common.service") || "Dịch vụ",
      });
    });

    // Map real purchase orders to timeline
    purchasesList.forEach((p) => {
      list.push({
        type: "purchase",
        id: p.soPhieuMua,
        title: `${t("purchaseOrders.justCreated") || "Phiếu mua hàng"} #${p.soPhieuMua}`,
        desc: `${t("common.supplier") || "Nhà cung cấp"}: ${p.nhaCungCap?.tenNhaCungCap || t("common.unknown") || "Không xác định"} • ${t("common.total") || "Tổng tiền"}: ${formatCurrency(p.tongTien)}`,
        time: formatDateTime(p.ngayLapPhieuMua, p.soPhieuMua),
        rawDate: p.ngayLapPhieuMua,
        tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        label: t("nav.purchaseOrders") || "Nhập mua",
      });
    });

    // Parse time text "HH:MM - DD/MM/YYYY" back to a comparable timestamp
    const getTimestamp = (item: typeof list[0]) => {
      const match = item.time.match(/^(\d{2}):(\d{2})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})$/);
      if (match) {
        const [, hours, minutes, day, month, year] = match;
        return new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hours, 10),
          parseInt(minutes, 10)
        ).getTime();
      }
      return new Date(item.rawDate).getTime();
    };

    // Sort combined activities by full date-time in descending order (newest first)
    const sorted = list.sort((a, b) => {
      const timeA = getTimestamp(a);
      const timeB = getTimestamp(b);
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return b.id.localeCompare(a.id);
    });

    return sorted;
  }, [salesList, servicesList, purchasesList, t]);

  const activities = useMemo(() => {
    return allActivities.slice(0, 5);
  }, [allActivities]);

  const filteredAllActivities = useMemo(() => {
    return allActivities.filter((act) => {
      if (activityTypeFilter !== "all" && act.type !== activityTypeFilter) {
        return false;
      }
      const query = activitySearchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        act.id.toLowerCase().includes(query) ||
        act.title.toLowerCase().includes(query) ||
        act.desc.toLowerCase().includes(query) ||
        act.label.toLowerCase().includes(query)
      );
    });
  }, [allActivities, activitySearchQuery, activityTypeFilter]);



  // 1. Dynamic stock growth (imported product units count this month)
  const stockGrowthText = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const currentMonthImportedUnits = purchasesList
      .filter(p => {
        if (!p.ngayLapPhieuMua) return false;
        const d = new Date(p.ngayLapPhieuMua);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, p) => {
        const itemSum = (p.items || []).reduce((s, item) => s + Number(item.soLuongMua || 0), 0);
        return sum + itemSum;
      }, 0);

    return `+${currentMonthImportedUnits} ${t("dashboard.growthStockSuffix")}`;
  }, [purchasesList, t]);

  // 2. Dynamic product growth (sales transaction count difference this month vs last month)
  const productGrowthText = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();

    const getSalesCountForPeriod = (m: number, y: number) => {
      return salesList.filter(s => {
        if (!s.ngayLapPhieuBan) return false;
        const d = new Date(s.ngayLapPhieuBan);
        return d.getMonth() === m && d.getFullYear() === y;
      }).length;
    };

    const thisMonthSalesCount = getSalesCountForPeriod(thisMonth, thisYear);
    const lastMonthSalesCount = getSalesCountForPeriod(lastMonth, lastYear);

    const diff = thisMonthSalesCount - lastMonthSalesCount;
    return `${diff >= 0 ? "+" : ""}${diff} ${t("dashboard.growthOrdersSuffix")}`;
  }, [salesList, t]);

  // 3. Dynamic monthly revenue and growth compared to last month (sales + services combined)
  const monthlyRevenueStats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();

    const getRevenueForPeriod = (m: number, y: number) => {
      const salesSum = salesList
        .filter(s => {
          if (!s.ngayLapPhieuBan) return false;
          const d = new Date(s.ngayLapPhieuBan);
          return d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((sum, s) => sum + Number(s.tongTien ?? 0), 0);

      const servicesSum = servicesList
        .filter(s => {
          if (!s.ngayLapPhieuDichVu) return false;
          const d = new Date(s.ngayLapPhieuDichVu);
          return d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((sum, s) => sum + Number(s.tongTien ?? 0), 0);

      return salesSum + servicesSum;
    };

    const thisMonthRev = getRevenueForPeriod(thisMonth, thisYear);
    const lastMonthRev = getRevenueForPeriod(lastMonth, lastYear);

    let growthText = "";
    if (lastMonthRev > 0) {
      const diff = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
      growthText = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% ${t("dashboard.growthRevenueSuffix")}`;
    } else {
      growthText = thisMonthRev > 0 ? `+100% ${t("dashboard.growthRevenueSuffix")}` : `+0.0% ${t("dashboard.growthRevenueSuffix")}`;
    }

    return {
      thisMonthRevenue: thisMonthRev,
      revenueGrowthText: growthText
    };
  }, [salesList, servicesList, t]);

  const summaryMetrics = useMemo(
    () => {
      const base: Array<{
        label: string;
        value: string;
        icon: any;
        tone: "neutral" | "warning" | "success" | "danger";
        growth: string;
      }> = [
          {
            label: t("dashboard.orderCount"),
            value: formatNumber(orderCount),
            icon: Package,
            tone: "neutral" as const,
            growth: productGrowthText,
          },
          {
            label: t("dashboard.totalStock"),
            value: formatNumber(totalStock),
            icon: Boxes,
            tone: "warning" as const,
            growth: stockGrowthText,
          },
        ];

      if (isAdmin) {
        base.push({
          label: t("dashboard.monthRevenue"),
          value: formatCurrency(monthlyRevenueStats.thisMonthRevenue),
          icon: BarChart3,
          tone: "success" as const,
          growth: monthlyRevenueStats.revenueGrowthText,
        });
      }

      base.push({
        label: t("dashboard.pendingService"),
        value: formatNumber(pendingServiceTickets),
        icon: FileClock,
        tone: "danger" as const,
        growth: t("dashboard.growthUrgent"),
      });

      return base;
    },
    [monthlyRevenueStats, pendingServiceTickets, orderCount, totalStock, productGrowthText, stockGrowthText, t, isAdmin]
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

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Premium Dashboard Sections Grid */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Left Column: Main Feed / Analytics & Timeline */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {/* Premium Dashboard Metrics Panel */}
              <div className={`grid gap-3 ${isAdmin ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
                {summaryMetrics.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="hover-elevate cursor-pointer rounded-xl border border-border/70 bg-card p-3 shadow-xs flex flex-col justify-between min-h-[90px]"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                          <h3 className="text-xl font-extrabold tracking-tight text-foreground leading-none">
                            {item.value}
                          </h3>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/40 p-1.5 shrink-0">
                          <Icon className="h-4 w-4 text-amber-500" />
                        </div>
                      </div>
                      <div className={`mt-2 flex items-center gap-1 text-[9px] font-bold ${item.tone === "danger" ? "text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-full w-fit border border-rose-500/20" : "text-emerald-600"}`}>
                        <Sparkles className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{item.growth}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Visual Revenue Sparkline Chart */}
              {isAdmin && (
                <Card className="shadow-xs border-border/70 overflow-hidden">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3 border-b bg-muted/10">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-amber-500" />
                        {t("dashboard.revenueAnalysis")}
                      </CardTitle>
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
                  <CardContent className="pt-8 pb-4 px-2 sm:px-4 h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.71 0.12 74)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="oklch(0.56 0.18 261)" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.27 0.03 258 / 5%)" />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 600, fill: 'oklch(0.5 0.02 258)' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 600, fill: 'oklch(0.5 0.02 258)' }}
                          tickFormatter={(val) => {
                            const mUnit = t("common.million") || "Tr";
                            const kUnit = t("common.thousand") || "k";
                            if (val >= 1000000) return (val / 1000000).toFixed(1) + mUnit;
                            if (val >= 1000) return (val / 1000).toFixed(0) + kUnit;
                            return val;
                          }}
                        />
                        <RechartsTooltip
                          cursor={{ fill: 'oklch(0.27 0.03 258 / 2%)', radius: 4 }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-card/95 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs shadow-xl border border-border/80 ring-1 ring-amber-500/10 space-y-1">
                                  <p className="font-bold text-[9px] text-muted-foreground uppercase">{t("common.date")} {label}</p>
                                  <p className="font-extrabold text-foreground text-sm">
                                    {formatCurrency(payload[0].value as number)}
                                  </p>
                                  <Badge variant="outline" className="text-[9px] capitalize text-amber-600 bg-amber-500/10 border-amber-500/20 font-bold">
                                    {chartMode === "sales" ? t("common.sale") : chartMode === "services" ? t("common.service") : t("common.total")}
                                  </Badge>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey={chartMode === "sales" ? "sales" : chartMode === "services" ? "services" : "combined"}
                          fill="url(#barGradient)"
                          radius={[4, 4, 0, 0]}
                          barSize={chartData.length > 10 ? 12 : 32}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fillOpacity={hoveredChartPoint === index ? 1 : 0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Recent Transactions & Operations Timeline */}
              <Card className="shadow-xs border-border/70">
                <CardHeader className="pb-3 border-b bg-muted/10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-amber-500" />
                      {t("dashboard.activityLog")}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{t("dashboard.activityDesc")}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 cursor-pointer h-8 px-3"
                    onClick={() => setIsOpenAllActivities(true)}
                  >
                    Xem tất cả
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  {activities.length === 0 ? (
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
            </div>

            {/* Right Column: Live Gold Prices & Quick Actions */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Quick Operations panel */}
              <Card className="shadow-xs border-border/70 flex flex-col justify-between">
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

                    {isAdmin ? (
                      <Link href="/dashboard/purchase-orders">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-emerald-500/40 hover:bg-emerald-500/5 group shadow-xs">
                          <div className="rounded-full bg-emerald-500/10 p-2 group-hover:bg-emerald-500/20 transition-colors">
                            <Package className="h-5 w-5 text-emerald-600" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{t("nav.purchaseOrders") || "Nhập mua hàng"}</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard/purchase-orders">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-emerald-500/40 hover:bg-emerald-500/5 group shadow-xs">
                          <div className="rounded-full bg-emerald-500/10 p-2 group-hover:bg-emerald-500/20 transition-colors">
                            <Package className="h-5 w-5 text-emerald-600" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{t("nav.purchaseOrders") || "Lập phiếu mua"}</span>
                        </Button>
                      </Link>
                    )}

                    {isAdmin ? (
                      <Link href="/dashboard/reports">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-blue-500/40 hover:bg-blue-500/5 group shadow-xs">
                          <div className="rounded-full bg-blue-500/10 p-2 group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{t("common.reportsMonthly")}</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard/products">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full hover:border-blue-500/40 hover:bg-blue-500/5 group shadow-xs">
                          <div className="rounded-full bg-blue-500/10 p-2 group-hover:bg-blue-500/20 transition-colors">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{t("nav.products")}</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
                {isAdmin && (
                  <div className="p-3 border-t bg-muted/10 text-center">
                    <Link href="/dashboard/settings">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                        <Settings className="mr-1.5 h-3.5 w-3.5" />
                        {t("dashboard.configSystem")}
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

            </div>
          </div>
        </>
      )}


      {/* View All Activities Premium Dialog */}
      <AnimatePresence>
        {isOpenAllActivities && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenAllActivities(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl glass-card flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-6 py-4.5">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-amber-500/10 p-2 border border-amber-500/25">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {t("dashboard.activityLog") || "Nhật ký hoạt động & vận hành"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.activityDesc") || "Các chứng từ giao dịch phát sinh gần đây của nhân viên."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpenAllActivities(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors border"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Toolbar: Search and Tabs */}
              <div className="border-b border-border/60 p-4 bg-muted/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Tabs */}
                <div className="flex flex-wrap gap-1 bg-muted/40 p-1 rounded-xl border w-full sm:w-auto">
                  {(["all", "sale", "service", "purchase"] as const).map((type) => {
                    const label =
                      type === "all" ? "Tất cả" :
                        type === "sale" ? t("common.sale") || "Bán lẻ" :
                          type === "service" ? t("common.service") || "Dịch vụ" :
                            t("nav.purchaseOrders") || "Mua vào";

                    const count = allActivities.filter(a => type === "all" ? true : a.type === type).length;
                    const isActive = activityTypeFilter === type;

                    return (
                      <button
                        key={type}
                        onClick={() => setActivityTypeFilter(type)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${isActive
                            ? "bg-amber-500 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                      >
                        {label} <span className={`text-[10px] ml-1 opacity-70 ${isActive ? "text-white" : "text-muted-foreground"}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm mã phiếu, khách hàng..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border bg-background/50 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500/50"
                  />
                  {activitySearchQuery && (
                    <button
                      onClick={() => setActivitySearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
                {filteredAllActivities.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Activity className="h-8 w-8 opacity-25 text-amber-500" />
                    <p className="font-semibold">Không tìm thấy hoạt động nào</p>
                    <p className="text-xs">Thử nhập từ khóa khác hoặc chuyển danh mục bộ lọc.</p>
                  </div>
                ) : (
                  <div className="relative border-l border-border/60 pl-5 ml-2.5 space-y-6">
                    {filteredAllActivities.map((act) => (
                      <div key={act.id} className="relative group">
                        {/* Bullet marker */}
                        <span className="absolute -left-[26px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-background border border-border group-hover:border-amber-500/50 transition-colors">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <span className="block text-xs font-bold text-foreground leading-tight">
                              {act.title}
                            </span>
                            <span className="block text-xs text-muted-foreground leading-relaxed">
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
              </div>

              {/* Footer */}
              <div className="border-t border-border/60 bg-muted/20 px-6 py-3.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Hiển thị {filteredAllActivities.length} trên tổng số {allActivities.length} hoạt động</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
