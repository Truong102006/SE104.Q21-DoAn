"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, MetricCard, PageHeader } from "@/components/dashboard/management";
import { backendApi } from "@/services/backend-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber } from "@/lib/format";
import { BarChart3, Boxes, FileClock, Package } from "lucide-react";
import type { SaleResponse, ServiceTicketResponse } from "@/types/backend";

function isCurrentMonth(dateText: string): boolean {
  const now = new Date();
  const target = new Date(dateText);
  return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
}

function isServiceTicketCompleted(ticket: ServiceTicketResponse): boolean {
  return ticket.tinhTrangDichVu.toLowerCase().includes("hoàn thành");
}

function calcCurrentMonthRevenue(sales: SaleResponse[]): number {
  return sales
    .filter((item) => isCurrentMonth(item.ngayLapPhieuBan))
    .reduce((sum, item) => sum + Number(item.tongTien ?? 0), 0);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productCount, setProductCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [pendingServiceTickets, setPendingServiceTickets] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [productsPage, sales, serviceTickets] = await Promise.all([
          backendApi.products.list({ page: 0, size: 500 }),
          backendApi.sales.list(),
          backendApi.serviceTickets.list(),
        ]);

        if (!mounted) {
          return;
        }

        const products = productsPage.content;
        setProductCount(products.length);
        setTotalStock(products.reduce((sum, item) => sum + Number(item.tonKho ?? 0), 0));
        setCurrentMonthRevenue(calcCurrentMonthRevenue(sales));
        setPendingServiceTickets(serviceTickets.filter((item) => !isServiceTicketCompleted(item)).length);
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err, "Không tải được dashboard"));
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
  }, []);

  const summary = useMemo(
    () => [
      {
        label: "Số sản phẩm",
        value: formatNumber(productCount),
        icon: Package,
      },
      {
        label: "Tổng tồn kho",
        value: formatNumber(totalStock),
        icon: Boxes,
      },
      {
        label: "Doanh thu tháng nay",
        value: formatCurrency(currentMonthRevenue),
        icon: BarChart3,
      },
      {
        label: "Phiếu dịch vụ chưa hoàn thành",
        value: formatNumber(pendingServiceTickets),
        icon: FileClock,
      },
    ],
    [currentMonthRevenue, pendingServiceTickets, productCount, totalStock],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Dashboard"
        title="Tổng quan vận hành"
        description="Số liệu nhanh theo thời gian thực từ hệ thống"
        badges={<Badge variant="outline">Realtime</Badge>}
      />

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={loading ? "..." : item.value}
            icon={item.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú</CardTitle>
        </CardHeader>
        <CardContent>
          {!loading && !error ? (
            <p className="text-sm text-muted-foreground">
              Dashboard đang lấy doanh thu từ các phiếu bán trong tháng hiện tại và trạng thái phiếu dịch vụ từ backend.
            </p>
          ) : (
            <EmptyState title="Đang tải dữ liệu" description="Hệ thống đang đồng bộ số liệu tổng quan" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
