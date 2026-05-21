"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import vi from "./locales/vi.json";
import en from "./locales/en.json";

export type Locale = "vi" | "en";
export type Translations = typeof vi;

const dictionaries: Record<Locale, Translations> = { vi, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale === "vi" || savedLocale === "en") {
      setLocaleState(savedLocale);
      document.documentElement.lang = savedLocale;
    } else {
      document.documentElement.lang = "vi";
    }
    setIsHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let result: any = dictionaries[locale];
      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = result[k];
        } else {
          return key;
        }
      }
      return typeof result === "string" ? result : key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
