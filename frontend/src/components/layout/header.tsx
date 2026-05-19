"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { requestLogout } from "@/services/auth-service";
import {
  formatRelativeTime,
  getUnreadNotificationCount,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock-notifications";
import { STATUS_DOT_CLASS } from "@/lib/status-styles";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

const PAGE_META: Array<{ path: string; title: string; subtitle: string }> = [
  { path: "/dashboard/service-voucher-lookup", title: "Tra cứu phiếu dịch vụ", subtitle: "BM9" },
  { path: "/dashboard/service-orders", title: "Lập phiếu dịch vụ", subtitle: "BM7" },
  { path: "/dashboard/purchase-orders", title: "Lập phiếu mua hàng", subtitle: "BM5" },
  { path: "/dashboard/orders", title: "Lập phiếu bán hàng", subtitle: "BM6" },
  { path: "/dashboard/reports", title: "Kết xuất báo cáo", subtitle: "BM10-BM12" },
  { path: "/dashboard/products", title: "Tra cứu sản phẩm", subtitle: "BM8" },
  { path: "/dashboard/customers", title: "Danh sách khách hàng", subtitle: "BM2" },
  { path: "/dashboard/suppliers", title: "Danh sách nhà cung cấp", subtitle: "BM1" },
  { path: "/dashboard/services", title: "Danh sách loại dịch vụ", subtitle: "BM4" },
  { path: "/dashboard/categories", title: "Danh sách đơn vị tính", subtitle: "BM3" },
  { path: "/dashboard/notifications", title: "Thông báo hệ thống", subtitle: "Cập nhật mới nhất" },
  { path: "/dashboard", title: "Dashboard tổng quan", subtitle: "Tổng hợp vận hành" },
];

function resolvePageMeta(pathname: string): { title: string; subtitle: string } {
  const match = PAGE_META.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
  if (match) {
    return { title: match.title, subtitle: match.subtitle };
  }
  return { title: "Dashboard", subtitle: "Workspace" };
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, logout, isAdmin } = useAuthStore();
  const unreadNotificationCount = getUnreadNotificationCount();
  const previewNotifications = MOCK_NOTIFICATIONS.slice(0, 4);

  const pageMeta = useMemo(() => resolvePageMeta(pathname), [pathname]);
  const workspaceDate = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  function handleOpenProfile() {
    router.push("/dashboard/profile");
  }

  function handleOpenSettings() {
    router.push("/dashboard/settings");
  }

  function handleOpenNotifications() {
    router.push("/dashboard/notifications");
  }

  async function handleLogout() {
    try {
      await requestLogout(token);
    } finally {
      logout();
      router.replace("/login");
    }
  }

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <header className="z-20 border-b border-border/70 bg-card">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6 xl:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-sm" className="cursor-pointer lg:hidden" aria-label="Mở menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r border-sidebar-border bg-sidebar p-0">
            <Sidebar collapsed={false} onToggle={() => {}} mobile />
          </SheetContent>
        </Sheet>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {pageMeta.subtitle}
          </p>
          <h1 className="truncate text-sm font-semibold text-foreground lg:text-base">{pageMeta.title}</h1>
        </div>

        <div className="relative ml-2 hidden max-w-lg flex-1 lg:flex">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Tìm kiếm nhanh sản phẩm, phiếu, khách hàng..."
            className="h-9 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-3 focus:ring-ring/30"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="hidden border-border/80 bg-card px-2.5 text-xs text-muted-foreground xl:inline-flex">
            {workspaceDate}
          </Badge>

          <Badge
            variant="outline"
            className={
              isAdmin()
                ? "border-sky-600/30 bg-sky-600/10 text-sky-700"
                : "border-border/80 bg-card text-muted-foreground"
            }
          >
            {isAdmin() ? "Admin" : "Nhân viên"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" className="relative cursor-pointer" aria-label="Thông báo">
                <Bell className="h-4 w-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {Math.min(unreadNotificationCount, 9)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Thông báo</span>
                <span className="text-[11px] text-muted-foreground">{unreadNotificationCount} chưa đọc</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {previewNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={handleOpenNotifications}
                  className="cursor-pointer items-start gap-2 py-2"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      notification.unread ? STATUS_DOT_CLASS.primary : "bg-muted-foreground/30"
                    }`}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{notification.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleOpenNotifications}
                className="cursor-pointer justify-center text-sm font-medium text-primary"
              >
                Xem tất cả thông báo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 cursor-pointer gap-2 px-2" aria-label="Menu người dùng">
                <Avatar className="h-8 w-8 border border-border/60 bg-muted/60">
                  <AvatarFallback className="text-xs font-semibold text-primary">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-sm font-medium md:block">
                  {user?.fullName ?? user?.username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user?.fullName ?? user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? "-"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleOpenProfile} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleOpenSettings} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
