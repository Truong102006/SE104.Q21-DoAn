"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Dashboard Layout — Sidebar + Header + Content
   Handles auth hydration and redirects.
   ────────────────────────────────────────────────────────── */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, hydrate, isHydrated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  /* Hydrate auth state on mount */
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /* Redirect to login if not authenticated */
  useEffect(() => {
    if (isHydrated && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  /* Loading state while hydrating */
  if (!isHydrated || !isAuthenticated()) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col transition-[margin-left] duration-300 ease-in-out",
          collapsed ? "lg:ml-[68px]" : "lg:ml-64",
        )}
      >
        <Header
          sidebarCollapsed={collapsed}
          onSidebarToggle={() => setCollapsed((c) => !c)}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
