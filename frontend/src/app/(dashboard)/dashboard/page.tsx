"use client";

import { useAuthStore } from "@/stores/auth-store";
import { MOCK_PRODUCTS, MOCK_GOLD_PRICES, formatVND } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Dashboard Home — Overview cards + gold prices
   ADMIN sees revenue/profit. STAFF sees limited stats.
   ────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user, isAdmin } = useAuthStore();

  const stats = [
    {
      title: "Sản phẩm",
      value: MOCK_PRODUCTS.length.toString(),
      change: "+12%",
      trend: "up" as const,
      icon: Package,
      roles: ["ADMIN", "STAFF"],
    },
    {
      title: "Đơn hàng hôm nay",
      value: "24",
      change: "+8%",
      trend: "up" as const,
      icon: ShoppingCart,
      roles: ["ADMIN", "STAFF"],
    },
    {
      title: "Khách hàng",
      value: "3,240",
      change: "+5%",
      trend: "up" as const,
      icon: Users,
      roles: ["ADMIN", "STAFF"],
    },
    {
      title: "Doanh thu tháng",
      value: formatVND(1_250_000_000),
      change: "+18%",
      trend: "up" as const,
      icon: TrendingUp,
      roles: ["ADMIN"], // ADMIN only
    },
  ];

  const visibleStats = stats.filter((s) =>
    s.roles.includes(user?.role ?? "STAFF"),
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Xin chào, {user?.fullName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Tổng quan hoạt động cửa hàng hôm nay
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => (
          <Card key={stat.title} className="shimmer-gold">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-rose-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">
                  so với tháng trước
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gold prices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            Giá vàng hôm nay
          </CardTitle>
          <CardDescription>Cập nhật lúc 08:00 — 08/05/2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {MOCK_GOLD_PRICES.map((price) => (
              <div
                key={price.id}
                className="rounded-xl border p-4 bg-muted/30"
              >
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {price.type}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Mua:</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatVND(price.buyPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Bán:</span>
                    <span className="text-sm font-semibold text-gold">
                      {formatVND(price.sellPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
