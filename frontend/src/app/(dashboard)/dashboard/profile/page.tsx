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
  STAFF: "Nhan vien",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ho so ca nhan</h1>
        <p className="mt-1 text-muted-foreground">
          Thong tin tai khoan dang dang nhap.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gold/10 text-gold text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user.fullName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground">Vai tro</span>
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thong tin co ban</CardTitle>
            <CardDescription>
              Du lieu hien tai dang lay tu auth-store local.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Ho va ten</Label>
              <Input id="full-name" value={user.fullName} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Ten dang nhap</Label>
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
