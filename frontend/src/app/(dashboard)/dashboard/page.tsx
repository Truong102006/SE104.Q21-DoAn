"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, Bell, CheckCircle2, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_GOLD_PRICES, MOCK_PRODUCTS } from "@/lib/mock-data";
import { MOCK_NOTIFICATIONS, formatRelativeTime, getUnreadNotificationCount } from "@/lib/mock-notifications";
import { STATUS_DOT_CLASS, STATUS_TONE_CLASS, type StatusTone } from "@/lib/status-styles";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";

interface WorkQueueItem {
  id: string;
  title: string;
  owner: string;
  dueTime: string;
  priority: PriorityLevel;
  href: string;
}

interface WorkflowItem {
  id: string;
  label: string;
  completed: number;
  total: number;
}

const WORK_QUEUE: WorkQueueItem[] = [
  {
    id: "wq-01",
    title: "Đối soát phiếu mua hàng PMH-20260515-003",
    owner: "Kho",
    dueTime: "10:30",
    priority: "HIGH",
    href: "/dashboard/purchase-orders",
  },
  {
    id: "wq-02",
    title: "Chốt phiếu dịch vụ PDV-20260515-001",
    owner: "Dịch vụ",
    dueTime: "11:00",
    priority: "HIGH",
    href: "/dashboard/service-orders",
  },
  {
    id: "wq-03",
    title: "Rà soát đơn vị tính thiếu chuẩn BM3",
    owner: "Quản trị dữ liệu",
    dueTime: "14:00",
    priority: "MEDIUM",
    href: "/dashboard/categories",
  },
  {
    id: "wq-04",
    title: "Tổng hợp báo cáo BM10-BM12 cuối ngày",
    owner: "Kế toán",
    dueTime: "16:30",
    priority: "LOW",
    href: "/dashboard/reports",
  },
];

const WORKFLOW_ITEMS: WorkflowItem[] = [
  { id: "wf-01", label: "Danh mục nền BM1-BM4", completed: 3, total: 4 },
  { id: "wf-02", label: "Phiếu nghiệp vụ BM5-BM7", completed: 3, total: 3 },
  { id: "wf-03", label: "Tra cứu BM8-BM9", completed: 2, total: 2 },
  { id: "wf-04", label: "Kết xuất BM10-BM12", completed: 3, total: 3 },
];

const PRIORITY_META: Record<PriorityLevel, { label: string; tone: StatusTone }> = {
  HIGH: {
    label: "Cao",
    tone: "danger",
  },
  MEDIUM: {
    label: "Trung bình",
    tone: "warning",
  },
  LOW: {
    label: "Thấp",
    tone: "neutral",
  },
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const lowStockProducts = MOCK_PRODUCTS
    .filter((product) => product.status === "LOW_STOCK" || product.status === "OUT_OF_STOCK")
    .sort((a, b) => a.stock - b.stock);
  const unreadNotifications = getUnreadNotificationCount(MOCK_NOTIFICATIONS);
  const urgentTaskCount = WORK_QUEUE.filter((item) => item.priority === "HIGH").length;
  const workflowDone = WORKFLOW_ITEMS.reduce((sum, item) => sum + item.completed, 0);
  const workflowTotal = WORKFLOW_ITEMS.reduce((sum, item) => sum + item.total, 0);
  const workflowCompletion = Math.round((workflowDone / workflowTotal) * 100);

  const latestNotifications = [...MOCK_NOTIFICATIONS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const latestGoldUpdate = useMemo(() => {
    const latestTimestamp = Math.max(
      ...MOCK_GOLD_PRICES.map((price) => new Date(price.updatedAt).getTime()),
    );
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(latestTimestamp));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-normal">Trung tâm điều hành</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentDateLabel} • {isAdmin ? "Quản trị viên" : "Nhân viên"} • Giá vàng cập nhật {latestGoldUpdate}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <Link href="/dashboard/reports">Kết xuất báo cáo</Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Việc ưu tiên cao</span>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xl font-semibold">{urgentTaskCount}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Cảnh báo tồn kho</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-1 text-xl font-semibold">{lowStockProducts.length}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Thông báo chưa đọc</span>
            <Bell className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-1 text-xl font-semibold">{unreadNotifications}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Hoàn thiện quy trình</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="mt-1 text-xl font-semibold">{workflowCompletion}%</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Hàng đợi xử lý</CardTitle>
                <CardDescription>Các việc cần theo dõi trong ca làm hiện tại.</CardDescription>
              </div>
              <Badge variant="outline" className="border-border/70 bg-muted/20">
                {WORK_QUEUE.length} việc
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[46%]">Công việc</TableHead>
                  <TableHead className="w-[16%]">Phụ trách</TableHead>
                  <TableHead className="w-[10%]">Hạn</TableHead>
                  <TableHead className="w-[14%]">Ưu tiên</TableHead>
                  <TableHead className="w-16 text-right">Mở</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WORK_QUEUE.map((item) => {
                  const priorityMeta = PRIORITY_META[item.priority];

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[420px] truncate font-medium">{item.title}</TableCell>
                      <TableCell className="truncate">{item.owner}</TableCell>
                      <TableCell>{item.dueTime}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS[priorityMeta.tone])}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[priorityMeta.tone])} />
                          {priorityMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline" className="cursor-pointer">
                          <Link href={item.href}>Mở</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle>Cần chú ý</CardTitle>
              <CardDescription>Tồn kho và thông báo mới nhất.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {lowStockProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Tồn: {product.stock}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 gap-1 px-2 text-[10px]",
                      product.status === "OUT_OF_STOCK"
                        ? STATUS_TONE_CLASS.danger
                        : STATUS_TONE_CLASS.warning,
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        product.status === "OUT_OF_STOCK"
                          ? STATUS_DOT_CLASS.danger
                          : STATUS_DOT_CLASS.warning,
                      )}
                    />
                    {product.status === "OUT_OF_STOCK" ? "Hết hàng" : "Sắp hết"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle>Thông báo mới</CardTitle>
              <CardDescription>{unreadNotifications} thông báo chưa đọc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {latestNotifications.map((notification) => (
                <div key={notification.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{notification.title}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
