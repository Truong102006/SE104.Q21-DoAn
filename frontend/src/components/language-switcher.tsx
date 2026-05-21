"use client";

import { useTranslation, type Locale } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
    className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const { locale, setLocale } = useTranslation();

    const options: { value: Locale; label: string; flag: string }[] = [
        { value: "vi", label: "VI", flag: "🇻🇳" },
        { value: "en", label: "EN", flag: "🇬🇧" },
    ];

    return (
        <div
            className={cn(
                "inline-flex p-0.5 rounded-full border border-border/80 bg-muted/40 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-border/100",
                className
            )}
        >
            {options.map((opt) => {
                const isActive = locale === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLocale(opt.value)}
                        className={cn(
                            "relative flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all duration-300 ease-out select-none focus:outline-none",
                            isActive
                                ? "bg-card text-foreground shadow-sm scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        )}
                    >
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
