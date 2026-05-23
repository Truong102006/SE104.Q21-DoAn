"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { STATUS_DOT_CLASS, STATUS_TONE_CLASS } from "@/lib/status-styles";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import {
  AppNotification,
  NotificationType,
  getNotificationTypeLabel,
  getUnreadNotificationCount,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock-notifications";
import {
  CheckCheck,
  ChevronDown,
  Cog,
  Inbox,
  Package,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";

type NotificationScopeFilter = "ALL" | "UNREAD";
type NotificationTypeFilter = "ALL" | NotificationType;

interface GroupedNotifications {
  label: string;
  items: AppNotification[];
}

const TYPE_FILTERS: Array<{ value: NotificationTypeFilter; label: string }> = [
  { value: "ALL", label: "Tất cả loại" },
  { value: "ORDER", label: "Đơn hàng" },
  { value: "INVENTORY", label: "Tồn kho" },
  { value: "PRICE", label: "Giá vàng" },
  { value: "SYSTEM", label: "Hệ thống" },
];

const TYPE_META: Record<NotificationType, { icon: LucideIcon; iconClass: string; badgeClass: string }> = {
  ORDER: {
    icon: ShoppingCart,
    iconClass: "bg-sky-600/12 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    badgeClass: "border-sky-600/30 bg-sky-600/10 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400",
  },
  INVENTORY: {
    icon: Package,
    iconClass: "bg-rose-600/12 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    badgeClass: "border-rose-600/30 bg-rose-600/10 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400",
  },
  PRICE: {
    icon: TrendingUp,
    iconClass: "bg-emerald-600/12 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    badgeClass: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  SYSTEM: {
    icon: Cog,
    iconClass: "bg-slate-500/12 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400",
    badgeClass: "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-400",
  },
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDateGroupLabel(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return "Hôm nay";
  }

  if (isSameDay(date, yesterday)) {
    return "Hôm qua";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [scopeFilter, setScopeFilter] = useState<NotificationScopeFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("ALL");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const toast = useToastStore();

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notifications]);

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications],
  );

  const totalCount = notifications.length;

  const typeCounts = useMemo(() => {
    return notifications.reduce(
      (acc, notification) => {
        acc[notification.type] += 1;
        return acc;
      },
      {
        ORDER: 0,
        INVENTORY: 0,
        PRICE: 0,
        SYSTEM: 0,
      } as Record<NotificationType, number>,
    );
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return sortedNotifications.filter((notification) => {
      if (scopeFilter === "UNREAD" && !notification.unread) {
        return false;
      }

      if (typeFilter !== "ALL" && notification.type !== typeFilter) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      return (
        notification.title.toLowerCase().includes(normalizedKeyword) ||
        notification.message.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [keyword, scopeFilter, sortedNotifications, typeFilter]);

  const visibleUnreadCount = useMemo(
    () => filteredNotifications.filter((notification) => notification.unread).length,
    [filteredNotifications],
  );

  const groupedNotifications = useMemo(() => {
    const map = new Map<string, AppNotification[]>();

    for (const notification of filteredNotifications) {
      const label = getDateGroupLabel(notification.createdAt);
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)?.push(notification);
    }

    return Array.from(map.entries()).map(
      ([label, items]): GroupedNotifications => ({
        label,
        items,
      }),
    );
  }, [filteredNotifications]);

  function handleMarkAllRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc.");
  }

  function handleToggleRead(id: string) {
    setNotifications((previous) =>
      previous.map((notification) => {
        if (notification.id === id) {
          return {
            ...notification,
            unread: !notification.unread,
          };
        }
        return notification;
      }),
    );
  }

  function handleDeleteNotification(id: string) {
    setNotifications((previous) => previous.filter((n) => n.id !== id));
    toast.success("Đã xóa thông báo thành công.");
  }

  function handleResetFilters() {
    setScopeFilter("ALL");
    setTypeFilter("ALL");
    setKeyword("");
  }

  function handleNotificationClick(notification: AppNotification) {
    if (notification.unread) {
      setNotifications((previous) =>
        previous.map((n) =>
          n.id === notification.id ? { ...n, unread: false } : n
        )
      );
    }

    if (notification.type === "ORDER") {
      router.push("/dashboard/orders");
    } else if (notification.type === "INVENTORY") {
      router.push("/dashboard/products");
    } else if (notification.type === "PRICE") {
      router.push("/dashboard/product-types");
    }
  }

  function formatTime(isoDate: string): string {
    const date = new Date(isoDate);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const hasActiveFilters = scopeFilter !== "ALL" || typeFilter !== "ALL" || keyword.trim().length > 0;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden glass-card shadow-sm border border-border/85">
        <CardHeader className="border-b bg-muted/20 px-4 py-4">
          <div className="space-y-3.5">
            {/* Hàng trên: Tiêu đề và Nút Đánh dấu tất cả đã đọc */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-base font-bold text-foreground">Thông báo hệ thống</CardTitle>
                <Badge variant="outline" className="h-5 px-2 bg-background border-border text-xs font-semibold text-muted-foreground select-none">
                  Tổng số: {totalCount}
                </Badge>
              </div>

              <Button
                size="sm"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="bg-primary hover:brightness-105 active:scale-95 transition-all h-8 text-xs font-bold px-4 rounded-lg cursor-pointer"
              >
                <CheckCheck className="mr-1.5 h-4 w-4" />
                Đánh dấu tất cả đã đọc
              </Button>
            </div>

            {/* Hàng dưới: Search, Tabs, Dropdown Phân loại */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Thanh tìm kiếm */}
              <div className="relative flex-1 min-w-[260px]">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm kiếm thông báo..."
                  className="pl-9 pr-8 h-8.5 text-xs rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-ring"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Tabs Tất cả | Chưa đọc */}
              <div className="flex items-center rounded-lg bg-muted p-0.5 border border-border/60 h-8.5 select-none">
                <button
                  type="button"
                  onClick={() => setScopeFilter("ALL")}
                  className={cn(
                    "rounded-md px-4 py-1 text-xs font-semibold cursor-pointer transition-all",
                    scopeFilter === "ALL"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Tất cả ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter("UNREAD")}
                  className={cn(
                    "rounded-md px-4 py-1 text-xs font-semibold cursor-pointer transition-all",
                    scopeFilter === "UNREAD"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Chưa đọc ({unreadCount})
                </button>
              </div>

              {/* Dropdown Phân loại (Custom Styled) */}
              <div className="flex items-center gap-2 h-8.5 relative">
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Bộ lọc:</span>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-between gap-1.5 h-8.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-foreground cursor-pointer hover:bg-accent/45 transition-all shadow-xs min-w-[150px] text-left"
                >
                  <span>
                    {TYPE_FILTERS.find((opt) => opt.value === typeFilter)?.label} ({typeFilter === "ALL" ? totalCount : typeCounts[typeFilter as NotificationType]})
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {/* Dropdown Menu (Popup) */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown on click outside */}
                    <div
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setDropdownOpen(false)}
                    />
                    
                    <div className="absolute right-0 top-full mt-1.5 z-40 min-w-[170px] rounded-lg border border-border/80 bg-popover p-1 shadow-md animate-in fade-in slide-in-from-top-1 duration-200 divide-y divide-border/20">
                      {TYPE_FILTERS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setTypeFilter(opt.value);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold cursor-pointer transition-colors text-left",
                            typeFilter === opt.value
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <span>{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                            {opt.value === "ALL" ? totalCount : typeCounts[opt.value as NotificationType]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 text-xs text-muted-foreground font-semibold bg-muted/5">
            <span>
              Tìm thấy {filteredNotifications.length} thông báo phù hợp
              {visibleUnreadCount > 0 ? `, trong đó có ${visibleUnreadCount} chưa đọc` : ""}
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-bold px-2 py-0" onClick={handleResetFilters}>
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>

          {groupedNotifications.length === 0 ? (
            <div className="px-6 py-16 text-center bg-card">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/40">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold">Không tìm thấy thông báo nào</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Vui lòng điều chỉnh lại từ khóa hoặc các bộ lọc đang chọn.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {groupedNotifications.map((group) => (
                <section key={group.label} className="bg-card">
                  <div className="bg-muted/15 border-b border-border/40 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground select-none">
                    {group.label}
                  </div>

                  <ul className="divide-y divide-border/30">
                    {group.items.map((notification) => {
                      const typeMeta = TYPE_META[notification.type];
                      const TypeIcon = typeMeta.icon;

                      return (
                        <li
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "group grid gap-3 px-4 py-3.5 md:grid-cols-[auto_1fr_auto] md:items-center transition-all duration-200 cursor-pointer select-none",
                            notification.unread 
                              ? "bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/50 dark:hover:bg-blue-950/15" 
                              : "bg-card hover:bg-muted/30",
                          )}
                        >
                          {/* Cột 1: Chỉ báo Chưa đọc (Dot) và Icon phân loại màu sắc theo mức độ */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 flex items-center justify-center shrink-0">
                              {notification.unread ? (
                                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-transparent" />
                              )}
                            </div>
                            <div
                              className={cn(
                                "flex h-8.5 w-8.5 items-center justify-center rounded-lg shadow-xs border border-border/30 shrink-0",
                                typeMeta.iconClass,
                              )}
                            >
                              <TypeIcon className="h-4.5 w-4.5" />
                            </div>
                          </div>

                          {/* Cột 2: Nội dung chi tiết thông báo */}
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className={cn(
                                "text-sm leading-tight",
                                notification.unread ? "font-bold text-foreground" : "font-medium text-muted-foreground/90"
                              )}>
                                {notification.title}
                              </p>
                              <Badge variant="outline" className={cn("text-[9px] py-0 px-1.5 font-bold h-4.5 select-none", typeMeta.badgeClass)}>
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>
                          </div>

                          {/* Cột 3: Trạng thái bình thường hiển thị Giờ cụ thể, hover hiển thị Icon thao tác nhanh */}
                          <div className="flex items-center justify-end min-w-[120px] text-right">
                            {/* Trạng thái bình thường: Giờ cụ thể */}
                            <span className="text-xs font-semibold text-muted-foreground/80 group-hover:hidden select-none">
                              {formatTime(notification.createdAt)}
                            </span>

                            {/* Hover state: các icon thao tác nhanh */}
                            <div className="hidden group-hover:flex items-center gap-1.5 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7 rounded-md cursor-pointer hover:bg-muted transition-colors",
                                  notification.unread ? "text-blue-600 hover:text-blue-700" : "text-muted-foreground"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRead(notification.id);
                                }}
                                title={notification.unread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
                              >
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md cursor-pointer hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                title="Xóa thông báo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
