"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import {
  BarChart3,
  ClipboardList,
  Gauge,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["ADMIN", "STAFF"] },
  { label: "Nha cung cap", href: "/dashboard/suppliers", icon: Truck, roles: ["ADMIN", "STAFF"] },
  { label: "Khach hang", href: "/dashboard/customers", icon: Users, roles: ["ADMIN", "STAFF"] },
  { label: "Don vi tinh", href: "/dashboard/units", icon: ClipboardList, roles: ["ADMIN", "STAFF"] },
  { label: "Loai san pham", href: "/dashboard/product-types", icon: Store, roles: ["ADMIN", "STAFF"] },
  { label: "Loai dich vu", href: "/dashboard/service-types", icon: Wrench, roles: ["ADMIN", "STAFF"] },
  { label: "San pham", href: "/dashboard/products", icon: Package, roles: ["ADMIN", "STAFF"] },
  { label: "Lap phieu mua", href: "/dashboard/purchase-orders", icon: ShoppingBag, roles: ["ADMIN", "STAFF"] },
  { label: "Lap phieu ban", href: "/dashboard/orders", icon: ShoppingBag, roles: ["ADMIN", "STAFF"] },
  { label: "Lap phieu dich vu", href: "/dashboard/service-orders", icon: Wrench, roles: ["ADMIN", "STAFF"] },
  { label: "Tra cuu san pham", href: "/dashboard/products?mode=search", icon: Search, roles: ["ADMIN", "STAFF"] },
  {
    label: "Tra cuu phieu dich vu",
    href: "/dashboard/service-voucher-lookup",
    icon: Search,
    roles: ["ADMIN", "STAFF"],
  },
  { label: "Quan ly tai khoan", href: "/dashboard/staff", icon: Users, roles: ["ADMIN"] },
  { label: "Bao cao", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Thay doi quy dinh", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");

  const items = MENU_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "z-30 flex flex-col border-r border-sidebar-border bg-sidebar",
        mobile ? "h-full w-full" : "fixed inset-y-0 left-0 w-56",
      )}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">Gold Store</p>
          <p className="text-xs text-sidebar-foreground/60">Management</p>
        </div>
      </div>

      <nav className="app-scrollbar flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
