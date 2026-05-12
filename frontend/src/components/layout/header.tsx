"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  formatRelativeTime,
  getUnreadNotificationCount,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock-notifications";
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

export function Header() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();
  const unreadNotificationCount = getUnreadNotificationCount();
  const previewNotifications = MOCK_NOTIFICATIONS.slice(0, 4);

  function handleOpenProfile() {
    router.push("/dashboard/profile");
  }

  function handleOpenSettings() {
    router.push("/dashboard/settings");
  }

  function handleOpenNotifications() {
    router.push("/dashboard/notifications");
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur-sm">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer lg:hidden"
            aria-label="Mo menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <Sidebar collapsed={false} onToggle={() => {}} />
        </SheetContent>
      </Sheet>

      <div className="relative hidden max-w-md flex-1 sm:flex">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Tim kiem san pham, don hang..."
          className="h-9 w-full rounded-lg border bg-muted/50 pl-10 pr-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            isAdmin()
              ? "border-gold/40 bg-gold/5 text-gold"
              : "border-muted-foreground/30 text-muted-foreground"
          }
        >
          {isAdmin() ? "Admin" : "Nhan vien"}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative cursor-pointer"
              aria-label="Thong bao"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                  {Math.min(unreadNotificationCount, 9)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Thong bao</span>
              <span className="text-[11px] text-muted-foreground">
                {unreadNotificationCount} chua doc
              </span>
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
                    notification.unread ? "bg-gold" : "bg-muted-foreground/30"
                  }`}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{notification.title}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleOpenNotifications}
              className="cursor-pointer justify-center text-sm font-medium text-gold"
            >
              Xem tat ca thong bao
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 cursor-pointer gap-2 px-2"
              aria-label="Menu nguoi dung"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gold/10 text-xs font-semibold text-gold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm font-medium md:block">
                {user?.fullName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleOpenProfile}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Ho so ca nhan
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleOpenSettings}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Cai dat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Dang xuat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
