"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { fetchCurrentUser, loginWithPassword } from "@/services/auth-service";
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
import { useTranslation } from "@/i18n/i18n-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrate, isHydrated } = useAuthStore();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
      const { token, user } = await loginWithPassword({ username, password });
      const me = await fetchCurrentUser(token).catch(() => user);
      login(token, me);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.errorDefault"));
    } finally {
      setLoading(false);
    }
  }


  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">{t("auth.initLoading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh relative">
      {/* Premium top-right Language Switcher & Theme Toggle */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden bg-[oklch(0.14_0.01_60)] lg:flex lg:w-1/2 xl:w-[55%]">
        <div className="absolute right-[-10%] top-[-20%] h-[600px] w-[600px] rounded-full bg-[oklch(0.65_0.12_75_/_0.08)] blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[oklch(0.72_0.14_80_/_0.06)] blur-3xl" />

        <div className="relative z-10 max-w-lg px-12 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[oklch(0.65_0.12_75)] shadow-lg shadow-[oklch(0.65_0.12_75_/_0.3)]">
            <Gem className="h-10 w-10 text-white animate-pulse" strokeWidth={1.5} />
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">Gold Store</h1>
          <p className="text-lg leading-relaxed text-[oklch(0.7_0.02_75)]">
            {t("auth.systemTitle")}
            <br />
            <span className="font-semibold text-gold-gradient">{t("auth.systemSubtitle")}</span>
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: t("nav.products"), value: "1,200+" },
              { label: t("nav.salesOrders"), value: "8,500+" },
              { label: t("nav.customers"), value: "3,200+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-[oklch(0.65_0.12_75)]">{stat.value}</p>
                <p className="mt-1 text-sm text-[oklch(0.55_0.01_75)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold">
              <Gem className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold">Gold Store</h1>
          </div>

          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">{t("auth.title")}</CardTitle>
              <CardDescription>
                {t("auth.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">{t("auth.username")}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t("auth.usernamePlaceholder")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full cursor-pointer bg-gold text-gold-foreground transition-colors hover:bg-gold/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.loggingIn")}
                    </>
                  ) : (
                    t("auth.loginButton")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
