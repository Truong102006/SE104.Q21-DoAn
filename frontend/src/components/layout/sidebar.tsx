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
      { key: "nav.accounts", href: "/dashboard/staff", icon: Users, roles: ["ADMIN"] },
      { key: "nav.settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
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
      { key: "nav.productSearch", href: "/dashboard/products?mode=search", icon: Search, roles: ["ADMIN", "STAFF"] },
      { key: "nav.serviceSearch", href: "/dashboard/service-voucher-lookup", icon: Search, roles: ["ADMIN", "STAFF"] },
    ],
  },
  {
    key: "nav.notificationScreen",
    icon: Bell,
    items: [
      { key: "nav.notifications", href: "/dashboard/notifications", icon: Bell, roles: ["ADMIN", "STAFF"] },
    ],
  },
  {
    key: "nav.reportsScreen",
    icon: BarChart3,
    items: [
      { key: "nav.reports", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN"] },
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
  const [isHovered, setIsHovered] = useState(false);

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
              <p className="text-sm font-semibold text-sidebar-foreground">Gold Store</p>
              <p className="text-xs text-sidebar-foreground/55">Quản lý cửa hàng</p>
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
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar py-4 transition-all duration-300 ease-in-out shadow-lg",
        isHovered ? "w-60 px-4" : "w-[76px] px-3 items-center"
      )}
    >
      {/* Branding / Logo */}
      <div className={cn("mb-6 flex h-12 items-center gap-3 px-1 transition-all duration-300", isHovered ? "w-full justify-start" : "w-12 justify-center")}>
        <Link href="/dashboard" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sidebar-border bg-sidebar-accent/40 text-gold shadow-sm transition-colors hover:bg-sidebar-accent">
          <Store className="h-6 w-6" />
        </Link>
        <div className={cn("transition-all duration-200 whitespace-nowrap overflow-hidden", isHovered ? "opacity-100 w-auto translate-x-0" : "opacity-0 w-0 -translate-x-2")}>
          <p className="text-sm font-bold text-sidebar-foreground">Gold Store</p>
          <p className="text-[10px] text-sidebar-foreground/55">Quản lý cửa hàng</p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex w-full flex-1 flex-col gap-3 py-1 overflow-y-auto app-scrollbar">
        {filteredSections.map((section, sectionIdx) => (
          <div key={section.key} className="w-full flex flex-col gap-1">
            {/* Section Header */}
            {isHovered ? (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/45 mt-2 mb-1 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                {t(section.key)}
              </p>
            ) : (
              sectionIdx > 0 && (
                <div className="mx-auto my-1 h-[1px] w-8 bg-sidebar-border/60 transition-all" />
              )
            )}

            {section.items.map((item) => {
              const activeItem = isItemActive(item);
              const ItemIcon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl transition-all duration-200",
                    isHovered ? "px-3 py-2.5 h-10 w-full justify-start" : "h-11 w-11 justify-center mx-auto",
                    activeItem 
                      ? "bg-sidebar-accent text-sidebar-foreground border border-sidebar-border/60 shadow-sm" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border border-transparent"
                  )}
                  title={!isHovered ? t(item.key) : undefined}
                >
                  <ItemIcon className={cn("h-5 w-5 shrink-0 transition-colors", activeItem ? "text-gold" : "")} />
                  {isHovered && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-opacity duration-300">
                      {t(item.key)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Info */}
      <div className={cn("mt-auto flex items-center justify-center transition-all duration-300 border-t border-sidebar-border/50 pt-4", isHovered ? "w-full px-1" : "w-11 mx-auto")}>
        <div className="flex h-10 w-full items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent/30 text-[10px] font-bold tracking-widest text-sidebar-foreground/45">
            GS
          </div>
          {isHovered && (
            <div className="whitespace-nowrap overflow-hidden transition-all duration-200">
              <p className="text-xs font-semibold text-sidebar-foreground">Gold Store</p>
              <p className="text-[9px] text-sidebar-foreground/40">v1.2.0</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
