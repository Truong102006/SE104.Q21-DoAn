"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { useTranslation } from "@/i18n/i18n-context";
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
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const MENU_ITEMS: MenuItem[] = [
  { key: "nav.dashboard", label: "Dashboard", href: "/dashboard", icon: Gauge, roles: ["ADMIN", "STAFF"] },
  { key: "nav.suppliers", label: "Nhà cung cấp", href: "/dashboard/suppliers", icon: Truck, roles: ["ADMIN", "STAFF"] },
  { key: "nav.customers", label: "Khách hàng", href: "/dashboard/customers", icon: Users, roles: ["ADMIN", "STAFF"] },
  { key: "nav.units", label: "Đơn vị tính", href: "/dashboard/units", icon: ClipboardList, roles: ["ADMIN", "STAFF"] },
  { key: "nav.productTypes", label: "Loại sản phẩm", href: "/dashboard/product-types", icon: Store, roles: ["ADMIN", "STAFF"] },
  { key: "nav.serviceTypes", label: "Loại dịch vụ", href: "/dashboard/service-types", icon: Wrench, roles: ["ADMIN", "STAFF"] },
  { key: "nav.products", label: "Sản phẩm", href: "/dashboard/products", icon: Package, roles: ["ADMIN", "STAFF"] },
  { key: "nav.purchaseOrders", label: "Lập phiếu mua", href: "/dashboard/purchase-orders", icon: ShoppingBag, roles: ["ADMIN", "STAFF"] },
  { key: "nav.salesOrders", label: "Lập phiếu bán", href: "/dashboard/orders", icon: ShoppingBag, roles: ["ADMIN", "STAFF"] },
  { key: "nav.serviceOrders", label: "Lập phiếu dịch vụ", href: "/dashboard/service-orders", icon: Wrench, roles: ["ADMIN", "STAFF"] },
  { key: "nav.productSearch", label: "Tra cứu sản phẩm", href: "/dashboard/products?mode=search", icon: Search, roles: ["ADMIN", "STAFF"] },
  {
    key: "nav.serviceSearch",
    label: "Tra cứu phiếu dịch vụ",
    href: "/dashboard/service-voucher-lookup",
    icon: Search,
    roles: ["ADMIN", "STAFF"],
  },
  { key: "nav.accounts", label: "Quản lý tài khoản", href: "/dashboard/staff", icon: Users, roles: ["ADMIN"] },
  { key: "nav.reports", label: "Báo cáo", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN"] },
  { key: "nav.settings", label: "Thay đổi quy định", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const { t } = useTranslation();

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
          <p className="text-xs text-sidebar-foreground/60">{mobile ? "Mobile App" : "Management"}</p>
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
              <span className="truncate">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
