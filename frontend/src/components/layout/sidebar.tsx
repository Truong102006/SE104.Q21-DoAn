"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavGroup, UserRole } from "@/types";
import {
  Archive,
  Bell,
  FileOutput,
  LayoutDashboard,
  Package,
  Search,
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

const COMPACT_GROUP_META: Record<string, { icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  "Lưu trữ": { icon: Archive },
  "Tra cứu": { icon: Search },
  "Kết xuất": { icon: FileOutput },
};

export function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role: UserRole = user?.role ?? "STAFF";
  const [openCompactGroup, setOpenCompactGroup] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  const compactOpenGroup = visibleGroups.find((group) => group.label === openCompactGroup) ?? null;

  function cancelCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleCloseFlyout() {
    cancelCloseTimer();
    closeTimer.current = setTimeout(() => setOpenCompactGroup(null), 120);
  }

  function openFlyout(groupLabel: string, target: HTMLElement) {
    cancelCloseTimer();
    const rect = target.getBoundingClientRect();
    setFlyoutPos({ top: rect.top, left: rect.right + 8 });
    setOpenCompactGroup(groupLabel);
  }

  return (
    <aside
      className={cn(
        "z-30 flex flex-col overflow-visible border-r border-sidebar-border bg-sidebar",
        mobile ? "h-full w-full" : "fixed inset-y-0 left-0 w-52",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Gem className="h-4.5 w-4.5 text-sidebar-primary-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="whitespace-nowrap text-[1rem] font-semibold leading-tight text-sidebar-foreground">Gold Store</h2>
          <p className="whitespace-nowrap text-[11px] text-sidebar-foreground/55">Management Workspace</p>
        </div>
      </div>

      <nav className="app-scrollbar flex-1 space-y-3 overflow-x-visible overflow-y-auto px-1.5 py-2.5">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {(!COMPACT_GROUP_META[group.label] || mobile) && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-sidebar-foreground/45">
                {group.label}
              </p>
            )}

            {(!COMPACT_GROUP_META[group.label] || mobile) && (
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const baseHref = item.href.split("#")[0];
                  const isActive = pathname === baseHref || (baseHref !== "/dashboard" && pathname.startsWith(baseHref));

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex h-8.5 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-medium",
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
            )}

            {!mobile && COMPACT_GROUP_META[group.label] && (
              <div className="relative">
                {(() => {
                  const CompactIcon = COMPACT_GROUP_META[group.label].icon;
                  const hasActiveChild = group.items.some((item) => {
                    const baseHref = item.href.split("#")[0];
                    return pathname === baseHref || (baseHref !== "/dashboard" && pathname.startsWith(baseHref));
                  });

                  return (
                    <>
                      <button
                        type="button"
                        className={cn(
                          "flex h-8.5 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium",
                          hasActiveChild
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                        onMouseEnter={(event) => openFlyout(group.label, event.currentTarget)}
                        onMouseLeave={scheduleCloseFlyout}
                      >
                        <CompactIcon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            hasActiveChild
                              ? "text-sidebar-primary"
                              : "text-sidebar-foreground/55",
                          )}
                          strokeWidth={1.85}
                        />
                        <span className="truncate">{group.label}</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </nav>

      {!mobile && compactOpenGroup && compactOpenGroup.items.length > 0 && (
        <div
          className="fixed z-[80] w-64"
          style={{ top: flyoutPos.top, left: flyoutPos.left }}
          onMouseEnter={cancelCloseTimer}
          onMouseLeave={scheduleCloseFlyout}
        >
          <div className="rounded-lg border border-sidebar-border bg-sidebar p-2 shadow-xl">
            <ul className="space-y-1">
              {compactOpenGroup.items.map((item) => {
                const baseHref = item.href.split("#")[0];
                const isActive =
                  pathname === baseHref || (baseHref !== "/dashboard" && pathname.startsWith(baseHref));

                return (
                  <li key={`compact-${item.href}`}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      onClick={() => setOpenCompactGroup(null)}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
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
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}

