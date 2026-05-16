"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Settings } from "lucide-react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleSave() {
    setSavedAt(
      new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b px-3 py-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Tùy chọn được lưu tạm thời trên client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-2.5">
              <div>
                <p className="text-sm font-medium">Nhận email hệ thống</p>
                <p className="text-xs text-muted-foreground">
                  Gửi thông báo qua email tài khoản.
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-gold"
                checked={emailNotifications}
                onChange={(event) => setEmailNotifications(event.target.checked)}
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-2.5">
              <div>
                <p className="text-sm font-medium">Đơn hàng mới</p>
                <p className="text-xs text-muted-foreground">
                  Bật thông báo khi có đơn hàng phát sinh.
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-gold"
                checked={orderNotifications}
                onChange={(event) => setOrderNotifications(event.target.checked)}
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b px-3 py-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Giao diện
            </CardTitle>
            <CardDescription>Tùy chỉnh cách hiển thị dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-2.5">
              <div>
                <p className="text-sm font-medium">Chế độ compact</p>
                <p className="text-xs text-muted-foreground">
                  Thu gọn mật độ thông tin trên thẻ và bảng.
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-gold"
                checked={compactMode}
                onChange={(event) => setCompactMode(event.target.checked)}
              />
            </label>

            <Button onClick={handleSave} className="w-full sm:w-auto">
              Lưu cài đặt tạm thời
            </Button>

            {savedAt && (
              <p className="text-xs text-muted-foreground">
                Đã lưu lúc {savedAt} (chỉ lưu trong phiên hiện tại).
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



