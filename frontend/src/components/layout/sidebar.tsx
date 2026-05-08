"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { NavGroup, UserRole } from "@/types";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  ShoppingCart,
  UserRound,
  Truck,
  ClipboardList,
  TrendingUp,
  Gem,
  ChevronLeft,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Dynamic Sidebar — Role-based navigation
   • ADMIN sees all menu items
   • STAFF only sees permitted items
   • Collapsible with smooth animation
   ────────────────────────────────────────────────────────── */

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    label: "Quản lý bán hàng",
    items: [
      {
        title: "Sản phẩm",
        href: "/dashboard/products",
        icon: Package,
        roles: ["ADMIN", "STAFF"],
      },
      {
        title: "Danh mục",
        href: "/dashboard/categories",
        icon: Tags,
        roles: ["ADMIN", "STAFF"],
      },
      {
        title: "Đơn hàng",
        href: "/dashboard/orders",
        icon: ShoppingCart,
        roles: ["ADMIN", "STAFF"],
        badge: "3",
      },
      {
        title: "Khách hàng",
        href: "/dashboard/customers",
        icon: UserRound,
        roles: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    label: "Quản lý kho",
    items: [
      {
        title: "Nhà cung cấp",
        href: "/dashboard/suppliers",
        icon: Truck,
        roles: ["ADMIN"],
      },
      {
        title: "Nhập hàng",
        href: "/dashboard/purchase-orders",
        icon: ClipboardList,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Thông tin thị trường",
    items: [
      {
        title: "Giá vàng",
        href: "/dashboard/gold-prices",
        icon: TrendingUp,
        roles: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        title: "Nhân viên",
        href: "/dashboard/staff",
        icon: Users,
        roles: ["ADMIN"],
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role: UserRole = user?.role ?? "STAFF";

  /* Filter nav items by role */
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      {/* ─── Logo ──────────────────────────────────────── */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Gem className="h-5 w-5 text-sidebar-primary-foreground" strokeWidth={1.5} />
        </div>
        <div
          className={cn(
            "overflow-hidden transition-[opacity,width] duration-300",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          <h2 className="whitespace-nowrap text-base font-semibold text-sidebar-foreground">
            Gold Store
          </h2>
        </div>
      </div>

      {/* ─── Navigation ────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {/* Group label */}
            {!collapsed && (
              <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            {collapsed && <Separator className="mb-2 bg-sidebar-border" />}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 cursor-pointer",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors duration-150",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground",
                      )}
                      strokeWidth={1.8}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-5 justify-center bg-sidebar-primary/15 text-sidebar-primary text-[10px] font-semibold"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      linkContent
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ─── Collapse toggle ───────────────────────────── */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onToggle}
          className="flex h-9 w-full items-center justify-center rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>
    </aside>
  );
}
