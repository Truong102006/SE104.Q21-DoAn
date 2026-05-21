"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { requestLogout } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/suppliers": "Nh\u00e0 cung c\u1ea5p",
  "/dashboard/customers": "Kh\u00e1ch h\u00e0ng",
  "/dashboard/units": "\u0110\u01a1n v\u1ecb t\u00ednh",
  "/dashboard/product-types": "Lo\u1ea1i s\u1ea3n ph\u1ea9m",
  "/dashboard/service-types": "Lo\u1ea1i d\u1ecbch v\u1ee5",
  "/dashboard/products": "S\u1ea3n ph\u1ea9m",
  "/dashboard/purchase-orders": "L\u1eadp phi\u1ebfu mua",
  "/dashboard/orders": "L\u1eadp phi\u1ebfu b\u00e1n",
  "/dashboard/service-orders": "L\u1eadp phi\u1ebfu d\u1ecbch v\u1ee5",
  "/dashboard/service-voucher-lookup": "Tra c\u1ee9u phi\u1ebfu d\u1ecbch v\u1ee5",
  "/dashboard/reports": "B\u00e1o c\u00e1o",
  "/dashboard/settings": "Thay \u0111\u1ed5i quy \u0111\u1ecbnh",
  "/dashboard/staff": "Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n",
};

function getPageTitle(pathname: string): string {
  const direct = PAGE_TITLES[pathname];
  if (direct) {
    return direct;
  }

  const matched = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(`${path}/`));
  if (matched) {
    return matched[1];
  }

  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, logout } = useAuthStore();

  const title = useMemo(() => getPageTitle(pathname), [pathname]);

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
            <Sidebar collapsed={false} onToggle={() => {}} mobile />
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-sm font-semibold lg:text-base">{title}</h1>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:block">
            {user?.username} ({user?.role ?? "STAFF"})
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
