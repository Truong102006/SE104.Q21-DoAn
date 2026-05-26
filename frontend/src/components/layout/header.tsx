"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { requestLogout } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, ChevronRight, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useTranslation } from "@/i18n/i18n-context";
import { LanguageSwitcher } from "../language-switcher";
import { ThemeToggle } from "../theme-toggle";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "nav.dashboard",
  "/dashboard/suppliers": "nav.suppliers",
  "/dashboard/customers": "nav.customers",
  "/dashboard/units": "nav.units",
  "/dashboard/product-types": "nav.productTypes",
  "/dashboard/service-types": "nav.serviceTypes",
  "/dashboard/products": "nav.products",
  "/dashboard/product-catalog": "nav.productCatalog",
  "/dashboard/purchase-orders": "nav.purchaseOrders",
  "/dashboard/orders": "nav.salesOrders",
  "/dashboard/service-orders": "nav.serviceOrders",
  "/dashboard/service-voucher-lookup": "nav.serviceSearch",
  "/dashboard/reports": "nav.reports",
  "/dashboard/settings": "nav.settings",
  "/dashboard/staff": "nav.accounts",
};

function getPageTitleKey(pathname: string): string {
  const direct = PAGE_TITLES[pathname];
  if (direct) {
    return direct;
  }

  const matched = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(`${path}/`));
  if (matched) {
    return matched[1];
  }

  return "nav.dashboard";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, logout } = useAuthStore();
  const { t } = useTranslation();

  const titleKey = useMemo(() => getPageTitleKey(pathname), [pathname]);
  const title = t(titleKey);

  async function handleLogout() {
    try {
      await requestLogout(token);
    } finally {
      logout();
      router.replace("/login");
    }
  }

  return (
    <header className="border-b border-border/70 bg-card">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-sm" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r border-sidebar-border bg-sidebar p-0">
            <Sidebar collapsed={false} onToggle={() => { }} mobile />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground/80">
            <Home className="h-3.5 w-3.5" />
            <ChevronRight className="h-3 w-3" />
          </div>
          <h1 className="font-semibold lg:text-base">{title}</h1>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Responsive pill Language Switcher */}
          <LanguageSwitcher className="mr-1 shadow-sm" />

          <span className="hidden text-muted-foreground sm:block">
            {user?.username} ({user?.role ?? "STAFF"})
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 cursor-pointer">
            <LogOut className="h-3.5 w-3.5" />
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
