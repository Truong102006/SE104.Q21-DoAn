"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, Bell, CheckCircle2, ClipboardList, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, MetricCard, PageHeader, StatusBadge } from "@/components/dashboard/management";
import { MOCK_GOLD_PRICES, MOCK_PRODUCTS } from "@/lib/mock-data";
import { MOCK_NOTIFICATIONS, formatRelativeTime, getUnreadNotificationCount } from "@/lib/mock-notifications";
import { useAuthStore } from "@/stores/auth-store";

type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";

interface WorkQueueItem {
  id: string;
  title: string;
  owner: string;
  dueTime: string;
  priority: PriorityLevel;
  status: "TODO" | "REVIEW" | "READY";
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
    status: "REVIEW",
    href: "/dashboard/purchase-orders",
  },
  {
    id: "wq-02",
    title: "Chốt phiếu dịch vụ PDV-20260515-001",
    owner: "Dịch vụ",
    dueTime: "11:00",
    priority: "HIGH",
    status: "TODO",
    href: "/dashboard/service-orders",
  },
  {
    id: "wq-03",
    title: "Rà soát đơn vị tính thiếu chuẩn BM3",
    owner: "Quản trị dữ liệu",
    dueTime: "14:00",
    priority: "MEDIUM",
    status: "TODO",
    href: "/dashboard/categories",
  },
  {
    id: "wq-04",
    title: "Tổng hợp báo cáo BM10-BM12 cuối ngày",
    owner: "Kế toán",
    dueTime: "16:30",
    priority: "LOW",
    status: "READY",
    href: "/dashboard/reports",
  },
];

const WORKFLOW_ITEMS: WorkflowItem[] = [
  { id: "wf-01", label: "Danh mục nền BM1-BM4", completed: 3, total: 4 },
  { id: "wf-02", label: "Phiếu nghiệp vụ BM5-BM7", completed: 3, total: 3 },
  { id: "wf-03", label: "Tra cứu BM8-BM9", completed: 2, total: 2 },
  { id: "wf-04", label: "Kết xuất BM10-BM12", completed: 3, total: 3 },
];

const PRIORITY_META = {
  HIGH: { label: "Cao", tone: "danger" },
  MEDIUM: { label: "Trung bình", tone: "warning" },
  LOW: { label: "Thấp", tone: "neutral" },
} as const;

const TASK_STATUS_META = {
  TODO: { label: "Cần làm", tone: "warning" },
  REVIEW: { label: "Cần duyệt", tone: "info" },
  READY: { label: "Sẵn sàng", tone: "success" },
} as const;

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
      <PageHeader
        eyebrow="Tổng quan vận hành"
        title="Trung tâm điều hành"
        description={`${currentDateLabel} - ${isAdmin ? "Quản trị viên" : "Nhân viên"} - Giá vàng cập nhật ${latestGoldUpdate}`}
        badges={<Badge variant="outline" className="border-border/70 bg-background/70">Ca làm hiện tại</Badge>}
        actions={
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <Link href="/dashboard/reports">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Kết xuất báo cáo
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Việc ưu tiên cao" value={urgentTaskCount} description="Cần xử lý trong ca" icon={ClipboardList} tone="danger" />
        <MetricCard label="Cảnh báo tồn kho" value={lowStockProducts.length} description="Sản phẩm sắp hết/hết" icon={AlertTriangle} tone="warning" />
        <MetricCard label="Thông báo chưa đọc" value={unreadNotifications} description="Cần kiểm tra" icon={Bell} tone="info" />
        <MetricCard label="Hoàn thiện quy trình" value={`${workflowCompletion}%`} description={`${workflowDone}/${workflowTotal} hạng mục`} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Hàng đợi xử lý</CardTitle>
                <CardDescription>Các việc cần theo dõi trong ca làm hiện tại.</CardDescription>
              </div>
              <Badge variant="outline" className="border-border/70 bg-background/70">
                {WORK_QUEUE.length} việc
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[42%]">Công việc</TableHead>
                  <TableHead className="w-[15%]">Phụ trách</TableHead>
                  <TableHead className="w-[10%]">Hạn</TableHead>
                  <TableHead className="w-[14%]">Ưu tiên</TableHead>
                  <TableHead className="w-[14%]">Trạng thái</TableHead>
                  <TableHead className="w-16 text-right">Mở</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WORK_QUEUE.map((item) => {
                  const priorityMeta = PRIORITY_META[item.priority];
                  const statusMeta = TASK_STATUS_META[item.status];

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[420px] truncate font-medium">{item.title}</TableCell>
                      <TableCell className="truncate">{item.owner}</TableCell>
                      <TableCell>{item.dueTime}</TableCell>
                      <TableCell><StatusBadge tone={priorityMeta.tone}>{priorityMeta.label}</StatusBadge></TableCell>
                      <TableCell><StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge></TableCell>
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
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle>Cần chú ý</CardTitle>
              <CardDescription>Tồn kho và thông báo mới nhất.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              {lowStockProducts.length === 0 ? (
                <EmptyState title="Tồn kho ổn định" description="Chưa có sản phẩm nào cần cảnh báo." className="min-h-32" />
              ) : (
                lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Tồn: {product.stock}</p>
                    </div>
                    <StatusBadge tone={product.status === "OUT_OF_STOCK" ? "danger" : "warning"}>
                      {product.status === "OUT_OF_STOCK" ? "Hết hàng" : "Sắp hết"}
                    </StatusBadge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-3">
              <CardTitle>Thông báo mới</CardTitle>
              <CardDescription>{unreadNotifications} thông báo chưa đọc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
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
