"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cai dat</h1>
          <p className="mt-1 text-muted-foreground">
            Quan ly cac tuy chon giao dien va thong bao.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          Frontend local state
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Thong bao
            </CardTitle>
            <CardDescription>
              Tuy chon duoc luu tam thoi tren client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-medium">Nhan email he thong</p>
                <p className="text-xs text-muted-foreground">
                  Gui thong bao qua email tai khoan.
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-gold"
                checked={emailNotifications}
                onChange={(event) => setEmailNotifications(event.target.checked)}
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-medium">Don hang moi</p>
                <p className="text-xs text-muted-foreground">
                  Bat thong bao khi co don hang phat sinh.
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Giao dien
            </CardTitle>
            <CardDescription>Tuy chinh cach hien thi dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-medium">Che do compact</p>
                <p className="text-xs text-muted-foreground">
                  Thu gon mat do thong tin tren the va bang.
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
              Luu cai dat tam thoi
            </Button>

            {savedAt && (
              <p className="text-xs text-muted-foreground">
                Da luu luc {savedAt} (chi luu trong phien hien tai).
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
