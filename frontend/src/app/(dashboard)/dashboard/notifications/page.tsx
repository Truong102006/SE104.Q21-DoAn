"use client";

import { useMemo, useState } from "react";
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
  formatRelativeTime,
  getNotificationTypeLabel,
  getUnreadNotificationCount,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock-notifications";
import {
  CheckCheck,
  Cog,
  Inbox,
  Package,
  Search,
  ShoppingCart,
  SlidersHorizontal,
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
  { value: "ALL", label: "Tất cả" },
  { value: "ORDER", label: "Đơn hàng" },
  { value: "INVENTORY", label: "Tồn kho" },
  { value: "PRICE", label: "Giá vàng" },
  { value: "SYSTEM", label: "Hệ thống" },
];

const TYPE_META: Record<NotificationType, { icon: LucideIcon; iconClass: string; badgeClass: string }> = {
  ORDER: {
    icon: ShoppingCart,
    iconClass: "bg-sky-600/12 text-sky-700",
    badgeClass: "border-sky-600/30 bg-sky-600/10 text-sky-700",
  },
  INVENTORY: {
    icon: Package,
    iconClass: "bg-amber-600/12 text-amber-700",
    badgeClass: "border-amber-600/30 bg-amber-600/10 text-amber-700",
  },
  PRICE: {
    icon: TrendingUp,
    iconClass: "bg-emerald-600/12 text-emerald-700",
    badgeClass: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700",
  },
  SYSTEM: {
    icon: Cog,
    iconClass: "bg-violet-600/12 text-violet-700",
    badgeClass: "border-violet-600/30 bg-violet-600/10 text-violet-700",
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
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [scopeFilter, setScopeFilter] = useState<NotificationScopeFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("ALL");
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
  const readCount = totalCount - unreadCount;

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

  function handleMarkVisibleRead() {
    const unreadVisible = filteredNotifications.filter(n => n.unread);
    const visibleIds = new Set(unreadVisible.map((notification) => notification.id));

    setNotifications((previous) =>
      previous.map((notification) =>
        visibleIds.has(notification.id)
          ? {
              ...notification,
              unread: false,
            }
          : notification,
      ),
    );
    toast.success(`Đã đánh dấu ${unreadVisible.length} thông báo đang hiển thị là đã đọc.`);
  }

  function handleToggleRead(id: string) {
    let isNowRead = false;
    setNotifications((previous) =>
      previous.map((notification) => {
        if (notification.id === id) {
          isNowRead = !notification.unread;
          return {
            ...notification,
            unread: !notification.unread,
          };
        }
        return notification;
      }),
    );

    if (isNowRead) {
      // Small feedback for individual toggle
    }
  }

  function handleResetFilters() {
    setScopeFilter("ALL");
    setTypeFilter("ALL");
    setKeyword("");
  }

  const hasActiveFilters = scopeFilter !== "ALL" || typeFilter !== "ALL" || keyword.trim().length > 0;

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Thông báo</CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                  Tổng {totalCount}
                </Badge>
                <Badge variant="outline" className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS.primary)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS.primary)} />
                  Chưa đọc {unreadCount}
                </Badge>
                <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px] text-muted-foreground">
                  Đã đọc {readCount}
                </Badge>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkVisibleRead}
                  disabled={visibleUnreadCount === 0}
                  className="h-7 cursor-pointer"
                >
                  <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                  Đã đọc lọc
                </Button>
                <Button
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="h-7 cursor-pointer"
                >
                  <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                  Đọc tất cả
                </Button>
              </div>
            </div>

            <div className="grid gap-2 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-center">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm theo tiêu đề hoặc nội dung thông báo"
                  className="pl-9 pr-8"
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

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={scopeFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  className="h-7 cursor-pointer"
                  onClick={() => setScopeFilter("ALL")}
                >
                  Tất cả
                  <span className="ml-1.5 rounded border border-current/25 px-1.5 text-[10px] leading-4">
                    {totalCount}
                  </span>
                </Button>
                <Button
                  variant={scopeFilter === "UNREAD" ? "default" : "outline"}
                  size="sm"
                  className="h-7 cursor-pointer"
                  onClick={() => setScopeFilter("UNREAD")}
                >
                  Chưa đọc
                  <span className="ml-1.5 rounded border border-current/25 px-1.5 text-[10px] leading-4">
                    {unreadCount}
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Loại:
              </span>
              {TYPE_FILTERS.map((typeOption) => (
                <Button
                  key={typeOption.value}
                  variant={typeFilter === typeOption.value ? "default" : "outline"}
                  size="sm"
                  className="h-7 cursor-pointer"
                  onClick={() => setTypeFilter(typeOption.value)}
                >
                  {typeOption.label}
                  <span className="ml-1.5 rounded border border-current/25 px-1.5 text-[10px] leading-4">
                    {typeOption.value === "ALL" ? totalCount : typeCounts[typeOption.value]}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
            <span>
              {filteredNotifications.length} thông báo phù hợp
              {visibleUnreadCount > 0 ? `, ${visibleUnreadCount} chưa đọc` : ""}
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-7 cursor-pointer" onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {groupedNotifications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-muted/45">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Không tìm thấy thông báo phù hợp</p>
              <p className="mt-1 text-sm text-muted-foreground">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <div>
              {groupedNotifications.map((group) => (
                <section key={group.label} className="border-b border-border/60 last:border-b-0">
                  <div className="bg-muted/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </div>

                  <ul>
                    {group.items.map((notification) => {
                      const typeMeta = TYPE_META[notification.type];
                      const TypeIcon = typeMeta.icon;

                      return (
                        <li
                          key={notification.id}
                          className={cn(
                            "grid gap-2 px-3 py-2.5 md:grid-cols-[auto_1fr_auto] md:items-start transition-colors duration-200",
                            notification.unread ? "bg-primary/10" : "bg-card hover:bg-muted/30",
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-7 w-7 items-center justify-center rounded-md",
                              typeMeta.iconClass,
                            )}
                          >
                            <TypeIcon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">{notification.title}</p>
                              {notification.unread && (
                                <Badge
                                  variant="outline"
                                  className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS.primary)}
                                >
                                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS.primary)} />
                                  Mới
                                </Badge>
                              )}
                              <Badge variant="outline" className={cn("text-[10px]", typeMeta.badgeClass)}>
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>

                          <div className="flex justify-end md:pt-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRead(notification.id)}
                              className="h-7 cursor-pointer whitespace-nowrap"
                            >
                              {notification.unread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
                            </Button>
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
