"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Gauge,
  Home,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { useTranslation } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

type MenuItem = {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

type MenuSection = {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    key: "nav.mainScreen",
    icon: Home,
    items: [
      { key: "nav.dashboard", href: "/dashboard", icon: Gauge, roles: ["ADMIN", "STAFF"] },
    ],
  },
  {
    key: "nav.entryScreen",
    icon: ClipboardList,
    items: [
      { key: "nav.purchaseOrders", href: "/dashboard/purchase-orders", icon: ShoppingBag, roles: ["ADMIN", "STAFF"] },
      { key: "nav.salesOrders", href: "/dashboard/orders", icon: ShoppingBag, roles: ["ADMIN", "STAFF"] },
      { key: "nav.serviceOrders", href: "/dashboard/service-orders", icon: Wrench, roles: ["ADMIN", "STAFF"] },
      { key: "nav.products", href: "/dashboard/products", icon: Package, roles: ["ADMIN", "STAFF"] },
      { key: "nav.productTypes", href: "/dashboard/product-types", icon: Store, roles: ["ADMIN", "STAFF"] },
      { key: "nav.serviceTypes", href: "/dashboard/service-types", icon: Wrench, roles: ["ADMIN", "STAFF"] },
      { key: "nav.customers", href: "/dashboard/customers", icon: Users, roles: ["ADMIN", "STAFF"] },
      { key: "nav.suppliers", href: "/dashboard/suppliers", icon: Truck, roles: ["ADMIN", "STAFF"] },
      { key: "nav.units", href: "/dashboard/units", icon: ClipboardList, roles: ["ADMIN", "STAFF"] },
    ],
  },
  {
    key: "nav.lookupScreen",
    icon: Search,
    items: [
      { key: "nav.serviceSearch", href: "/dashboard/service-voucher-lookup", icon: Search, roles: ["ADMIN", "STAFF"] },
    ],
  },
  {
    key: "nav.reportsScreen",
    icon: BarChart3,
    items: [
      { key: "nav.reports", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN"] },
    ],
  },
  {
    key: "nav.systemManagement",
    icon: Settings,
    items: [
      { key: "nav.accounts", href: "/dashboard/staff", icon: Users, roles: ["ADMIN"] },
      { key: "nav.settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
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
  const searchParams = useSearchParams();
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => setIsMounted(true), []);

  const isItemActive = (item: MenuItem) => {
    if (!isMounted) return false;

    const [pathPart, queryPart = ""] = item.href.split("?");
    if (pathPart === "/dashboard" && pathname !== "/dashboard") return false;
    if (pathPart !== "/dashboard" && pathname !== pathPart && !pathname.startsWith(`${pathPart}/`)) return false;

    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      for (const [key, value] of params.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    }

    if (pathPart === "/dashboard/products" && searchParams.get("mode") === "search") {
      return false;
    }

    return true;
  };

  const filteredSections = MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);

  const isSectionActive = (section: MenuSection) => section.items.some((item) => isItemActive(item));

  useEffect(() => {
    if (!mobile) return;
    const next: Record<number, boolean> = {};
    filteredSections.forEach((section, idx) => {
      if (isSectionActive(section)) next[idx] = true;
    });
    setExpandedSections(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mobile]);

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (mobile) {
    return (
      <aside className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent/50 text-gold">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">Tiệm Vàng GS</p>
              <p className="text-xs text-sidebar-foreground/55">Hệ thống quản lý</p>
            </div>
          </div>
        </div>

        <nav className="app-scrollbar flex-1 space-y-2 overflow-y-auto px-3 py-4">
          {filteredSections.map((section, idx) => {
            const SectionIcon = section.icon;
            const expanded = !!expandedSections[idx];
            const active = isSectionActive(section);

            return (
              <div key={section.key} className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/10 p-1">
                <button
                  type="button"
                  onClick={() => toggleSection(idx)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                    active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <SectionIcon className={cn("h-4 w-4", active ? "text-gold" : "text-sidebar-foreground/50")} />
                    <span>{t(section.key)}</span>
                  </div>
                  {expanded ? <ChevronDown className="h-4 w-4 text-sidebar-foreground/45" /> : <ChevronRight className="h-4 w-4 text-sidebar-foreground/45" />}
                </button>

                {expanded && (
                  <div className="mt-1 space-y-1 px-1 pb-1">
                    {section.items.map((item) => {
                      const activeItem = isItemActive(item);
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                            activeItem ? "bg-background text-foreground shadow-sm" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                          )}
                        >
                          <ItemIcon className={cn("h-4 w-4", activeItem ? "text-gold" : "text-sidebar-foreground/40")} />
                          <span className="truncate">{t(item.key)}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar py-4 shadow-lg w-[76px] px-3 items-center">
      {/* Branding / Logo */}
      <div className="mb-6 flex h-12 w-12 shrink-0 items-center justify-center">
        <Link href="/dashboard" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sidebar-border bg-sidebar-accent/40 text-gold shadow-sm transition-colors hover:bg-sidebar-accent" title="Tiệm Vàng GS">
          <Store className="h-6 w-6" />
        </Link>
      </div>

      {/* Navigation list */}
      <nav className="flex w-full flex-1 flex-col gap-3 py-1 items-center">
        {filteredSections.map((section, idx) => {
          const SectionIcon = section.icon;
          const active = isSectionActive(section);
          const hasSingleItem = section.items.length === 1;
          const singleItemHref = hasSingleItem ? section.items[0].href : null;

          const categoryIcon = (
            <div
              className={cn(
                "h-11 w-11 justify-center flex items-center rounded-xl transition-all duration-200 border border-transparent cursor-pointer",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground border-sidebar-border/60 shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <SectionIcon className={cn("h-5 w-5 shrink-0 transition-colors", active ? "text-gold" : "")} />
            </div>
          );

          return (
            <div
              key={section.key}
              className="relative mx-auto my-0.5"
              onMouseEnter={() => !hasSingleItem && setHoveredIdx(idx)}
              onMouseLeave={() => !hasSingleItem && setHoveredIdx(null)}
            >
              {/* Category Icon */}
              {hasSingleItem && singleItemHref ? (
                <Link href={singleItemHref}>
                  {categoryIcon}
                </Link>
              ) : (
                categoryIcon
              )}

              {/* Floating Sub-menu (Tooltip style) */}
              {!hasSingleItem && (
                <div
                  className={cn(
                    "absolute left-[54px] top-0 z-50 w-56 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-2xl transition-all duration-200 ease-out flex flex-col gap-1 before:absolute before:-left-3 before:top-0 before:h-full before:w-3 before:content-['']",
                    hoveredIdx === idx
                      ? "visible opacity-100 translate-x-0 pointer-events-auto"
                      : "invisible opacity-0 translate-x-2 pointer-events-none"
                  )}
                >
                  {/* Arrow */}
                  <div className="absolute top-[18px] -left-1 h-2 w-2 rotate-45 border-b border-l border-sidebar-border bg-sidebar" />

                  {/* Section Header inside Tooltip */}
                  <div className="px-3 py-1.5 border-b border-sidebar-border/50 mb-1 relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/45">
                      {t(section.key)}
                    </p>
                  </div>

                  {/* Sub-items list */}
                  <div className="flex flex-col gap-0.5 relative z-10">
                    {section.items.map((item) => {
                      const activeItem = isItemActive(item);
                      const ItemIcon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setHoveredIdx(null)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 border border-transparent",
                            activeItem
                              ? "bg-sidebar-accent text-sidebar-foreground border-sidebar-border/50 shadow-sm"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                          )}
                        >
                          <ItemIcon className={cn("h-4 w-4 shrink-0 transition-colors", activeItem ? "text-gold" : "")} />
                          <span className="truncate">{t(item.key)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Info */}
      <div className="mt-auto flex items-center justify-center border-t border-sidebar-border/50 pt-4 w-11 mx-auto">
        <div className="flex h-10 w-full items-center justify-center relative group cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent/30 text-[10px] font-bold tracking-widest text-sidebar-foreground/45">
            GS
          </div>

          {/* Floating Footer info */}
          <div className="absolute left-[54px] top-1/2 -translate-y-1/2 invisible opacity-0 translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 w-32 rounded-lg border border-sidebar-border bg-sidebar p-2 shadow-2xl transition-all duration-200 ease-out whitespace-nowrap">
            {/* Arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-1 h-2 w-2 rotate-45 border-b border-l border-sidebar-border bg-sidebar" />
            <div className="relative z-10">
              <p className="text-xs font-semibold text-sidebar-foreground">Tiệm Vàng GS</p>
              <p className="text-[9px] text-sidebar-foreground/40">v1.2.0</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
