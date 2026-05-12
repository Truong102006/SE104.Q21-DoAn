"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AppNotification,
  formatRelativeTime,
  getNotificationTypeLabel,
  getUnreadNotificationCount,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock-notifications";
import { BellRing, CheckCheck } from "lucide-react";

type NotificationFilter = "ALL" | "UNREAD";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [notifications, setNotifications] =
    useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications],
  );

  const visibleNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((notification) => notification.unread);
    }
    return notifications;
  }, [filter, notifications]);

  function handleMarkAllRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, unread: false })),
    );
  }

  function handleToggleRead(id: string) {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, unread: !notification.unread }
          : notification,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thong bao</h1>
          <p className="mt-1 text-muted-foreground">
            Theo doi cap nhat don hang, ton kho va he thong.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          {unreadCount} chua doc
        </Badge>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-gold" />
                Trung tam thong bao
              </CardTitle>
              <CardDescription>
                Du lieu mock cho frontend, co the thay bang API sau.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "ALL" ? "default" : "outline"}
                onClick={() => setFilter("ALL")}
                className="cursor-pointer"
              >
                Tat ca
              </Button>
              <Button
                variant={filter === "UNREAD" ? "default" : "outline"}
                onClick={() => setFilter("UNREAD")}
                className="cursor-pointer"
              >
                Chua doc
              </Button>
              <Button
                variant="outline"
                onClick={handleMarkAllRead}
                className="cursor-pointer"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Danh dau da doc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visibleNotifications.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Khong co thong bao nao phu hop voi bo loc.
            </div>
          ) : (
            <ul className="divide-y">
              {visibleNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-muted/20"
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      notification.unread ? "bg-gold" : "bg-muted-foreground/30"
                    }`}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {getNotificationTypeLabel(notification.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRead(notification.id)}
                    className="cursor-pointer whitespace-nowrap"
                  >
                    {notification.unread ? "Danh dau da doc" : "Danh dau chua doc"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
