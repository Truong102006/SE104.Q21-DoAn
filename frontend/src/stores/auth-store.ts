"use client";

import { create } from "zustand";
import type { User, UserRole } from "@/types";

/* ──────────────────────────────────────────────────────────────
   Auth Store — Zustand + cookie/localStorage persistence
   Stores JWT token and user data.  Cookie is set so that
   Next.js middleware can read the token at the edge.
   ────────────────────────────────────────────────────────── */

const AUTH_COOKIE = "auth-token";
const AUTH_STORAGE_KEY = "gold-store-auth";

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;

  /* Computed helpers */
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: UserRole) => boolean;

  /* Actions */
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

/* ── Cookie helpers ──────────────────────────────────────── */
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/* ── Store ───────────────────────────────────────────────── */
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isHydrated: false,

  isAuthenticated: () => !!get().token && !!get().user,
  isAdmin: () => get().user?.role === "ADMIN",
  hasRole: (role) => get().user?.role === role,

  login: (token, user) => {
    /* Persist to cookie (for middleware) + localStorage (for hydration) */
    setCookie(AUTH_COOKIE, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
    set({ token, user });
  },

  logout: () => {
    deleteCookie(AUTH_COOKIE);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ token: null, user: null });
  },

  hydrate: () => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const { token, user } = JSON.parse(raw) as {
          token: string;
          user: User;
        };
        /* Also re-set the cookie in case it was cleared */
        setCookie(AUTH_COOKIE, token);
        set({ token, user, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },
}));
