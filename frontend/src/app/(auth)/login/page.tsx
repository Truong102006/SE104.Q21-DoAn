"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { mockLogin } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gem, Eye, EyeOff, Loader2 } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Login Page — Luxury Gold Store Authentication
   Premium split-screen layout with brand showcase + login form
   ────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrate, isHydrated } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Hydrate auth state from localStorage on mount */
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /* Redirect if already authenticated */
  useEffect(() => {
    if (isHydrated && isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await mockLogin(username, password);
      login(token, user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: "admin" | "staff") {
    setUsername(role);
    setPassword(role === "admin" ? "admin123" : "staff123");
    setError("");
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">Đang khởi tạo trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      {/* ─── Left panel — Brand showcase ─────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center bg-[oklch(0.14_0.01_60)] overflow-hidden">
        {/* Decorative gold gradient circles */}
        <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[oklch(0.65_0.12_75_/_0.08)] blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[oklch(0.72_0.14_80_/_0.06)] blur-3xl" />

        <div className="relative z-10 max-w-lg px-12 text-center">
          {/* Logo */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[oklch(0.65_0.12_75)] shadow-lg shadow-[oklch(0.65_0.12_75_/_0.3)]">
            <Gem className="h-10 w-10 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
            Gold Store
          </h1>
          <p className="text-lg leading-relaxed text-[oklch(0.7_0.02_75)]">
            Hệ thống quản lý cửa hàng
            <br />
            <span className="text-gold-gradient font-semibold">
              Vàng · Bạc · Đá Quý
            </span>
          </p>

          {/* Stats decoration */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: "Sản phẩm", value: "1,200+" },
              { label: "Đơn hàng", value: "8,500+" },
              { label: "Khách hàng", value: "3,200+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-[oklch(0.65_0.12_75)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[oklch(0.55_0.01_75)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right panel — Login form ────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold">
              <Gem className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold">Gold Store</h1>
          </div>

          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Đăng nhập
              </CardTitle>
              <CardDescription>
                Nhập thông tin tài khoản để truy cập hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error message */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      className="h-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full cursor-pointer bg-gold text-gold-foreground hover:bg-gold/90 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>

              {/* Demo shortcuts */}
              <div className="mt-6 border-t pt-6">
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  Tài khoản demo
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fillDemo("admin")}
                    className="flex-1 cursor-pointer"
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fillDemo("staff")}
                    className="flex-1 cursor-pointer"
                  >
                    Nhân viên
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
