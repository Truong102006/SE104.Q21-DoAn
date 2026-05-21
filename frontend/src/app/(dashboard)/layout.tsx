"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { fetchCurrentUser } from "@/services/auth-service";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Loader2 } from "lucide-react";
import { ToastContainer } from "@/components/ui/toast-container";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, isAuthenticated, hydrate, isHydrated, login, logout } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated()) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    let cancelled = false;
    fetchCurrentUser(token)
      .then((user) => {
        if (!cancelled) {
          login(token, user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          logout();
          router.replace("/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, token, login, logout, router]);

  if (!isHydrated || !isAuthenticated()) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-static min-h-dvh bg-background">
      <div className="hidden lg:block">
        <Sidebar collapsed={false} onToggle={() => {}} />
      </div>

      <div className="flex flex-col lg:ml-[76px]">
        <Header />

        <main className="flex-1 px-3 py-4 lg:px-4 lg:py-4 xl:px-5">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

