"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

const ROLE_LABELS = {
  ADMIN: "Admin",
  STAFF: "Nhân viên",
} as const;

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const initials = user.fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center border-b px-3 py-3 text-center">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gold/10 text-gold text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user.fullName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2.5">
              <span className="text-xs text-muted-foreground">Vai trò</span>
              <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>
                Username:{" "}
                <span className="font-medium text-foreground">{user.username}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b px-3 py-3">
            <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
            <CardDescription>Dữ liệu hiện tại đang lấy từ auth-store local.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Họ và tên</Label>
              <Input id="full-name" value={user.fullName} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" value={user.username} readOnly />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


