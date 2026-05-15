"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavGroup, UserRole } from "@/types";
import {
  Bell,
  LayoutDashboard,
  Package,
  Wrench,
  UserRound,
  Truck,
  ClipboardList,
  BarChart3,
  Gem,
} from "lucide-react";

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Dashboard tổng quan",
    items: [
      {
        title: "Tổng quan",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    label: "Thông báo",
    items: [
      {
        title: "Thông báo",
        href: "/dashboard/notifications",
        icon: Bell,
        roles: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    label: "Lưu trữ",
    items: [
      {
        title: "Nhà cung cấp",
        href: "/dashboard/suppliers",
        icon: Truck,
        roles: ["ADMIN"],
        badge: "BM1",
      },
      {
        title: "Khách hàng",
        href: "/dashboard/customers",
        icon: UserRound,
        roles: ["ADMIN", "STAFF"],
        badge: "BM2",
      },
      {
        title: "Đơn vị tính",
        href: "/dashboard/categories",
        icon: ClipboardList,
        roles: ["ADMIN", "STAFF"],
        badge: "BM3",
      },
      {
        title: "Loại dịch vụ",
        href: "/dashboard/services",
        icon: Wrench,
        roles: ["ADMIN", "STAFF"],
        badge: "BM4",
      },
      {
        title: "Phiếu mua hàng",
        href: "/dashboard/purchase-orders",
        icon: ClipboardList,
        roles: ["ADMIN"],
        badge: "BM5",
      },
      {
        title: "Phiếu bán hàng",
        href: "/dashboard/orders",
        icon: ClipboardList,
        roles: ["ADMIN", "STAFF"],
        badge: "BM6",
      },
      {
        title: "Phiếu dịch vụ",
        href: "/dashboard/service-orders",
        icon: ClipboardList,
        roles: ["ADMIN", "STAFF"],
        badge: "BM7",
      },
    ],
  },
  {
    label: "Tra cứu",
    items: [
      {
        title: "Sản phẩm",
        href: "/dashboard/products",
        icon: Package,
        roles: ["ADMIN", "STAFF"],
        badge: "BM8",
      },
      {
        title: "Phiếu dịch vụ",
        href: "/dashboard/service-voucher-lookup",
        icon: ClipboardList,
        roles: ["ADMIN", "STAFF"],
        badge: "BM9",
      },
    ],
  },
  {
    label: "Kết xuất",
    items: [
      {
        title: "Báo cáo tồn kho",
        href: "/dashboard/reports#bm10",
        icon: BarChart3,
        roles: ["ADMIN", "STAFF"],
        badge: "BM10",
      },
      {
        title: "Doanh thu sản phẩm",
        href: "/dashboard/reports#bm11",
        icon: BarChart3,
        roles: ["ADMIN", "STAFF"],
        badge: "BM11",
      },
      {
        title: "Doanh thu dịch vụ",
        href: "/dashboard/reports#bm12",
        icon: BarChart3,
        roles: ["ADMIN", "STAFF"],
        badge: "BM12",
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role: UserRole = user?.role ?? "STAFF";

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "z-30 flex flex-col border-r border-sidebar-border bg-sidebar",
        mobile ? "h-full w-full" : "fixed inset-y-0 left-0 w-72",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Gem className="h-5 w-5 text-sidebar-primary-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="whitespace-nowrap text-base font-semibold text-sidebar-foreground">Gold Store</h2>
          <p className="text-xs text-sidebar-foreground/55">Management Workspace</p>
        </div>
      </div>

      <nav className="app-scrollbar flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-sidebar-foreground/45">
              {group.label}
            </p>

            <ul className="space-y-1">
              {group.items.map((item) => {
                const baseHref = item.href.split("#")[0];
                const isActive = pathname === baseHref || (baseHref !== "/dashboard" && pathname.startsWith(baseHref));

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/55 group-hover:text-sidebar-accent-foreground",
                      )}
                      strokeWidth={1.85}
                    />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "ml-auto rounded border px-1.5 py-0.5 text-[10px] leading-none tracking-wide",
                          isActive
                            ? "border-sidebar-primary/40 bg-sidebar-primary/15 text-sidebar-primary"
                            : "border-sidebar-border/90 bg-sidebar-accent/50 text-sidebar-foreground/65",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {mobile ? (
                      linkContent
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

